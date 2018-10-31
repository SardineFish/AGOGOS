import { ProjectFile } from "./project";
import { ModuleManager } from "./module-manager";
export declare const UUIDNamespace = "18de3d21-d38a-4e78-884f-89463c8eb1c7";
export declare const AGOGOSProgramExtension = "ago";
export declare function getUUID(): string;
export declare class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number);
    static plus(u: Vector2, v: Vector2): Vector2;
    static minus(u: Vector2, v: Vector2): Vector2;
}
export declare const vec2: (x: number, y: number) => Vector2;
export interface EndPoint {
    process: string;
    property: string;
    port: "input" | "output";
}
export interface Connection {
    source: EndPoint;
    target: EndPoint;
}
export declare function equalEndpoint(a: EndPoint, b: EndPoint): boolean;
export declare function swapEndpoint(connection: Connection): Connection;
export declare function getPropertyAtEndpoint(process: ProcessNodeData, endpoint: EndPoint): PropertyData;
export declare function JSONStringrify(obj: any): string;
export declare function diffFiles(oldFiles: ProjectFile[], newFiles: ProjectFile[]): DiffResult<ProjectFile>;
export interface DiffResult<T> {
    oldItem?: T;
    newItem?: T;
    operation: "add" | "remove" | "change";
}
export declare function diff<T>(listOld: T[], listNew: T[], cmpFunc?: (a: T, b: T) => boolean): DiffResult<T>[];
export declare function switchCase<T>(value: string, cases: {
    [key: string]: T;
}): T;
export declare function foreachAsync<T>(list: T[], callback: (item: T, idx: number) => Promise<any>): Promise<T[]>;
export declare function mapAsync<TIn, TOut>(list: TIn[], func: (item: TIn, idx: number) => Promise<TOut>): Promise<TOut[]>;
export interface ConsoleMessage {
    type: "log" | "warn" | "error";
    message: string;
}
export interface StatusOutput {
    loading?: boolean;
    message: string;
    progress?: number;
}
export interface MapObject<TValue> {
    [key: string]: TValue;
}
export declare function toMapObject<TValueIn>(map: Map<string, TValueIn>): MapObject<TValueIn>;
export declare function toMapObject<TValueIn, TValue>(map: Map<string, TValueIn>, cast: (obj: TValueIn) => TValue): MapObject<TValue>;
export interface ProcessNodeData {
    name: string;
    processType: string;
    properties: MapObject<PropertyData>;
    processOutput: PropertyData;
}
export declare class PropertyData {
    name: string;
    type: string;
    elementType?: string;
    elements?: PropertyData[];
    properties?: MapObject<PropertyData>;
    value?: any;
    input?: EndPoint;
    output?: EndPoint;
}
export declare function getPropertyData(name: string, type: string, obj: any, moduleManager: ModuleManager): PropertyData;
export declare class TypeData {
    type: string;
    properties?: MapObject<TypeData>;
}
export declare class ObjectData {
    owner: any;
    name: string;
    properties: Map<string, PropertyData>;
}
export declare class NullSafe<T> {
    private nullSafeObj;
    safe(): T | null;
    safe<TNext>(callback: (obj: T) => TNext): NullSafe<TNext>;
    constructor(obj: T);
}
export declare function NULL<T>(obj: T): NullSafe<T>;
export declare function getElementType(typeName: string): string;
export interface SourceFile {
    name: string;
    type: "file" | "folder" | string;
    path: string;
    children?: ProjectFile[];
    moduleType: "typedef" | "process" | "editor";
    moduleName: string;
    compiledFile?: string;
}
export declare function removeAt<T>(list: T[], idx: number): T;
