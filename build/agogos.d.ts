import { AGOGOSProject } from "./project";
import { BrowserWindow, Event } from "electron";
declare class AGOGOS {
    workDir: string;
    project: AGOGOSProject;
    mainWindow: BrowserWindow;
    ipcEvent: Event;
    init(workDir: string): Promise<AGOGOS>;
    reload(event: Event): Promise<AGOGOS>;
}
declare const agogos: AGOGOS;
export default agogos;
