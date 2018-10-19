import React, { HTMLProps, RefObject, MouseEvent } from "react";
import { Vector2, EndPoint, ProcessNodeData } from "./lib";
declare type RefCallback<T> = (ref: T) => void;
declare type EventHandler<T> = (e: T) => void;
export interface DragMoveEvent {
    startX: number;
    startY: number;
    x: number;
    y: number;
}
export interface ConnectEvent {
    source: EndPoint;
    target: EndPoint;
}
interface ProcessNodeProps extends HTMLProps<HTMLDivElement> {
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
interface ProcessNodeState {
    connecting: boolean;
    portFilter: string;
}
export declare class ReactProcessNode extends React.Component<ProcessNodeProps, ProcessNodeState> {
    constructor(props: ProcessNodeProps);
    drag: boolean;
    holdPos: Vector2;
    nodeRef: RefObject<HTMLDivElement>;
    onValueChange(key: string, e: any): void;
    onMouseDown(e: MouseEvent<HTMLElement>): void;
    onMouseMove(e: MouseEvent<HTMLElement>): void;
    onMouseUp(e: MouseEvent<HTMLElement>): void;
    componentDidMount(): void;
    getPortPos(key: string, port: string): Vector2;
    render(): JSX.Element;
}
export declare function renderProcessNode(props: ProcessNodeProps, pos?: Vector2): HTMLElement;
interface ConnectLineProps {
    from: Vector2;
    to: Vector2;
    refCallback?: (ref: ConnectLine) => void;
}
export declare class ConnectLine extends React.Component<ConnectLineProps, ConnectLineProps> {
    constructor(props: ConnectLineProps);
    componentDidMount(): void;
    render(): JSX.Element;
}
export declare function RenderConnectLine(props: ConnectLineProps): Promise<{
    line: ConnectLine;
    element: HTMLElement;
}>;
export {};
