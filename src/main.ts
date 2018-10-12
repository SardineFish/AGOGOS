import { app, BrowserWindow, ipcMain, Event, Menu, MenuItem } from "electron";
import program from "commander";
import fs from "fs";
import path from "path";
import { Startup, ChannelStartup, ChannelProjectSettings, ChannelFileChanged, FileChangeArgs } from "./ipc";
import { AGOGOSProject } from "./project";
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

//console.log(program.args);

let agogosProject: AGOGOSProject;
let mainWindow: BrowserWindow;
let mainWindowEvent: Event;

loadProject();

function loadProject()
{
    app.on("ready", async () =>
    {
        agogosProject = new AGOGOSProject(workDir);
        await agogosProject.open();
        await loadRenderer();
        agogosProject.open().then(async () =>
        {
            agogosProject.fileWatchCallback = (operation, oldFile, newFile) =>
            {
                mainWindowEvent.sender.send(ChannelFileChanged, <FileChangeArgs>{
                    operation: operation,
                    oldFileName: oldFile ? path.resolve(oldFile.path) : null,
                    newFileName: newFile ? path.resolve(newFile.path) : null,
                    newFile: agogosProject.projectFiles
                });
            };

            mainWindowEvent.sender.send(ChannelStartup, <Startup>{ workDir: agogosProject.projectDirectory, /*project: agogosProject,*/ projectFile: agogosProject.projectFiles });
            await agogosProject.tsCompiler.init();
        });
    });
}
async function loadRenderer():Promise<Event>
{
    return new Promise<Event>(resolve =>
    {
        loadMenu();
        mainWindow = new BrowserWindow({ width: 1280, height: 720 });
        mainWindow.loadFile("./res/html/index.html");


        ipcMain.on("ping", (event: Event, args: any) =>
        {
            event.returnValue = "pong";
            mainWindowEvent = event;
            resolve(event);
        });
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
    Menu.setApplicationMenu(menu);
}