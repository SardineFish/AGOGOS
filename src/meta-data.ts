import "reflect-metadata";

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