"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const commander_1 = __importDefault(require("commander"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const agogos_1 = require("./agogos");
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
const agogos = new agogos_1.AGOGOS();
loadProject();
function loadProject() {
    electron_1.app.on("ready", async () => {
        loadMenu();
        await agogos.init(workDir);
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
                    click: () => agogos.project.save(),
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
                    label: "Reload",
                    accelerator: "F5",
                    click: () => agogos.mainWindow.reload()
                },
                {
                    label: "Development Tools",
                    accelerator: "F12",
                    click: () => agogos.mainWindow.webContents.toggleDevTools()
                }
            ]
        },
        {
            label: "Project",
            submenu: [
                {
                    label: "Build Project",
                    accelerator: "CommandOrControl+Shift+B",
                    click: async () => {
                        let diagnostics = await agogos.project.tsCompiler.compile();
                        agogos.console.log("Compile Completed.");
                        diagnostics.forEach(diag => agogos.console.error(diag.messageText));
                    }
                }
            ]
        }
    ]);
    electron_1.Menu.setApplicationMenu(menu);
}
//# sourceMappingURL=main.js.map