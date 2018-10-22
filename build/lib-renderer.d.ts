import { StatusOutput, ConsoleMessage, MapObject, ProcessNodeData, TypeData } from "./lib";
import { AGOGOSProject, ProjectFile } from "./project";
import { NodeData } from "../../react-tree-viewer/dist";
import * as React from "react";
import { NodeMouseEvent, TreeNodeDragEvent } from "../../react-tree-viewer";
import { GeneralIPC } from "./ipc";
import { ProjectFileData } from "./lib-renderer";
export declare function GetProjectSettings(): AGOGOSProject;
export declare function PopupProjectMenu(context: string): void;
export declare function diffProjectFilesRenderer(files: ProjectFile, fileNode: NodeData): NodeData;
export interface ProjectFileData extends NodeData, ProjectFile {
    children?: ProjectFileData[];
}
export declare class AGOGOSRenderer {
    static instance: AGOGOSRenderer;
    ipc: GeneralIPC;
    app: App;
    processLib: MapObject<ProcessNodeData>;
    typeLib: MapObject<TypeData>;
    ready: boolean;
    readonly console: {
        log: (message: any, type?: "log" | "warn" | "error") => void;
    };
    constructor();
    init(): AGOGOSRenderer;
    render(): AGOGOSRenderer;
}
interface AppArgs {
    callback: (app: App) => void;
}
interface AppState {
    workDir: string;
    dirData: ProjectFileData;
    statusText: StatusOutput;
    consoleHistory: ConsoleMessage[];
    projectFile: ProjectFile;
    showConsole: boolean;
}
declare class App extends React.Component<AppArgs, AppState> {
    constructor(props: AppArgs);
    consoleHistory: ConsoleMessage[];
    console: {
        log: (message: any, type?: "log" | "warn" | "error") => void;
    };
    readonly latestConsole: ConsoleMessage;
    onFolderExtend(nodeData: NodeData): NodeData;
    onProjectContextMenu(e: NodeMouseEvent): void;
    onProjectReady(projectFile: ProjectFile): void;
    componentDidMount(): void;
    onFileDragStart(e: TreeNodeDragEvent): void;
    render(): JSX.Element;
}
export {};
