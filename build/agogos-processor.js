"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AGOGOSProcessor {
    constructor(moduleManager, processes) {
        this.processList = [];
        this.processLib = new Map();
        this.processDependencies = new Map();
        this.hasOutput = new Map();
        this.outputLib = new Map();
        for (const key in processes) {
            let processData = processes[key];
            let process = moduleManager.processManager.instantiateProcess(processData.processType);
            process.name = processData.name;
            this.processLib.set(processData.name, process);
            this.processList.push(process);
        }
        this.processList.forEach(process => {
            let dependencies = this.resolveProcess(process, processes[process.name]);
            this.processDependencies.set(process.name, dependencies);
        });
    }
    run() {
        this.processList.forEach(process => {
            if (!this.hasOutput.has(process.name))
                this.process(process);
        });
    }
    process(process) {
        let dependencies = this.processDependencies.get(process.name);
        if (dependencies) {
            for (let i = 0; i < dependencies.length; i++) {
                if (dependencies[i].type === "output" && !this.outputLib.has(dependencies[i].target.name))
                    this.process(dependencies[i].target);
                this.applyDependence(dependencies[i]);
            }
        }
        this.outputLib.set(process.name, process.process());
    }
    applyDependence(dependence) {
        let selfPaths = dependence.pathSelf.split(".");
        let targetPaths = dependence.pathTarget.split(".");
        let target = dependence.target;
        let self = dependence.self;
        if (targetPaths[0] === "output") {
            target = this.outputLib.get(dependence.target.name);
            targetPaths = targetPaths.slice(1);
        }
        for (let i = 0; i < selfPaths.length - 1; i++) {
            self = self[selfPaths[i]];
        }
        for (let i = 0; i < targetPaths.length; i++)
            target = target[targetPaths[i]];
        self[selfPaths[selfPaths.length - 1]] = target;
    }
    resolveProcess(process, data) {
        let dependencies = [];
        for (const key in data.properties) {
            let property = data.properties[key];
            if (property.input) {
                dependencies.push({
                    self: process,
                    target: this.processLib.get(property.input.process),
                    pathSelf: key,
                    type: property.input.property.startsWith("output") ? "output" : "args",
                    pathTarget: property.input.property
                });
                this.hasOutput.set(property.input.process, true);
            }
            else {
                process[key] = property.value;
            }
        }
        return dependencies;
    }
}
exports.AGOGOSProcessor = AGOGOSProcessor;
//# sourceMappingURL=agogos-processor.js.map