import { AGOGOSProject } from "./project";
import { BrowserWindow, Event } from "electron";
declare class AGOGOS {
    workDir: string;
    project: AGOGOSProject;
    mainWindow: BrowserWindow;
    init(workDir: string): Promise<AGOGOS>;
    reload(event: Event): Promise<AGOGOS>;
    console: {
        log: (message: any) => void;
        warn: (message: any) => void;
        error: (message: any) => void;
    };
}
declare const agogos: AGOGOS;
export default agogos;
