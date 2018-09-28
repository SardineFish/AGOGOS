"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const commander_1 = __importDefault(require("commander"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ipc_1 = require("./ipc");
const project_1 = require("./project");
require("electron-reload")(electron_1.app.getAppPath());
const pkg = require('../package.json');
commander_1.default
    .version(pkg.version);
commander_1.default
    .arguments("<dir>");
commander_1.default.parse(process.argv);
//console.log(program.args);
let agogosProject;
loadProject();
function loadProject() {
    electron_1.app.on("ready", () => {
        let workDir = path_1.default.normalize(commander_1.default.args[0]);
        console.log(workDir);
        if (!fs_1.default.existsSync(workDir))
            commander_1.default.help();
        agogosProject = new project_1.AGOGOSProject(workDir);
        agogosProject.open()
            .then(() => loadRenderer())
            .catch(err => agogosProject.init(path_1.default.basename(workDir))
            .then(() => loadRenderer()));
    });
}
function loadRenderer() {
    let window = new electron_1.BrowserWindow({ width: 1280, height: 720 });
    window.loadFile("./res/html/index.html");
    electron_1.ipcMain.on("ping", (event, args) => {
        console.log(electron_1.app.getAppPath());
        console.log(args);
        event.returnValue = "pong";
        event.sender.send(ipc_1.ChannelStartup, { workDir: agogosProject.projectDirectory });
    });
    electron_1.ipcMain.on(ipc_1.ChannelProjectSettings, (event, args) => {
        event.returnValue = agogosProject;
    });
}
//# sourceMappingURL=main.js.map