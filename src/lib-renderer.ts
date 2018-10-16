import { EndPoint } from "./lib";
import { AGOGOSProject, ProjectFile } from "./project";
import { ipcRenderer, remote } from "electron";
import { ChannelProjectSettings } from "./ipc";
import { NodeData } from "../../react-tree-viewer/dist";
const { Menu } = remote;

export function GetProjectSettings(): AGOGOSProject
{
    return ipcRenderer.sendSync(ChannelProjectSettings) as AGOGOSProject;
}
export function PopupProjectMenu(context: string)
{
    Menu.buildFromTemplate([
        {
            label: "New File",
        },
        {
            label: "New Folder",
        },
        {
            label: "Rename"
        }
    ]).popup({});
}
export function diffProjectFilesRenderer(files: ProjectFile, fileNode: NodeData): NodeData
{
    return null;
    for (let i = 0; i < files.children.length; i++)
    {
        for (let j = 0; j < fileNode.children.length; j++)
        {
            
        }
    }
}
export interface ProjectFileData extends NodeData, ProjectFile
{
    children?: ProjectFileData[];
}