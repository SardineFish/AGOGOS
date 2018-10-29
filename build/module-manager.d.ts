import { ProcessUnit } from "./process-unit";
import { ProcessNodeData, MapObject, TypeData, SourceFile } from "./lib";
export declare class ModuleManager {
    typeManager: TypeManager;
    processManager: ProcessManager;
    editorModules: SourceFile[];
    private moduleLib;
    reset(): void;
    importSourceFile(filePath: string): SourceFile;
}
declare class TypeManager {
    moduleManager: ModuleManager;
    private typeLib;
    constructor(moduleManager: ModuleManager);
    isInherit(derived: string, base: string): boolean;
    resetLib(): void;
    addType(name: string, constructor: typeof Object): void;
    getType(name: string): typeof Object;
    getTypeData(name: string): TypeData;
    exportTypesData(): MapObject<TypeData>;
    instantiate(name: string): Object;
}
declare class ProcessManager {
    moduleManager: ModuleManager;
    private processLib;
    constructor(moduleManager: ModuleManager);
    getProcessData(name: string): ProcessNodeData;
    resetLib(): void;
    addProcess(name: string, ProcessType: typeof ProcessUnit): void;
    instantiateProcess(name: string): ProcessUnit;
    exportProcessData(): MapObject<ProcessNodeData>;
}
export {};
