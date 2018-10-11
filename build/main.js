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
let mainWindow;
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
    mainWindow = new electron_1.BrowserWindow({ width: 1280, height: 720 });
    mainWindow.loadFile("./res/html/index.html");
    electron_1.ipcMain.on("ping", (event, args) => {
        event.returnValue = "pong";
        agogosProject.fileWatchCallback = (operation, oldFile, newFile) => {
            event.sender.send(ipc_1.ChannelFileChanged, {
                operation: operation,
                oldFileName: oldFile ? path_1.default.resolve(oldFile.path) : null,
                newFileName: newFile ? path_1.default.resolve(newFile.path) : null,
                newFile: agogosProject.projectFiles
            });
        };
        event.sender.send(ipc_1.ChannelStartup, { workDir: agogosProject.projectDirectory, /*project: agogosProject,*/ projectFile: agogosProject.projectFiles });
    });
}
function loadMenu() {
    let menu = new electron_1.Menu();
    menu = electron_1.Menu.buildFromTemplate([
        {
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
        },
        {
            label: "Edit",
            role: "editMenu"
        },
        {
            label: "Window",
            role: "windowMenu"
        },
        {
            label: "Tool",
            submenu: [
                {
                    label: "Development Tools",
                    accelerator: "F12",
                    click: () => mainWindow.webContents.toggleDevTools()
                }
            ]
        },
        {
            label: "Project",
            submenu: [
                {
                    label: "Build Project",
                    accelerator: "CommandOrControl+Shift+B",
                    click: () => agogosProject.tsCompiler.compile()
                }
            ]
        }
    ]);
    electron_1.Menu.setApplicationMenu(menu);
}
//# sourceMappingURL=main.js.map