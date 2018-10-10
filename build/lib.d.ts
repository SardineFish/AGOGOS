import { ProcessNodeData } from "./lib-renderer";
import { ProjectFile } from "./project";
export declare class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number);
    static plus(u: Vector2, v: Vector2): Vector2;
    static minus(u: Vector2, v: Vector2): Vector2;
}
export declare const vec2: (x: number, y: number) => Vector2;
export interface EndPoint {
    process: ProcessNodeData;
    property: string;
    port: string;
}
export interface Connection {
    source: EndPoint;
    target: EndPoint;
}
export declare function JSONStringrify(obj: any): string;
export declare function diffFiles(oldFiles: ProjectFile[], newFiles: ProjectFile[]): DiffResult<ProjectFile>;
export interface DiffResult<T> {
    oldItem?: T;
    newItem?: T;
    operation: "add" | "remove" | "change";
}
export declare function diff<T>(listOld: T[], listNew: T[], cmpFunc?: (a: T, b: T) => boolean): DiffResult<T>[];
export declare function locateDirectory(root: ProjectFile, targetPath: string): ProjectFile;
export declare function switchCase<T>(value: string, cases: {
    [key: string]: T;
}): T;
export declare function foreachAsync<T>(list: T[], callback: (item: T, idx: number) => Promise<any>): Promise<T[]>;
export declare function mapAsync<TIn, TOut>(list: TIn[], func: (item: TIn, idx: number) => Promise<TOut>): Promise<TOut[]>;
