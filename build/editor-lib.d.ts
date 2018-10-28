import { PropertyData, EndPoint, Vector2 } from "./lib";
import { RefObject, ChangeEvent } from "react";
import * as React from "react";
declare type EventHandler<T> = (e: T) => void;
export declare class EditorContent extends React.Component {
    render(): JSX.Element;
}
export interface EditorProps {
    process: string;
    className?: string;
    allowInput?: boolean;
    allowOutput?: boolean;
    property: PropertyData;
    label: string;
    onConnectEnd?: EventHandler<EndPoint>;
    onConnectStart?: EventHandler<EndPoint>;
    header?: React.ReactNode;
    content?: React.ReactNode;
    editable?: boolean;
    connecting?: boolean;
    onChanged?: (data: PropertyData) => void;
}
export interface EditorState {
    extend: boolean;
}
export declare class Editor extends React.Component<EditorProps, EditorState> {
    nodeRef: RefObject<HTMLDivElement>;
    constructor(props: EditorProps);
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