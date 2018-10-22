"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const linq_1 = __importDefault(require("linq"));
const utility_1 = require("./utility");
const meta_data_1 = require("./meta-data");
const react_dom_1 = __importDefault(require("react-dom"));
const lib_1 = require("./lib");
const lib_renderer_1 = require("./lib-renderer");
class ValueEditor extends react_1.default.Component {
    onPortMouseDown(port) {
        if (this.props.onConnectStart) {
            this.props.onConnectStart({
                process: this.props.node.name,
                property: this.props.propertyName,
                port: port
            });
        }
    }
    onPortMouseUp(port) {
        if (this.props.connecting && this.props.onConnectEnd)
            this.props.onConnectEnd({
                process: this.props.node.name,
                property: this.props.propertyName,
                port: port
            });
    }
    doRender(element) {
        return (react_1.default.createElement("span", { className: ["editor", `editor-${this.props.propertyName}`].concat(this.props.className ? [this.props.className] : []).join(" ") },
            this.props.allowInput ?
                (react_1.default.createElement("span", { className: "port-input", onMouseDown: () => this.onPortMouseDown("input"), onMouseUp: () => this.onPortMouseUp("input") })) : null,
            react_1.default.createElement("span", { className: "editor-label" }, this.props.label),
            element,
            this.props.allowOutput ?
                (react_1.default.createElement("span", { className: "port-output", onMouseDown: () => this.onPortMouseDown("output"), onMouseUp: () => this.onPortMouseUp("output") })) : null));
    }
}
class EditorString extends ValueEditor {
    constructor(props) {
        super(props);
        this.input = react_1.default.createRef();
    }
    componentDidMount() {
        this.input.current.value = this.props.editvalue;
    }
    onChange(e) {
        this.props.onChange(e.target.value);
    }
    render() {
        const editable = this.props.editable === undefined ? true : this.props.editable;
        return this.doRender((react_1.default.createElement("input", Object.assign({ type: "text", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (editable ? {} : { value: this.props.editvalue })))));
    }
}
class EditorNumber extends ValueEditor {
    constructor(props) {
        super(props);
        this.input = react_1.default.createRef();
    }
    componentDidMount() {
        this.input.current.valueAsNumber = this.props.editvalue;
    }
    onChange(e) {
        this.props.onChange(e.target.valueAsNumber);
    }
    render() {
        const editable = this.props.editable === undefined ? true : this.props.editable;
        return this.doRender((react_1.default.createElement("input", Object.assign({ type: "number", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (editable ? {} : { value: this.props.editvalue })))));
    }
}
class EditorBoolean extends ValueEditor {
    constructor(props) {
        super(props);
        this.input = react_1.default.createRef();
    }
    componentDidMount() {
        this.input.current.checked = this.props.editvalue;
    }
    onChange(e) {
        this.props.onChange(e.target.checked);
    }
    render() {
        const editable = this.props.editable === undefined ? true : this.props.editable;
        return this.doRender((react_1.default.createElement("input", Object.assign({ type: "checkbox", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (editable ? {} : { checked: this.props.editvalue })))));
    }
}
class EditorObject extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.nodeRef = react_1.default.createRef();
        this.state = { extend: false };
    }
    onValueChange(key, value) {
        this.props.objectData.properties[key] = value;
    }
    onPortMouseDown(port) {
        if (this.props.onConnectStart) {
            this.props.onConnectStart({
                process: this.props.node.name,
                property: this.props.propertyName,
                port: port
            });
        }
    }
    onPortMouseUp(port) {
        if (this.props.connecting && this.props.onConnectEnd)
            this.props.onConnectEnd({
                process: this.props.node.name,
                property: this.props.propertyName,
                port: port
            });
    }
    onChildConnectStart(endpoint) {
        endpoint.property = `${this.props.propertyName}.${endpoint.property}`;
        if (this.props.onConnectStart)
            this.props.onConnectStart(endpoint);
    }
    onChildConnectEnd(endpoint) {
        endpoint.property = `${this.props.propertyName}.${endpoint.property}`;
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
        const typeData = lib_renderer_1.AGOGOSRenderer.instance.typeLib[this.props.type];
        return (react_1.default.createElement("div", { className: ["object-editor", this.state.extend ? "extend" : "fold"].join(" "), ref: this.nodeRef },
            react_1.default.createElement("span", { className: ["editor", "editor-header", `editor-${this.props.propertyName}`].concat(this.props.className ? [this.props.className] : []).join(" ") },
                this.props.allowInput ?
                    (react_1.default.createElement("span", { className: "port-input", onMouseDown: () => this.onPortMouseDown("input"), onMouseUp: () => this.onPortMouseUp("input") })) : null,
                typeData ?
                    react_1.default.createElement("span", { className: `fold-icon ${this.state.extend ? "extend" : "fold"}`, onClick: () => this.setState({ extend: !this.state.extend }) })
                    : null,
                react_1.default.createElement("span", { className: "editor-label" }, this.props.label),
                react_1.default.createElement("span", { className: "editor-content" }, `object: ${this.props.type}`),
                this.props.allowOutput ?
                    (react_1.default.createElement("span", { className: "port-output", onMouseDown: () => this.onPortMouseDown("output"), onMouseUp: () => this.onPortMouseUp("output") })) : null),
            this.state.extend ?
                react_1.default.createElement("div", { className: "editor-children" }, utility_1.getKeys(typeData.properties).map((key, idx) => {
                    switch (typeData.properties[key].type) {
                        case meta_data_1.BuildinTypes.string:
                            return (react_1.default.createElement(EditorString, { node: this.props.node, propertyName: key, label: key, allowInput: this.props.allowInput, allowOutput: this.props.allowOutput, ref: key, editvalue: this.props.objectData.properties[key].value, key: idx, onChange: (value) => this.onValueChange(key, value), connecting: this.props.connecting, portFilter: this.props.portFilter, onConnectStart: (endpoint) => this.onChildConnectStart(endpoint), onConnectEnd: (endpoint) => this.onChildConnectEnd(endpoint) }));
                        case meta_data_1.BuildinTypes.number:
                            return (react_1.default.createElement(EditorNumber, { node: this.props.node, propertyName: key, label: key, allowInput: this.props.allowInput, allowOutput: this.props.allowOutput, ref: key, editvalue: lib_1.NULL(this.props.objectData).safe(() => this.props.objectData.value).safe(() => this.props.objectData.properties).safe(p => p[key]).safe(p => p.value).safe(), key: idx, onChange: (value) => this.onValueChange(key, value), connecting: this.props.connecting, portFilter: this.props.portFilter, onConnectStart: (endpoint) => this.onChildConnectStart(endpoint), onConnectEnd: (endpoint) => this.onChildConnectEnd(endpoint) }));
                        case meta_data_1.BuildinTypes.boolean:
                            return (react_1.default.createElement(EditorBoolean, { node: this.props.node, propertyName: key, label: key, allowInput: this.props.allowInput, allowOutput: this.props.allowOutput, ref: key, editvalue: lib_1.NULL(this.props.objectData).safe(() => this.props.objectData.value).safe(() => this.props.objectData.properties).safe(p => p[key]).safe(p => p.value).safe(), key: idx, onChange: (value) => this.onValueChange(key, value), connecting: this.props.connecting, portFilter: this.props.portFilter, onConnectStart: (endpoint) => this.onChildConnectStart(endpoint), onConnectEnd: (endpoint) => this.onChildConnectEnd(endpoint) }));
                        default:
                            return (react_1.default.createElement(EditorObject, { node: this.props.node, propertyName: key, type: typeData.properties[key].type, objectData: lib_1.NULL(this.props.objectData).safe(data => data.value).safe(() => this.props.objectData.properties[key]).safe(), label: key, allowInput: this.props.allowInput, allowOutput: this.props.allowOutput, ref: key, editvalue: lib_1.NULL(this.props.objectData).safe(() => this.props.objectData.value).safe(() => this.props.objectData.properties).safe(p => p[key]).safe(p => p.value).safe(), key: idx, onChange: (value) => this.onValueChange(key, value), connecting: this.props.connecting, portFilter: this.props.portFilter, onConnectStart: (endpoint) => this.onChildConnectStart(endpoint), onConnectEnd: (endpoint) => this.onChildConnectEnd(endpoint) }));
                    }
                }))
                : null));
    }
}
class ReactProcessNode extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.drag = false;
        this.state = {
            portFilter: props.portFilter,
            connecting: props.connecting
        };
        this.nodeRef = react_1.default.createRef();
    }
    onValueChange(key, e) {
        if (key === "name" && this.props.onNameChange) {
            this.props.onNameChange(e);
            this.props.node.name = e;
        }
        else
            this.props.node.properties[key].value = e;
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
    getPortPos(key, port) {
        let keys = key.split(".");
        if (keys.length > 1 && this.refs[keys[0]].state.extend) {
            return this.refs[keys[0]].getPortPos(keys.slice(1).join('.'), port);
        }
        let rect = this.nodeRef.current.querySelector(`.editor-${keys[0]} .port-${port}`).getBoundingClientRect();
        return lib_1.vec2(rect.left + 5, rect.top + 5);
    }
    render() {
        const outputType = this.props.node.processOutput.type;
        return (react_1.default.createElement("div", { className: "node-wrapper", ref: this.nodeRef },
            react_1.default.createElement("header", { className: "node-header", onMouseDown: (e) => this.onMouseDown(e), onMouseUp: (e) => this.onMouseUp(e) }, this.props.node.processType),
            react_1.default.createElement("div", { className: "node-content" }, Array.from(utility_1.getKeys(this.props.node.properties))
                .map((key, idx) => {
                switch (this.props.node.properties[key].type) {
                    case meta_data_1.BuildinTypes.string:
                        return (react_1.default.createElement(EditorString, { node: this.props.node, propertyName: key, label: key, allowOutput: true, ref: key, editvalue: this.props.node.properties[key].value, key: idx, allowInput: true, onChange: (value) => this.onValueChange(key, value), connecting: this.state.connecting, portFilter: this.state.portFilter, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }));
                    case meta_data_1.BuildinTypes.number:
                        return (react_1.default.createElement(EditorNumber, { node: this.props.node, propertyName: key, label: key, allowOutput: true, ref: key, editvalue: this.props.node.properties[key].value, key: idx, allowInput: true, onChange: (value) => this.onValueChange(key, value), connecting: this.state.connecting, portFilter: this.state.portFilter, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }));
                    case meta_data_1.BuildinTypes.boolean:
                        return (react_1.default.createElement(EditorBoolean, { node: this.props.node, propertyName: key, label: key, allowOutput: true, ref: key, editvalue: this.props.node.properties[key].value, key: idx, allowInput: true, onChange: (value) => this.onValueChange(key, value), connecting: this.state.connecting, portFilter: this.state.portFilter, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }));
                    default:
                        return (react_1.default.createElement(EditorObject, { type: this.props.node.properties[key].type, node: this.props.node, propertyName: key, objectData: this.props.node.properties[key], label: key, allowOutput: true, ref: key, editvalue: this.props.node.properties[key].value, key: idx, allowInput: true, onChange: (value) => this.onValueChange(key, value), connecting: this.state.connecting, portFilter: this.state.portFilter, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }));
                }
            })),
            react_1.default.createElement("div", { className: "node-output" }, linq_1.default.from([
                {
                    key: meta_data_1.BuildinTypes.string, handler: () => (react_1.default.createElement(EditorString, { node: this.props.node, propertyName: "output", label: "Output", ref: "output", editvalue: "", allowOutput: true, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }))
                },
                {
                    key: meta_data_1.BuildinTypes.number, handler: () => (react_1.default.createElement(EditorNumber, { node: this.props.node, propertyName: "output", label: "Output", ref: "output", editvalue: NaN, allowOutput: true, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }))
                },
                {
                    key: meta_data_1.BuildinTypes.boolean, handler: () => (react_1.default.createElement(EditorBoolean, { node: this.props.node, propertyName: "output", label: "Output", ref: "output", editvalue: false, allowOutput: true, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }))
                },
                {
                    key: outputType, handler: () => (react_1.default.createElement(EditorObject, { node: this.props.node, objectData: this.props.node.processOutput, propertyName: "output", label: "Output", ref: "output", editvalue: null, type: outputType, allowOutput: true, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }))
                },
            ])
                .where(proc => proc.key === outputType)
                .firstOrDefault()
                .handler())));
    }
}
exports.ReactProcessNode = ReactProcessNode;
function renderProcessNode(props, pos = lib_1.vec2(0, 0)) {
    let element = document.createElement("div");
    element.className = "process-node";
    element.style.left = `${pos.x}px`;
    element.style.top = `${pos.y}px`;
    let { ref, ...others } = props;
    const reactElement = (react_1.default.createElement(ReactProcessNode, Object.assign({}, others)));
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
//# sourceMappingURL=process-editor.js.map