"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipc_1 = require("./ipc");
class PropertyData {
}
exports.PropertyData = PropertyData;
class ProcessNodeData {
    constructor() {
        this.properties = new Map();
    }
}
exports.ProcessNodeData = ProcessNodeData;
class ObjectData {
    constructor() {
        this.properties = new Map();
    }
}
exports.ObjectData = ObjectData;
function GetProjectSettings() {
    return electron_1.ipcRenderer.sendSync(ipc_1.ChannelProjectSettings);
}
exports.GetProjectSettings = GetProjectSettings;
//# sourceMappingURL=lib-renderer.js.map