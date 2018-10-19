import React, { HTMLProps, RefObject, EventHandler, ChangeEventHandler, ChangeEvent, DragEvent, MouseEventHandler } from "react";
import ViewPort from "../../react-free-viewport/dist";
import { TestProcessNode, KeyProcess } from "./process-unit";
import linq from "linq";
import { getKeys } from "./utility";
import { getType, BuildinTypes } from "./meta-data";
import { renderProcessNode, DragMoveEvent, ReactProcessNode, ConnectLine, RenderConnectLine} from "./process-editor"
import { Vector2, vec2, Connection, EndPoint, ProcessNodeData, getUUID } from "./lib";
import { IPCRenderer } from "./ipc";
import { AGOGOSRenderer } from "./lib-renderer";

//import processManager from "./process-manager";
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
            <section className={[this.props.className, "pane"].join(" ")} id={this.props.id} key={this.props.key} style={this.props.style}>
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
    addProcess(process: ProcessNodeData, pos:Vector2)
    {
        process.name = getUUID();
        console.log(process);
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
        
        //process.name = `Process${this.processes.size}`;
        
        this.processes.set(process.name, { process: process, renderer: null });

        /*let element = renderProcessNode({
            node:process, onDragStart, onNodeDragMove, (p)=> this.startConnection(p), (p) => this.endConnection(p), (p) =>
        {
            this.processes.get(process.name).renderer = p;
        }
    });*/
        let element = renderProcessNode({
            node: process,
            onDragMoveStart: onDragStart,
            onDragMove: onNodeDragMove,
            onConnectStart: (p) => this.startConnection(p),
            onConnectEnd: (p) => this.endConnection(p),
            refCallback: (p) => this.processes.get(process.name).renderer = p
        }, pos);
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
        let pos = this.viewport.mousePosition(this.processes.get(endpoint.process).renderer.getPortPos(endpoint.property, endpoint.port));
        this.processes.forEach(obj =>
        {
            obj.renderer.setState({ connecting: true });
        });
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
        const resetConnection = () =>
        {
            this.pendingConnection = null;
            this.connecting = false;
        };
        this.pendingConnection.obj.target = endpoint;
        let source = this.pendingConnection.obj.source;
        let target = this.pendingConnection.obj.target;
        if (source.port === target.port)
        {
            AGOGOSRenderer.instance.console.log("Can not connect same port.", "warn");
            resetConnection();
            return;
        }
        else if (source.port === "input")
        {
            source = this.pendingConnection.obj.target;
            target = this.pendingConnection.obj.source;
        }

        if (this.processes.get(target.process).process.properties[target.property].input)
        {
            AGOGOSRenderer.instance.console.log("Already has input connection.", "warn");
            resetConnection();
            return;
        }

        this.processes.get(target.process).process.properties[target.property].input = source;
        this.pendingConnection.renderer.setState({
            to: this.viewport.mousePosition(this.processes.get(endpoint.process).renderer.getPortPos(endpoint.property, endpoint.port))
        });
        this.connections.push(this.pendingConnection);
        resetConnection();
    }
    updateConnectionLine(line: RenderedConnection)
    {
        if (line.obj.target)
        {
            line.renderer.setState({
                from: this.viewport.mousePosition(this.processes.get(line.obj.source.process).renderer.getPortPos(line.obj.source.property, line.obj.source.port)),
                to: this.viewport.mousePosition(this.processes.get(line.obj.target.process).renderer.getPortPos(line.obj.target.property, line.obj.target.port))
            });
        }
        else
        {
            line.renderer.setState({
                from: this.viewport.mousePosition(this.processes.get(line.obj.source.process).renderer.getPortPos(line.obj.source.property, line.obj.source.port))
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
        /*processManager.addProcess("TestProcessNode", TestProcessNode);
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));
        this.addProcess(processManager.getProcessData(processManager.instantiateProcess("TestProcessNode")));*/
        /*this.addProcess(processManager.getProcessData(new TestProcessNode()));
        this.addProcess(processManager.getProcessData(new TestProcessNode()));
        this.addProcess(processManager.getProcessData(new TestProcessNode()));*/
        window.addEventListener("mousemove", (e) => this.onWindowMouseMove(e));
        window.addEventListener("mouseup", (e) => this.onWindowMouseUp(e));
    }
    async onFileDrop(e: React.DragEvent<HTMLElement>)
    {
        let pos = this.viewport.mousePosition(vec2(e.clientX,e.clientY))
        e.preventDefault();
        this.addProcess(await AGOGOSRenderer.instance.ipc.call<ProcessNodeData>(IPCRenderer.GetProcess, e.dataTransfer.getData("text/plain")), pos);
    }
    render()
    {
        const { children, ref, key, ...other } = this.props;
        
        return (
            <ViewPort id={this.props.id}
                ref="viewport"
                button={1}
                refobj={this.domRef}
                onDrop={e => this.onFileDrop(e)}
                onDragOver={e =>
                {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                }} {...other}>

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