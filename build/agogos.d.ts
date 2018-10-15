import { AGOGOSProject } from "./project";
import { BrowserWindow, Event } from "electron";
import { GeneralIPC } from "./ipc";
declare class AGOGOS {
    workDir: string;
    project: AGOGOSProject;
    mainWindow: BrowserWindow;
    ipc: GeneralIPC;
    init(workDir: string): Promise<AGOGOS>;
    reload(event: Event): Promise<AGOGOS>;
    console: {
        log: (message: any) => void;
        warn: (message: any) => void;
        error: (message: any) => void;
    };
    showStatus: (status: string, loading?: boolean, progress?: number) => void;
}
declare const agogos: AGOGOS;
export default agogos;
