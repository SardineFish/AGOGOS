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
    object = "object"
}
const [jsonIgnore, getJsonIgnore] = DectatorFactory<boolean>("jsonIgnore", true);
//const [process, getProcess] = DectatorFactory<string>("process", "");

function process(constructor: Function)
{
    if (constructor)
        (constructor as any).__agogosProcess = constructor.name;
}

function getProcess(constructor: Function)
{
    if (constructor)
        return (constructor as any).__agogosProcess;
}


export { jsonIgnore, getJsonIgnore, process, getProcess };