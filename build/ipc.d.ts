export interface Startup {
    workDir: string;
}
export declare const ChannelStartup = "startup";
export declare const ChannelProjectSettings = "proj-settings";
export declare const ChannelFileChanged = "file-chenged";
export declare function waitIpcRenderer<T>(channel: string, timeout?: number): Promise<T>;
export declare function waitIpcMain<T>(channel: string, timeout?: number): Promise<T>;
