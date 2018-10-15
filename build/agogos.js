"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const project_1 = require("./project");
const electron_1 = require("electron");
const ipc_1 = require("./ipc");
const path_1 = __importDefault(require("path"));
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
                console.error(message);
                this.mainWindow.webContents.send(ipc_1.ChannelConsole, { type: "error", message: message.toString() });
            },
        };
    }
    async init(workDir) {
        this.workDir = workDir;
        this.project = new project_1.AGOGOSProject(workDir);
        this.mainWindow = new electron_1.BrowserWindow({ width: 1280, height: 720 });
        this.mainWindow.loadFile("./res/html/index.html");
        electron_1.ipcMain.on("ping", (event, args) => this.reload(event));
        await this.project.open();
        return this;
    }
    async reload(event) {
        this.project.fileWatchCallback = (operation, oldFile, newFile) => {
            this.mainWindow.webContents.send(ipc_1.ChannelFileChanged, {
                operation: operation,
                oldFileName: oldFile ? path_1.default.resolve(oldFile.path) : null,
                newFileName: newFile ? path_1.default.resolve(newFile.path) : null,
                newFile: this.project.projectFiles
            });
        };
        if (!this.project.tsCompiler.ready) {
            this.project.tsCompiler.init().then(() => this.project.tsCompiler.watch());
        }
        event.sender.send(ipc_1.ChannelStartup, { workDir: this.project.projectDirectory, /*project: agogosProject,*/ projectFile: this.project.projectFiles });
        return this;
    }
}
const agogos = new AGOGOS();
exports.default = agogos;
//# sourceMappingURL=agogos.js.map