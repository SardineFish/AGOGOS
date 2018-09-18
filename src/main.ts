import { app, BrowserWindow, ipcMain, Event } from "electron";
import program from "commander";
import fs from "fs";
import path from "path";
import { Startup, ChannelStartup } from "./ipc";

const pkg = require('../package.json');

program
    .version(pkg.version);

program
    .arguments("<dir>");

program.parse(process.argv);

//console.log(program.args);

let workDir = path.normalize(program.args[0]);
console.log(workDir);
if (!fs.existsSync(workDir))
    program.help();

app.on("ready", () =>
{
    let window = new BrowserWindow({ width: 1280, height: 720 });
    window.loadFile("./res/html/index.html");

    ipcMain.on("ping", (event: Event, args: any) =>
    {
        console.log(args);
        event.returnValue = "pong";
        event.sender.send(ChannelStartup, <Startup>{ workDir: workDir });
    });
});