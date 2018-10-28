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
export function type(typeDef:string|Function)
{
    if (typeDef instanceof Function)
    {
        let type = getTypedef(typeDef);
        type = type ? type : BuildinTypes.object;

        return Reflect.metadata(typeMetadataKey, type);
    }
    return Reflect.metadata(typeMetadataKey, typeDef);
}
export function getType(target: any, propertyKey: string)
{
    let type = Reflect.getMetadata(typeMetadataKey, target, propertyKey);
    if (!type)
        return BuildinTypes.object;
    return type;
}
export const BuildinTypes =
{
    string: "string",
    number: "number",
    boolean: "boolean",
    void: "void",
    object: "object",
    array: (type: string | Function) =>
    {
        let typeName = type;
        if (type instanceof Function)
        {
            typeName = getTypedef(type);
            typeName = typeName ? typeName : BuildinTypes.object;
        }
        return `${typeName}[]`;
    },
};
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

export function editor(constructor: Function)
{
    const regexp = /(.*)(?:Editor)/i;
    if (constructor && regexp.test(constructor.name))
    {
        let editorName = regexp.exec(constructor.name)[1].toString();
        (constructor as any).__agogosEditor = editorName;
    }
}
export function getEditor(constructor: Function)
{
    if (constructor)
        return (constructor as any).__agogosEditor;
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

export function iterableProcess(constructor: Function)
{
    if (constructor)
        (constructor as any).__iterableProcess = true;
}
export function isIterableProcess(constructor: Function)
{
    if (constructor)
        return (constructor as any).__iterableProcess ? true : false;
    return false;
}