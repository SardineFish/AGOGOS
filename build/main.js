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
    .version(pkg.version)
    .option("--remote-debugging-port")
    .arguments("<appPath>");
commander_1.default
    .arguments("<dir>");
commander_1.default.parse(process.argv);
let workDir = path_1.default.normalize(commander_1.default.args[commander_1.default.args.length - 1]);
console.log(workDir);
if (!fs_1.default.existsSync(workDir))
    commander_1.default.help();
//console.log(program.args);
let agogosProject;
loadProject();
function loadProject() {
    electron_1.app.on("ready", async () => {
        agogosProject = new project_1.AGOGOSProject(workDir);
        await agogosProject.open();
        loadRenderer();
    });
}
function loadRenderer() {
    loadMenu();
    let window = new electron_1.BrowserWindow({ width: 1280, height: 720 });
    window.loadFile("./res/html/index.html");
    electron_1.ipcMain.on("ping", (event, args) => {
        event.returnValue = "pong";
        event.sender.send(ipc_1.ChannelStartup, { workDir: agogosProject.projectDirectory, /*project: agogosProject,*/ projectFile: agogosProject.projectFiles });
    });
    electron_1.ipcMain.on(ipc_1.ChannelProjectSettings, (event, args) => {
        event.returnValue = agogosProject;
        agogosProject.fileWatchCallback = (operation, oldFile, newFile) => {
            event.sender.send(ipc_1.ChannelFileChanged, {
                operation: operation,
                oldFileName: oldFile.path ? path_1.default.resolve(oldFile.path) : null,
                newFileName: newFile.path ? path_1.default.resolve(newFile.path) : null
            });
        };
    });
}
function loadMenu() {
    let menu = new electron_1.Menu();
    menu.append(new electron_1.MenuItem({
        label: "File",
        submenu: [
            {
                label: "New File",
            },
            {
                label: "New Project",
            },
            {
                label: "Open Project"
            },
            {
                label: "Save Project",
                click: () => agogosProject.save(),
                accelerator: "CommandOrControl+Shift+S",
            }
        ]
    }));
    menu.append(new electron_1.MenuItem({
        label: "Edit",
        role: "editMenu"
    }));
    menu.append(new electron_1.MenuItem({
        label: "Window",
        role: "windowMenu"
    }));
    menu.append(new electron_1.MenuItem({
        label: "Tool",
        submenu: [
            {
                label: "Development Tools",
                accelerator: "F12",
            }
        ]
    }));
    //
    //Menu.setApplicationMenu(menu);
}
//# sourceMappingURL=main.js.map