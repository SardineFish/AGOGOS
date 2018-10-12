import { AGOGOSProject } from "./project";
import { BrowserWindow, ipcMain, Event } from "electron";
import { ChannelFileChanged, FileChangeArgs, ChannelStartup, Startup } from "./ipc";
import Path from "path";

class AGOGOS
{
    workDir: string;
    project: AGOGOSProject;
    mainWindow: BrowserWindow;
    ipcEvent: Event;
    async init(workDir: string):Promise<AGOGOS>
    {
        this.workDir = workDir;
        this.project = new AGOGOSProject(workDir);
        this.mainWindow = new BrowserWindow({ width: 1280, height: 720 });
        this.mainWindow.loadFile("./res/html/index.html");
        ipcMain.on("ping", (event: Event, args: any) => this.reload(event));
        await this.project.open();
        return this;
    }
    async reload(event:Event):Promise<AGOGOS>
    {
        this.ipcEvent = event;
        this.project.fileWatchCallback = (operation, oldFile, newFile) =>
        {
            this.ipcEvent.sender.send(ChannelFileChanged, <FileChangeArgs>{
                operation: operation,
                oldFileName: oldFile ? Path.resolve(oldFile.path) : null,
                newFileName: newFile ? Path.resolve(newFile.path) : null,
                newFile: this.project.projectFiles
            });
        };
        if (!this.project.tsCompiler.ready)
            await this.project.tsCompiler.init();
        event.sender.send(ChannelStartup, <Startup>{ workDir: this.project.projectDirectory, /*project: agogosProject,*/ projectFile: this.project.projectFiles });
        return this;
    }
}
const agogos: AGOGOS = new AGOGOS();
export default agogos;