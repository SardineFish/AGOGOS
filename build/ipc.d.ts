/// <reference types="node" />
import { ProjectFile } from "./project";
import { ChildProcess } from "child_process";
export interface Startup {
    workDir: string;
    projectFile: ProjectFile;
}
export declare const ChannelStartup = "startup";
export declare const ChannelProjectSettings = "proj-settings";
export declare const ChannelFileChanged = "file-chenged";
export declare const ChannelConsole = "agogos-console";
export declare function waitIpcRenderer<T>(channel: string, timeout?: number): Promise<T>;
export declare function waitIpcMain<T>(channel: string, timeout?: number): Promise<T>;
export interface FileChangeArgs {
    operation: "add" | "delete" | "rename";
    oldFileName: string;
    newFileName: string;
    newFile: ProjectFile;
}
declare type IPCHandler = (...args: any[]) => any;
export declare class ProcessIPC {
    process: any;
    private callList;
    private handler;
    private increaseCallID;
    constructor(process: ChildProcess | NodeJS.Process);
    private onmessage;
    add(name: string, handler: IPCHandler): void;
    call<TResult>(name: string, ...args: any[]): Promise<TResult>;
}
export {};
