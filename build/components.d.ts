import React, { HTMLProps, RefObject } from "react";
import ViewPort from "../../react-free-viewport/dist";
import { ReactProcessNode, ConnectLine } from "./process-editor";
import { Vector2, Connection, EndPoint, ProcessNodeData } from "./lib";
interface PaneProps extends HTMLProps<HTMLDivElement> {
    header: string;
}
interface RenderedProcessNode {
    process: ProcessNodeData;
    renderer: ReactProcessNode;
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
export declare class ProcessSpace extends React.Component<HTMLProps<HTMLDivElement>> {
    domRef: RefObject<HTMLDivElement>;
    viewport: ViewPort;
    processes: Map<string, RenderedProcessNode>;
    connections: RenderedConnection[];
    connecting: boolean;
    pendingConnection: RenderedConnection;
    constructor(props: HTMLProps<HTMLDivElement>);
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
interface ProgressProps extends HTMLProps<HTMLSpanElement> {
    progress: number;
}
export declare class ProgressBar extends React.Component<ProgressProps> {
    render(): JSX.Element;
}
export {};
