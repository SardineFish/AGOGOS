import { ProcessNode } from "./process-node";
import { ProcessNodeData } from "./lib";
import { SourceFile } from "./project";
export declare class ModuleManager {
    typeManager: TypeManager;
    processManager: ProcessManager;
    reset(): void;
    importSourceFile(filePath: string): SourceFile;
}
declare class TypeManager {
    private typeLib;
    isInherit(derived: string, base: string): boolean;
    resetLib(): void;
    addType(name: string, constructor: typeof Object): void;
}
declare class ProcessManager {
    private processLib;
    getProcessData(process: ProcessNode): ProcessNodeData;
    resetLib(): void;
    addProcess(name: string, ProcessType: typeof ProcessNode): void;
    instantiateProcess(name: string): import("./user-lib/agogos").Unit;
}
export {};
