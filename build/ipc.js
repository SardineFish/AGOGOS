"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const electron_1 = require("electron");
exports.ChannelStartup = "startup";
exports.ChannelProjectSettings = "proj-settings";
exports.ChannelFileChanged = "file-chenged";
async function waitIpcRenderer(channel, timeout = 500) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer.once(channel, (event, args) => {
            resolve(args);
        });
        util_1.promisify(setTimeout)(timeout).then(() => reject(new Error("Ipc Timeout.")));
    });
}
exports.waitIpcRenderer = waitIpcRenderer;
async function waitIpcMain(channel, timeout = 500) {
    return new Promise((resolve, reject) => {
        electron_1.ipcMain.once(channel, (event, args) => {
            resolve(args);
        });
        util_1.promisify(setTimeout)(timeout).then(() => reject(new Error("Ipc Timeout.")));
    });
}
exports.waitIpcMain = waitIpcMain;
//# sourceMappingURL=ipc.js.map