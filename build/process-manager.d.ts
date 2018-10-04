import { ProcessNode } from "./process-node";
import { ProcessNodeData } from "./lib-renderer";
declare class ProcessManager {
    private types;
    private processLib;
    inherit(derived: string, base: string): boolean;
    getProcessData(process: ProcessNode): ProcessNodeData;
    addProcess(name: string, ProcessType: typeof ProcessNode): void;
    instantiateProcess(name: string): ProcessNode;
    addType(name: string, Type: any): void;
}
declare const _default: ProcessManager;
export default _default;
