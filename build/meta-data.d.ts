import "reflect-metadata";
declare type DecoratorFunc<T> = (value?: T) => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
declare type MetadataFunc = (target: any, propKey?: string) => any;
export declare function type(typeDef: string | Function): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function getType(target: any, propertyKey: string): any;
export declare const BuildinTypes: {
    string: string;
    number: string;
    boolean: string;
    void: string;
    object: string;
    array: (type: string | Function) => string;
};
declare const jsonIgnore: DecoratorFunc<boolean>, getJsonIgnore: MetadataFunc;
export { jsonIgnore, getJsonIgnore };
export declare function process(constructor: Function): void;
export declare function getProcess(constructor: Function): string;
export declare function editor(constructor: Function): void;
export declare function getEditor(constructor: Function): any;
export declare function typedef(constructor: Function): any;
export declare function getTypedef(constructor: Function): string;
export declare function iterableProcess(constructor: Function): void;
export declare function isIterableProcess(constructor: Function): boolean;
