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

loadProject();

function loadProject()
{
    app.on("ready", async () =>
    {
        agogosProject = new AGOGOSProject(workDir);
        await agogosProject.open();
        loadRenderer();
    });
}
function loadRenderer()
{
    loadMenu();
    let window = new BrowserWindow({ width: 1280, height: 720 });
    window.loadFile("./res/html/index.html");


    ipcMain.on("ping", (event: Event, args: any) =>
    {
        event.returnValue = "pong";
        agogosProject.fileWatchCallback = (operation, oldFile, newFile) =>
        {
            event.sender.send(ChannelFileChanged, <FileChangeArgs>{
                operation: operation,
                oldFileName: oldFile.path ? path.resolve(oldFile.path) : null,
                newFileName: newFile.path ? path.resolve(newFile.path) : null,
                newFile: agogosProject.projectFiles
            });
        }
        event.sender.send(ChannelStartup, <Startup>{ workDir: agogosProject.projectDirectory, /*project: agogosProject,*/ projectFile: agogosProject.projectFiles });
    });
}
function loadMenu()
{

    let menu = new Menu();
    menu.append(new MenuItem({
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
                accelerator:"CommandOrControl+Shift+S",
            }
        ]
    }));
    menu.append(new MenuItem({
        label: "Edit",
        role: "editMenu"
    }));
    menu.append(new MenuItem({
        label: "Window",
        role: "windowMenu"
    }));
    menu.append(new MenuItem({
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