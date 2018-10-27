import { ProcessNodeData, MapObject } from "./lib";
import { ModuleManager } from "./module-manager";
export declare class AGOGOSProcessor {
    private processList;
    private processLib;
    private backwardDependencies;
    private forwardDependencies;
    private hasOutput;
    private outputLib;
    private moduleManager;
    constructor(moduleManager: ModuleManager, processes: MapObject<ProcessNodeData>);
    run(): void;
    private backwardProcess;
    private forwardProcess;
    private applyDependence;
    private resolveProcess;
    private resolveProperty;
}
