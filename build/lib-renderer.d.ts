import { AGOGOSProject, ProjectFile } from "./project";
import { NodeData } from "../../react-tree-viewer/dist";
export declare function GetProjectSettings(): AGOGOSProject;
export declare function PopupProjectMenu(context: string): void;
export declare function diffProjectFilesRenderer(files: ProjectFile, fileNode: NodeData): NodeData;
export interface ProjectFileData extends NodeData, ProjectFile {
    children?: ProjectFileData[];
}
