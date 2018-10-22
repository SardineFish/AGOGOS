/// <reference types="node" />
import { ProjectFile } from "./project";
import { ChildProcess } from "child_process";
import { MapObject, PropertyData, ProcessNodeData } from "./lib";
export interface Startup {
    workDir: string;
    projectFile: ProjectFile;
}
export declare const ChannelStartup = "startup";
export declare const ChannelProjectSettings = "proj-settings";
export declare const ChannelFileChanged = "file-chenged";
export declare const ChannelConsole = "agogos-console";
export declare const ChannelStatus = "agogos-status";
export declare const ChannelProjectReady = "agogos-ready";
export declare const ChannelGetProcess = "get-process";
export declare const ChannelIpcCall = "_ipc-call";
export declare const ChannelStatusCompile = "status-compile";
export declare const ChannelStatusReady = "status-ready";
export declare const IPCRenderer: {
    GetProcess: string;
};
export declare function waitIpcRenderer<T>(channel: string, timeout?: number): Promise<T>;
export declare function waitIpcMain<T>(channel: string, timeout?: number): Promise<T>;
export interface FileChangeArgs {
    operation: "add" | "delete" | "rename";
    oldFileName: string;
    newFileName: string;
    newFile: ProjectFile;
}
declare type IPCHandler = (...args: any[]) => any;
export interface IPCEntity {
    receive: (onMsg: (args: any) => void) => void;
    send: (args: any) => void;
}
export declare class GeneralIPC {
    entity: IPCEntity;
    private callList;
    private handler;
    private increaseCallID;
    constructor(entity: IPCEntity);
    private onmessage;
    add(name: string, handler: IPCHandler): void;
    call<TResult>(name: string, ...args: any[]): Promise<TResult>;
}
export declare class ProcessIPC extends GeneralIPC {
    process: any;
    constructor(process: ChildProcess | NodeJS.Process);
}
export declare class ProjectCompiled {
    typeLib: MapObject<PropertyData>;
    processLib: MapObject<ProcessNodeData>;
}
export {};
