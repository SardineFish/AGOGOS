import { app, BrowserWindow, ipcMain, Event, Menu, MenuItem } from "electron";
import program from "commander";
import fs from "fs";
import path from "path";
import { Startup, ChannelStartup, ChannelProjectSettings } from "./ipc";
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
    app.on("ready", () =>
    {
        agogosProject = new AGOGOSProject(workDir);
        agogosProject.open()
            .then(() => loadRenderer())
            .catch(err => agogosProject.init(path.basename(workDir))
                .then(() => loadRenderer()));
        
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
        event.sender.send(ChannelStartup, <Startup>{ workDir: agogosProject.projectDirectory });
    });
    ipcMain.on(ChannelProjectSettings, (event: Event, args: any) =>
    {
        event.returnValue = agogosProject; 
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