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

    __processType: string;

    @type(BuildinTypes.void)
    process()
    {
        
    }
}

const privateKeys = ["name", "__processType"];

export class ProcessUtility
{
    public static getProcessData(process: ProcessUnit): ProcessNodeData
    {
        if (!process)
            return null;
        let data: ProcessNodeData = {
            name: process.name,
            processType: process.__processType, 
            processOutput: { type: getType(process, KeyProcess), value: null },
            properties: {}
        };
        data.name = process.name;
        for (const key in process)
        {
            if (privateKeys.includes(key))
                continue;
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