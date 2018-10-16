import { AGOGOSProject } from "./project";
import { BrowserWindow, ipcMain, Event } from "electron";
import { ChannelFileChanged, FileChangeArgs, ChannelStartup, Startup, ChannelConsole, ChannelStatus, GeneralIPC, ChannelIpcCall, IPCRenderer } from "./ipc";
import Path from "path";
import { ConsoleMessage, StatusOutput } from "./lib";

export class AGOGOS
{
    static instance: AGOGOS;
    workDir: string;
    project: AGOGOSProject;
    mainWindow: BrowserWindow;
    ipc: GeneralIPC;
    constructor()
    {
        AGOGOS.instance = this;
    }
    async init(workDir: string):Promise<AGOGOS>
    {
        this.workDir = workDir;
        this.project = new AGOGOSProject(workDir);
        this.mainWindow = new BrowserWindow({ width: 1280, height: 720 });
        this.mainWindow.loadFile("./res/html/index.html");
        ipcMain.on("ping", (event: Event, args: any) => this.reload(event));
        this.ipc = new GeneralIPC({
            receive: (msg) => ipcMain.on(ChannelIpcCall, (event: Event, args: any) => msg(args)),
            send: (args) => this.mainWindow.webContents.send(ChannelIpcCall, args)
        });
        await this.project.open();
        
        return this;
    }
    async reload(event:Event):Promise<AGOGOS>
    {
        this.ipc.add(IPCRenderer.GetProcess, async (filename: string) => await this.onGetProcessData(filename));
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
            this.showStatus("Init Compiler", true);
            this.project.tsCompiler.init()
                .then(() => this.project.tsCompiler.watch())
                .then(() => this.showStatus("Project Ready"));
            this.project.tsCompiler.onCompileCompleteCallback = () => this.onCompileComplete();
        }
        return this;
    }
    onCompileComplete()
    {
        this.project.tsCompiler.srcFiles.forEach(file =>
        {
            this.project.processManager.importProcess(this.project.tsCompiler.outputMap.get(file));
        });
    }
    async onGetProcessData(filename: string)
    {
        
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
            //console.error(message);
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