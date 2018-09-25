import React, { HTMLProps, RefObject, EventHandler, ChangeEventHandler, ChangeEvent, MouseEvent, DragEvent, MouseEventHandler } from "react";
import ViewPort from "../../react-free-viewport/dist";
import { ProcessNode, TestProcessNode, KeyProcess } from "./process-node";
import linq from "linq";
import { getKeys } from "./utility";
import { getType, BuildinTypes } from "./meta-data";
import { renderProcessNode, DragMoveEvent} from "./process-editor"
import { Vector2, vec2 } from "./lib";
interface PaneProps extends HTMLProps<HTMLDivElement>
{
    header: string;
}
export class Pane extends React.Component<PaneProps>
{
    render()
    {
        return (
            <section className={[this.props.className, "pane"].join(" ")} id={this.props.id} key={this.props.key}>
                <header className="pane-header">{this.props.header}</header>
                <div className="pane-content">{this.props.children}</div>
            </section>
        );
    }
}
export class ProcessSpace extends React.Component<HTMLProps<HTMLDivElement>>
{
    domRef: RefObject<HTMLDivElement>;
    viewport: ViewPort;
    constructor(props:HTMLProps<HTMLDivElement>)
    {
        super(props);
        this.domRef = React.createRef();
    }
    addProcess(process: ProcessNode)
    {
        let startPos: Vector2;
        let holdPos: Vector2;
        const onDragStart = (e: DragMoveEvent) =>
        {
            let style = getComputedStyle(element);
            startPos = vec2(parseFloat(style.left), parseFloat(style.top));
            holdPos = this.viewport.mousePosition(vec2(e.startX, e.startY));
        };
        const onNodeDragMove = (e: DragMoveEvent) =>
        {
            let dp = Vector2.minus(this.viewport.mousePosition(vec2(e.x, e.y)), holdPos);
            let pos = Vector2.plus(startPos, dp);
            element.style.left = `${pos.x}px`;
            element.style.top = `${pos.y}px`;
        };
        let element = renderProcessNode(process, onDragStart, onNodeDragMove);
        this.domRef.current!.querySelector(".viewport-wrapper")!.appendChild(element);
    }
    componentDidMount()
    {
        this.viewport = this.refs["viewport"] as ViewPort;
        this.addProcess(new TestProcessNode());
        this.addProcess(new TestProcessNode());
        this.addProcess(new TestProcessNode());
    }
    render()
    {
        const { children, ...other } = this.props;
        
        return (
            <ViewPort id={this.props.id} ref="viewport" button={1} refobj={this.domRef}>

            </ViewPort>
        )
    }
}