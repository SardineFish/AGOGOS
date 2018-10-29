"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const project_1 = require("./project");
const electron_1 = require("electron");
const ipc_1 = require("./ipc");
const path_1 = __importDefault(require("path"));
const linq_1 = __importDefault(require("linq"));
const agogos_processor_1 = require("./agogos-processor");
class AGOGOS {
    constructor() {
        this.console = {
            log: (message) => {
                console.log(message);
                this.mainWindow.webContents.send(ipc_1.ChannelConsole, { type: "log", message: message.toString() });
            },
            warn: (message) => {
                console.warn(message);
                this.mainWindow.webContents.send(ipc_1.ChannelConsole, { type: "warn", message: message.toString() });
            },
            error: (message) => {
                //console.error(message);
                this.mainWindow.webContents.send(ipc_1.ChannelConsole, { type: "error", message: message.toString() });
            },
        };
        this.showStatus = (status, loading, progress) => {
            this.mainWindow.webContents.send(ipc_1.ChannelStatus, {
                message: status,
                loading,
                progress
            });
        };
        AGOGOS.instance = this;
    }
    async init(workDir) {
        this.workDir = workDir;
        this.project = new project_1.AGOGOSProject(workDir);
        this.mainWindow = new electron_1.BrowserWindow({ width: 1280, height: 720 });
        this.mainWindow.loadFile("./res/html/index.html");
        electron_1.ipcMain.on("ping", (event, args) => this.reload(event));
        this.ipc = new ipc_1.GeneralIPC({
            receive: (msg) => electron_1.ipcMain.on(ipc_1.ChannelIpcCall, (event, args) => msg(args)),
            send: (args) => this.mainWindow.webContents.send(ipc_1.ChannelIpcCall, args)
        });
        await this.project.open();
        return this;
    }
    async reload(event) {
        this.ipc.add(ipc_1.IPCRenderer.GetProcess, (filename) => this.onGetProcessData(filename));
        this.project.fileWatchCallback = (operation, oldFile, newFile) => {
            this.mainWindow.webContents.send(ipc_1.ChannelFileChanged, {
                operation: operation,
                oldFileName: oldFile ? path_1.default.resolve(oldFile.path) : null,
                newFileName: newFile ? path_1.default.resolve(newFile.path) : null,
                newFile: this.project.projectFiles
            });
        };
        event.sender.send(ipc_1.ChannelStartup, { workDir: this.project.projectDirectory, /*project: agogosProject,*/ projectFile: this.project.projectFiles });
        if (!this.project.tsCompiler.ready) {
            this.showStatus("Init Compiler", true);
            this.project.tsCompiler.init()
                .then(() => this.project.tsCompiler.watch())
                .then(() => this.showStatus("Project Ready"));
            this.project.tsCompiler.onCompileCompleteCallback = () => this.onCompileComplete();
        }
        if (this.project.tsCompiler.compiled) {
            this.mainWindow.webContents.send(ipc_1.ChannelStatusReady, {
                processLib: this.project.moduleManager.processManager.exportProcessData(),
                typeLib: this.project.moduleManager.typeManager.exportTypesData(),
                customEditor: this.project.moduleManager.editorModules
            });
        }
        return this;
    }
    async run() {
        let processesData = await this.ipc.call(ipc_1.IPCRenderer.GetProcessData);
        this.processor = new agogos_processor_1.AGOGOSProcessor(this.project.moduleManager, processesData);
        this.processor.run();
    }
    onCompileStart() {
        this.mainWindow.webContents.send(ipc_1.ChannelStatusCompile);
    }
    onCompileComplete() {
        this.project.moduleManager.reset();
        this.project.sourceFiles = [];
        this.project.tsCompiler.srcFiles.forEach(file => {
            let src = this.project.moduleManager.importSourceFile(this.project.tsCompiler.outputMap.get(file));
            if (src) {
                src.compiledFile = src.path;
                src.name = file;
                src.path = path_1.default.resolve(this.workDir, file);
                this.project.sourceFiles.push(src);
            }
        });
        this.mainWindow.webContents.send(ipc_1.ChannelStatusReady, {
            processLib: this.project.moduleManager.processManager.exportProcessData(),
            typeLib: this.project.moduleManager.typeManager.exportTypesData(),
            customEditor: this.project.moduleManager.editorModules
        });
    }
    onGetProcessData(filename) {
        let src = linq_1.default.from(this.project.sourceFiles).where(src => src.path === filename).firstOrDefault();
        if (!src)
            return null;
        if (src.moduleType !== "process")
            return null;
        return this.project.moduleManager.processManager.getProcessData(src.moduleName);
    }
}
exports.AGOGOS = AGOGOS;
//# sourceMappingURL=agogos.js.map