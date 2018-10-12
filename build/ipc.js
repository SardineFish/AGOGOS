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
const IPCReturnValue = "__IPC_RETURN";
class ProcessIPC {
    constructor(process) {
        this.callList = new Map();
        this.handler = new Map();
        this.increaseCallID = 0;
        this.process = process;
        this.process.on("message", (msg) => this.onmessage(msg));
    }
    async onmessage(msg) {
        let { name, callId, data } = msg;
        let args = data;
        if (name === IPCReturnValue) {
            this.callList.get(callId)(data);
            this.callList.delete(callId);
            return;
        }
        let handler = this.handler.get(name);
        let returnValue;
        if (handler)
            returnValue = handler(...args);
        if (returnValue instanceof Promise)
            returnValue.then(returnValue => this.process.send({ name: IPCReturnValue, callId, data: returnValue }));
        else
            this.process.send({ name: IPCReturnValue, callId, data: returnValue });
    }
    add(name, handler) {
        this.handler.set(name, handler);
    }
    async call(name, ...args) {
        let callId = ++this.increaseCallID;
        return new Promise((resolve) => {
            this.callList.set(callId, resolve);
            this.process.send({ name, callId, data: args });
        });
    }
}
exports.ProcessIPC = ProcessIPC;
//# sourceMappingURL=ipc.js.map