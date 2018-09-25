import ReactDOM from "react-dom";
import React from "react";
import { ReactProcessNode } from "./process-editor";
import { type, BuildinTypes } from "./meta-data";
export const KeyProcess = "process";
export class ProcessNode
{
    [key: string]: any;
    nodeName: string = "Node";

    @type("string")
    name: string = "Node";

    inputMap: Map<string, ValuePort> = new Map();

    process()
    {
        
    }
}
class ValuePort
{
    name: string;
    target: ProcessNode;
    port: string;
}
export class TestProcessNode extends ProcessNode
{
    @type(BuildinTypes.number)
    num: number = 0;
    @type(BuildinTypes.string)
    text: string = "";
    @type(BuildinTypes.boolean)
    isTrue: boolean = false;
    @type(BuildinTypes.object)
    next: TestProcessNode = null;

    @type(BuildinTypes.string)
    process()
    {
        
    }
}