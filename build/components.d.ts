import React, { HTMLProps, RefObject } from "react";
import ViewPort from "../../react-free-viewport/dist";
import { DragMoveEvent, ConnectLine, ProcessEditor } from "./process-editor";
import { Vector2, Connection, EndPoint, ProcessNodeData, MapObject } from "./lib";
import { AGOGOSProgram, ProcessLayout } from "./project";
interface PaneProps extends HTMLProps<HTMLDivElement> {
    header: string;
}
interface RenderedObject<TObj, TRenderer extends React.Component> {
    obj: TObj;
    renderer: TRenderer;
    element: HTMLElement;
}
export declare type RenderedConnection = RenderedObject<Connection, ConnectLine>;
export declare class Pane extends React.Component<PaneProps> {
    render(): JSX.Element;
}
interface EditorPageProps {
    label: string;
}
export declare class EditorPage<P = EditorPageProps, S = {}> extends React.Component<P & EditorPageProps, S> {
    label: string;
    onActive(): void;
    onClose(): void;
}
interface LocatedComponentProps {
    className: string;
    pos: Vector2;
}
export declare class LocatedComponent extends React.Component<LocatedComponentProps, {
    pos: Vector2;
}> {
    elementRef: React.RefObject<HTMLDivElement>;
    constructor(props: LocatedComponentProps);
    componentWillReceiveProps(nextProps: LocatedComponentProps): void;
    moveTo(pos: Vector2): void;
    render(): JSX.Element;
}
interface ProgramPageProps extends EditorPageProps {
    program: AGOGOSProgram;
}
interface ProgramPageState {
    processes: MapObject<ProcessLayout>;
    program: AGOGOSProgram;
}
export declare class ProgramPage extends EditorPage<ProgramPageProps, ProgramPageState> {
    viewportElement: React.RefObject<HTMLDivElement>;
    connectWrapper: React.RefObject<HTMLDivElement>;
    viewport: ViewPort;
    connecting: boolean;
    pendingConnection: RenderedConnection;
    connections: RenderedConnection[];
    dragging: {
        startMousePos: Vector2;
        startPos: Vector2;
    };
    constructor(props: ProgramPageProps);
    componentWillReceiveProps(newProps: ProgramPageProps): void;
    reload(): Promise<void>;
    componentDidUpdate(): void;
    addProcess(process: ProcessNodeData, pos: Vector2): void;
    addConnection(connection: Connection): Promise<RenderedConnection>;
    startConnection(endpoint: EndPoint): void;
    endConnection(endpoint: EndPoint): void;
    updateConnectionLine(line: RenderedConnection): void;
    onDragMoveStart(process: string, e: DragMoveEvent): void;
    onDragMove(process: string, e: DragMoveEvent): void;
    onWindowMouseMove(e: MouseEvent): void;
    onWindowMouseUp(e: MouseEvent): void;
    componentDidMount(): void;
    onFileDrop(e: React.DragEvent<HTMLElement>): Promise<void>;
    render(): JSX.Element;
}
interface ProcessSpaceProps extends EditorPageProps {
    program: AGOGOSProgram;
}
export declare class ProcessSpace extends EditorPage<ProcessSpaceProps> {
    domRef: RefObject<HTMLDivElement>;
    viewport: ViewPort;
    processes: Map<string, RenderedObject<ProcessNodeData, ProcessEditor>>;
    connections: RenderedConnection[];
    connecting: boolean;
    pendingConnection: RenderedConnection;
    program: AGOGOSProgram;
    constructor(props: ProcessSpaceProps);
    addProcess(process: ProcessNodeData, pos: Vector2): void;
    startConnection(endpoint: EndPoint): void;
    endConnection(endpoint: EndPoint): void;
    updateConnectionLine(line: RenderedConnection): void;
    onWindowMouseMove(e: MouseEvent): void;
    onWindowMouseUp(e: MouseEvent): void;
    componentDidMount(): void;
    onFileDrop(e: React.DragEvent<HTMLElement>): Promise<void>;
    render(): JSX.Element;
}
interface PageContainerProps {
}
interface PageContainerState {
    activePageIdx: number;
    pages: EditorPage[];
    pageTitles: string[];
}
export declare class PageContainer extends React.Component<PageContainerProps, PageContainerState> {
    constructor(props: PageContainerProps);
    currentIdx: number;
    addPage(title: string, page: any): void;
    openPage(idx: number): void;
    render(): JSX.Element;
}
interface ProgressProps extends HTMLProps<HTMLSpanElement> {
    progress: number;
}
export declare class ProgressBar extends React.Component<ProgressProps> {
    render(): JSX.Element;
}
export {};
