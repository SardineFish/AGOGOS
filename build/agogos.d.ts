import { AGOGOSProject } from "./project";
import { BrowserWindow, Event } from "electron";
import { GeneralIPC } from "./ipc";
export declare class AGOGOS {
    static instance: AGOGOS;
    workDir: string;
    project: AGOGOSProject;
    mainWindow: BrowserWindow;
    ipc: GeneralIPC;
    constructor();
    init(workDir: string): Promise<AGOGOS>;
    reload(event: Event): Promise<AGOGOS>;
    onCompileComplete(): void;
    onGetProcessData(filename: string): Promise<void>;
    console: {
        log: (message: any) => void;
        warn: (message: any) => void;
        error: (message: any) => void;
    };
    showStatus: (status: string, loading?: boolean, progress?: number) => void;
}
