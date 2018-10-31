import React, { HTMLProps, RefObject, EventHandler, ChangeEventHandler, ChangeEvent, DragEvent, MouseEventHandler } from "react";
import ViewPort from "../../react-free-viewport/dist";
import { TestProcessNode, KeyProcess } from "./process-unit";
import linq from "linq";
import { getKeys } from "./utility";
import { getType, BuildinTypes } from "./meta-data";
import { renderProcessNode, DragMoveEvent, ConnectLine, RenderConnectLine, ProcessEditor } from "./process-editor"
import { Vector2, vec2, Connection, EndPoint, ProcessNodeData, getUUID, toMapObject, MapObject, mapAsync } from "./lib";
import { IPCRenderer } from "./ipc";
import { AGOGOSRenderer } from "./lib-renderer";
import { AGOGOSProgram, ProcessLayout } from "./project";

//import processManager from "./process-manager";
interface PaneProps extends HTMLProps<HTMLDivElement>
{
    header: string;
}
interface RenderedProcessNode
{
    process: ProcessNodeData;
    renderer: ProcessEditor;
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

interface EditorPageProps
{
    label: string;
}
export class EditorPage<P=EditorPageProps, S={}> extends React.Component<P & EditorPageProps, S>
{
    label: string;
    onActive()
    {

    }
    onClose()
    {

    }
}
interface LocatedComponentProps
{
    className: string;
    pos: Vector2;
}
export class LocatedComponent extends React.Component<LocatedComponentProps,{pos:Vector2}>
{
    elementRef: React.RefObject<HTMLDivElement>;
    constructor(props: LocatedComponentProps)
    {
        super(props);
        this.elementRef = React.createRef();
        this.state = {
            pos: this.props.pos
        };
    }
    componentWillReceiveProps(nextProps: LocatedComponentProps)
    {
        this.state = {
            pos: nextProps.pos
        };
    }
    moveTo(pos: Vector2)
    {
        /*
        this.elementRef.current.style.left = `${pos.x}px`;
        this.elementRef.current.style.top = `${pos.y}px`;
        */
        this.setState({
            pos: pos
        });
    }
    render()
    {
        return (
            <div
                className={["located-object",this.props.className].join(" ")}
                ref={this.elementRef}
                style={{
                left: `${this.state.pos.x}px`,
                top: `${this.state.pos.y}px`
            }}>
                {this.props.children}
            </div>
        )
    }
}
interface ProgramPageProps extends EditorPageProps
{
    program: AGOGOSProgram;
}
interface ProgramPageState
{
    processes: MapObject<ProcessLayout>;
    program: AGOGOSProgram
    //connections: Connection[];
}
export class ProgramPage extends EditorPage<ProgramPageProps, ProgramPageState>
{
    viewportElement: React.RefObject<HTMLDivElement>;
    connectWrapper: React.RefObject<HTMLDivElement>;
    viewport: ViewPort;
    connecting: boolean;
    pendingConnection: RenderedConnection;
    connections: RenderedConnection[] = [];
    dragging: { startMousePos: Vector2, startPos: Vector2 };
    constructor(props: ProgramPageProps)
    {
        super(props);
        this.viewportElement = React.createRef();
        this.connectWrapper = React.createRef();
        this.state = {
            processes: this.props.program.processes,
            program: this.props.program
            //connections: this.props.program.connections
        };
    }
    componentWillReceiveProps(newProps: ProgramPageProps)
    {
        this.state = {
            processes: newProps.program.processes,
            program: newProps.program
            //connections: this.props.program.connections
        };
    }
    async reload()
    {
        this.connections.forEach(cnn =>
        {
            cnn.element.remove();
        });
        this.connections = [];
        this.connecting = false;
        if (this.pendingConnection && this.pendingConnection.element)
            this.pendingConnection.element.remove();
        this.pendingConnection = null;
        this.connections = await mapAsync(this.state.program.connections, async (connection) => await this.addConnection(connection));
    }
    componentDidUpdate()
    {
        this.reload();
    }
    addProcess(process: ProcessNodeData, pos: Vector2)
    {
        if (!this.state.program)
        {
            AGOGOSRenderer.instance.console.log("No AGOGOS program opened.", "warn");
            return;
        }
        process.name = getUUID();
        console.log(process);
        /*
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
            return;
            this.connections.forEach(cnn => this.updateConnectionLine(cnn));
            if (this.connecting)
                this.updateConnectionLine(this.pendingConnection);
        };
        */
        //process.name = `Process${this.processes.size}`;

        //this.processes.set(process.name, { process: process, renderer: null });

        //AGOGOSRenderer.instance.processesData = toMapObject(this.processes, p => p.process);

        /*let element = renderProcessNode({
            node:process, onDragStart, onNodeDragMove, (p)=> this.startConnection(p), (p) => this.endConnection(p), (p) =>
        {
            this.processes.get(process.name).renderer = p;
        }
    });*/
        let processes = this.state.processes;
        processes[process.name] = {
            position: pos,
            process: process
        };
        this.setState({
            processes: processes
        });
        /*
        let element = renderProcessNode({
            process: process,
            onDragMoveStart: onDragStart,
            onDragMove: onNodeDragMove,
            onConnectStart: (p) => this.startConnection(p),
            onConnectEnd: (p) => this.endConnection(p),
            refCallback: (p) => this.processes.get(process.name).renderer = p
        }, pos);

        this.processes.set(process.name, {
            obj: process,
            renderer: null,
            element: element
        });

        this.domRef.current!.querySelector(".viewport-wrapper")!.appendChild(element);*/
    }
    async addConnection(connection: Connection): Promise<RenderedConnection>
    {
        var {line, element} = await RenderConnectLine(
            {
                from: this.viewport.mousePosition((this.refs[connection.source.process] as ProcessEditor).getPortPos(connection.source.property, connection.source.port)),
                to: this.viewport.mousePosition((this.refs[connection.target.process] as ProcessEditor).getPortPos(connection.target.property, connection.target.port))
            }
        );
        this.connectWrapper.current.appendChild(element);
        return {
            obj: connection,
            element,
            renderer: line
        };
    }
    startConnection(endpoint: EndPoint)
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
        let pos = this.viewport.mousePosition((this.refs[endpoint.process] as ProcessEditor).getPortPos(endpoint.property, endpoint.port));
        getKeys(this.state.processes).forEach(key =>
        {
            (this.refs[key] as ProcessEditor).setState({ connecting: true });
        });
        /*this.processes.forEach(obj =>
        {
            obj.renderer.setState({ connecting: true });
        });*/
        //this.connecting = true;

