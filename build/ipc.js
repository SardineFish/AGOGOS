"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const electron_1 = require("electron");
exports.ChannelStartup = "startup";
exports.ChannelProjectSettings = "proj-settings";
exports.ChannelFileChanged = "file-chenged";
exports.ChannelConsole = "agogos-console";
exports.ChannelStatus = "agogos-status";
exports.ChannelProjectReady = "agogos-ready";
exports.ChannelGetProcess = "get-process";
exports.ChannelIpcCall = "_ipc-call";
exports.ChannelStatusCompile = "status-compile";
exports.ChannelStatusReady = "status-ready";
exports.IPCRenderer = {
    GetProcess: "get-process-data",
    GetProcessData: "get-process-data-from-renderer"
};
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
class GeneralIPC {
    constructor(entity) {
        this.callList = new Map();
        this.handler = new Map();
        this.increaseCallID = 0;
        this.entity = entity;
        this.entity.receive((msg) => this.onmessage(msg));
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
            returnValue.then(returnValue => this.entity.send({ name: IPCReturnValue, callId, data: returnValue }));
        else
            this.entity.send({ name: IPCReturnValue, callId, data: returnValue });
    }
    add(name, handler) {
        this.handler.set(name, handler);
    }
    async call(name, ...args) {
        let callId = ++this.increaseCallID;
        return new Promise((resolve) => {
            this.callList.set(callId, resolve);
            this.entity.send({ name, callId, data: args });
        });
    }
}
exports.GeneralIPC = GeneralIPC;
class ProcessIPC extends GeneralIPC {
    constructor(process) {
        super({
            receive: (msg) => process.on("message", msg),
            send: (args) => process.send(args)
        });
        this.process = process;
    }
}
exports.ProcessIPC = ProcessIPC;
class ProjectCompiled {
}
exports.ProjectCompiled = ProjectCompiled;
//# sourceMappingURL=ipc.js.map