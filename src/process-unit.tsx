import ReactDOM from "react-dom";
import React from "react";
import { ReactProcessNode } from "./process-editor";
import { type, BuildinTypes, getType } from "./meta-data";
import { ProcessNodeData } from "./lib";
export const KeyProcess = "process";

export class ProcessUnit
{
    @type(BuildinTypes.string)
    name: string = "Process";

    @type(BuildinTypes.void)
    process()
    {
        
    }
}

export class ProcessUtility
{
    public static getProcessData(process: ProcessUnit): ProcessNodeData
    {
        if (!process)
            return null;
        let data: ProcessNodeData = {
            name: process.name,
            processOutput: { type: getType(process, KeyProcess), value: null },
            properties: {}
        };
        data.name = process.name;
        for (const key in process)
        {
            if (process.hasOwnProperty(key))
            {
                data.properties[key] = { type: getType(process, key), value: process[key] };
            }
        }
        //console.log(JSON.stringify(data));
        return data;
    }
}
export class TestProcessNode extends ProcessUnit
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