import { promisify } from "util";
import { ipcRenderer, ipcMain } from "electron";
import { AGOGOSProject, ProjectFile } from "./project";
import { fork, ChildProcess } from "child_process";
import { MapObject, PropertyData, ProcessNodeData } from "./lib";
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
export const ChannelStatus = "agogos-status";
export const ChannelProjectReady = "agogos-ready";
export const ChannelGetProcess = "get-process";
export const ChannelIpcCall = "_ipc-call";
export const ChannelStatusCompile = "status-compile";
export const ChannelStatusReady = "status-ready";
export const IPCRenderer = {
    GetProcess:"get-process-data"
}

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
export interface IPCEntity
{
    receive: (onMsg: (args: any) => void) => void;
    send: (args: any) => void;
}
export class GeneralIPC
{
    public entity: IPCEntity;
    private callList: Map<number, (returnValue: any) => void> = new Map();
    private handler: Map<string, IPCHandler> = new Map();
    private increaseCallID = 0;
    constructor(entity: IPCEntity)
    {
        this.entity = entity;
        this.entity.receive((msg: IPCPackage) => this.onmessage(msg));
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
            returnValue.then(returnValue => this.entity.send(<IPCPackage>{ name: IPCReturnValue, callId, data: returnValue }));
        else
            this.entity.send(<IPCPackage>{ name: IPCReturnValue, callId, data: returnValue });
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
            this.entity.send(<IPCPackage>{ name, callId, data: args });
        });
    }
}
export class ProcessIPC extends GeneralIPC
{
    public process: any;

    constructor(process: ChildProcess | NodeJS.Process)
    {
        super({
            receive: (msg) => (<any>process).on("message", msg),
            send: (args) => (<any>process).send(args)
        })
        this.process = process;
    }
}
export class ProjectCompiled
{
    typeLib: MapObject<PropertyData>;
    processLib: MapObject<ProcessNodeData>
}