import { app, BrowserWindow, ipcMain, Event } from "electron";
import program from "commander";
import fs from "fs";
import path from "path";
import { Startup, ChannelStartup, ChannelProjectSettings } from "./ipc";
import { AGOGOSProject } from "./project";
require("electron-reload")(app.getAppPath());

const pkg = require('../package.json');

program
    .version(pkg.version);

program
    .arguments("<dir>");

program.parse(process.argv);

//console.log(program.args);

let agogosProject: AGOGOSProject;

loadProject();

function loadProject()
{
    app.on("ready", () =>
    {
        let workDir = path.normalize(program.args[0]);
        console.log(workDir);
        if (!fs.existsSync(workDir))
            program.help();
        agogosProject = new AGOGOSProject(workDir);
        agogosProject.open()
            .then(() => loadRenderer())
            .catch(err => agogosProject.init(path.basename(workDir))
                .then(() => loadRenderer()));
        
    });
}
function loadRenderer()
{
    let window = new BrowserWindow({ width: 1280, height: 720 });
    window.loadFile("./res/html/index.html");

    ipcMain.on("ping", (event: Event, args: any) =>
    {
        console.log(app.getAppPath());
        console.log(args);
        event.returnValue = "pong";
        event.sender.send(ChannelStartup, <Startup>{ workDir: agogosProject.projectDirectory });
    });
    ipcMain.on(ChannelProjectSettings, (event: Event, args: any) =>
    {
        event.returnValue = agogosProject; 
    });
}