import React, { HTMLProps, RefObject, ChangeEventHandler, ChangeEvent, MouseEvent, DragEvent, MouseEventHandler } from "react";
import { TestProcessNode, KeyProcess } from "./process-unit";
import linq from "linq";
import { getKeys } from "./utility";
import { getType, BuildinTypes, typedef } from "./meta-data";
import ReactDOM from "react-dom";
import { Vector2, vec2, EndPoint, ProcessNodeData, PropertyData, TypeData, NULL, getElementType } from "./lib";
import { RenderedConnection } from "./components";
import { AGOGOSRenderer } from "./lib-renderer";
import { EditorManager } from "./editor-manager";
import { NumberEditor, StringEditor, BooleanEditor, Editor } from "./editor-lib";

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
const BuildinTypesList = [
    "string",
    "number",
    "boolean",
    "void",
    "object",
    "array"];
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
interface ProcessEditorProps
{
    process:ProcessNodeData
    onDragMove?: EventHandler<DragMoveEvent>;
    onDragMoveStart?: EventHandler<DragMoveEvent>;
    onNameChange?: EventHandler<string>;
    onConnectEnd?: EventHandler<EndPoint>;
    onConnectStart?: EventHandler<EndPoint>;
    refCallback?: RefCallback<ProcessEditor>;
    onChanged?: (data: ProcessNodeData) => void;
}
interface ProcessEditorState
{
    connecting: boolean;
}
export class ProcessEditor extends React.Component<ProcessEditorProps,ProcessEditorState>
{
    nodeRef: RefObject<HTMLDivElement>;
    drag: boolean = false;
    holdPos: Vector2;
    constructor(props: ProcessEditorProps)
    {
        super(props);
        this.state = {
            connecting: false
        };
        this.nodeRef = React.createRef();
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
    onChildrenChanged(data: PropertyData)
    {
        this.props.process.properties[data.name] = data;
        if (this.props.onChanged)
            this.props.onChanged(this.props.process);
    }
    getPortPos(key: string, port: string): Vector2
    {
        let keys = key.split(".");
        if (keys.length > 1 && (this.refs[keys[0]] as Editor).state.extend)
        {
            return (this.refs[keys[0]] as Editor).getPortPos(keys.slice(1).join('.'), port);
        }
        let rect = this.nodeRef.current!.querySelector(`.editor-${keys[0]} .port-${port}`).getBoundingClientRect();
        return vec2(rect.left + 5, rect.top + 5);
    }
    render()
    {
        const outputType = this.props.process.processOutput.type;
        return (
            <div className="node-wrapper" ref={this.nodeRef}>
                <header className="node-header" onMouseDown={(e) => this.onMouseDown(e)} onMouseUp={(e) => this.onMouseUp(e)} >{this.props.process.processType}</header>
                <div className="node-content">
                    {
                        getKeys(this.props.process.properties).map((key, idx) =>
                        {
                            let childType = this.props.process.properties[key].type;
                            let childProperty = this.props.process.properties[key];
                            let ChildEditor = AGOGOSRenderer.instance.editorManager.getEditor(childType);
                            return (
                                <ChildEditor
                                    key={key}
                                    ref={key}
                                    process={this.props.process.name}
                                    property={childProperty}
                                    label={key}
                                    allowInput={true}
                                    allowOutput={true}
                                    editable={true}
                                    connecting={this.state.connecting}
                                    onChanged={(data) => this.onChildrenChanged(data)}
                                    onConnectStart={this.props.onConnectStart}
                                    onConnectEnd={this.props.onConnectEnd}
                                />
                            )
                        })
                    }
                </div>
                <div className="node-output">
                    {
                        (() =>
                        {
                            let outputProperty = this.props.process.processOutput;
                            let OutputEditor = AGOGOSRenderer.instance.editorManager.getEditor(this.props.process.processOutput.type);
                            return (
                                <OutputEditor
                                    ref="output"
                                    process={this.props.process.name}
                                    property={outputProperty}
                                    label="Output"
                                    allowInput={false}
                                    allowOutput={true}
                                    editable={false}
                                    connecting={this.state.connecting}
                                    onConnectStart={this.props.onConnectStart}
                                    onConnectEnd={this.props.onConnectEnd}
                                />
                            )
                        })()
                    }
                </div>
            </div>
        )
    }
}

export function renderProcessNode(props: ProcessEditorProps, pos: Vector2 = vec2(0, 0)): HTMLElement
{
    let element = document.createElement("div");
    element.className = "process-node";
    element.style.left = `${pos.x}px`;
    element.style.top = `${pos.y}px`;
    const reactElement = (
        <ProcessEditor
            {...props} />
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
export function RenderConnectLine(props: ConnectLineProps): Promise<{ line: ConnectLine, element: HTMLElement }>
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

export function InitEditor(editorManager: EditorManager)
{
    editorManager.addEditor(BuildinTypes.number, NumberEditor as any);
    editorManager.addEditor(BuildinTypes.string, StringEditor as any);
    editorManager.addEditor(BuildinTypes.boolean, BooleanEditor as any);
    editorManager.addEditor(BuildinTypes.object, Editor as any);
    editorManager.setDefault(Editor as any);
}