        RenderConnectLine({
            from: pos,
            to: pos
        }).then(({ line, element }) =>
        {
            this.connecting = true;
            this.connectWrapper.current.appendChild(element);
            //this.domRef.current!.querySelector(".viewport-wrapper")!.appendChild(element);
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
            this.pendingConnection.element.remove();
            resetConnection();
            return;
        }
        else if (source.port === "input")
        {
            source = this.pendingConnection.obj.target;
            target = this.pendingConnection.obj.source;
        }

        if (this.state.processes[target.process].process.properties[target.property].input)
        {
            AGOGOSRenderer.instance.console.log("Already has input connection.", "warn");
            this.pendingConnection.element.remove();
            resetConnection();
            return;
        }

        this.state.processes[target.process].process.properties[target.property].input = source;

        this.pendingConnection.renderer.setState({
            to: this.viewport.mousePosition((this.refs[endpoint.process] as ProcessEditor).getPortPos(endpoint.property, endpoint.port))
        });
        this.connections.push(this.pendingConnection);
        this.state.program.connections.push(this.pendingConnection.obj);
        resetConnection();

        //AGOGOSRenderer.instance.processesData = toMapObject(this.processes, p => p.obj);
    }
    updateConnectionLine(line: RenderedConnection)
    {
        if (line.obj.target)
        {
            line.renderer.setState({
                from: this.viewport.mousePosition((this.refs[line.obj.source.process] as ProcessEditor).getPortPos(line.obj.source.property, line.obj.source.port)),
                to: this.viewport.mousePosition((this.refs[line.obj.target.process] as ProcessEditor).getPortPos(line.obj.target.property, line.obj.target.port)),
            });
        }
        else
        {
            line.renderer.setState({
                from: this.viewport.mousePosition((this.refs[line.obj.source.process] as ProcessEditor).getPortPos(line.obj.source.property, line.obj.source.port)),
            });
        }
    }
    onDragMoveStart(process:string, e:DragMoveEvent)
    {
        this.dragging = {
            startMousePos: this.viewport.mousePosition(vec2(e.startX, e.startY)),
            startPos: this.state.processes[process].position
        };
    }
    onDragMove(process: string, e: DragMoveEvent)
    {
        var mousePos = this.viewport.mousePosition(vec2(e.x, e.y));
        this.state.processes[process].position = Vector2.plus(this.dragging.startPos, Vector2.minus(mousePos, this.dragging.startMousePos));
        (this.refs[`wrapper-${process}`] as LocatedComponent).moveTo(this.state.processes[process].position);
        this.connections.forEach(l => this.updateConnectionLine(l));
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
        window.addEventListener("mousemove", (e) => this.onWindowMouseMove(e));
        window.addEventListener("mouseup", (e) => this.onWindowMouseUp(e));

        this.reload();
    }
    async onFileDrop(e: React.DragEvent<HTMLElement>)
    {
        let pos = this.viewport.mousePosition(vec2(e.clientX, e.clientY))
        e.preventDefault();
        this.addProcess(await AGOGOSRenderer.instance.ipc.call<ProcessNodeData>(IPCRenderer.GetProcess, e.dataTransfer.getData("text/plain")), pos);
    }
    render()
    {
        return (
            <ViewPort
                className="editor-viewport"
                ref="viewport"
                button={1}
                refobj={this.viewportElement}
                onDrop={e => this.onFileDrop(e)}
                onDragOver={e =>
                {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                }}>
                {
                    getKeys(this.state.processes).map(key => (
                        <LocatedComponent className="process-node" pos={this.state.processes[key].position} ref={`wrapper-${key}`} key={key}>
                            <ProcessEditor
                                ref={key}
                                process={this.state.processes[key].process}
                                onDragMoveStart={e => this.onDragMoveStart(key, e)}
                                onDragMove={e => this.onDragMove(key, e)}
                                onConnectStart={e => this.startConnection(e)}
                                onConnectEnd={e=>this.endConnection(e)}
                            ></ProcessEditor>
                        </LocatedComponent>
                    ))
                }
                <div className="connections-wrapper" ref={this.connectWrapper}>
                </div>
            </ViewPort>
        )
    }
}
interface ProcessSpaceProps extends EditorPageProps
{
    program: AGOGOSProgram;
}
interface ProcessSpaceState
{
    program: AGOGOSProgram;
}
export class ProcessSpace extends EditorPage<ProcessSpaceProps>
{
    domRef: RefObject<HTMLDivElement>;
    viewport: ViewPort;
    processes: Map<string, RenderedObject<ProcessNodeData, ProcessEditor>> = new Map();
    connections: RenderedConnection[] = [];
    connecting: boolean = false;
    pendingConnection: RenderedConnection;
    program: AGOGOSProgram;
    constructor(props: ProcessSpaceProps)
    {
        super(props);
        this.domRef = React.createRef();

        AGOGOSRenderer.instance.ipc.add(IPCRenderer.SendProgram, (prog: AGOGOSProgram) =>
        {
            this.processes.forEach(p =>
            {
                p.element.remove();
            });
            this.processes.clear();
            this.program = this.program;
            this.connections.forEach(connection =>
            {
                connection.element.remove();
            });
            this.connections = [];
            if (this.pendingConnection)
                this.pendingConnection.element.remove();

        });
    }
    addProcess(process: ProcessNodeData, pos: Vector2)
    {
        if (!this.program)
        {
            AGOGOSRenderer.instance.console.log("No AGOGOS program opened.", "warn");
            return;
        }
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

        //this.processes.set(process.name, { process: process, renderer: null });

        //AGOGOSRenderer.instance.processesData = toMapObject(this.processes, p => p.process);

        /*let element = renderProcessNode({
            node:process, onDragStart, onNodeDragMove, (p)=> this.startConnection(p), (p) => this.endConnection(p), (p) =>
        {
            this.processes.get(process.name).renderer = p;
        }
    });*/
        let element = renderProcessNode({
            process: process,
            onDragMoveStart: onDragStart,
            onDragMove: onNodeDragMove,
            onConnectStart: (p) => this.startConnection(p),
            onConnectEnd: (p) => this.endConnection(p),
            refCallback: (p) => this.processes.get(process.name).renderer = p
        }, pos);

        this.processes.set(process.name, {
            obj: process,
            renderer: null,
            element: element
        });

        this.domRef.current!.querySelector(".viewport-wrapper")!.appendChild(element);
    }
    startConnection(endpoint: EndPoint)
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
            this.pendingConnection.element.remove();
            resetConnection();
            return;
        }
        else if (source.port === "input")
        {
            source = this.pendingConnection.obj.target;
            target = this.pendingConnection.obj.source;
        }

