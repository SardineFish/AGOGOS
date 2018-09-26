"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const linq_1 = __importDefault(require("linq"));
const meta_data_1 = require("./meta-data");
const react_dom_1 = __importDefault(require("react-dom"));
const lib_1 = require("./lib");
class ValueEditor extends react_1.default.Component {
    onPortMouseDown(port) {
        if (this.props.onConnectStart) {
            this.props.onConnectStart({
                process: this.props.node,
                property: this.props.propertyName,
                port: port
            });
        }
    }
    onPortMouseUp(port) {
        if (this.props.connecting && this.props.onConnectEnd)
            this.props.onConnectEnd({
                process: this.props.node,
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
class EditorObject extends ValueEditor {
    constructor(props) {
        super(props);
    }
    render() {
        return this.doRender(react_1.default.createElement("span", { className: "editor-content" }, this.props.editvalue.name));
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
            this.props.node.properties.get(key).value = e;
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
        let rect = this.nodeRef.current.querySelector(`.editor-${key} .port-${port}`).getBoundingClientRect();
        return lib_1.vec2(rect.left + 5, rect.top + 5);
    }
    render() {
        const outputType = this.props.node.processOutput.type;
        return (react_1.default.createElement("div", { className: "node-wrapper", ref: this.nodeRef },
            react_1.default.createElement("header", { className: "node-header", onMouseDown: (e) => this.onMouseDown(e), onMouseUp: (e) => this.onMouseUp(e) }, this.props.node.name),
            react_1.default.createElement("div", { className: "node-content" }, Array.from(this.props.node.properties.keys())
                .map((key, idx) => {
                switch (this.props.node.properties.get(key).type) {
                    case meta_data_1.BuildinTypes.string:
                        return (react_1.default.createElement(EditorString, { node: this.props.node, propertyName: key, label: key, ref: key, editvalue: this.props.node.properties.get(key).value, key: idx, allowInput: true, onChange: (e) => this.onValueChange(key, e), connecting: this.props.connecting, portFilter: this.props.portFilter, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }));
                    case meta_data_1.BuildinTypes.number:
                        return (react_1.default.createElement(EditorNumber, { node: this.props.node, propertyName: key, label: key, ref: key, editvalue: this.props.node.properties.get(key).value, key: idx, allowInput: true, onChange: (e) => this.onValueChange(key, e), connecting: this.props.connecting, portFilter: this.props.portFilter, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }));
                    case meta_data_1.BuildinTypes.boolean:
                        return (react_1.default.createElement(EditorBoolean, { node: this.props.node, propertyName: key, label: key, ref: key, editvalue: this.props.node.properties.get(key).value, key: idx, allowInput: true, onChange: (e) => this.onValueChange(key, e), connecting: this.props.connecting, portFilter: this.props.portFilter, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }));
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
                    key: outputType, handler: () => (react_1.default.createElement(EditorObject, { node: this.props.node, propertyName: "output", label: "Output", ref: "output", editvalue: null, type: outputType, allowOutput: true, onConnectStart: this.props.onConnectStart, onConnectEnd: this.props.onConnectEnd }))
                },
            ])
                .where(proc => proc.key === outputType)
                .firstOrDefault()
                .handler())));
    }
}
exports.ReactProcessNode = ReactProcessNode;
function renderProcessNode(node, onDragMoveStart, onDragMove, onConnectStart, onConnectEnd, refCallback) {
    let element = document.createElement("div");
    element.className = "process-node";
    const reactElement = (react_1.default.createElement(ReactProcessNode, { node: node, onDragMoveStart: onDragMoveStart, onDragMove: onDragMove, onConnectStart: onConnectStart, onConnectEnd: onConnectEnd, refCallback: refCallback }));
    console.log(react_dom_1.default.render(reactElement, element));
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
        return (react_1.default.createElement("svg", { style: { overflow: "visible", margin: 0, padding: 0, width: "1px", height: "1px", left: 0, top: 0, display: "block", pointerEvents: "none" } },
            react_1.default.createElement("line", { x1: this.state.from.x, y1: this.state.from.y, x2: this.state.to.x, y2: this.state.to.y, stroke: "black", width: "10px" })));
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