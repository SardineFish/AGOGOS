import React, { HTMLProps, RefObject, EventHandler, ChangeEventHandler, ChangeEvent, DragEvent, MouseEventHandler } from "react";
import ViewPort from "../../react-free-viewport/dist";
import { TestProcessNode, KeyProcess } from "./process-node";
import { ProcessNodeData } from "./lib-renderer";
import linq from "linq";
import { getKeys } from "./utility";
import { getType, BuildinTypes } from "./meta-data";
import { renderProcessNode, DragMoveEvent, ReactProcessNode, ConnectLine, RenderConnectLine} from "./process-editor"
import { Vector2, vec2, Connection, EndPoint } from "./lib";
import processManager from "./process-manager";
interface PaneProps extends HTMLProps<HTMLDivElement>
{
    header: string;
}
interface RenderedProcessNode
{
    process: ProcessNodeData;
    renderer: ReactProcessNode;
}
interface RenderedObject<TObj, TRenderer extends React.Component>
{
    obj: TObj;
    renderer: TRenderer;
    element: HTMLElement;
}
export type RenderedConnection = RenderedObject<Connection, ConnectLine>;
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
    processes: Map<string, RenderedProcessNode> = new Map();
    connections: RenderedConnection[] = [];
    connecting: boolean = false;
    pendingConnection: RenderedConnection;
    constructor(props:HTMLProps<HTMLDivElement>)
    {
        super(props);
        this.domRef = React.createRef();
    }
    addProcess(process: ProcessNodeData)
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
            this.connections.forEach(cnn => this.updateConnectionLine(cnn));
            if (this.connecting)
                this.updateConnectionLine(this.pendingConnection);
        };
        
        process.name = `Process${this.processes.size}`;
        this.processes.set(process.name, { process: process, renderer: null });

        let element = renderProcessNode(process, onDragStart, onNodeDragMove, (p)=>this.startConnection(p), (p)=>this.endConnection(p), (p) =>
        {
            this.processes.get(process.name).renderer = p;
        });
        this.domRef.current!.querySelector(".viewport-wrapper")!.appendChild(element);
    }
    startConnection(endpoint:EndPoint)
    {
        if (this.connecting)
            return;
        this.pendingConnection = {
            obj: {
                source: endpoint,
                target: null
            },
            renderer: null,
            element: null
        };
        let pos = this.viewport.mousePosition(this.processes.get(endpoint.process.name).renderer.getPortPos(endpoint.property, endpoint.port));
        this.processes.forEach(obj =>
        {
            obj.renderer.setState({ connecting: true });
        })
        //this.connecting = true;
        
        RenderConnectLine({
            from: pos,
            to: pos
        }).then(({ line, element }) =>
        {
            this.connecting = true;
            this.domRef.current!.querySelector(".viewport-wrapper")!.appendChild(element);
            this.pendingConnection.renderer = line;
            this.pendingConnection.element = element;
            console.log(line);
        });
    }
    endConnection(endpoint: EndPoint)
    {
        this.pendingConnection.obj.target = endpoint;
        this.pendingConnection.renderer.setState({
            to: this.viewport.mousePosition(this.processes.get(endpoint.process.name).renderer.getPortPos(endpoint.property, endpoint.port))
        });
        this.connections.push(this.pendingConnection);
        this.pendingConnection = null;
        this.connecting = false;
    }
    updateConnectionLine(line: RenderedConnection)
    {
        if (line.obj.target)
        {
            line.renderer.setState({
                from: this.viewport.mousePosition(this.processes.get(line.obj.source.process.name).renderer.getPortPos(line.obj.source.property, line.obj.source.port)),
                to: this.viewport.mousePosition(this.processes.get(line.obj.target.process.name).renderer.getPortPos(line.obj.target.property, line.obj.target.port))
            });
        }
        else
        {
            line.renderer.setState({
                from: this.viewport.mousePosition(this.processes.get(line.obj.source.process.name).renderer.getPortPos(line.obj.source.property, line.obj.source.port))
            });
        }
    }
    onWindowMouseMove(e: MouseEvent)
    {
        if (this.connecting)
        {
            this.pendingConnection.renderer.setState({ to: this.viewport.mousePosition(vec2(e.clientX, e.clientY)) });
        }
    }
    onWindowMouseUp(e: MouseEvent)
    {
        if (this.connecting)
        {
            this.connecting = false;
            this.pendingConnection.element.remove();
            this.pendingConnection = null;
        }
    }
    componentDidMount()
    {
        this.viewport = this.refs["viewport"] as ViewPort;
        processManager.addProcess("TestProcessNode", TestProcessNode);
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));
        /*this.addProcess(processManager.getProcessData(new TestProcessNode()));
        this.addProcess(processManager.getProcessData(new TestProcessNode()));
        this.addProcess(processManager.getProcessData(new TestProcessNode()));*/
        window.addEventListener("mousemove", (e) => this.onWindowMouseMove(e));
        window.addEventListener("mouseup", (e) => this.onWindowMouseUp(e));
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
interface ProgressProps extends HTMLProps<HTMLSpanElement>
{
    progress: number;
}
export class ProgressBar extends React.Component<ProgressProps>
{
    render()
    {
        let { className, ...others } = this.props;
        className = [className, "progress-bar"].join(" ");
        return (
            <span className={className} {...others} style={{ display: "inline-block", position: "relative" }}>
                <span
                    className="progress"
                    style={{
                        display: "block",
                        position: "absolute",
                        left: "0",
                        top: "0",
                        height: "100%",
                        width: `${this.props.progress * 100}%`
                    }} />
            </span>
        );
    }
}