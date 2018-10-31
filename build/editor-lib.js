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
    onPortMouseDown(e, port) {
        e.preventDefault();
        if (e.button === 2 && this.props.onDisconnect) {
            this.props.onDisconnect({
                process: this.props.process,
                property: this.props.property.name,
                port: port
            });
        }
        else if (e.button === 0 && this.props.onConnectStart) {
            this.props.onConnectStart({
                process: this.props.process,
                property: this.props.property.name,
                port: port
            });
        }
    }
    onPortMouseUp(e, port) {
        e.preventDefault();
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
    onChildDisconnect(endpoint) {
        endpoint.property = `${this.props.property.name}.${endpoint.property}`;
        if (this.props.onDisconnect)
            this.props.onDisconnect(endpoint);
    }
    getPortPos(key, port) {
        let keys = key.split(".");
        if (keys.length > 1 && this.refs[keys[0]].state.extend) {
            return this.refs[keys[0]].getPortPos(keys.slice(1).join('.'), port);
        }
        let rect = this.nodeRef.current.querySelector(`.editor-${keys[0]} .port-${port}`).getBoundingClientRect();
        return lib_1.vec2(rect.left + 5, rect.top + 5);
    }
    applyChange() {
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    propertyEditor(name) {
        const typeData = lib_renderer_1.AGOGOSRenderer.instance.typeLib[this.props.property.type];
        let childType = typeData.properties[name].type;
        let childProperty = this.props.property.properties[name];
        if (!childProperty)
            childProperty = {
                name: name,
                type: childType,
            };
        this.props.property.properties[name] = childProperty;
        let ChildEditor = lib_renderer_1.AGOGOSRenderer.instance.editorManager.getEditor(childType);
        return (React.createElement(ChildEditor, { key: name, ref: name, process: this.props.process, property: childProperty, label: name, allowInput: this.props.allowInput, allowOutput: this.props.allowOutput, editable: this.props.editable, connecting: this.props.connecting, onChanged: (data) => this.onChildrenChanged(data), onConnectStart: e => this.onChildConnectStart(e), onConnectEnd: e => this.onChildConnectEnd(e), onDisconnect: e => this.onChildDisconnect(e) }));
    }
    renderHeader() {
        return (React.createElement("span", { className: "editor-content" }, `object: ${this.props.property.type}`));
    }
    renderContent() {
        const typeData = lib_renderer_1.AGOGOSRenderer.instance.typeLib[this.props.property.type];
        if (!typeData)
            return null;
        return (React.createElement(EditorContent, null, utility_1.getKeys(typeData.properties).map((key, idx) => this.propertyEditor(key))));
    }
    render() {
        const header = this.renderHeader();
        const content = this.renderContent();
        return (React.createElement("div", { className: ["object-editor", this.state.extend ? "extend" : "fold"].join(" "), ref: this.nodeRef },
            React.createElement("span", { className: ["editor", "editor-header", `editor-${this.props.property.name}`].concat(this.props.className ? [this.props.className] : []).join(" ") },
                this.props.allowInput ?
                    (React.createElement("span", { className: "port-input", onMouseDown: (e) => this.onPortMouseDown(e, "input"), onMouseUp: (e) => this.onPortMouseUp(e, "input") })) : null,
                content ?
                    React.createElement("span", { className: `fold-icon ${this.state.extend ? "extend" : "fold"}`, onClick: () => this.setState({ extend: !this.state.extend }) })
                    : null,
                React.createElement("span", { className: "editor-label" }, this.props.label),
                React.createElement("span", { className: "editor-header-content" }, header ?
                    header
                    : `object: ${this.props.property.type}`),
                this.props.allowOutput ?
                    (React.createElement("span", { className: "port-output", onMouseDown: (e) => this.onPortMouseDown(e, "output"), onMouseUp: (e) => this.onPortMouseUp(e, "output") })) : null),
            this.state.extend ?
                content
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
    renderHeader() {
        return (React.createElement("input", Object.assign({ type: "text", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (this.props.editable ? {} : { value: this.props.property.value }))));
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
    renderHeader() {
        return (React.createElement("input", Object.assign({ type: "number", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (this.props.editable ? {} : { value: this.props.property.value }))));
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
    renderHeader() {
        return (React.createElement("input", Object.assign({ type: "checkbox", className: "editor-content", onChange: (e) => this.onChange(e), ref: this.input }, (this.props.editable ? {} : { value: this.props.property.value }))));
    }
}
exports.BooleanEditor = BooleanEditor;
/*
export class ObjectEditor extends Editor
{
    render()
    {
        const typeData = AGOGOSRenderer.instance.typeLib[this.props.property.type];
        let { children, header, content, ...others } = this.props;
        header = header ? header : (<span className="editor-content">{`object: ${this.props.property.type}`}</span>);
        if (!content && typeData)
            content = (
                <EditorContent>
                    {
                        getKeys(typeData.properties).map((key, idx) =>
                        {
                            let childType = typeData.properties[key].type;
                            let childProperty = this.props.property.properties[key];
                            if (!childProperty)
                                childProperty = {
                                    name: key,
                                    type: childType,
                                };
                            this.props.property.properties[key] = childProperty;
                            let ChildEditor = AGOGOSRenderer.instance.editorManager.getEditor(childType);
                            return (
                                <ChildEditor
                                    key={key}
                                    ref={key}
                                    process={this.props.process}
                                    property={childProperty}
                                    label={key}
                                    allowInput={this.props.allowInput}
                                    allowOutput={this.props.allowOutput}
                                    editable={this.props.editable}
                                    connecting={this.props.connecting}
                                    onChanged={(data) => this.onChildrenChanged(data)}
                                    onConnectStart={e => this.onChildConnectStart(e)}
                                    onConnectEnd={e => this.onChildConnectEnd(e)}
                                />
                            )
                        })
                    }
                </EditorContent>);
        return (
            <Editor header={header} content={content} {...others}>
            </Editor>

        )
    }
}*/ 
//# sourceMappingURL=editor-lib.js.map