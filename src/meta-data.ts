import "reflect-metadata";
type DecoratorFunc<T> = (value?: T) => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
type MetadataFunc = (target: any, propKey?: string) => any;
function DectatorFactory<T>(name: string, defaultValue: T = null, dataWrapper: (value: T) => any = v => v): [DecoratorFunc<T>, MetadataFunc]
{
    const metadataKey = Symbol(name);
    return [
        (value?: T) =>
        {
            if (value === undefined)
                value = defaultValue;
            return Reflect.metadata(metadataKey, dataWrapper(value));
        },
        (target: any, propKey?: string) =>
        {
            if (propKey === undefined)
                return Reflect.getMetadata(metadataKey, target);
            else
                return Reflect.getMetadata(metadataKey, target, propKey);
        }
    ];
}
const typeMetadataKey = Symbol("type");
export function type(typeName:string)
{
    return Reflect.metadata(typeMetadataKey, typeName);
}
export function getType(target: any, propertyKey: string)
{
    return Reflect.getMetadata(typeMetadataKey, target, propertyKey);
}
export enum BuildinTypes
{
    string = "string",
    number = "number",
    boolean = "boolean",
    void = "void",
    object = "object"
}
const [jsonIgnore, getJsonIgnore] = DectatorFactory<boolean>("jsonIgnore", true);
export { jsonIgnore, getJsonIgnore };
    
//const [process, getProcess] = DectatorFactory<string>("process", "");

export function process(constructor: Function)
{
    if (constructor)
        (constructor as any).__agogosProcess = constructor.name;
}
export function getProcess(constructor: Function): string
{
    if (constructor)
        return (constructor as any).__agogosProcess;
    else
        return null;
}

export function typedef(constructor: Function)
{
    if (constructor)
        (constructor as any).__agogosType = constructor.name;
    else
        return null;
}
export function getTypedef(constructor: Function): string
{
    if (constructor)
        return (constructor as any).__agogosType;
    else
        return null;
}