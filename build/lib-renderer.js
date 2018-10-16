"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipc_1 = require("./ipc");
const { Menu } = electron_1.remote;
function GetProjectSettings() {
    return electron_1.ipcRenderer.sendSync(ipc_1.ChannelProjectSettings);
}
exports.GetProjectSettings = GetProjectSettings;
function PopupProjectMenu(context) {
    Menu.buildFromTemplate([
        {
            label: "New File",
        },
        {
            label: "New Folder",
        },
        {
            label: "Rename"
        }
    ]).popup({});
}
exports.PopupProjectMenu = PopupProjectMenu;
function diffProjectFilesRenderer(files, fileNode) {
    return null;
    for (let i = 0; i < files.children.length; i++) {
        for (let j = 0; j < fileNode.children.length; j++) {
        }
    }
}
exports.diffProjectFilesRenderer = diffProjectFilesRenderer;
//# sourceMappingURL=lib-renderer.js.map