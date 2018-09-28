import "reflect-metadata";
type DecoratorFunc<T> = (value: T) => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
type MetadataFunc = (target: any, propKey: string) => any;
function DectatorFactory<T>(name: string, dataWrapper: (value: T) => any = v => v): [DecoratorFunc<T>, MetadataFunc]
{
    const metadataKey = Symbol(name);
    return [
        (value: T) => Reflect.metadata(metadataKey, value),
        (target: any, propKey: string) => Reflect.getMetadata(metadataKey, target, propKey)
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
const [jsonIgnore, getJsonIgnore] = DectatorFactory<boolean>("jsonIgnore");
export { jsonIgnore, getJsonIgnore };