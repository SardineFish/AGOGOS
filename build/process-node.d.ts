export declare const KeyProcess = "process";
export declare class ProcessNode {
    [key: string]: any;
    nodeName: string;
    name: string;
    inputMap: Map<string, ValuePort>;
    process(): void;
}
declare class ValuePort {
    name: string;
    target: ProcessNode;
    port: string;
}
export declare class TestProcessNode extends ProcessNode {
    num: number;
    text: string;
    isTrue: boolean;
    next: TestProcessNode;
    process(): void;
}
export {};
