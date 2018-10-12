import { app, BrowserWindow, ipcMain, Event, Menu, MenuItem } from "electron";
import program from "commander";
import fs from "fs";
import path from "path";
import { Startup, ChannelStartup, ChannelProjectSettings, ChannelFileChanged, FileChangeArgs } from "./ipc";
import { AGOGOSProject } from "./project";
import agogos from "./agogos";
require("electron-reload")(app.getAppPath());

const pkg = require('../package.json');

program
    .version(pkg.version)
    .option("--remote-debugging-port")
    .arguments("<appPath>");

program
    .arguments("<dir>");

program.parse(process.argv);

let workDir = path.normalize(program.args[program.args.length - 1]);
console.log(workDir);
if (!fs.existsSync(workDir))
    program.help();


loadProject();

function loadProject()
{
    app.on("ready", async () =>
    {
        loadMenu();
        await agogos.init(workDir);
    });
}
function loadMenu()
{

    let menu = new Menu();
    menu = Menu.buildFromTemplate([
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
                    click: () => agogosProject.tsCompiler.compile()
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);
}