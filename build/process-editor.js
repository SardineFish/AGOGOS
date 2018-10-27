"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const utility_1 = require("./utility");
const meta_data_1 = require("./meta-data");
const react_dom_1 = __importDefault(require("react-dom"));
const lib_1 = require("./lib");
const lib_renderer_1 = require("./lib-renderer");
const BuildinTypesList = [
    "string",
    "number",
    "boolean",
    "void",
    "object",
    "array"
];
/*
interface ArrayEditorProps extends EditorProps<any[]>
{
}
interface ArrayEditorState
{
    extend: boolean;
    arrayData: PropertyData;
}

class ArrayEditor extends React.Component<ArrayEditorProps, ArrayEditorState>
{
    nodeRef: RefObject<HTMLDivElement>;
    constructor(props: ArrayEditorProps)
    {
        super(props);
        this.nodeRef = React.createRef();
        this.state = {
            extend: false,
            arrayData: this.props.editvalue ? this.props.editvalue : {
                type: this.props.type,
                elementType: getElementType(this.props.type),
                elements:[]
            }
        };
    }
    componentDidMount()
    {
        if (this.props.onChange)
            this.props.onChange(this.state.arrayData);
    }
    onValueChange(idx: number, value: any)
    {
        this.state.arrayData.elements[idx] = value;
    }
    onPortMouseDown(port: "input" | "output")
    {
        if (this.props.onConnectStart)
        {
            this.props.onConnectStart({
                process: this.props.node.name,
                property: this.props.propertyName,
                port: port
            });
        }
    }
    onPortMouseUp(port: "input" | "output")
    {
        if (this.props.connecting && this.props.onConnectEnd)
            this.props.onConnectEnd({
                process: this.props.node.name,
                property: this.props.propertyName,
                port: port
            });
    }
    onChildConnectStart(endpoint: EndPoint)
    {
        endpoint.property = `${this.props.propertyName}.${endpoint.property}`;
        if (this.props.onConnectStart)
            this.props.onConnectStart(endpoint);
    }
    onChildConnectEnd(endpoint: EndPoint)
    {
        endpoint.property = `${this.props.propertyName}.${endpoint.property}`;
        if (this.props.onConnectEnd)
            this.props.onConnectEnd(endpoint);
    }
    getPortPos(key: string, port: string): Vector2
    {
        let keys = key.split(".");
        if (keys.length > 1 && (this.refs[keys[0]] as EditorObject).state.extend)
        {
            return (this.refs[keys[0]] as EditorObject).getPortPos(keys.slice(1).join('.'), port);
        }
        let rect = this.nodeRef.current!.querySelector(`.editor-${keys[0]} .port-${port}`).getBoundingClientRect();
        return vec2(rect.left + 5, rect.top + 5);
    }
}*/
class EditorContent extends react_1.default.Component {
    render() {
        return (react_1.default.createElement("div", { className: "editor-children" }, this.props.children));
    }
}
class Editor extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.props.property.properties = this.props.property.properties || {};
        this.props.property.elements = this.props.property.elements || [];
        this.state = {
            extend: false
        };
        this.nodeRef = react_1.default.createRef();
    }
    onPortMouseDown(port) {
        if (this.props.onConnectStart) {
            this.props.onConnectStart({
                process: this.props.process,
                property: this.props.property.name,
                port: port
            });
        }
    }
    onPortMouseUp(port) {
        if (this.props.connecting && this.props.onConnectEnd)
            this.props.onConnectEnd({
                process: this.props.process,
                property: this.props.property.name,
                port: port
            });
    }
    onChildrenChanged(data) {
        this.props.property.properties[data.name] = data;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    onChildConnectStart(endpoint) {
        endpoint.property = `${this.props.property.name}.${endpoint.property}`;
        if (this.props.onConnectStart)
            this.props.onConnectStart(endpoint);
    }
    onChildConnectEnd(endpoint) {
        endpoint.property = `${this.props.property.name}.${endpoint.property}`;
        if (this.props.onConnectEnd)
            this.props.onConnectEnd(endpoint);
    }
    getPortPos(key, port) {
        let keys = key.split(".");
        if (keys.length > 1 && this.refs[keys[0]].state.extend) {
            return this.refs[keys[0]].getPortPos(keys.slice(1).join('.'), port);
        }
        let rect = this.nodeRef.current.querySelector(`.editor-${keys[0]} .port-${port}`).getBoundingClientRect();
        return lib_1.vec2(rect.left + 5, rect.top + 5);
    }
    render() {
        return (react_1.default.createElement("div", { className: ["object-editor", this.state.extend ? "extend" : "fold"].join(" "), ref: this.nodeRef },
            react_1.default.createElement("span", { className: ["editor", "editor-header", `editor-${this.props.property.name}`].concat(this.props.className ? [this.props.className] : []).join(" ") },
                this.props.allowInput ?
                    (react_1.default.createElement("span", { className: "port-input", onMouseDown: () => this.onPortMouseDown("input"), onMouseUp: () => this.onPortMouseUp("input") })) : null,
                this.props.editorContent ?
                    react_1.default.createElement("span", { className: `fold-icon ${this.state.extend ? "extend" : "fold"}`, onClick: () => this.setState({ extend: !this.state.extend }) })
                    : null,
                react_1.default.createElement("span", { className: "editor-label" }, this.props.label),
                this.props.editorHeader ?
                    this.props.editorHeader
                    : `object: ${this.props.property.type}`,
                this.props.allowOutput ?
                    (react_1.default.createElement("span", { className: "port-output", onMouseDown: () => this.onPortMouseDown("output"), onMouseUp: () => this.onPortMouseUp("output") })) : null),
            this.state.extend ?
                this.props.editorContent
                : null));
    }
}
exports.Editor = Editor;
class StringEditor extends Editor {
    constructor(props) {
        super(props);
        this.input = react_1.default.createRef();
    }
    componentDidMount() {
        this.input.current.value = this.props.property.value ? this.props.property.value : "";
        this.props.property.value = this.input.current.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    onChange(e) {
        this.props.property.value = e.target.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    render() {
        let { children, editorHeader, ...others } = this.props;
        editorHeader = (react_1.default.createElement("input", Object.assign({ type: "text", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (this.props.editable ? {} : { value: this.props.property.value }))));
        return (react_1.default.createElement(Editor, Object.assign({ header: editorHeader }, others)));
    }
}
class NumberEditor extends Editor {
    constructor(props) {
        super(props);
        this.input = react_1.default.createRef();
    }
    componentDidMount() {
        this.input.current.value = this.props.property.value ? this.props.property.value : 0;
        this.props.property.value = this.input.current.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    onChange(e) {
        this.props.property.value = e.target.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    render() {
        let { children, editorHeader, ...others } = this.props;
        editorHeader = (react_1.default.createElement("input", Object.assign({ type: "number", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (this.props.editable ? {} : { value: this.props.property.value }))));
        return (react_1.default.createElement(Editor, Object.assign({ editorHeader: editorHeader }, others)));
    }
}
class BooleanEditor extends Editor {
    constructor(props) {
        super(props);
        this.input = react_1.default.createRef();
    }
    componentDidMount() {
        this.input.current.value = this.props.property.value ? this.props.property.value : 0;
        this.props.property.value = this.input.current.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    onChange(e) {
        this.props.property.value = e.target.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    render() {
        let { children, editorHeader, ...others } = this.props;
        editorHeader = (react_1.default.createElement("input", Object.assign({ type: "checkbox", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (this.props.editable ? {} : { value: this.props.property.value }))));
        return (react_1.default.createElement(Editor, Object.assign({ editorHeader: editorHeader }, others)));
    }
}
class ObjectEditor extends Editor {
    render() {
        const typeData = lib_renderer_1.AGOGOSRenderer.instance.typeLib[this.props.property.type];
        let { children, editorHeader, editorContent, ...others } = this.props;
        editorHeader = (react_1.default.createElement("span", { className: "editor-content" }, `object: ${this.props.property.type}`));
        if (typeData)
            editorContent = (react_1.default.createElement(EditorContent, null, utility_1.getKeys(typeData.properties).map((key, idx) => {
                let childType = typeData.properties[key].type;
                let childProperty = this.props.property.properties[key];
                if (!childProperty)
                    childProperty = {
                        name: key,
                        type: childType,
                    };
                this.props.property.properties[key] = childProperty;
                let ChildEditor = lib_renderer_1.AGOGOSRenderer.instance.editorManager.getEditor(childType);
                return (react_1.default.createElement(ChildEditor, { key: key, ref: key, process: this.props.process, property: childProperty, label: key, allowInput: this.props.allowInput, allowOutput: this.props.allowOutput, editable: this.props.editable, connecting: this.props.connecting, onChanged: (data) => this.onChildrenChanged(data), onConnectStart: e => this.onChildConnectStart(e), onConnectEnd: e => this.onChildConnectEnd(e) }));
            })));
        return (react_1.default.createElement(Editor, Object.assign({ editorHeader: editorHeader, editorContent: editorContent }, others)));
    }
}
class ProcessEditor extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.drag = false;
        this.state = {
            connecting: false
        };
        this.nodeRef = react_1.default.createRef();
    }
    onMouseDown(e) {
        if (e.button === 0) {
            this.drag = true;
            this.holdPos = lib_1.vec2(e.clientX, e.clientY);
            this.props.onDragMoveStart({ startX: this.holdPos.x, startY: this.holdPos.y, x: e.clientX, y: e.clientY });
        }
    }
    onMouseMove(e) {
        if (this.drag) {
            if (this.props.onDragMove) {
                this.props.onDragMove({ startX: this.holdPos.x, startY: this.holdPos.y, x: e.clientX, y: e.clientY });
            }
        }
    }
    onMouseUp(e) {
        if (e.button === 0) {
            this.drag = false;
        }
    }
    componentDidMount() {
        window.addEventListener("mousemove", (e) => this.onMouseMove(e));
        if (this.props.refCallback) {
            this.props.refCallback(this);
        }
    }
    onChildrenChanged(data) {
        this.props.process.properties[data.name] = data;
        if (this.props.onChanged)
            this.props.onChanged(this.props.process);
    }
    getPortPos(key, port) {
        let keys = key.split(".");
        if (keys.length > 1 && this.refs[keys[0]].state.extend) {
            return this.refs[keys[0]].getPortPos(keys.slice(1).join('.'), port);
        }
        let rect = this.nodeRef.current.querySelector(`.editor-${keys[0]} .port-${port}`).getBoundingClientRect();
        return lib_1.vec2(rect.left + 5, rect.top + 5);
    }
    render() {
        const outputType = this.props.process.processOutput.type;
        return (react_1.default.createElement("div", { className: "node-wrapper", ref: this.nodeRef },
            react_1.default.createElement("header", { className: "node-header", onMouseDown: (e) => this.onMouseDown(e), onMouseUp: (e) => this.onMouseUp(e) }, this.props.process.processType),
            react_1.default.createElement("div", { className: "node-content" }, utility_1.getKeys(this.props.process.properties).map((key, idx) => {
                let childType = this.props.process.properties[key].type;
                let childProperty = this.props.process.properties[key];
                let ChildEditor = lib_renderer_1.AGOGOSRenderer.instance.editorManager.getEditor(childType);
                return (react_1.default.createElement(ChildEditor, { key: key, ref: key, process: this.props.process.name, property: childProperty, label: key, allowInput: true, allowOutput: true, editable: true, connecting: this.state.connecting, onChanged: (data) => this.onChildrenChanged(data), onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }));
            })),
            react_1.default.createElement("div", { className: "node-output" }, (() => {
                let outputProperty = this.props.process.processOutput;
                let OutputEditor = lib_renderer_1.AGOGOSRenderer.instance.editorManager.getEditor(this.props.process.processOutput.type);
                return (react_1.default.createElement(OutputEditor, { ref: "output", process: this.props.process.name, property: outputProperty, label: "Output", allowInput: false, allowOutput: true, editable: false, connecting: this.state.connecting, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }));
            })())));
    }
}
exports.ProcessEditor = ProcessEditor;
function renderProcessNode(props, pos = lib_1.vec2(0, 0)) {
    let element = document.createElement("div");
    element.className = "process-node";
    element.style.left = `${pos.x}px`;
    element.style.top = `${pos.y}px`;
    const reactElement = (react_1.default.createElement(ProcessEditor, Object.assign({}, props)));
    react_dom_1.default.render(reactElement, element);
    return element;
}
exports.renderProcessNode = renderProcessNode;
class ConnectLine extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            from: this.props.from,
            to: this.props.to
        };
    }
    componentDidMount() {
        if (this.props.refCallback)
            this.props.refCallback(this);
    }
    render() {
        const k = 0.4;
        const cp1 = lib_1.vec2((this.state.to.x - this.state.from.x) * k + this.state.from.x, this.state.from.y);
        const cp2 = lib_1.vec2((this.state.to.x - this.state.from.x) * (-k) + this.state.to.x, this.state.to.y);
        return (react_1.default.createElement("svg", { style: { overflow: "visible", margin: 0, padding: 0, width: "1px", height: "1px", left: 0, top: 0, display: "block", pointerEvents: "none" } },
            react_1.default.createElement("path", { d: `M ${this.state.from.x},${this.state.from.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${this.state.to.x},${this.state.to.y}`, stroke: "black", width: "1", fill: "transparent" })));
        /*
                <line
                    x1={this.state.from.x}
                    y1={this.state.from.y}
                    x2={this.state.to.x}
                    y2={this.state.to.y}
                    stroke="black"
                    width="10px"
                /> */
    }
}
exports.ConnectLine = ConnectLine;
function RenderConnectLine(props) {
    return new Promise((resolver) => {
        let element = document.createElement("div");
        element.className = "connect-line-wrapper";
        const reactElement = (react_1.default.createElement(ConnectLine, { from: props.from, to: props.to, refCallback: (ref) => resolver({ line: ref, element: element }) }));
        react_dom_1.default.render(reactElement, element);
    });
}
exports.RenderConnectLine = RenderConnectLine;
function InitEditor(editorManager) {
    editorManager.addEditor(meta_data_1.BuildinTypes.number, NumberEditor);
    editorManager.addEditor(meta_data_1.BuildinTypes.string, StringEditor);
    editorManager.addEditor(meta_data_1.BuildinTypes.boolean, BooleanEditor);
    editorManager.addEditor(meta_data_1.BuildinTypes.object, ObjectEditor);
    editorManager.setDefault(ObjectEditor);
}
exports.InitEditor = InitEditor;
//# sourceMappingURL=process-editor.js.map