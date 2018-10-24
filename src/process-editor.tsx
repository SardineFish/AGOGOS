import React, { HTMLProps, RefObject, ChangeEventHandler, ChangeEvent, MouseEvent, DragEvent, MouseEventHandler } from "react";
import { TestProcessNode, KeyProcess } from "./process-unit";
import linq from "linq";
import { getKeys } from "./utility";
import { getType, BuildinTypes } from "./meta-data";
import ReactDOM from "react-dom";
import { Vector2, vec2, EndPoint, ProcessNodeData, PropertyData, TypeData, NULL } from "./lib";
import { RenderedConnection } from "./components";
import { AGOGOSRenderer } from "./lib-renderer";

type EditorValueChangeCallback<T> = (value: T) => void;
type RefCallback<T> = (ref: T) => void;
type EventHandler<T> = (e: T) => void;
export interface DragMoveEvent
{
    startX: number;
    startY: number;
    x: number;
    y: number;
}
export interface ConnectEvent
{
    source: EndPoint;
    target: EndPoint;
}
interface ProcessNodeProps extends HTMLProps<HTMLDivElement>
{
    node: ProcessNodeData;
    onDragMove?: EventHandler<DragMoveEvent>;
    onDragMoveStart?: EventHandler<DragMoveEvent>;
    connecting?: boolean;
    portFilter?: string;
    onNameChange?: EventHandler<string>;
    onConnectEnd?: EventHandler<EndPoint>;
    onConnectStart?: EventHandler<EndPoint>;
    refCallback?: RefCallback<ReactProcessNode>;
}

interface EditorProps<T>
{
    label: string;
    className?: string;
    allowInput?: boolean;
    allowOutput?: boolean;
    node: ProcessNodeData;
    propertyName: string;
    key?: string | number;
    type?: string;
    editvalue: T;
    editable?: boolean;
    onChange?: EditorValueChangeCallback<T>;
    connecting?: boolean;
    portFilter?: string;
    onConnectEnd?: EventHandler<EndPoint>;
    onConnectStart?: EventHandler<EndPoint>;
}
interface ProcessNodeState
{
    connecting: boolean;
    portFilter: string;
}
class ValueEditor<T> extends React.Component<EditorProps<T>>
{
    onPortMouseDown(port:"input"|"output")
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
    doRender(element:JSX.Element)
    {
        return (
            <span className={["editor",`editor-${this.props.propertyName}`].concat(this.props.className ? [this.props.className as string] : []).join(" ")} >
                {
                    this.props.allowInput ?
                        (<span className="port-input" onMouseDown={()=>this.onPortMouseDown("input")} onMouseUp={()=>this.onPortMouseUp("input")}></span>) : null
                }
                <span className="editor-label">{this.props.label}</span>
                {
                    element
                }
                {
                    this.props.allowOutput ?
                        (<span className="port-output" onMouseDown={() => this.onPortMouseDown("output")} onMouseUp={() => this.onPortMouseUp("output")}></span>) : null
                }
            </span>
        )
    }
}
class EditorString extends ValueEditor<string>
{
    input: RefObject<HTMLInputElement>;
    constructor(props: EditorProps<string>)
    {
        super(props);
        this.input = React.createRef();
    }
    componentDidMount()
    {
        this.input.current!.value = this.props.editvalue ? this.props.editvalue : "";
        this.props.onChange(this.input.current!.value);
    }
    onChange(e: ChangeEvent<HTMLInputElement>)
    {
        this.props.onChange(e.target.value);
    }
    render()
    {
        const editable = this.props.editable === undefined ? true : this.props.editable;
        return this.doRender((
            <input
                type="text"
                className="editor-content"
                onChange={(e) => this.onChange(e)}
                ref={this.input}
                {...(editable ? {} : { value: this.props.editvalue })} />
        ));
    }
}

