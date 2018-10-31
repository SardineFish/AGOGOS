import { AGOGOSProject, AGOGOSProgram } from "./project";
import { BrowserWindow, Event } from "electron";
import { GeneralIPC } from "./ipc";
import { ProcessNodeData } from "./lib";
import { AGOGOSProcessor } from "./agogos-processor";
export declare class AGOGOS {
    static instance: AGOGOS;
    workDir: string;
    project: AGOGOSProject;
    mainWindow: BrowserWindow;
    ipc: GeneralIPC;
    processor: AGOGOSProcessor;
    constructor();
    init(workDir: string): Promise<AGOGOS>;
    reload(event: Event): Promise<AGOGOS>;
    run(): Promise<void>;
    openProgrm(path: string): Promise<AGOGOSProgram>;
    onCompileStart(): void;
    onCompileComplete(): void;
    onGetProcessData(filename: string): ProcessNodeData;
    console: {
        log: (message: any) => void;
        warn: (message: any) => void;
        error: (message: any) => void;
    };
    showStatus: (status: string, loading?: boolean, progress?: number) => void;
}
