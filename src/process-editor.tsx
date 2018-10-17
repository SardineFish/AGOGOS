import React, { HTMLProps, RefObject, ChangeEventHandler, ChangeEvent, MouseEvent, DragEvent, MouseEventHandler } from "react";
import { TestProcessNode, KeyProcess } from "./process-unit";
import linq from "linq";
import { getKeys } from "./utility";
import { getType, BuildinTypes } from "./meta-data";
import ReactDOM from "react-dom";
import { Vector2, vec2, EndPoint, ProcessNodeData } from "./lib";
import { RenderedConnection } from "./components";

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
                process: this.props.node,
                property: this.props.propertyName,
                port: port
            });
        }
    }
    onPortMouseUp(port: "input" | "output")
    {
        if (this.props.connecting && this.props.onConnectEnd)
            this.props.onConnectEnd({
                process: this.props.node,
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
        this.input.current!.value = this.props.editvalue;
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
        this.input.current!.valueAsNumber = this.props.editvalue;
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
        this.input.current!.checked = this.props.editvalue;
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

class EditorObject extends ValueEditor<ProcessNodeData>
{
    input: RefObject<HTMLInputElement>;
    constructor(props: EditorProps<ProcessNodeData>)
    {
        super(props);
    }
    render()
    {
        return this.doRender(
            <span className="editor-content">{this.props.editvalue.name}</span>
        );
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
            this.props.node.properties.get(key).value = e;
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
        let rect = this.nodeRef.current!.querySelector(`.editor-${key} .port-${port}`).getBoundingClientRect();
        return vec2(rect.left + 5, rect.top + 5);
    }
    render()
    {
        const outputType = this.props.node.processOutput.type;
        return (
            <div className="node-wrapper" ref={this.nodeRef}>
                <header className="node-header" onMouseDown={(e) => this.onMouseDown(e)} onMouseUp={(e) => this.onMouseUp(e)} >{this.props.node.name}</header>
                <div className="node-content">
                    {
                        Array.from(this.props.node.properties.keys())
                            .map((key, idx) =>
                            {
                                switch (this.props.node.properties.get(key).type)
                                {
                                    case BuildinTypes.string:
                                        return (<EditorString
                                            node={this.props.node}
                                            propertyName={key}
                                            label={key}
                                            allowOutput
                                            ref={key}
                                            editvalue={this.props.node.properties.get(key).value}
                                            key={idx} allowInput
                                            onChange={(e) => this.onValueChange(key, e)}
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
                                            editvalue={this.props.node.properties.get(key).value}
                                            key={idx} allowInput onChange={(e) => this.onValueChange(key, e)}
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
                                            editvalue={this.props.node.properties.get(key).value}
                                            key={idx} allowInput onChange={(e) => this.onValueChange(key, e)}
                                            connecting={this.state.connecting}
                                            portFilter={this.state.portFilter}
                                            onConnectStart={this.props.onConnectStart}
                                            onConnectEnd={this.props.onConnectEnd}/>);
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



export function renderProcessNode(node: ProcessNodeData, onDragMoveStart?: EventHandler<DragMoveEvent>, onDragMove?: EventHandler<DragMoveEvent>,onConnectStart?:EventHandler<EndPoint>, onConnectEnd?:EventHandler<EndPoint>, refCallback?: RefCallback<ReactProcessNode>): HTMLElement
{
    let element = document.createElement("div");
    element.className = "process-node";
    const reactElement = (
        <ReactProcessNode
            node={node}
            onDragMoveStart={onDragMoveStart}
            onDragMove={onDragMove}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            refCallback={refCallback}/>
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