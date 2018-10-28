"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
const react_1 = __importDefault(require("react"));
const lib_renderer_1 = require("./lib-renderer");
const utility_1 = require("./utility");
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
exports.StringEditor = StringEditor;
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
exports.NumberEditor = NumberEditor;
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
exports.BooleanEditor = BooleanEditor;
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
exports.ObjectEditor = ObjectEditor;
//# sourceMappingURL=editor-lib.js.map