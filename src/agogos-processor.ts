import { ProcessUnit } from "./process-unit";
import { ProcessNodeData, MapObject } from "./lib";
import { ModuleManager } from "./module-manager";

export class AGOGOSProcessor
{
    private processList: ProcessUnit[] = [];
    private processLib: Map<string, ProcessUnit> = new Map();
    private processDependencies: Map<string, ProcessDependence[]> = new Map();
    private hasOutput: Map<string, boolean> = new Map();
    private outputLib: Map<string, any> = new Map();

    constructor(moduleManager:ModuleManager,processes: MapObject<ProcessNodeData>)
    {
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
            this.processDependencies.set(process.name, dependencies);
        });
    }

    public run()
    {
        this.processList.forEach(process =>
        {
            if (!this.hasOutput.has(process.name))
                this.process(process);
        })
    }

    private process(process: ProcessUnit)
    {
        let dependencies = this.processDependencies.get(process.name);
        if (dependencies)
        {
            for (let i=0; i < dependencies.length; i++)
            {
                if (dependencies[i].type === "output" && !this.outputLib.has(dependencies[i].target.name))
                    this.process(dependencies[i].target);
                this.applyDependence(dependencies[i]);
            }
        }
        this.outputLib.set(process.name, process.process());
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
                process[key] = property.value;
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