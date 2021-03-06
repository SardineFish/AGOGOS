import { AGOGOSProject, AGOGOSProgram } from "./project";
import { BrowserWindow, ipcMain, Event } from "electron";
import { ChannelFileChanged, FileChangeArgs, ChannelStartup, Startup, ChannelConsole, ChannelStatus, GeneralIPC, ChannelIpcCall, IPCRenderer, ChannelStatusCompile, ProjectCompiled, ChannelStatusReady } from "./ipc";
import Path from "path";
import { ConsoleMessage, StatusOutput, toMapObject, ProcessNodeData, MapObject, JSONStringrify } from "./lib";
import linq from "linq";
import { AGOGOSProcessor } from "./agogos-processor";
import { promisify } from "util";
import fs from "fs";

export class AGOGOS
{
    static instance: AGOGOS;
    workDir: string;
    project: AGOGOSProject;
    mainWindow: BrowserWindow;
    ipc: GeneralIPC;
    processor: AGOGOSProcessor;
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
        this.ipc.add(IPCRenderer.GetProcess, (filename: string) => this.onGetProcessData(filename));
        this.ipc.add(IPCRenderer.GetProgram, async (path: string) => await this.openProgrm(path));
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
        if (this.project.tsCompiler.compiled)
        {
            this.mainWindow.webContents.send(ChannelStatusReady, <ProjectCompiled>{
                processLib: this.project.moduleManager.processManager.exportProcessData(),
                typeLib: this.project.moduleManager.typeManager.exportTypesData(),
                customEditor: this.project.moduleManager.editorModules
            });
        }
        return this;
    }
    async run()
    {
        let processesData = await this.ipc.call<MapObject<ProcessNodeData>>(IPCRenderer.GetProcessData);
        this.processor = new AGOGOSProcessor(this.project.moduleManager, processesData);
        this.processor.run();
    }
    async openProgrm(path: string)
    {
        let program: AGOGOSProgram;
        if (await promisify(fs.exists)(path))
        {
            program = JSON.parse((await promisify(fs.readFile)(path)).toString());
            if (!program)
            {
                program = {
                    projectPath: this.project.projectDirectory,
                    filePath: path,
                    processes: {},
                    connections: []
                };
                await promisify(fs.writeFile)(path, JSON.stringify(program));
            }
        }
        else
        {
            program = {
                projectPath: this.project.projectDirectory,
                filePath: path,
                processes: {},
                connections: []
            };
            await promisify(fs.writeFile)(path, JSON.stringify(program));
        }
        if (!program.connections || !(program.connections instanceof Array))
            program.connections = [];
        if (!program.processes)
            program.processes = {};
        program.filePath = path;
        program.projectPath = this.project.projectDirectory;
        await this.ipc.call(IPCRenderer.SendProgram, program);
        return program;
    }
    async saveProgram(program: AGOGOSProgram)
    {
        await promisify(fs.writeFile)(program.filePath, JSON.stringify(program));
        this.console.log(`Program saved to ${program.filePath}`);
        return program;
    }
    onCompileStart()
    {
        this.mainWindow.webContents.send(ChannelStatusCompile);
    }
    onCompileComplete()
    {
        this.project.moduleManager.reset();
        this.project.sourceFiles = [];
        this.project.tsCompiler.srcFiles.forEach(file =>
        {
            let src = this.project.moduleManager.importSourceFile(this.project.tsCompiler.outputMap.get(file));
            if (src)
            {
                src.compiledFile = src.path;
                src.name = file;
                src.path = Path.resolve(this.workDir, file);
                this.project.sourceFiles.push(src);
            }
        });
        this.mainWindow.webContents.send(ChannelStatusReady, <ProjectCompiled>{
            processLib: this.project.moduleManager.processManager.exportProcessData(),
            typeLib: this.project.moduleManager.typeManager.exportTypesData(),
            customEditor: this.project.moduleManager.editorModules
        });
    }
    onGetProcessData(filename: string)
    {
        let src = linq.from(this.project.sourceFiles).where(src => src.path === filename).firstOrDefault();
        if (!src)
            return null;
        if (src.moduleType !== "process")
            return null;
        return this.project.moduleManager.processManager.getProcessData(src.moduleName);
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