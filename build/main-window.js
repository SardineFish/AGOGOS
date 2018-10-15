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
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
const react_split_pane_1 = __importDefault(require("react-split-pane"));
const react_tree_viewer_1 = require("../../react-tree-viewer");
const electron_1 = require("electron");
const ipc_1 = require("./ipc");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const components_1 = require("./components");
const linq_1 = __importDefault(require("linq"));
const lib_renderer_1 = require("./lib-renderer");
const lib_1 = require("./lib");
const project_1 = require("./project");
function toProjectFileData(root) {
    let { children, ...other } = root;
    return {
        extend: false,
        data: root.path,
        icon: (React.createElement("span", { className: lib_1.switchCase(root.type, { "file": `node-icon file ${path_1.default.extname(root.path).replace(".", "")}`, "folder": "node-icon directory" }) })),
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
            icon: (React.createElement("span", { className: isDir ? "node-icon directory" : `node-icon file ${path_1.default.extname(p).replace(".", "")}` }))
        };
    })).orderBy(node => fs_1.default.statSync(node.data).isDirectory() ? 0 : 1).toArray();
}
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workDir: null,
            dirData: null,
            statusText: { type: "log", message: "AGOGOS ready" },
            consoleText: { type: "error", message: "Development environment." },
            projectFile: null
        };
    }
    onFolderExtend(nodeData) {
        return nodeData;
    }
    onProjectContextMenu(e) {
        lib_renderer_1.PopupProjectMenu(e.parent.data);
    }
    onProjectReady(projectFile) {
        let projectFileData = toProjectFileData(this.state.projectFile);
        projectFileData.icon = (React.createElement("span", { className: "node-icon directory" }));
        projectFileData.name = projectFileData.path;
        projectFileData.extend = true;
        this.setState({
            dirData: projectFileData
        });
        electron_1.ipcRenderer.on(ipc_1.ChannelFileChanged, (event, args) => {
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
        electron_1.ipcRenderer.on(ipc_1.ChannelConsole, (event, args) => {
            this.setState({ consoleText: args });
        });
    }
    componentDidMount() {
        electron_1.ipcRenderer.once(ipc_1.ChannelStartup, (event, args) => {
            this.setState({
                workDir: args.workDir,
                projectFile: args.projectFile
            });
            this.onProjectReady(args.projectFile);
        });
        electron_1.ipcRenderer.send("ping", "ping");
    }
    render() {
        let data = this.state.dirData;
        return (React.createElement("div", { id: "content" },
            React.createElement("main", { id: "main" },
                React.createElement(react_split_pane_1.default, { split: "vertical", minSize: 50, defaultSize: 300, allowResize: true },
                    React.createElement("div", { id: "left-side" },
                        React.createElement(react_split_pane_1.default, { split: "horizontal", defaultSize: 400, allowResize: true },
                            React.createElement(components_1.Pane, { id: "work-dir", header: "Project" },
                                React.createElement(react_tree_viewer_1.TreeViewer, { nodeData: this.state.dirData, tabSize: 10, root: true, onContextMenu: e => this.onProjectContextMenu(e), onExtend: (nodeData) => this.onFolderExtend(nodeData) })),
                            React.createElement(components_1.Pane, { id: "res-lib", header: "Library" }))),
                    React.createElement("div", { id: "mid", className: "pane" },
                        React.createElement(components_1.ProcessSpace, { id: "process-space" })))),
            React.createElement("footer", { id: "status-bar" },
                this.state.consoleText ?
                    React.createElement("span", { id: "console-text", className: `icon-before msg-${this.state.consoleText.type}` }, this.state.consoleText.message)
                    : null,
                this.state.statusText ?
                    React.createElement("span", { id: "status-text", className: `icon-before msg-${this.state.statusText.type}` }, this.state.statusText.message)
                    : null)));
    }
}
const $ = (selector) => document.querySelector(selector);
const element = (React.createElement(App, null));
ReactDOM.render(element, $("#root"));
//# sourceMappingURL=main-window.js.map