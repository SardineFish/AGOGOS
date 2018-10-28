import { PropertyData, EndPoint, Vector2, vec2 } from "./lib";
import { RefObject, ChangeEvent } from "react";
import * as React from "react";
import { AGOGOSRenderer } from "./lib-renderer";
import { getKeys } from "./utility";
type RefCallback<T> = (ref: T) => void;
type EventHandler<T> = (e: T) => void;
export class EditorContent extends React.Component
{
    render()
    {
        return (
            <div className="editor-children">
                {this.props.children}
            </div>
        )
    }
}
export interface EditorProps
{
    process: string;
    className?: string;
    allowInput?: boolean;
    allowOutput?: boolean;
    property: PropertyData;
    label: string;
    onConnectEnd?: EventHandler<EndPoint>;
    onConnectStart?: EventHandler<EndPoint>;
    header?: React.ReactNode;
    content?: React.ReactNode;
    editable?: boolean;
    connecting?: boolean;
    onChanged?: (data: PropertyData) => void;
}
export interface EditorState
{
    extend: boolean;
}
export class Editor extends React.Component<EditorProps, EditorState>
{
    nodeRef: RefObject<HTMLDivElement>;
    constructor(props: EditorProps)
    {
        super(props);
        this.props.property.properties = this.props.property.properties || {};
        this.props.property.elements = this.props.property.elements || [];
        this.state = {
            extend: false
        };
        this.nodeRef = React.createRef();
    }
    onPortMouseDown(port: "input" | "output")
    {
        if (this.props.onConnectStart)
        {
            this.props.onConnectStart({
                process: this.props.process,
                property: this.props.property.name,
                port: port
            });
        }
    }
    onPortMouseUp(port: "input" | "output")
    {
        if (this.props.connecting && this.props.onConnectEnd)
            this.props.onConnectEnd({
                process: this.props.process,
                property: this.props.property.name,
                port: port
            });
    }
    onChildrenChanged(data: PropertyData)
    {
        this.props.property.properties[data.name] = data;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    onChildConnectStart(endpoint: EndPoint)
    {
        endpoint.property = `${this.props.property.name}.${endpoint.property}`;
        if (this.props.onConnectStart)
            this.props.onConnectStart(endpoint);
    }
    onChildConnectEnd(endpoint: EndPoint)
    {
        endpoint.property = `${this.props.property.name}.${endpoint.property}`;
        if (this.props.onConnectEnd)
            this.props.onConnectEnd(endpoint);
    }
    getPortPos(key: string, port: string): Vector2
    {
        let keys = key.split(".");
        if (keys.length > 1 && (this.refs[keys[0]] as ObjectEditor).state.extend)
        {
            return (this.refs[keys[0]] as ObjectEditor).getPortPos(keys.slice(1).join('.'), port);
        }
        let rect = this.nodeRef.current!.querySelector(`.editor-${keys[0]} .port-${port}`).getBoundingClientRect();
        return vec2(rect.left + 5, rect.top + 5);
    }
    render()
    {
        return (
            <div className={["object-editor", this.state.extend ? "extend" : "fold"].join(" ")} ref={this.nodeRef}>
                <span className={["editor", "editor-header", `editor-${this.props.property.name}`].concat(this.props.className ? [this.props.className as string] : []).join(" ")} >
                    {
                        this.props.allowInput ?
                            (<span className="port-input" onMouseDown={() => this.onPortMouseDown("input")} onMouseUp={() => this.onPortMouseUp("input")}></span>) : null
                    }
                    {
                        this.props.content ?
                            <span className={`fold-icon ${this.state.extend ? "extend" : "fold"}`} onClick={() => this.setState({ extend: !this.state.extend })}></span>
                            : null
                    }
                    <span className="editor-label">{this.props.label}</span>
                    {
                        this.props.header ?
                            this.props.header
                            : `object: ${this.props.property.type}`
                    }
                    {
                        this.props.allowOutput ?
                            (<span className="port-output" onMouseDown={() => this.onPortMouseDown("output")} onMouseUp={() => this.onPortMouseUp("output")}></span>) : null
                    }
                </span>
                {
                    this.state.extend ?
                        this.props.content
                        : null
                }
            </div>
        )
    }
}

export class StringEditor extends Editor
{
    input: RefObject<HTMLInputElement>;
    constructor(props: EditorProps)
    {
        super(props);
        this.input = React.createRef();
    }
    componentDidMount()
    {
        this.input.current.value = this.props.property.value ? this.props.property.value : "";
        this.props.property.value = this.input.current.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    onChange(e: ChangeEvent<HTMLInputElement>)
    {
        this.props.property.value = e.target.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    render()
    {
        let { children, header, ...others } = this.props;
        header = (<input
            type="text"
            className="editor-content"
            onChange={(e) => this.onChange(e)}
            ref={this.input}
            {...(this.props.editable ? {} : { value: this.props.property.value })} />);
        
        return (
            <Editor header={header} {...others}>
            </Editor>
        )
    }
}

export class NumberEditor extends Editor
{
    input: RefObject<HTMLInputElement>;
    constructor(props: EditorProps)
    {
        super(props);
        this.input = React.createRef();
    }
    componentDidMount()
    {
        this.input!.current.value = this.props.property.value ? this.props.property.value : 0;
        this.props.property.value = this.input.current.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    onChange(e: ChangeEvent<HTMLInputElement>)
    {
        this.props.property.value = e.target.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    render()
    {
        let { children, header, ...others } = this.props;
        header = (<input
            type="number"
            className="editor-content"
            onChange={(e) => this.onChange(e)}
            ref={this.input}
            {...(this.props.editable ? {} : { value: this.props.property.value })} />);
        
        return (
            <Editor header={header} {...others}>
            </Editor>
        );
    }
}

export class BooleanEditor extends Editor
{
    input: RefObject<HTMLInputElement>;
    constructor(props: EditorProps)
    {
        super(props);
        this.input = React.createRef();
    }
    componentDidMount()
    {
        this.input.current.value = this.props.property.value ? this.props.property.value : 0;
        this.props.property.value = this.input.current.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    onChange(e: ChangeEvent<HTMLInputElement>)
    {
        this.props.property.value = e.target.value;
        if (this.props.onChanged)
            this.props.onChanged(this.props.property);
    }
    render()
    {
        let { children, header, ...others } = this.props;
        header = (<input
            type="checkbox"
            className="editor-content"
            onChange={(e) => this.onChange(e)}
            ref={this.input}
            {...(this.props.editable ? {} : { value: this.props.property.value })} />);
        return (
            <Editor header={header} {...others}>
            </Editor>
        );
    }
}

export class ObjectEditor extends Editor
{
    render()
    {
        const typeData = AGOGOSRenderer.instance.typeLib[this.props.property.type];
        let { children, header, content, ...others } = this.props;
        header = (<span className="editor-content">{`object: ${this.props.property.type}`}</span>);
        if (typeData)
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
}