import React, { RefObject, MouseEvent } from "react";
import { Vector2, EndPoint, ProcessNodeData, PropertyData } from "./lib";
import { EditorManager } from "./editor-manager";
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
interface ProcessEditorProps {
    process: ProcessNodeData;
    onDragMove?: EventHandler<DragMoveEvent>;
    onDragMoveStart?: EventHandler<DragMoveEvent>;
    onNameChange?: EventHandler<string>;
    onConnectEnd?: EventHandler<EndPoint>;
    onConnectStart?: EventHandler<EndPoint>;
    refCallback?: RefCallback<ProcessEditor>;
    onChanged?: (data: ProcessNodeData) => void;
}
interface ProcessEditorState {
    connecting: boolean;
}
export declare class ProcessEditor extends React.Component<ProcessEditorProps, ProcessEditorState> {
    nodeRef: RefObject<HTMLDivElement>;
    drag: boolean;
    holdPos: Vector2;
    constructor(props: ProcessEditorProps);
    onMouseDown(e: MouseEvent<HTMLElement>): void;
    onMouseMove(e: MouseEvent<HTMLElement>): void;
    onMouseUp(e: MouseEvent<HTMLElement>): void;
    componentDidMount(): void;
    onChildrenChanged(data: PropertyData): void;
    getPortPos(key: string, port: string): Vector2;
    render(): JSX.Element;
}
export declare function renderProcessNode(props: ProcessEditorProps, pos?: Vector2): HTMLElement;
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
export declare function InitEditor(editorManager: EditorManager): void;
export {};
