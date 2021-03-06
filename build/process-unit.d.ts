import { ProcessNodeData } from "./lib";
import { ModuleManager } from "./module-manager";
export declare const KeyProcess = "process";
export declare class ProcessUnit {
    name: string;
    __processType: string;
    process(): any;
}
export declare class ProcessUtility {
    static getProcessData(process: ProcessUnit, moduleManager: ModuleManager): ProcessNodeData;
}
export declare class TestProcessNode extends ProcessUnit {
    num: number;
    text: string;
    isTrue: boolean;
    next: TestProcessNode;
    process(): void;
}
