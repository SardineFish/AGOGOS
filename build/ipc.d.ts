import { ProjectFile } from "./project";
export interface Startup {
    workDir: string;
    projectFile: ProjectFile;
}
export declare const ChannelStartup = "startup";
export declare const ChannelProjectSettings = "proj-settings";
export declare const ChannelFileChanged = "file-chenged";
export declare function waitIpcRenderer<T>(channel: string, timeout?: number): Promise<T>;
export declare function waitIpcMain<T>(channel: string, timeout?: number): Promise<T>;
export interface FileChangeArgs {
    operation: "add" | "delete" | "change";
    oldFileName: string;
    newFileName: string;
    newFile: ProjectFile;
}
