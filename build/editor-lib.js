"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
const React = __importStar(require("react"));
const lib_renderer_1 = require("./lib-renderer");
const utility_1 = require("./utility");
class EditorContent extends React.Component {
    render() {
        return (React.createElement("div", { className: "editor-children" }, this.props.children));
    }
}
exports.EditorContent = EditorContent;
class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.props.property.properties = this.props.property.properties || {};
        this.props.property.elements = this.props.property.elements || [];
        this.state = {
            extend: false
        };
        this.nodeRef = React.createRef();
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
        return (React.createElement("div", { className: ["object-editor", this.state.extend ? "extend" : "fold"].join(" "), ref: this.nodeRef },
            React.createElement("span", { className: ["editor", "editor-header", `editor-${this.props.property.name}`].concat(this.props.className ? [this.props.className] : []).join(" ") },
                this.props.allowInput ?
                    (React.createElement("span", { className: "port-input", onMouseDown: () => this.onPortMouseDown("input"), onMouseUp: () => this.onPortMouseUp("input") })) : null,
                this.props.content ?
                    React.createElement("span", { className: `fold-icon ${this.state.extend ? "extend" : "fold"}`, onClick: () => this.setState({ extend: !this.state.extend }) })
                    : null,
                React.createElement("span", { className: "editor-label" }, this.props.label),
                this.props.header ?
                    this.props.header
                    : `object: ${this.props.property.type}`,
                this.props.allowOutput ?
                    (React.createElement("span", { className: "port-output", onMouseDown: () => this.onPortMouseDown("output"), onMouseUp: () => this.onPortMouseUp("output") })) : null),
            this.state.extend ?
                this.props.content
                : null));
    }
}
exports.Editor = Editor;
class StringEditor extends Editor {
    constructor(props) {
        super(props);
        this.input = React.createRef();
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
        let { children, header, ...others } = this.props;
        header = (React.createElement("input", Object.assign({ type: "text", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (this.props.editable ? {} : { value: this.props.property.value }))));
        return (React.createElement(Editor, Object.assign({ header: header }, others)));
    }
}
exports.StringEditor = StringEditor;
class NumberEditor extends Editor {
    constructor(props) {
        super(props);
        this.input = React.createRef();
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
        let { children, header, ...others } = this.props;
        header = (React.createElement("input", Object.assign({ type: "number", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (this.props.editable ? {} : { value: this.props.property.value }))));
        return (React.createElement(Editor, Object.assign({ header: header }, others)));
    }
}
exports.NumberEditor = NumberEditor;
class BooleanEditor extends Editor {
    constructor(props) {
        super(props);
        this.input = React.createRef();
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
        let { children, header, ...others } = this.props;
        header = (React.createElement("input", Object.assign({ type: "checkbox", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (this.props.editable ? {} : { value: this.props.property.value }))));
        return (React.createElement(Editor, Object.assign({ header: header }, others)));
    }
}
exports.BooleanEditor = BooleanEditor;
class ObjectEditor extends Editor {
    render() {
        const typeData = lib_renderer_1.AGOGOSRenderer.instance.typeLib[this.props.property.type];
        let { children, header, content, ...others } = this.props;
        header = (React.createElement("span", { className: "editor-content" }, `object: ${this.props.property.type}`));
        if (typeData)
            content = (React.createElement(EditorContent, null, utility_1.getKeys(typeData.properties).map((key, idx) => {
                let childType = typeData.properties[key].type;
                let childProperty = this.props.property.properties[key];
                if (!childProperty)
                    childProperty = {
                        name: key,
                        type: childType,
                    };
                this.props.property.properties[key] = childProperty;
                let ChildEditor = lib_renderer_1.AGOGOSRenderer.instance.editorManager.getEditor(childType);
                return (React.createElement(ChildEditor, { key: key, ref: key, process: this.props.process, property: childProperty, label: key, allowInput: this.props.allowInput, allowOutput: this.props.allowOutput, editable: this.props.editable, connecting: this.props.connecting, onChanged: (data) => this.onChildrenChanged(data), onConnectStart: e => this.onChildConnectStart(e), onConnectEnd: e => this.onChildConnectEnd(e) }));
            })));
        return (React.createElement(Editor, Object.assign({ header: header, content: content }, others)));
    }
}
exports.ObjectEditor = ObjectEditor;
//# sourceMappingURL=editor-lib.js.map