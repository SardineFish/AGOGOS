"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipc_1 = require("./ipc");
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
const react_split_pane_1 = __importDefault(require("react-split-pane"));
const react_tree_viewer_1 = require("../../react-tree-viewer");
const ipc_2 = require("./ipc");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const components_1 = require("./components");
const linq_1 = __importDefault(require("linq"));
const lib_1 = require("./lib");
const project_1 = require("./project");
const editor_manager_1 = require("./editor-manager");
const process_editor_1 = require("./process-editor");
const { Menu } = electron_1.remote;
const $ = (selector) => document.querySelector(selector);
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
class AGOGOSRenderer {
    constructor() {
        this.ready = false;
        this.processesData = null;
        AGOGOSRenderer.instance = this;
        this.editorManager = new editor_manager_1.EditorManager();
        process_editor_1.InitEditor(this.editorManager);
    }
    get console() { return this.app.console; }
    ;
    init() {
        this.ipc = new ipc_2.GeneralIPC({
            receive: (msg) => electron_1.ipcRenderer.on(ipc_2.ChannelIpcCall, (event, args) => msg(args)),
            send: (args) => electron_1.ipcRenderer.send(ipc_2.ChannelIpcCall, args)
        });
        this.ipc.add(ipc_2.IPCRenderer.GetProcessData, () => {
            return this.processesData;
        });
        electron_1.ipcRenderer.on(ipc_1.ChannelStatusCompile, () => this.ready = false);
        electron_1.ipcRenderer.on(ipc_1.ChannelStatusReady, (event, args) => {
            this.processLib = args.processLib;
            this.typeLib = args.typeLib;
            this.editorManager.reset();
            process_editor_1.InitEditor(this.editorManager);
            args.customEditor.forEach(src => this.editorManager.importEditor(src));
            this.ready = true;
            this.console.log("Ready");
        });
        return this;
    }
    render() {
        const $ = (selector) => document.querySelector(selector);
        const element = (React.createElement(App, { callback: (app) => this.app = app }));
        ReactDOM.render(element, $("#root"));
        return this;
    }
}
exports.AGOGOSRenderer = AGOGOSRenderer;
function toProjectFileData(root) {
    let { children, ...other } = root;
    return {
        extend: false,
        data: root.path,
        icon: (React.createElement("span", { className: lib_1.switchCase(root.type, {
                "file": `node-icon file ${path_1.default.extname(root.path).replace(".", "")}`, "folder": "node-icon directory"
            }) }, " ")),
        children: children ? children.map(child => toProjectFileData(child)) : null,
        ...other
    };
}
function getDirData(dirPath) {
    return linq_1.default.from(fs_1.default.readdirSync(dirPath).filter(name => !name.startsWith(".")).map((name) => {
        let p = path_1.default.resolve(dirPath, name);
        let isDir = fs_1.default.statSync(p).isDirectory();
        return {
            extend: false,
            name: name,
            children: isDir ? [] : undefined,
            data: p,
            icon: (React.createElement("span", { className: isDir ? "node-icon directory" : `node-icon file ${path_1.default.extname(p).replace(".", "")}` }, " "))
        };
    })).orderBy(node => fs_1.default.statSync(node.data).isDirectory() ? 0 : 1).toArray();
}
class App extends React.Component {
    constructor(props) {
        super(props);
        this.consoleHistory = [];
        this.console = {
            log: (message, type = "log") => {
                console.log(message);
                this.consoleHistory.push({ message: `[GUI] ${message.toString()}`, type });
                this.setState({
                    consoleHistory: this.consoleHistory
                });
            }
        };
        this.consoleHistory = [{ type: "warn", message: "Development environment." }];
        this.state = {
            workDir: null,
            dirData: null,
            statusText: { message: "GUI Ready", loading: true, progress: 0.4 },
            consoleHistory: this.consoleHistory,
            projectFile: null,
            showConsole: false,
        };
    }
    get latestConsole() { return this.state.consoleHistory[this.state.consoleHistory.length - 1]; }
    onFolderExtend(nodeData) {
        return nodeData;
    }
    onProjectContextMenu(e) {
        PopupProjectMenu(e.parent.data);
    }
    onProjectReady(projectFile) {
        let projectFileData = toProjectFileData(this.state.projectFile);
        projectFileData.icon = (React.createElement("span", { className: "node-icon directory" }));
        projectFileData.name = projectFileData.path;
        projectFileData.extend = true;
        this.setState({
            dirData: projectFileData
        });
        electron_1.ipcRenderer.on(ipc_2.ChannelFileChanged, (event, args) => {
            let relativeOld = args.oldFileName ? path_1.default.relative(this.state.workDir, args.oldFileName) : null;
            let relativeNew = args.newFileName ? path_1.default.relative(this.state.workDir, args.newFileName) : null;
            let dir;
            if (args.operation === "add") {
                dir = project_1.ProjFile.getDirectory(projectFileData, relativeNew);
                let file = project_1.ProjFile.getFile(args.newFile, relativeNew);
                dir.children.push(toProjectFileData(file));
            }
            else if (args.operation === "rename") {
                dir = project_1.ProjFile.getDirectory(projectFileData, relativeOld);
                let file = project_1.ProjFile.getFile(projectFileData, relativeOld);
                file.path = args.newFileName;
                file.name = path_1.default.basename(args.newFileName);
            }
            else if (args.operation === "delete") {
                dir = project_1.ProjFile.getDirectory(projectFileData, relativeOld);
                dir.children = dir.children.filter(child => child.path !== args.oldFileName);
            }
            else
                return;
            dir.children = project_1.ProjFile.orderFiles(dir.children);
            this.setState({ dirData: projectFileData });
        });
        electron_1.ipcRenderer.on(ipc_2.ChannelConsole, (event, args) => {
            this.state.consoleHistory.push(args);
            this.setState({ consoleHistory: this.state.consoleHistory });
        });
        electron_1.ipcRenderer.on(ipc_2.ChannelStatus, (event, args) => {
            this.setState({
                statusText: args
            });
        });
    }
    componentDidMount() {
        this.props.callback(this);
        electron_1.ipcRenderer.once(ipc_2.ChannelStartup, (event, args) => {
            this.setState({
                workDir: args.workDir,
                projectFile: args.projectFile
            });
            this.onProjectReady(args.projectFile);
        });
        electron_1.ipcRenderer.send("ping", "ping");
    }
    onFileDragStart(e) {
        e.dataTransfer.setData("text/plain", e.nodeData.data);
        e.dataTransfer.dropEffect = "move";
        //this.console.log(e.nodeData.data);
    }
    render() {
        let data = this.state.dirData;
        return (React.createElement("div", { id: "content" },
            React.createElement("main", { id: "main" },
                React.createElement(react_split_pane_1.default, { split: "vertical", minSize: 50, defaultSize: 300, allowResize: true },
                    React.createElement("div", { id: "left-side" },
                        React.createElement(react_split_pane_1.default, { split: "horizontal", defaultSize: 400, allowResize: true },
                            React.createElement(components_1.Pane, { id: "work-dir", header: "Project" },
                                React.createElement(react_tree_viewer_1.TreeViewer, { nodeData: this.state.dirData, tabSize: 10, root: true, dragable: true, onDragStart: (e) => this.onFileDragStart(e), onContextMenu: e => this.onProjectContextMenu(e), onExtend: (nodeData) => this.onFolderExtend(nodeData) })),
                            React.createElement(components_1.Pane, { id: "res-lib", header: "Library" }))),
                    React.createElement("div", { id: "mid", className: "pane" },
                        React.createElement(components_1.ProcessSpace, { id: "process-space" })))),
            React.createElement("footer", { id: "status-bar" },
                React.createElement("span", { id: "agogos-console" },
                    this.state.consoleHistory.length > 0 ?
                        React.createElement("span", { id: "console-text", className: `icon-before msg-${this.latestConsole.type}`, onClick: () => this.setState({ showConsole: !this.state.showConsole }) }, this.latestConsole.message)
                        : null,
                    React.createElement(components_1.Pane, { id: "console-history", header: "Console", style: { visibility: this.state.showConsole ? "visible" : "collapse" } }, this.state.consoleHistory.map((con, idx) => (React.createElement("p", { className: `console-msg-item icon-before msg-${con.type}`, key: idx }, con.message))))),
                React.createElement("span", { id: "agogos-status" },
                    this.state.statusText.progress ?
                        React.createElement(components_1.ProgressBar, { progress: this.state.statusText.progress })
                        : null,
                    React.createElement("span", { id: "status-text", className: this.state.statusText.loading ? "loading" : "" }, this.state.statusText.message)))));
    }
}
//# sourceMappingURL=lib-renderer.js.map