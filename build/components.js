"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const dist_1 = __importDefault(require("../../react-free-viewport/dist"));
const utility_1 = require("./utility");
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
class EditorPage extends react_1.default.Component {
    onActive() {
    }
    onClose() {
    }
}
exports.EditorPage = EditorPage;
class LocatedComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.elementRef = react_1.default.createRef();
        this.state = {
            pos: this.props.pos
        };
    }
    componentWillReceiveProps(nextProps) {
        this.state = {
            pos: nextProps.pos
        };
    }
    moveTo(pos) {
        /*
        this.elementRef.current.style.left = `${pos.x}px`;
        this.elementRef.current.style.top = `${pos.y}px`;
        */
        this.setState({
            pos: pos
        });
    }
    render() {
        return (react_1.default.createElement("div", { className: ["located-object", this.props.className].join(" "), ref: this.elementRef, style: {
                left: `${this.state.pos.x}px`,
                top: `${this.state.pos.y}px`
            } }, this.props.children));
    }
}
exports.LocatedComponent = LocatedComponent;
class ProgramPage extends EditorPage {
    constructor(props) {
        super(props);
        this.connections = [];
        this.viewportElement = react_1.default.createRef();
        this.connectWrapper = react_1.default.createRef();
        this.state = {
            processes: this.props.program.processes,
            program: this.props.program
            //connections: this.props.program.connections
        };
    }
    componentWillReceiveProps(newProps) {
        this.setState({
            processes: newProps.program.processes,
            program: newProps.program
        });
    }
    async reload() {
        this.connections.forEach(cnn => {
            cnn.element.remove();
        });
        this.connections = [];
        this.connecting = false;
        if (this.pendingConnection && this.pendingConnection.element)
            this.pendingConnection.element.remove();
        this.pendingConnection = null;
        this.connections = await lib_1.mapAsync(this.state.program.connections, async (connection) => await this.addConnection(connection));
    }
    componentDidUpdate() {
        this.reload();
    }
    addProcess(process, pos) {
        if (!this.state.program) {
            lib_renderer_1.AGOGOSRenderer.instance.console.log("No AGOGOS program opened.", "warn");
            return;
        }
        process.name = lib_1.getUUID();
        console.log(process);
        /*
        let startPos: Vector2;
        let holdPos: Vector2;
        const onDragStart = (e: DragMoveEvent) =>
        {
            let style = getComputedStyle(element);
            startPos = vec2(parseFloat(style.left), parseFloat(style.top));
            holdPos = this.viewport.mousePosition(vec2(e.startX, e.startY));
        };
        const onNodeDragMove = (e: DragMoveEvent) =>
        {
            let dp = Vector2.minus(this.viewport.mousePosition(vec2(e.x, e.y)), holdPos);
            let pos = Vector2.plus(startPos, dp);
            element.style.left = `${pos.x}px`;
            element.style.top = `${pos.y}px`;
            return;
            this.connections.forEach(cnn => this.updateConnectionLine(cnn));
            if (this.connecting)
                this.updateConnectionLine(this.pendingConnection);
        };
        */
        //process.name = `Process${this.processes.size}`;
        //this.processes.set(process.name, { process: process, renderer: null });
        //AGOGOSRenderer.instance.processesData = toMapObject(this.processes, p => p.process);
        /*let element = renderProcessNode({
            node:process, onDragStart, onNodeDragMove, (p)=> this.startConnection(p), (p) => this.endConnection(p), (p) =>
        {
            this.processes.get(process.name).renderer = p;
        }
    });*/
        let processes = this.state.processes;
        processes[process.name] = {
            position: pos,
            process: process
        };
        this.setState({
            processes: processes
        });
        /*
        let element = renderProcessNode({
            process: process,
            onDragMoveStart: onDragStart,
            onDragMove: onNodeDragMove,
            onConnectStart: (p) => this.startConnection(p),
            onConnectEnd: (p) => this.endConnection(p),
            refCallback: (p) => this.processes.get(process.name).renderer = p
        }, pos);

        this.processes.set(process.name, {
            obj: process,
            renderer: null,
            element: element
        });

        this.domRef.current!.querySelector(".viewport-wrapper")!.appendChild(element);*/
    }
    async addConnection(connection) {
        var { line, element } = await process_editor_1.RenderConnectLine({
            from: this.viewport.mousePosition(this.refs[connection.source.process].getPortPos(connection.source.property, connection.source.port)),
            to: this.viewport.mousePosition(this.refs[connection.target.process].getPortPos(connection.target.property, connection.target.port))
        });
        this.connectWrapper.current.appendChild(element);
        return {
            obj: connection,
            element,
            renderer: line
        };
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
        let pos = this.viewport.mousePosition(this.refs[endpoint.process].getPortPos(endpoint.property, endpoint.port));
        utility_1.getKeys(this.state.processes).forEach(key => {
            this.refs[key].setState({ connecting: true });
        });
        /*this.processes.forEach(obj =>
        {
            obj.renderer.setState({ connecting: true });
        });*/
        //this.connecting = true;
        process_editor_1.RenderConnectLine({
            from: pos,
            to: pos
        }).then(({ line, element }) => {
            this.connecting = true;
            this.connectWrapper.current.appendChild(element);
            //this.domRef.current!.querySelector(".viewport-wrapper")!.appendChild(element);
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
            this.pendingConnection.element.remove();
            resetConnection();
            return;
        }
        else if (source.port === "input") {
            source = this.pendingConnection.obj.target;
            target = this.pendingConnection.obj.source;
        }
        if (this.state.processes[target.process].process.properties[target.property].input) {
            lib_renderer_1.AGOGOSRenderer.instance.console.log("Already has input connection.", "warn");
            this.pendingConnection.element.remove();
            resetConnection();
            return;
        }
        this.state.processes[target.process].process.properties[target.property].input = source;
        this.pendingConnection.renderer.setState({
            to: this.viewport.mousePosition(this.refs[endpoint.process].getPortPos(endpoint.property, endpoint.port))
        });
        this.connections.push(this.pendingConnection);
        this.state.program.connections.push(this.pendingConnection.obj);
        resetConnection();
        //AGOGOSRenderer.instance.processesData = toMapObject(this.processes, p => p.obj);
    }
    updateConnectionLine(line) {
        if (line.obj.target) {
            line.renderer.setState({
                from: this.viewport.mousePosition(this.refs[line.obj.source.process].getPortPos(line.obj.source.property, line.obj.source.port)),
                to: this.viewport.mousePosition(this.refs[line.obj.target.process].getPortPos(line.obj.target.property, line.obj.target.port)),
            });
        }
        else {
            line.renderer.setState({
                from: this.viewport.mousePosition(this.refs[line.obj.source.process].getPortPos(line.obj.source.property, line.obj.source.port)),
            });
        }
    }
    onDragMoveStart(process, e) {
        this.dragging = {
            startMousePos: this.viewport.mousePosition(lib_1.vec2(e.startX, e.startY)),
            startPos: this.state.processes[process].position
        };
    }
    onDragMove(process, e) {
        var mousePos = this.viewport.mousePosition(lib_1.vec2(e.x, e.y));
        this.state.processes[process].position = lib_1.Vector2.plus(this.dragging.startPos, lib_1.Vector2.minus(mousePos, this.dragging.startMousePos));
        this.refs[`wrapper-${process}`].moveTo(this.state.processes[process].position);
        this.connections.forEach(l => this.updateConnectionLine(l));
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
        window.addEventListener("mousemove", (e) => this.onWindowMouseMove(e));
        window.addEventListener("mouseup", (e) => this.onWindowMouseUp(e));
        this.reload();
    }
    async onFileDrop(e) {
        let pos = this.viewport.mousePosition(lib_1.vec2(e.clientX, e.clientY));
        e.preventDefault();
        this.addProcess(await lib_renderer_1.AGOGOSRenderer.instance.ipc.call(ipc_1.IPCRenderer.GetProcess, e.dataTransfer.getData("text/plain")), pos);
    }
    render() {
        return (react_1.default.createElement(dist_1.default, { className: "editor-viewport", ref: "viewport", button: 1, refobj: this.viewportElement, onDrop: e => this.onFileDrop(e), onDragOver: e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            } },
            utility_1.getKeys(this.state.processes).map(key => (react_1.default.createElement(LocatedComponent, { className: "process-node", pos: this.state.processes[key].position, ref: `wrapper-${key}`, key: key },
                react_1.default.createElement(process_editor_1.ProcessEditor, { ref: key, process: this.state.processes[key].process, onDragMoveStart: e => this.onDragMoveStart(key, e), onDragMove: e => this.onDragMove(key, e), onConnectStart: e => this.startConnection(e), onConnectEnd: e => this.endConnection(e) })))),
            react_1.default.createElement("div", { className: "connections-wrapper", ref: this.connectWrapper })));
    }
}
exports.ProgramPage = ProgramPage;
class ProcessSpace extends EditorPage {
    constructor(props) {
        super(props);
        this.processes = new Map();
        this.connections = [];
        this.connecting = false;
        this.domRef = react_1.default.createRef();
        lib_renderer_1.AGOGOSRenderer.instance.ipc.add(ipc_1.IPCRenderer.SendProgram, (prog) => {
            this.processes.forEach(p => {
                p.element.remove();
            });
            this.processes.clear();
            this.program = this.program;
            this.connections.forEach(connection => {
                connection.element.remove();
            });
            this.connections = [];
            if (this.pendingConnection)
                this.pendingConnection.element.remove();
        });
    }
    addProcess(process, pos) {
        if (!this.program) {
            lib_renderer_1.AGOGOSRenderer.instance.console.log("No AGOGOS program opened.", "warn");
            return;
        }
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
        //this.processes.set(process.name, { process: process, renderer: null });
        //AGOGOSRenderer.instance.processesData = toMapObject(this.processes, p => p.process);
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
        this.processes.set(process.name, {
            obj: process,
            renderer: null,
            element: element
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
            this.pendingConnection.element.remove();
            resetConnection();
            return;
        }
        else if (source.port === "input") {
            source = this.pendingConnection.obj.target;
            target = this.pendingConnection.obj.source;
        }
        if (this.processes.get(target.process).obj.properties[target.property].input) {
            lib_renderer_1.AGOGOSRenderer.instance.console.log("Already has input connection.", "warn");
            this.pendingConnection.element.remove();
            resetConnection();
            return;
        }
        this.processes.get(target.process).obj.properties[target.property].input = source;
        this.pendingConnection.renderer.setState({
            to: this.viewport.mousePosition(this.processes.get(endpoint.process).renderer.getPortPos(endpoint.property, endpoint.port))
        });
        this.connections.push(this.pendingConnection);
        resetConnection();
        //AGOGOSRenderer.instance.processesData = toMapObject(this.processes, p => p.obj);
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
        window.addEventListener("mousemove", (e) => this.onWindowMouseMove(e));
        window.addEventListener("mouseup", (e) => this.onWindowMouseUp(e));
    }
    async onFileDrop(e) {
        let pos = this.viewport.mousePosition(lib_1.vec2(e.clientX, e.clientY));
        e.preventDefault();
        this.addProcess(await lib_renderer_1.AGOGOSRenderer.instance.ipc.call(ipc_1.IPCRenderer.GetProcess, e.dataTransfer.getData("text/plain")), pos);
    }
    render() {
        const { children, ...other } = this.props;
        return (react_1.default.createElement(dist_1.default, Object.assign({ className: "editor-viewport", ref: "viewport", button: 1, refobj: this.domRef, onDrop: e => this.onFileDrop(e), onDragOver: e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            } }, other)));
    }
}
exports.ProcessSpace = ProcessSpace;
class PageContainer extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            pages: [],
            activePageIdx: -1,
            pageTitles: []
        };
    }
    get currentIdx() { return this.state.activePageIdx; }
    set currentIdx(value) { this.openPage(value); }
    addPage(title, page) {
        var pages = this.state.pages;
        pages.push(page);
        this.state.pageTitles.push(title);
        this.setState({
            activePageIdx: pages.length - 1,
            pages: pages,
            pageTitles: this.state.pageTitles
        });
    }
    openPage(idx) {
        this.setState({
            activePageIdx: idx
        });
    }
    onClose(e, idx) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onPageClose && (!this.props.onPageClose(idx)))
            return;
        let labels = this.state.pageTitles;
        let pages = this.state.pages;
        let active = this.state.activePageIdx;
        lib_1.removeAt(pages, idx);
        lib_1.removeAt(labels, idx);
        if (active >= pages.length) {
            active--;
        }
        this.setState({
            activePageIdx: active,
            pages: pages,
            pageTitles: labels,
        });
    }
    render() {
        return (react_1.default.createElement("div", { className: "page-container" },
            react_1.default.createElement("header", { className: "page-bar" },
                react_1.default.createElement("ul", { className: "page-list" }, this.state.pageTitles.map((title, idx) => (react_1.default.createElement("li", { className: ["page-label", this.state.activePageIdx === idx ? "opened" : ""].join(" "), key: idx, onClick: (e) => this.openPage(idx) },
                    react_1.default.createElement("span", { className: "page-name" }, title),
                    react_1.default.createElement("span", { className: "button-close-page", onClick: (e) => this.onClose(e, idx) })))))),
            react_1.default.createElement("main", { className: "page-content" }, this.state.pages[this.state.activePageIdx])));
    }
}
exports.PageContainer = PageContainer;
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