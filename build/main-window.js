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
function getDirData(dirPath) {
    return fs_1.default.readdirSync(dirPath).map((name) => {
        let p = path_1.default.resolve(dirPath, name);
        return {
            name: name,
            children: fs_1.default.statSync(p).isDirectory() ? [] : undefined,
            data: p
        };
    });
}
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workDir: this.props.workDir,
            dirData: {
                name: props.workDir,
                children: getDirData(this.props.workDir),
                data: this.props.workDir
            }
        };
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(react_split_pane_1.default, { split: "vertical", minSize: 50, defaultSize: 100, allowResize: true },
                React.createElement("div", { id: "left-side" },
                    React.createElement(react_split_pane_1.default, { split: "horizontal", defaultSize: 100, allowResize: true },
                        React.createElement("div", { id: "work-dir", className: "pane" },
                            React.createElement(react_tree_viewer_1.TreeViewer, { data: this.state.dirData, onExtend: (state) => console.log(state.nodeData.children = getDirData(state.nodeData.data)) })),
                        React.createElement("div", { id: "res-lib", className: "pane" }, "2"))),
                React.createElement("div", { id: "mid", className: "pane" }, "0"))));
    }
}
const $ = (selector) => document.querySelector(selector);
electron_1.ipcRenderer.once(ipc_1.ChannelStartup, (event, args) => {
    const element = (React.createElement(App, { workDir: args.workDir }));
    ReactDOM.render(element, $("#root"));
});
electron_1.ipcRenderer.send("ping", "ping");
//# sourceMappingURL=main-window.js.map