"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const process_node_1 = require("./process-node");
const linq_1 = __importDefault(require("linq"));
const utility_1 = require("./utility");
const meta_data_1 = require("./meta-data");
const react_dom_1 = __importDefault(require("react-dom"));
const lib_1 = require("./lib");
class ValueEditor extends react_1.default.Component {
    render() {
        return (react_1.default.createElement("span", { className: ["editor"].concat(this.props.className ? [this.props.className] : []).join(" ") },
            this.props.allowInput ?
                (react_1.default.createElement("span", { className: "editor-input" })) : null,
            react_1.default.createElement("span", { className: "editor-label" }, this.props.label),
            this.props.children,
            this.props.allowOutput ?
                (react_1.default.createElement("span", { className: "editor-output" })) : null));
    }
}
class EditorString extends react_1.default.Component {
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
        return (react_1.default.createElement(ValueEditor, { className: this.props.className, label: this.props.label, allowInput: this.props.allowInput, allowOutput: this.props.allowOutput },
            react_1.default.createElement("input", Object.assign({ type: "text", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (editable ? {} : { value: this.props.editvalue })))));
    }
}
class EditorNumber extends react_1.default.Component {
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
        return (react_1.default.createElement(ValueEditor, { className: this.props.className, label: this.props.label, allowInput: this.props.allowInput, allowOutput: this.props.allowOutput },
            react_1.default.createElement("input", Object.assign({ type: "number", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (editable ? {} : { value: this.props.editvalue })))));
    }
}
class EditorBoolean extends react_1.default.Component {
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
        return (react_1.default.createElement(ValueEditor, { className: this.props.className, label: this.props.label, allowInput: this.props.allowInput, allowOutput: this.props.allowOutput },
            react_1.default.createElement("input", Object.assign({ type: "checkbox", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (editable ? {} : { checked: this.props.editvalue })))));
    }
}
class EditorObject extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.input = react_1.default.createRef();
    }
    componentDidMount() {
    }
    onChange(e) {
    }
    render() {
        return (react_1.default.createElement(ValueEditor, { className: this.props.className, label: this.props.label },
            react_1.default.createElement("span", { className: "editor-content" }, this.props.editvalue.name)));
    }
}
class ReactProcessNode extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.drag = false;
    }
    onValueChange(key, e) {
        this.props.node[key] = e;
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
    }
    render() {
        const outputType = meta_data_1.getType(this.props.node, process_node_1.KeyProcess);
        return (react_1.default.createElement("div", { className: "node-wrapper" },
            react_1.default.createElement("header", { className: "node-header", onMouseDown: (e) => this.onMouseDown(e), onMouseUp: (e) => this.onMouseUp(e) }, this.props.node.nodeName),
            react_1.default.createElement("div", { className: "node-content" }, utility_1.getKeys(this.props.node)
                .filter((key) => meta_data_1.getType(this.props.node, key))
                .map((key, idx) => {
                switch (meta_data_1.getType(this.props.node, key)) {
                    case meta_data_1.BuildinTypes.string:
                        return (react_1.default.createElement(EditorString, { label: key, editvalue: this.props.node[key], key: idx, allowInput: true, onChange: (e) => this.onValueChange(key, e) }));
                    case meta_data_1.BuildinTypes.number:
                        return (react_1.default.createElement(EditorNumber, { label: key, editvalue: this.props.node[key], key: idx, allowInput: true, onChange: (e) => this.onValueChange(key, e) }));
                    case meta_data_1.BuildinTypes.boolean:
                        return (react_1.default.createElement(EditorBoolean, { label: key, editvalue: this.props.node[key], key: idx, allowInput: true, onChange: (e) => this.onValueChange(key, e) }));
                }
            })),
            react_1.default.createElement("div", { className: "node-output" }, linq_1.default.from([
                { key: meta_data_1.BuildinTypes.string, handler: () => (react_1.default.createElement(EditorString, { label: "Output", editvalue: "", allowOutput: true })) },
                { key: meta_data_1.BuildinTypes.number, handler: () => (react_1.default.createElement(EditorNumber, { label: "Output", editvalue: NaN, allowOutput: true })) },
                { key: meta_data_1.BuildinTypes.boolean, handler: () => (react_1.default.createElement(EditorBoolean, { label: "Output", editvalue: false, allowOutput: true })) },
                { key: outputType, handler: () => (react_1.default.createElement(EditorObject, { label: "Output", editvalue: null, type: outputType, allowOutput: true })) },
            ])
                .where(proc => proc.key === outputType)
                .firstOrDefault()
                .handler())));
    }
}
exports.ReactProcessNode = ReactProcessNode;
function renderProcessNode(node, onDragMoveStart, onDragMove) {
    let element = document.createElement("div");
    element.className = "process-node";
    const reactElement = (react_1.default.createElement(ReactProcessNode, { node: node, onDragMoveStart: onDragMoveStart, onDragMove: onDragMove }));
    console.log(react_dom_1.default.render(reactElement, element));
    return element;
}
exports.renderProcessNode = renderProcessNode;
//# sourceMappingURL=process-editor.js.map