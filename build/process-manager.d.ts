import { ProcessNode } from "./process-node";
import { ProcessNodeData } from "./lib";
export declare class ProcessManager {
    private types;
    private processLib;
    inherit(derived: string, base: string): boolean;
    getProcessData(process: ProcessNode): ProcessNodeData;
    importProcess(filename: string): void;
    addProcess(name: string, ProcessType: typeof ProcessNode): void;
    instantiateProcess(name: string): ProcessNode;
    addType(name: string, Type: any): void;
}
