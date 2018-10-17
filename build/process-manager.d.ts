import { ProcessNode } from "./process-node";
import { ProcessNodeData } from "./lib";
export declare class ProcessManager {
    private types;
    private processLib;
    private processFile;
    inherit(derived: string, base: string): boolean;
    getProcessData(process: ProcessNode): ProcessNodeData;
    resetLib(): void;
    importProcess(filename: string): string;
    addProcess(name: string, ProcessType: typeof ProcessNode): void;
    instantiateProcess(name: string): import("./user-lib/agogos").Unit;
    addType(name: string, Type: any): void;
}