class EditorNumber extends ValueEditor<number>
{
    input: RefObject<HTMLInputElement>;
    constructor(props: EditorProps<number>)
    {
        super(props);
        this.input = React.createRef();
    }
    componentDidMount()
    {
        this.input.current!.valueAsNumber = this.props.editvalue ? this.props.editvalue : 0;
        this.props.onChange(this.input.current!.valueAsNumber);
    }
    onChange(e: ChangeEvent<HTMLInputElement>)
    {
        this.props.onChange(e.target.valueAsNumber);
    }
    render()
    {
        const editable = this.props.editable === undefined ? true : this.props.editable;
        return this.doRender((
            <input
                type="number"
                className="editor-content"
                onChange={(e) => this.onChange(e)}
                ref={this.input}
                {...(editable ? {} : { value: this.props.editvalue })} />
        ));
    }
}

class EditorBoolean extends ValueEditor<boolean>
{
    input: RefObject<HTMLInputElement>;
    constructor(props: EditorProps<boolean>)
    {
        super(props);
        this.input = React.createRef();
    }
    componentDidMount()
    {
        this.input.current!.checked = this.props.editvalue ? this.props.editvalue : false;
        this.props.onChange(this.input.current!.checked);
    }
    onChange(e: ChangeEvent<HTMLInputElement>)
    {
        this.props.onChange(e.target.checked);
    }
    render()
    {
        const editable = this.props.editable === undefined ? true : this.props.editable;
        return this.doRender((
            <input
                type="checkbox"
                className="editor-content"
                onChange={(e) => this.onChange(e)}
                ref={this.input}
                {...(editable ? {} : { checked: this.props.editvalue })} />
        ));
    }
}

const BuildinTypesList = [
    "string",
    "number",
    "boolean",
    "void",
    "object",
    "array"];


