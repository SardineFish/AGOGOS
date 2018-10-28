import { PropertyData, EndPoint, Vector2 } from "./lib";
import React, { RefObject, ChangeEvent } from "react";
declare type EventHandler<T> = (e: T) => void;
interface EditorProps {
    process: string;
    className?: string;
    allowInput?: boolean;
    allowOutput?: boolean;
    property: PropertyData;
    label: string;
    onConnectEnd?: EventHandler<EndPoint>;
    onConnectStart?: EventHandler<EndPoint>;
    editorHeader?: React.ReactNode;
    editorContent?: React.ReactNode;
    editable?: boolean;
    connecting?: boolean;
    onChanged?: (data: PropertyData) => void;
}
interface EditorState {
    extend: boolean;
}
export declare class Editor<P extends EditorProps = EditorProps, S extends EditorState = EditorState> extends React.Component<P, S> {
    nodeRef: RefObject<HTMLDivElement>;
    constructor(props: P);
    onPortMouseDown(port: "input" | "output"): void;
    onPortMouseUp(port: "input" | "output"): void;
    onChildrenChanged(data: PropertyData): void;
    onChildConnectStart(endpoint: EndPoint): void;
    onChildConnectEnd(endpoint: EndPoint): void;
    getPortPos(key: string, port: string): Vector2;
    render(): JSX.Element;
}
export declare class StringEditor extends Editor {
    input: RefObject<HTMLInputElement>;
    constructor(props: EditorProps);
    componentDidMount(): void;
    onChange(e: ChangeEvent<HTMLInputElement>): void;
    render(): JSX.Element;
}
export declare class NumberEditor extends Editor {
    input: RefObject<HTMLInputElement>;
    constructor(props: EditorProps);
    componentDidMount(): void;
    onChange(e: ChangeEvent<HTMLInputElement>): void;
    render(): JSX.Element;
}
export declare class BooleanEditor extends Editor {
    input: RefObject<HTMLInputElement>;
    constructor(props: EditorProps);
    componentDidMount(): void;
    onChange(e: ChangeEvent<HTMLInputElement>): void;
    render(): JSX.Element;
}
export declare class ObjectEditor extends Editor {
    render(): JSX.Element;
}
export {};
