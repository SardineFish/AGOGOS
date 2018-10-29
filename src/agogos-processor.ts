import { ProcessUnit } from "./process-unit";
import { ProcessNodeData, MapObject, PropertyData } from "./lib";
import { ModuleManager } from "./module-manager";
import agogos from "./user-lib/agogos";

export class AGOGOSProcessor
{
    private processList: ProcessUnit[] = [];
    private processLib: Map<string, ProcessUnit> = new Map();
    private backwardDependencies: Map<string, ProcessDependence[]> = new Map();
    private forwardDependencies: Map<string, string[]> = new Map();
    private hasOutput: Map<string, boolean> = new Map();
    private outputLib: Map<string, any> = new Map();
    private moduleManager: ModuleManager;

    constructor(moduleManager:ModuleManager,processes: MapObject<ProcessNodeData>)
    {
        this.moduleManager = moduleManager;
        for (const key in processes)
        {
            let processData = processes[key];
            let process = moduleManager.processManager.instantiateProcess(processData.processType);
            process.name = processData.name;
            this.processLib.set(processData.name, process);
            this.processList.push(process);
        }
        this.processList.forEach(process =>
        {
            let dependencies = this.resolveProcess(process, processes[process.name]);
            this.backwardDependencies.set(process.name, dependencies);
            // Build forward dependencies
            dependencies.forEach(dp =>
            {
                if (!this.forwardDependencies.has(dp.target.name))
                    this.forwardDependencies.set(dp.target.name, []);
                this.forwardDependencies.get(dp.target.name).push(dp.self.name);
            });
        });
    }

    public run()
    {
        this.processList.forEach(async process =>
        {
            if (!this.hasOutput.has(process.name))
                await this.backwardProcess(process);
        })
    }

    private async backwardProcess(process: ProcessUnit)
    {
        try
        {
            let dependencies = this.backwardDependencies.get(process.name);
            if (dependencies)
            {
                for (let i = 0; i < dependencies.length; i++)
                {
                    if (dependencies[i].type === "output" && !this.outputLib.has(dependencies[i].target.name))
                        await this.backwardProcess(dependencies[i].target);
                    this.applyDependence(dependencies[i]);
                }
            }
            let result = process.process();
            if (result instanceof Promise)
                this.outputLib.set(process.name, await result);
            else
                this.outputLib.set(process.name, process.process());
        }
        catch (ex)
        {
            agogos.console.error(`Faild to process ${process.name}: ${ex.message}`);
        }
    }

    private async forwardProcess(process: ProcessUnit)
    {
        try
        {
            let dependencies = this.backwardDependencies.get(process.name);
            if (dependencies)
            {
                for (let i = 0; i < dependencies.length; i++)
                {
                    if (dependencies[i].type === "output" && !this.outputLib.has(dependencies[i].target.name))
                        await this.backwardProcess(dependencies[i].target);
                    this.applyDependence(dependencies[i]);
                }
            }
            let result = process.process();
            if (result instanceof Promise)
                this.outputLib.set(process.name, await result);
            else
                this.outputLib.set(process.name, process.process());
        }
        catch (ex)
        {
            agogos.console.error(`Faild to process ${process.name}: ${ex.message}`);
        }
    }

    private applyDependence(dependence: ProcessDependence)
    {
        let selfPaths = dependence.pathSelf.split(".");
        let targetPaths = dependence.pathTarget.split(".");
        let target:any = dependence.target;
        let self:any = dependence.self;
        if (targetPaths[0] === "output")
        {
            target = this.outputLib.get(dependence.target.name);
            targetPaths = targetPaths.slice(1);
        }
        for (let i = 0; i < selfPaths.length-1; i++)
        {
            self = self[selfPaths[i]];
        }
        for (let i = 0; i < targetPaths.length; i++)
            target = target[targetPaths[i]];
        self[selfPaths[selfPaths.length - 1]] = target;
    }

    private resolveProcess(process: ProcessUnit, data: ProcessNodeData): ProcessDependence[]
    {
        let dependencies: ProcessDependence[] = [];
        for (const key in data.properties)
        {
            let property = data.properties[key];
            if (property.input)
            {
                dependencies.push({
                    self: process,
                    target: this.processLib.get(property.input.process),
                    pathSelf: key,
                    type: property.input.property.startsWith("output")?"output":"args",
                    pathTarget: property.input.property
                });
                this.hasOutput.set(property.input.process, true);
            }
            else
            {
                if (!property.value)
                    property.value = this.moduleManager.typeManager.instantiate(property.type);
                process[key] = property.value;
                dependencies = dependencies.concat(this.resolveProperty(process, process[key], data.properties[key], key));
            }
        }
        return dependencies;
    }

    private resolveProperty(process: ProcessUnit, prop: any, data: PropertyData, pathToProp: string): ProcessDependence[]
    {
        let dependencies: ProcessDependence[] = [];
        if (!data || !data.properties)
            return dependencies;
        for (const key in data.properties)
        {
            let property = data.properties[key];
            if (property.input)
            {
                dependencies.push({
                    self: process,
                    target: this.processLib.get(property.input.process),
                    pathSelf: pathToProp + "."+ key,
                    type: property.input.property.startsWith("output") ? "output" : "args",
                    pathTarget: property.input.property
                });
                this.hasOutput.set(property.input.process, true);
            }
            else
            {
                prop[key] = property.value;
                dependencies = dependencies.concat(this.resolveProperty(process, prop[key], data.properties[key], pathToProp + "." + key));
            }
        }
        return dependencies;
    }
}

interface ProcessDependence
{
    self: ProcessUnit;
    target: ProcessUnit;
    type: "output" | "args";
    pathSelf: string;
    pathTarget: string;
}