interface ObjectEditorProps extends EditorProps<object>
{
    objectData: PropertyData;
    type: string;
}
interface ObjectEditorState
{
    extend: boolean;
}
class EditorObject extends React.Component<ObjectEditorProps,ObjectEditorState>
{
    input: RefObject<HTMLInputElement>;
    nodeRef: RefObject<HTMLDivElement>;
    objData: PropertyData;
    constructor(props: ObjectEditorProps)
    {
        super(props);
        this.nodeRef = React.createRef();
        this.state = { extend: false };
        this.objData = this.props.objectData ? this.props.objectData : {
            type: this.props.type,
            value: {},
            properties: {}
        };
        if (!this.objData.properties)
            this.objData.properties = {};
        if (!this.objData.value)
            this.objData.value = {};
    }
    componentDidMount()
    {
        NULL(this.props.onChange)
            .safe(f => f(this.objData))
            .safe();
    }
    onValueChange(key: string, value: any)
    {
        const typeData = AGOGOSRenderer.instance.typeLib[this.props.type];
        if (BuildinTypesList.includes(typeData.properties[key].type))
            this.objData.properties[key] = {
                type: typeData.properties[key].type,
                value: value
            };
        else
            this.objData.properties[key] = value;
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
    render()
    {
        const typeData = AGOGOSRenderer.instance.typeLib[this.props.type];
        return (
            <div className={["object-editor",this.state.extend?"extend":"fold"].join(" ")} ref={this.nodeRef}>
                <span className={["editor", "editor-header", `editor-${this.props.propertyName}`].concat(this.props.className ? [this.props.className as string] : []).join(" ")} >
                    {
                        this.props.allowInput ?
                            (<span className="port-input" onMouseDown={() => this.onPortMouseDown("input")} onMouseUp={() => this.onPortMouseUp("input")}></span>) : null
                    }
                    {
                        typeData ?
                            <span className={`fold-icon ${this.state.extend ? "extend" : "fold"}`} onClick={() => this.setState({ extend: !this.state.extend })}></span>
                            :null
                    }
                    <span className="editor-label">{this.props.label}</span>
                    <span className="editor-content">{`object: ${this.props.type}`}</span>
                    {
                        this.props.allowOutput ?
                            (<span className="port-output" onMouseDown={() => this.onPortMouseDown("output")} onMouseUp={() => this.onPortMouseUp("output")}></span>) : null
                    }
                </span>
                {
                    this.state.extend ?
                        <div className="editor-children">
                            {
                                getKeys(typeData.properties).map((key, idx) =>
                                {
                                    switch (typeData.properties[key].type)
                                    {
                                        case BuildinTypes.string:
                                            return (<EditorString
                                                node={this.props.node}
                                                propertyName={key}
                                                label={key}
                                                allowInput={this.props.allowInput}
                                                allowOutput={this.props.allowOutput}
                                                ref={key}
                                                editvalue={this.props.objectData!.properties[key].value}
                                                key={idx}
                                                onChange={(value) => this.onValueChange(key, value)}
                                                connecting={this.props.connecting}
                                                portFilter={this.props.portFilter}
                                                onConnectStart={(endpoint)=>this.onChildConnectStart(endpoint)}
                                                onConnectEnd={(endpoint)=>this.onChildConnectEnd(endpoint)} />);
                                        case BuildinTypes.number:
                                            return (<EditorNumber
                                                node={this.props.node}
                                                propertyName={key}
                                                label={key}
                                                allowInput={this.props.allowInput}
                                                allowOutput={this.props.allowOutput}
                                                ref={key}
                                                editvalue={NULL(this.props.objectData).safe(() => this.props.objectData.value).safe(() => this.props.objectData.properties).safe(p => p[key]).safe(p => p.value).safe()}
                                                key={idx}
                                                onChange={(value) => this.onValueChange(key, value)}
                                                connecting={this.props.connecting}
                                                portFilter={this.props.portFilter}
                                                onConnectStart={(endpoint) => this.onChildConnectStart(endpoint)}
                                                onConnectEnd={(endpoint) => this.onChildConnectEnd(endpoint)} />);
                                        case BuildinTypes.boolean:
                                            return (<EditorBoolean
                                                node={this.props.node}
                                                propertyName={key}
                                                label={key}
                                                allowInput={this.props.allowInput}
                                                allowOutput={this.props.allowOutput}
                                                ref={key}
                                                editvalue={NULL(this.props.objectData).safe(() => this.props.objectData.value).safe(() => this.props.objectData.properties).safe(p => p[key]).safe(p => p.value).safe()}
                                                key={idx}
                                                onChange={(value) => this.onValueChange(key, value)}
                                                connecting={this.props.connecting}
                                                portFilter={this.props.portFilter}
                                                onConnectStart={(endpoint) => this.onChildConnectStart(endpoint)}
                                                onConnectEnd={(endpoint) => this.onChildConnectEnd(endpoint)} />);
                                        default:
                                            return (
                                                <EditorObject
                                                    node={this.props.node}
                                                    propertyName={key}
                                                    type={typeData.properties[key].type}
                                                    objectData={NULL(this.props.objectData).safe(data=>data.value).safe(()=>this.props.objectData.properties[key]).safe()}
                                                    label={key}
                                                    allowInput={this.props.allowInput}
                                                    allowOutput={this.props.allowOutput}
                                                    ref={key}
                                                    editvalue={NULL(this.props.objectData).safe(()=>this.props.objectData.value).safe(() => this.props.objectData.properties).safe(p => p[key]).safe(p => p.value).safe()}
                                                    key={idx}
                                                    onChange={(value) => this.onValueChange(key, value)}
                                                    connecting={this.props.connecting}
                                                    portFilter={this.props.portFilter}
                                                    onConnectStart={(endpoint) => this.onChildConnectStart(endpoint)}
                                                    onConnectEnd={(endpoint) => this.onChildConnectEnd(endpoint)}
                                                />
                                            )
                                    }
                                })
                            }
                        </div>
                        : null
                }
            </div>
        )
    }
}

export class ReactProcessNode extends React.Component<ProcessNodeProps,ProcessNodeState>
{
    constructor(props:ProcessNodeProps)
    {
        super(props);
        this.state = {
            portFilter: props.portFilter,
            connecting: props.connecting
        };
        this.nodeRef = React.createRef();
    }
    drag: boolean = false;
    holdPos: Vector2;
    nodeRef: RefObject<HTMLDivElement>;
    onValueChange(key: string, e: any)
    {
        if (key === "name" && this.props.onNameChange)
        {
            this.props.onNameChange(e);
            this.props.node.name = e;
        }
        else
            this.props.node.properties[key].value = e;
    }
    onMouseDown(e: MouseEvent<HTMLElement>)
    {
        if (e.button === 0)
        {
            this.drag = true;
            this.holdPos = vec2(e.clientX, e.clientY);
            this.props.onDragMoveStart({ startX: this.holdPos.x, startY: this.holdPos.y, x: e.clientX, y: e.clientY });
        }
    }
    onMouseMove(e: MouseEvent<HTMLElement>)
    {
        if (this.drag)
        {
            if (this.props.onDragMove)
            {
                this.props.onDragMove({ startX: this.holdPos.x, startY: this.holdPos.y, x: e.clientX, y: e.clientY });
            }
        }
    }
    onMouseUp(e: MouseEvent<HTMLElement>)
    {
        if (e.button === 0)
        {
            this.drag = false;
        }
    }
    componentDidMount()
    {
        window.addEventListener("mousemove", (e: any) => this.onMouseMove(e));
        if (this.props.refCallback)
        {
            this.props.refCallback(this);
        }
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
    render()
    {
        const outputType = this.props.node.processOutput.type;
        return (
            <div className="node-wrapper" ref={this.nodeRef}>
                <header className="node-header" onMouseDown={(e) => this.onMouseDown(e)} onMouseUp={(e) => this.onMouseUp(e)} >{this.props.node.processType}</header>
                <div className="node-content">
                    {
                        Array.from(getKeys(this.props.node.properties))
                            .map((key, idx) =>
                            {
                                switch (this.props.node.properties[key].type)
                                {
                                    case BuildinTypes.string:
                                        return (<EditorString
                                            node={this.props.node}
                                            propertyName={key}
                                            label={key}
                                            allowOutput
                                            ref={key}
                                            editvalue={this.props.node.properties[key].value}
                                            key={idx} allowInput
                                            onChange={(value) => this.onValueChange(key, value)}
                                            connecting={this.state.connecting}
                                            portFilter={this.state.portFilter}
                                            onConnectStart={this.props.onConnectStart}
                                            onConnectEnd={this.props.onConnectEnd}/>);
                                    case BuildinTypes.number:
                                        return (<EditorNumber
                                            node={this.props.node}
                                            propertyName={key}
                                            label={key}
                                            allowOutput
                                            ref={key}
                                            editvalue={this.props.node.properties[key].value}
                                            key={idx} allowInput onChange={(value) => this.onValueChange(key, value)}
                                            connecting={this.state.connecting}
                                            portFilter={this.state.portFilter}
                                            onConnectStart={this.props.onConnectStart}
                                            onConnectEnd={this.props.onConnectEnd}/>);
                                    case BuildinTypes.boolean:
                                        return (<EditorBoolean
                                            node={this.props.node}
                                            propertyName={key}
                                            label={key}
                                            allowOutput
                                            ref={key}
                                            editvalue={this.props.node.properties[key].value}
                                            key={idx} allowInput onChange={(value) => this.onValueChange(key, value)}
                                            connecting={this.state.connecting}
                                            portFilter={this.state.portFilter}
                                            onConnectStart={this.props.onConnectStart}
                                            onConnectEnd={this.props.onConnectEnd} />);
                                    default:
                                        return (
                                            <EditorObject
                                                type={this.props.node.properties[key].type}
                                                node={this.props.node}
                                                propertyName={key}
                                                objectData={this.props.node.properties[key]}
                                                label={key}
                                                allowOutput
                                                ref={key}
                                                editvalue={this.props.node.properties[key].value}
                                                key={idx} allowInput onChange={(value) => this.onValueChange(key, value)}
                                                connecting={this.state.connecting}
                                                portFilter={this.state.portFilter}
                                                onConnectStart={this.props.onConnectStart}
                                                onConnectEnd={this.props.onConnectEnd} 
                                            />
                                        )
                                }
                            })
                    }
                </div>
                <div className="node-output">
                    {
                        linq.from([
                            {
                                key: BuildinTypes.string, handler: () => (<EditorString
                                    node={this.props.node}
                                    propertyName="output"
                                    label="Output"
                                    ref="output"
                                    editvalue=""
                                    allowOutput
                                    onConnectStart={this.props.onConnectStart}
                                    onConnectEnd={this.props.onConnectEnd} />)
                            },
                            {
                                key: BuildinTypes.number, handler: () => (<EditorNumber
                                    node={this.props.node}
                                    propertyName="output"
                                    label="Output"
                                    ref="output"
                                    editvalue={NaN}
                                    allowOutput
                                    onConnectStart={this.props.onConnectStart}
                                    onConnectEnd={this.props.onConnectEnd}/>)
                            },
                            {
                                key: BuildinTypes.boolean, handler: () => (<EditorBoolean
                                    node={this.props.node}
                                    propertyName="output"
                                    label="Output"
                                    ref="output"
                                    editvalue={false}
                                    allowOutput
                                    onConnectStart={this.props.onConnectStart}
                                    onConnectEnd={this.props.onConnectEnd}/>)
                            },
                            {
                                key: outputType, handler: () => (<EditorObject
                                    node={this.props.node}
                                    objectData={this.props.node.processOutput}
                                    propertyName="output"
                                    label="Output"
                                    ref="output"
                                    editvalue={null}
                                    type={outputType}
                                    allowOutput
                                    onConnectStart={this.props.onConnectStart}
                                    onConnectEnd={this.props.onConnectEnd} />)
                            },
                        ])
                            .where(proc => proc.key === outputType)
                            .firstOrDefault()
                            .handler()
                    }
                </div>
            </div>
        )
    }
}



export function renderProcessNode(props: ProcessNodeProps, pos:Vector2=vec2(0,0)): HTMLElement
{
    let element = document.createElement("div");
    element.className = "process-node";
    element.style.left = `${pos.x}px`;
    element.style.top = `${pos.y}px`;
    let { ref, ...others } = props;
    const reactElement = (
        <ReactProcessNode
            {...others}/>
    );
    ReactDOM.render(reactElement, element)
    return element;
}


interface ConnectLineProps
{
    from: Vector2;
    to: Vector2;
    refCallback?: (ref: ConnectLine) => void;
}

export class ConnectLine extends React.Component<ConnectLineProps, ConnectLineProps>
{
    constructor(props: ConnectLineProps)
    {
        super(props);
        this.state = {
            from: this.props.from,
            to: this.props.to
        };
    }
    componentDidMount()
    {
        if (this.props.refCallback)
            this.props.refCallback(this);
    }
    render()
    {
        const k = 0.4;
        const cp1 = vec2((this.state.to.x - this.state.from.x) * k + this.state.from.x, this.state.from.y);
        const cp2 = vec2((this.state.to.x - this.state.from.x) * (-k) + this.state.to.x, this.state.to.y);
        return (
            <svg style={{ overflow: "visible", margin: 0, padding: 0, width: "1px", height: "1px", left: 0, top: 0, display: "block", pointerEvents: "none" }}>
                <path
                    d={`M ${this.state.from.x},${this.state.from.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${this.state.to.x},${this.state.to.y}`}
                    stroke="black"
                    width="1"
                    fill="transparent"
                />
            </svg>
        );
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
export function RenderConnectLine(props: ConnectLineProps): Promise<{line: ConnectLine,element:HTMLElement }>
{
    return new Promise((resolver) =>
    {
        let element = document.createElement("div");
        element.className = "connect-line-wrapper";
        const reactElement = (
            <ConnectLine
                from={props.from}
                to={props.to}
                refCallback={(ref) => resolver({ line: ref, element: element })}
            />
        );
        ReactDOM.render(reactElement, element);
    });
}