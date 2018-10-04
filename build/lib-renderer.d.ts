import { EndPoint } from "./lib";
import { AGOGOSProject, ProjectFile } from "./project";
import { NodeData } from "../../react-tree-viewer/dist";
export declare class PropertyData {
    type: string;
    value: any;
    input?: EndPoint;
    output?: EndPoint;
}
export declare class ProcessNodeData {
    name: string;
    properties: Map<string, PropertyData>;
    processOutput: PropertyData;
}
export declare class ObjectData {
    owner: any;
    name: string;
    properties: Map<string, PropertyData>;
}
export declare function GetProjectSettings(): AGOGOSProject;
export declare function PopupProjectMenu(context: string): void;
export declare function diffProjectFilesRenderer(files: ProjectFile, fileNode: NodeData): NodeData;
