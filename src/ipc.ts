import { promisify } from "util";
import { ipcRenderer, ipcMain } from "electron";
import { AGOGOSProject, ProjectFile } from "./project";
import { fork, ChildProcess } from "child_process";
export interface Startup
{
    workDir: string;
    /*project: AGOGOSProject;*/
    projectFile: ProjectFile;
}
export const ChannelStartup = "startup";
export const ChannelProjectSettings = "proj-settings";
export const ChannelFileChanged = "file-chenged";
export const ChannelConsole = "agogos-console";

export async function waitIpcRenderer<T>(channel: string, timeout: number = 500): Promise<T>
{
    return new Promise<T>((resolve, reject) =>
    {
        ipcRenderer.once(channel, (event: Event, args: T) =>
        {
            resolve(args);
        });
        promisify(setTimeout)(timeout).then(() => reject(new Error("Ipc Timeout.")));
    });
}
export async function waitIpcMain<T>(channel: string, timeout: number = 500): Promise<T>
{
    return new Promise<T>((resolve, reject) =>
    {
        ipcMain.once(channel, (event: Event, args: T) =>
        {
            resolve(args);
        });
        promisify(setTimeout)(timeout).then(() => reject(new Error("Ipc Timeout.")));
    });
}

export interface FileChangeArgs
{
    operation: "add" | "delete" | "rename";
    oldFileName: string;
    newFileName: string;
    newFile: ProjectFile;
}

const IPCReturnValue = "__IPC_RETURN";
type IPCHandler = (...args: any[]) => any;
interface IPCPackage
{
    name: string;
    callId: number;
    data: any;
}
export class ProcessIPC
{
    public process: any;
    private callList: Map<number, (returnValue: any) => void> = new Map();
    private handler: Map<string, IPCHandler> = new Map();
    private increaseCallID = 0;

    constructor(process: ChildProcess | NodeJS.Process)
    {
        this.process = process;
        this.process.on("message", (msg: IPCPackage) => this.onmessage(msg));
    }
    private async onmessage(msg: IPCPackage): Promise<void>
    {

        let { name, callId, data } = msg;
        let args = data as Array<any>;

        if (name === IPCReturnValue)
        {
            this.callList.get(callId)!(data);
            this.callList.delete(callId);
            return;
        }

        let handler = this.handler.get(name);
        let returnValue: any;
        if (handler)
            returnValue = handler(...args);
        if (returnValue instanceof Promise)
            returnValue.then(returnValue => this.process.send(<IPCPackage>{ name: IPCReturnValue, callId, data: returnValue }));
        else
            this.process.send(<IPCPackage>{ name: IPCReturnValue, callId, data: returnValue });
    }
    public add(name: string, handler: IPCHandler)
    {
        this.handler.set(name, handler);
    }
    public async call<TResult>(name: string, ...args: any[]): Promise<TResult>
    {
        let callId = ++this.increaseCallID;
        return new Promise<TResult>((resolve) =>
        {
            this.callList.set(callId, resolve);
            this.process.send(<IPCPackage>{ name, callId, data: args });
        });
    }
}