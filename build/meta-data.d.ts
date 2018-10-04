import "reflect-metadata";
declare type DecoratorFunc<T> = (value: T) => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
declare type MetadataFunc = (target: any, propKey: string) => any;
export declare function type(typeName: string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function getType(target: any, propertyKey: string): any;
export declare enum BuildinTypes {
    string = "string",
    number = "number",
    boolean = "boolean",
    object = "object"
}
declare const jsonIgnore: DecoratorFunc<boolean>, getJsonIgnore: MetadataFunc;
export { jsonIgnore, getJsonIgnore };
