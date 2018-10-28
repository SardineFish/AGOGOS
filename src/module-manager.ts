import { ProcessUnit, ProcessUtility } from "./process-unit";
import { getType, BuildinTypes, getProcess, getTypedef, getEditor } from "./meta-data";
import Path from "path";
import { ProcessNodeData, PropertyData, MapObject, TypeData, SourceFile } from "./lib";
import agogos from "./user-lib/agogos"

export class ModuleManager
{
    public typeManager: TypeManager = new TypeManager();
    public processManager: ProcessManager = new ProcessManager();
    public editorModules: SourceFile[] = [];
    private moduleLib: Map<string, SourceFile> = new Map();

    public reset()
    {
        this.typeManager.resetLib();
        this.processManager.resetLib();
        this.editorModules = [];
        for (const path of this.moduleLib.keys()) {
            delete require.cache[path];
        }
        this.processManager.resetLib();
    }
    public importSourceFile(filePath: string): SourceFile
    {
        try
        {
            const importObj = require(filePath);
            if (importObj.default)
            {
                //let obj = new importObj.default();
                let processName = getProcess(importObj.default);
                let typeName = getTypedef(importObj.default);
                let editorName = getEditor(importObj.default);
                let srcFile: SourceFile;
                if (processName)
                {
                    this.processManager.addProcess(processName, importObj.default);
                    srcFile =  {
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
                    srcFile =  {
                        name: Path.basename(filePath),
                        path: Path.resolve(filePath),
                        type: "file",
                        moduleType: "typedef",
                        moduleName: typeName
                    };
                }
                if (editorName)
                {
                    srcFile = {
                        name: Path.basename(filePath),
                        path: Path.resolve(filePath),
                        type: "file",
                        moduleType: "editor",
                        moduleName: editorName
                    };
                    this.editorModules.push(srcFile);
                }
                this.moduleLib.set(filePath, srcFile);
                return srcFile;
            }
        }
        catch (err)
        {
            agogos.console.error(`Failed to import source file ${filePath} \r\n${err.message}`);
        }
        return null;
    }
}

const IgnoreResolveTypes =
    [
        BuildinTypes.array,
        BuildinTypes.boolean,
        BuildinTypes.number,
        BuildinTypes.object,
        BuildinTypes.string,
        BuildinTypes.void
    ];

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
        for (const typedef of this.typeLib.values()) {
        }
        this.typeLib.clear();
    }
    public addType(name: string, constructor: typeof Object)
    {
        if (this.typeLib.has(name))
            throw new Error("Type existed.");
        this.typeLib.set(name, constructor);
    }
    public getType(name: string): typeof Object
    {
        if (!this.typeLib.has(name))
            return null;
        return this.typeLib.get(name);
    }
    public getTypeData(name: string): TypeData
    {
        let constructor = this.getType(name);
        if (!constructor)
            return null;
        let obj = new constructor();
        let properties: MapObject<TypeData> = {};
        for (const key in obj)
        {
            if (obj.hasOwnProperty(key))
            {
                properties[key] = {
                    type: getType(obj, key)
                };
            }
        }
        return {
            type: name,
            properties: properties
        };
    }
    public exportTypesData(): MapObject<TypeData>
    {
        let mapObj: MapObject<TypeData> = {};
        for (const key of this.typeLib.keys()) {
            mapObj[key] = this.getTypeData(key);
        }
        return mapObj;
    }
    public instantiate(name: string)
    {
        let constructor = this.getType(name);
        if (!constructor)
            return null;
        return new constructor();
    }
}

class ProcessManager
{
    private processLib: Map<string, typeof ProcessUnit> = new Map();

    public getProcessData(name: string): ProcessNodeData
    {
        return ProcessUtility.getProcessData(this.instantiateProcess(name));
    }
    public resetLib()
    {
        this.processLib.clear();
    }
    public addProcess(name:string, ProcessType: typeof ProcessUnit)
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
        if (!Process)
            return null;
        let process = new Process();
        if (process.name === "Process")
            process.name = name;
        process.__processType = name;
        return process;
    }
    public exportProcessData(): MapObject<ProcessNodeData>
    {
        let mapObj: MapObject<ProcessNodeData> = {};
        for (const key of this.processLib.keys()) {
            mapObj[key] = this.getProcessData(key);
        }
        return mapObj;
    }
}