        if (this.processes.get(target.process).obj.properties[target.property].input)
        {
            AGOGOSRenderer.instance.console.log("Already has input connection.", "warn");
            this.pendingConnection.element.remove();
            resetConnection();
            return;
        }

        this.processes.get(target.process).obj.properties[target.property].input = source;

        this.pendingConnection.renderer.setState({
            to: this.viewport.mousePosition(this.processes.get(endpoint.process).renderer.getPortPos(endpoint.property, endpoint.port))
        });
        this.connections.push(this.pendingConnection);
        resetConnection();

        //AGOGOSRenderer.instance.processesData = toMapObject(this.processes, p => p.obj);
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
        window.addEventListener("mousemove", (e) => this.onWindowMouseMove(e));
        window.addEventListener("mouseup", (e) => this.onWindowMouseUp(e));
    }
    async onFileDrop(e: React.DragEvent<HTMLElement>)
    {
        let pos = this.viewport.mousePosition(vec2(e.clientX, e.clientY))
        e.preventDefault();
        this.addProcess(await AGOGOSRenderer.instance.ipc.call<ProcessNodeData>(IPCRenderer.GetProcess, e.dataTransfer.getData("text/plain")), pos);
    }
    render()
    {
        const { children, ...other } = this.props;

        return (
            <ViewPort
                className="editor-viewport"
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
interface PageContainerProps
{

}
interface PageContainerState
{
    activePageIdx: number;
    pages: EditorPage[];
    pageTitles: string[];
}
export class PageContainer extends React.Component<PageContainerProps, PageContainerState>
{
    constructor(props: PageContainerProps)
    {
        super(props);
        this.state = {
            pages: [],
            activePageIdx: -1,
            pageTitles: []
        };
    }
    addPage(title: string, page: any)
    {
        var pages = this.state.pages;
        pages.push(page);
        this.state.pageTitles.push(title);
        this.setState({
            activePageIdx: pages.length - 1,
            pages: pages,
            pageTitles: this.state.pageTitles
        });
    }
    openPage(idx: number)
    {
        this.setState({
            activePageIdx: idx
        });
    }
    render()
    {
        return (
            <div className="page-container">
                <header className="page-bar">
                    <ul className="page-list">
                        {this.state.pageTitles.map((title, idx) => (
                            <li className="page-label" key={idx} onClick={()=>this.openPage(idx)}>
                                <span className="page-name">{title}</span>
                                <span className="button-close-page"></span>
                            </li>
                        ))}
                    </ul>
                </header>
                <main className="page-content">
                    {
                        this.state.pages[this.state.activePageIdx]
                    }
                </main>
            </div>
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