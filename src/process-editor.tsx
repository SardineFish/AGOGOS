import React, { HTMLProps, RefObject, ChangeEventHandler, ChangeEvent, MouseEvent, DragEvent, MouseEventHandler } from "react";
import { ProcessNode, TestProcessNode, KeyProcess } from "./process-node";
import linq from "linq";
import { getKeys } from "./utility";
import { getType, BuildinTypes } from "./meta-data";
import ReactDOM from "react-dom";
import { Vector2, vec2 } from "./lib";

type EditorValueChangeCallback<T> = (value: T) => void;
type EditorValueLinkCallback = (value: any) => void;
type EventHandler<T> = (e: T) => void;
export interface DragMoveEvent
{
    startX: number;
    startY: number;
    x: number;
    y: number;
}
interface ProcessNodeProps extends HTMLProps<HTMLDivElement>
{
    node: ProcessNode;
    onDragMove?: EventHandler<DragMoveEvent>;
    onDragMoveStart?: EventHandler<DragMoveEvent>;
    x?: number,
    y?: number
}

interface ValueEditorProps
{
    label: string;
    className?: string;
    allowInput?: boolean;
    allowOutput?: boolean;
}

interface EditorProps<T> extends ValueEditorProps
{
    key?: string | number;
    editvalue: T;
    editable?: boolean;
    onChange?: EditorValueChangeCallback<T>;
}
interface ObjectEditorProps extends EditorProps<ProcessNode>
{
    type: typeof ProcessNode;
}
interface ProcessNodeState
{
    x: number;
    y: number;
}
class ValueEditor extends React.Component<ValueEditorProps>
{
    render()
    {
        return (
            <span className={["editor"].concat(this.props.className ? [this.props.className as string] : []).join(" ")} >
                {
                    this.props.allowInput ?
                        (<span className="editor-input"></span>) : null
                }
                <span className="editor-label">{this.props.label}</span>
                {
                    this.props.children
                }
                {
                    this.props.allowOutput ?
                        (<span className="editor-output"></span>) : null
                }
            </span>
        )
    }
}
class EditorString extends React.Component<EditorProps<string>>
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
        return (
            <ValueEditor className={this.props.className} label={this.props.label} allowInput={this.props.allowInput} allowOutput={this.props.allowOutput}>
                <input
                    type="text"
                    className="editor-content"
                    onChange={(e) => this.onChange(e)}
                    ref={this.input}
                    {...(editable ? {} : { value: this.props.editvalue })} />
            </ValueEditor>
        );
    }
}

class EditorNumber extends React.Component<EditorProps<number>>
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
        return (
            <ValueEditor className={this.props.className} label={this.props.label} allowInput={this.props.allowInput} allowOutput={this.props.allowOutput}>
                <input
                    type="number"
                    className="editor-content"
                    onChange={(e) => this.onChange(e)}
                    ref={this.input}
                    {...(editable ? {} : { value: this.props.editvalue })} />
            </ValueEditor>
        )
    }
}

class EditorBoolean extends React.Component<EditorProps<boolean>>
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
        return (
            <ValueEditor className={this.props.className} label={this.props.label} allowInput={this.props.allowInput} allowOutput={this.props.allowOutput}>
                <input
                    type="checkbox"
                    className="editor-content"
                    onChange={(e) => this.onChange(e)}
                    ref={this.input}
                    {...(editable ? {} : { checked: this.props.editvalue })} />
            </ValueEditor>
        )
    }
}

class EditorObject extends React.Component<ObjectEditorProps>
{
    input: RefObject<HTMLInputElement>;
    constructor(props: ObjectEditorProps)
    {
        super(props);
        this.input = React.createRef();
    }
    componentDidMount()
    {

    }
    onChange(e: ChangeEvent<HTMLInputElement>)
    {

    }
    render()
    {
        return (
            <ValueEditor className={this.props.className} label={this.props.label}>
                <span className="editor-content">{this.props.editvalue.name}</span>
            </ValueEditor>
        )
    }
}

export class ReactProcessNode extends React.Component<ProcessNodeProps,ProcessNodeState>
{
    constructor(props:ProcessNodeProps)
    {
        super(props);
    }
    drag: boolean = false;
    holdPos: Vector2;
    onValueChange(key: string, e: any)
    {
        this.props.node[key] = e;
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
        window.addEventListener("mousemove", (e:any)=>this.onMouseMove(e));   
    }
    render()
    {
        const outputType = getType(this.props.node, KeyProcess);
        return (
            <div className="node-wrapper">
                <header className="node-header" onMouseDown={(e) => this.onMouseDown(e)} onMouseUp={(e) => this.onMouseUp(e)} >{this.props.node.nodeName}</header>
                <div className="node-content">
                    {
                        getKeys(this.props.node)
                            .filter((key) => getType(this.props.node, key))
                            .map((key, idx) =>
                            {
                                switch (getType(this.props.node, key))
                                {
                                    case BuildinTypes.string:
                                        return (<EditorString label={key} editvalue={this.props.node[key]} key={idx} allowInput onChange={(e) => this.onValueChange(key, e)}></EditorString>);
                                    case BuildinTypes.number:
                                        return (<EditorNumber label={key} editvalue={this.props.node[key]} key={idx} allowInput onChange={(e) => this.onValueChange(key, e)}></EditorNumber>);
                                    case BuildinTypes.boolean:
                                        return (<EditorBoolean label={key} editvalue={this.props.node[key]} key={idx} allowInput onChange={(e) => this.onValueChange(key, e)}></EditorBoolean>);
                                }
                            })
                    }
                </div>
                <div className="node-output">
                    {
                        linq.from([
                            { key: BuildinTypes.string, handler: () => (<EditorString label="Output" editvalue="" allowOutput />) },
                            { key: BuildinTypes.number, handler: () => (<EditorNumber label="Output" editvalue={NaN} allowOutput />) },
                            { key: BuildinTypes.boolean, handler: () => (<EditorBoolean label="Output" editvalue={false} allowOutput />) },
                            { key: outputType, handler: () => (<EditorObject label="Output" editvalue={null} type={outputType} allowOutput />) },
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



export function renderProcessNode(node: ProcessNode,onDragMoveStart?:EventHandler<DragMoveEvent>, onDragMove?:EventHandler<DragMoveEvent>): HTMLElement
{
    let element = document.createElement("div");
    element.className = "process-node";
    const reactElement = (
        <ReactProcessNode node={node} onDragMoveStart={onDragMoveStart} onDragMove={onDragMove}></ReactProcessNode>
    );
    console.log(ReactDOM.render(reactElement, element));
    return element;
}