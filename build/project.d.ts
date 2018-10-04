/// <reference types="node" />
import { IPackageJSON } from "./package-json";
import fs from "fs";
declare type FileWatchCallback = (operation: "add" | "delete" | "rename", oldFile?: ProjectFile, newFile?: ProjectFile) => void;
export declare class AGOGOSProject extends IPackageJSON {
    projectDirectory: string;
    projectFiles: ProjectFile;
    fileWatchCallback: FileWatchCallback;
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
export interface ProjectFile {
    name: string;
    type: "file" | "folder" | string;
    path: string;
    children?: ProjectFile[];
    watcher?: fs.FSWatcher;
}
export {};
