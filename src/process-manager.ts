import { ProcessNode, KeyProcess } from "./process-node";
import { getType, BuildinTypes, getProcess } from "./meta-data";
import Path from "path";
import { ProcessNodeData } from "./lib";
import agogos from "./user-lib/agogos"

export class ProcessManager
{
    private types: Map<string, any> = new Map();
    private processLib: Map<string, typeof ProcessNode> = new Map();
    public inherit(derived: string, base: string)
    {
        switch (derived)
        {
            case BuildinTypes.number:
            case BuildinTypes.boolean:
            case BuildinTypes.string:
                return derived === base;
            default:
                return derived === base;//return (this.types.get(derived) instanceof this.types.get(base));
        }
    }
    public getProcessData(process: ProcessNode): ProcessNodeData
    {
        let data: ProcessNodeData = new ProcessNodeData();
        data.name = process.name;
        for (const key in process) {
            if (process.hasOwnProperty(key)) {
                data.properties.set(key, { type: getType(process, key), value: process[key] });
            }
        }
        data.processOutput = { type: getType(process, KeyProcess), value: null };
        //console.log(JSON.stringify(data));
        return data;
    }
    public importProcess(filename: string)
    {
        filename = Path.resolve(filename);
        const importObj = require(filename);
        let processName = getProcess(importObj.default);
        if (importObj.default)
        {
            let obj = new importObj.default();
            let type = getType(obj, "process");
            console.log(type);
        }
        console.log(processName);
        
    }
    public addProcess(name:string, ProcessType: typeof ProcessNode)
    {
        this.processLib.set(name, ProcessType);
    }
    public instantiateProcess(name: string)
    {
        if (!this.processLib.has(name))
            return null;
        let Process = this.processLib.get(name);
        return new Process();
    }
    public addType(name: string, Type: any)
    {
        this.types.set(name, Type);
    }
}