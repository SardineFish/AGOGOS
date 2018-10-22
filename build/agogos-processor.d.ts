import { ProcessNodeData, MapObject } from "./lib";
import { ModuleManager } from "./module-manager";
export declare class AGOGOSProcessor {
    private processList;
    private processLib;
    private processDependencies;
    private hasOutput;
    private outputLib;
    constructor(moduleManager: ModuleManager, processes: MapObject<ProcessNodeData>);
    run(): void;
    private process;
    private applyDependence;
    private resolveProcess;
}
