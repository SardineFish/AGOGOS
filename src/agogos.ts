import { AGOGOSProject } from "./project";
import { BrowserWindow, ipcMain, Event } from "electron";
import { ChannelFileChanged, FileChangeArgs, ChannelStartup, Startup, ChannelConsole, ChannelStatus } from "./ipc";
import Path from "path";
import { ConsoleMessage, StatusOutput } from "./lib";

class AGOGOS
{
    workDir: string;
    project: AGOGOSProject;
    mainWindow: BrowserWindow;
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
        this.project.fileWatchCallback = (operation, oldFile, newFile) =>
        {
            this.mainWindow.webContents.send(ChannelFileChanged, <FileChangeArgs>{
                operation: operation,
                oldFileName: oldFile ? Path.resolve(oldFile.path) : null,
                newFileName: newFile ? Path.resolve(newFile.path) : null,
                newFile: this.project.projectFiles
            });
        };
        event.sender.send(ChannelStartup, <Startup>{ workDir: this.project.projectDirectory, /*project: agogosProject,*/ projectFile: this.project.projectFiles });
        if (!this.project.tsCompiler.ready)
        {
            agogos.showStatus("Init Compiler", true);
            this.project.tsCompiler.init()
                .then(() => this.project.tsCompiler.watch())
                .then(() => agogos.showStatus("Project Ready"));
        }
        return this;
    }
    
    console = {
        log: (message: any) =>
        {
            console.log(message);
            this.mainWindow.webContents.send(ChannelConsole, <ConsoleMessage>{ type: "log", message: message.toString() })
        },
        warn: (message: any) =>
        {
            console.warn(message);
            this.mainWindow.webContents.send(ChannelConsole, <ConsoleMessage>{ type: "warn", message: message.toString() })
        },
        error: (message: any) =>
        {
            console.error(message);
            this.mainWindow.webContents.send(ChannelConsole, <ConsoleMessage>{ type: "error", message: message.toString() })
        },
    }

    showStatus = (status: string, loading?:boolean, progress?:number)=>{
        this.mainWindow.webContents.send(ChannelStatus, <StatusOutput>{
            message: status,
            loading,
            progress
        });
    }
}
const agogos: AGOGOS = new AGOGOS();
export default agogos;