"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const dist_1 = __importDefault(require("../../react-free-viewport/dist"));
const process_node_1 = require("./process-node");
const process_editor_1 = require("./process-editor");
const lib_1 = require("./lib");
const process_manager_1 = __importDefault(require("./process-manager"));
class Pane extends react_1.default.Component {
    render() {
        return (react_1.default.createElement("section", { className: [this.props.className, "pane"].join(" "), id: this.props.id, key: this.props.key },
            react_1.default.createElement("header", { className: "pane-header" }, this.props.header),
            react_1.default.createElement("div", { className: "pane-content" }, this.props.children)));
    }
}
exports.Pane = Pane;
class ProcessSpace extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.processes = new Map();
        this.connections = [];
        this.connecting = false;
        this.domRef = react_1.default.createRef();
    }
    addProcess(process) {
        let startPos;
        let holdPos;
        const onDragStart = (e) => {
            let style = getComputedStyle(element);
            startPos = lib_1.vec2(parseFloat(style.left), parseFloat(style.top));
            holdPos = this.viewport.mousePosition(lib_1.vec2(e.startX, e.startY));
        };
        const onNodeDragMove = (e) => {
            let dp = lib_1.Vector2.minus(this.viewport.mousePosition(lib_1.vec2(e.x, e.y)), holdPos);
            let pos = lib_1.Vector2.plus(startPos, dp);
            element.style.left = `${pos.x}px`;
            element.style.top = `${pos.y}px`;
            this.connections.forEach(cnn => this.updateConnectionLine(cnn));
            if (this.connecting)
                this.updateConnectionLine(this.pendingConnection);
        };
        process.name = `Process${this.processes.size}`;
        this.processes.set(process.name, { process: process, renderer: null });
        let element = process_editor_1.renderProcessNode(process, onDragStart, onNodeDragMove, (p) => this.startConnection(p), (p) => this.endConnection(p), (p) => {
            this.processes.get(process.name).renderer = p;
        });
        this.domRef.current.querySelector(".viewport-wrapper").appendChild(element);
    }
    startConnection(endpoint) {
        if (this.connecting)
            return;
        this.pendingConnection = {
            obj: {
                source: endpoint,
                target: null
            },
            renderer: null,
            element: null
        };
        let pos = this.viewport.mousePosition(this.processes.get(endpoint.process.name).renderer.getPortPos(endpoint.property, endpoint.port));
        //this.connecting = true;
        process_editor_1.RenderConnectLine({
            from: pos,
            to: pos
        }).then(({ line, element }) => {
            this.connecting = true;
            this.domRef.current.querySelector(".viewport-wrapper").appendChild(element);
            this.pendingConnection.renderer = line;
            this.pendingConnection.element = element;
            console.log(line);
        });
    }
    endConnection(endpoint) {
    }
    updateConnectionLine(line) {
        if (line.obj.target) {
            line.renderer.setState({
                from: this.viewport.mousePosition(this.processes.get(line.obj.source.process.name).renderer.getPortPos(line.obj.source.property, line.obj.source.port)),
                to: this.viewport.mousePosition(this.processes.get(line.obj.target.process.name).renderer.getPortPos(line.obj.target.property, line.obj.target.port))
            });
        }
        else {
            line.renderer.setState({
                from: this.viewport.mousePosition(this.processes.get(line.obj.source.process.name).renderer.getPortPos(line.obj.source.property, line.obj.source.port))
            });
        }
    }
    onWindowMouseMove(e) {
        if (this.connecting) {
            this.pendingConnection.renderer.setState({ to: this.viewport.mousePosition(lib_1.vec2(e.clientX, e.clientY)) });
        }
    }
    onWindowMouseUp(e) {
        if (this.connecting) {
            this.connecting = false;
            this.pendingConnection.element.remove();
            this.pendingConnection = null;
        }
    }
    componentDidMount() {
        this.viewport = this.refs["viewport"];
        this.addProcess(process_manager_1.default.getProcessData(new process_node_1.TestProcessNode()));
        this.addProcess(process_manager_1.default.getProcessData(new process_node_1.TestProcessNode()));
        this.addProcess(process_manager_1.default.getProcessData(new process_node_1.TestProcessNode()));
        window.addEventListener("mousemove", (e) => this.onWindowMouseMove(e));
        window.addEventListener("mouseup", (e) => this.onWindowMouseUp(e));
    }
    render() {
        const { children, ...other } = this.props;
        return (react_1.default.createElement(dist_1.default, { id: this.props.id, ref: "viewport", button: 1, refobj: this.domRef }));
    }
}
exports.ProcessSpace = ProcessSpace;
//# sourceMappingURL=components.js.map