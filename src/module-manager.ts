import { ProcessNode, KeyProcess } from "./process-node";
import { getType, BuildinTypes, getProcess, getTypedef } from "./meta-data";
import Path from "path";
import { ProcessNodeData } from "./lib";
import agogos from "./user-lib/agogos"
import { SourceFile } from "./project";

export class ModuleManager
{
    public typeManager: TypeManager = new TypeManager();
    public processManager: ProcessManager = new ProcessManager();

    public reset()
    {
        this.typeManager.resetLib();
        this.processManager.resetLib();
    }
    public importSourceFile(filePath: string): SourceFile
    {
        try
        {
            const importObj = require(filePath);
            if (importObj.default)
            {
                let processName = getProcess(importObj.default);
                let typeName = getTypedef(importObj.default);
                if (processName)
                {
                    this.processManager.addProcess(processName, importObj.default);
                    return {
                        name: Path.basename(filePath),
                        path: Path.resolve(filePath),
                        type: "file",
                        moduleType: "process",
                        moduleName: processName
                    };
                }
                if (typeName)
                {
                    this.typeManager.addType(typeName, importObj.default);
                    return {
                        name: Path.basename(filePath),
                        path: Path.resolve(filePath),
                        type: "file",
                        moduleType: "typedef",
                        moduleName: processName
                    };
                }
            }
        }
        catch (err)
        {
            agogos.console.error(`Failed to import source file ${filePath} \r\n${err.message}`);
        }
        return null;
    }
}

class TypeManager
{
    private typeLib: Map<string, typeof Object> = new Map();

    public isInherit(derived: string, base: string)
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
    public resetLib()
    {
        this.typeLib.clear();
    }
    public addType(name: string, constructor: typeof Object)
    {
        if (this.typeLib.has(name))
            throw new Error("Type existed.");
        this.typeLib.set(name, constructor);
    }
}

class ProcessManager
{
    private processLib: Map<string, typeof agogos.Unit> = new Map();
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
    public resetLib()
    {
        this.processLib.clear();
    }
    public addProcess(name:string, ProcessType: typeof ProcessNode)
    {
        if (this.processLib.has(name))
            throw new Error("Process existed.");
        this.processLib.set(name, ProcessType);
    }
    public instantiateProcess(name: string)
    {
        if (!this.processLib.has(name))
            return null;
        let Process = this.processLib.get(name);
        return new Process();
    }
}