import { app, BrowserWindow } from "electron";


app.on("ready", () =>
{
    let window = new BrowserWindow();
    window.loadFile("./main.js");
});