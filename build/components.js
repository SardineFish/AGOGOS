"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const dist_1 = __importDefault(require("../../react-free-viewport/dist"));
const process_editor_1 = require("./process-editor");
const lib_1 = require("./lib");
const ipc_1 = require("./ipc");
const lib_renderer_1 = require("./lib-renderer");
class Pane extends react_1.default.Component {
    render() {
        return (react_1.default.createElement("section", { className: [this.props.className, "pane"].join(" "), id: this.props.id, key: this.props.key, style: this.props.style },
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
    addProcess(process, pos) {
        process.name = lib_1.getUUID();
        console.log(process);
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
        //process.name = `Process${this.processes.size}`;
        this.processes.set(process.name, { process: process, renderer: null });
        lib_renderer_1.AGOGOSRenderer.instance.processesData = lib_1.toMapObject(this.processes, p => p.process);
        /*let element = renderProcessNode({
            node:process, onDragStart, onNodeDragMove, (p)=> this.startConnection(p), (p) => this.endConnection(p), (p) =>
        {
            this.processes.get(process.name).renderer = p;
        }
    });*/
        let element = process_editor_1.renderProcessNode({
            process: process,
            onDragMoveStart: onDragStart,
            onDragMove: onNodeDragMove,
            onConnectStart: (p) => this.startConnection(p),
            onConnectEnd: (p) => this.endConnection(p),
            refCallback: (p) => this.processes.get(process.name).renderer = p
        }, pos);
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
        let pos = this.viewport.mousePosition(this.processes.get(endpoint.process).renderer.getPortPos(endpoint.property, endpoint.port));
        this.processes.forEach(obj => {
            obj.renderer.setState({ connecting: true });
        });
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
        const resetConnection = () => {
            this.pendingConnection = null;
            this.connecting = false;
        };
        this.pendingConnection.obj.target = endpoint;
        let source = this.pendingConnection.obj.source;
        let target = this.pendingConnection.obj.target;
        if (source.port === target.port) {
            lib_renderer_1.AGOGOSRenderer.instance.console.log("Can not connect same port.", "warn");
            resetConnection();
            return;
        }
        else if (source.port === "input") {
            source = this.pendingConnection.obj.target;
            target = this.pendingConnection.obj.source;
        }
        if (this.processes.get(target.process).process.properties[target.property].input) {
            lib_renderer_1.AGOGOSRenderer.instance.console.log("Already has input connection.", "warn");
            resetConnection();
            return;
        }
        this.processes.get(target.process).process.properties[target.property].input = source;
        this.pendingConnection.renderer.setState({
            to: this.viewport.mousePosition(this.processes.get(endpoint.process).renderer.getPortPos(endpoint.property, endpoint.port))
        });
        this.connections.push(this.pendingConnection);
        resetConnection();
        lib_renderer_1.AGOGOSRenderer.instance.processesData = lib_1.toMapObject(this.processes, p => p.process);
    }
    updateConnectionLine(line) {
        if (line.obj.target) {
            line.renderer.setState({
                from: this.viewport.mousePosition(this.processes.get(line.obj.source.process).renderer.getPortPos(line.obj.source.property, line.obj.source.port)),
                to: this.viewport.mousePosition(this.processes.get(line.obj.target.process).renderer.getPortPos(line.obj.target.property, line.obj.target.port))
            });
        }
        else {
            line.renderer.setState({
                from: this.viewport.mousePosition(this.processes.get(line.obj.source.process).renderer.getPortPos(line.obj.source.property, line.obj.source.port))
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
        /*processManager.addProcess("TestProcessNode", TestProcessNode);
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));*/
        /*this.addProcess(processManager.getProcessData(new TestProcessNode()));
        this.addProcess(processManager.getProcessData(new TestProcessNode()));
        this.addProcess(processManager.getProcessData(new TestProcessNode()));*/
        window.addEventListener("mousemove", (e) => this.onWindowMouseMove(e));
        window.addEventListener("mouseup", (e) => this.onWindowMouseUp(e));
    }
    async onFileDrop(e) {
        let pos = this.viewport.mousePosition(lib_1.vec2(e.clientX, e.clientY));
        e.preventDefault();
        this.addProcess(await lib_renderer_1.AGOGOSRenderer.instance.ipc.call(ipc_1.IPCRenderer.GetProcess, e.dataTransfer.getData("text/plain")), pos);
    }
    render() {
        const { children, ref, key, ...other } = this.props;
        return (react_1.default.createElement(dist_1.default, Object.assign({ id: this.props.id, ref: "viewport", button: 1, refobj: this.domRef, onDrop: e => this.onFileDrop(e), onDragOver: e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            } }, other)));
    }
}
exports.ProcessSpace = ProcessSpace;
class ProgressBar extends react_1.default.Component {
    render() {
        let { className, ...others } = this.props;
        className = [className, "progress-bar"].join(" ");
        return (react_1.default.createElement("span", Object.assign({ className: className }, others, { style: { display: "inline-block", position: "relative" } }),
            react_1.default.createElement("span", { className: "progress", style: {
                    display: "block",
                    position: "absolute",
                    left: "0",
                    top: "0",
                    height: "100%",
                    width: `${this.props.progress * 100}%`
                } })));
    }
}
exports.ProgressBar = ProgressBar;
//# sourceMappingURL=components.js.map