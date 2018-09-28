import { EndPoint } from "./lib";
import { AGOGOSProject } from "./project";
import { ipcRenderer } from "electron";
import { ChannelProjectSettings } from "./ipc";
export class PropertyData
{
    type: string;
    value: any;
    input?: EndPoint;
    output?: EndPoint;
}
export class ProcessNodeData
{
    name: string;
    properties: Map<string, PropertyData> = new Map();
    processOutput: PropertyData;
}
export class ObjectData
{
    owner: any;
    name: string;
    properties: Map<string, PropertyData> = new Map();
}
export function GetProjectSettings(): AGOGOSProject
{
    return ipcRenderer.sendSync(ChannelProjectSettings) as AGOGOSProject;
}