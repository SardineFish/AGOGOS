/// <reference types="node" />
import { IPackageJSON } from "./package-json";
import fs from "fs";
import * as typescript from "typescript";
import { ProcessIPC } from "./ipc";
declare type FileWatchCallback = (operation: "add" | "delete" | "rename", oldFile?: ProjectFile, newFile?: ProjectFile) => void;
export declare class AGOGOSProject extends IPackageJSON {
    projectDirectory: string;
    projectFiles: ProjectFile;
    fileWatchCallback: FileWatchCallback;
    tsCompiler: TSCompiler;
    readonly packageJSONPath: string;
    readonly agogosFolder: string;
    constructor(path: string);
    open(): Promise<AGOGOSProject>;
    checkAGOGOSFolder(): Promise<AGOGOSProject>;
    init(name: string): Promise<AGOGOSProject>;
    save(): Promise<AGOGOSProject>;
    scanFiles(): Promise<AGOGOSProject>;
    startWatch(callback: FileWatchCallback): AGOGOSProject;
}
declare class TSCompiler {
    ready: boolean;
    compileProcessIPC: ProcessIPC;
    srcDirectory: string;
    outDirectory: string;
    srcFiles: string[];
    outputMap: Map<string, string>;
    constructor(src: string, out: string);
    init(): Promise<void>;
    compile(): Promise<ReadonlyArray<typescript.Diagnostic>>;
    watch(): Promise<TSCompiler>;
    private onCompileComplete;
    private onDiagnostic;
    private onStatusReport;
}
export interface ProjectFile {
    name: string;
    type: "file" | "folder" | string;
    path: string;
    children?: ProjectFile[];
    watcher?: fs.FSWatcher;
}
export declare class ProjFile {
    static getDirectory(root: ProjectFile, path: string, pathType?: "relative" | "absolute"): ProjectFile;
    static getFile(root: ProjectFile, path: string, pathType?: "relative" | "absolute"): ProjectFile;
    static orderFiles(files: ProjectFile[]): ProjectFile[];
}
export {};
