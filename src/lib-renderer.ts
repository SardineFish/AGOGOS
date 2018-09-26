import { EndPoint } from "./lib";
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