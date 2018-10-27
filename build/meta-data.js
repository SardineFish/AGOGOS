"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function DectatorFactory(name, defaultValue = null, dataWrapper = v => v) {
    const metadataKey = Symbol(name);
    return [
        (value) => {
            if (value === undefined)
                value = defaultValue;
            return Reflect.metadata(metadataKey, dataWrapper(value));
        },
        (target, propKey) => {
            if (propKey === undefined)
                return Reflect.getMetadata(metadataKey, target);
            else
                return Reflect.getMetadata(metadataKey, target, propKey);
        }
    ];
}
const typeMetadataKey = Symbol("type");
function type(typeDef) {
    if (typeDef instanceof Function) {
        let type = getTypedef(typeDef);
        type = type ? type : exports.BuildinTypes.object;
        return Reflect.metadata(typeMetadataKey, type);
    }
    return Reflect.metadata(typeMetadataKey, typeDef);
}
exports.type = type;
function getType(target, propertyKey) {
    let type = Reflect.getMetadata(typeMetadataKey, target, propertyKey);
    if (!type)
        return exports.BuildinTypes.object;
    return type;
}
exports.getType = getType;
exports.BuildinTypes = {
    string: "string",
    number: "number",
    boolean: "boolean",
    void: "void",
    object: "object",
    array: (type) => {
        let typeName = type;
        if (type instanceof Function) {
            typeName = getTypedef(type);
            typeName = typeName ? typeName : exports.BuildinTypes.object;
        }
        return `${typeName}[]`;
    },
};
const [jsonIgnore, getJsonIgnore] = DectatorFactory("jsonIgnore", true);
exports.jsonIgnore = jsonIgnore;
exports.getJsonIgnore = getJsonIgnore;
//const [process, getProcess] = DectatorFactory<string>("process", "");
function process(constructor) {
    if (constructor)
        constructor.__agogosProcess = constructor.name;
}
exports.process = process;
function getProcess(constructor) {
    if (constructor)
        return constructor.__agogosProcess;
    else
        return null;
}
exports.getProcess = getProcess;
function typedef(constructor) {
    if (constructor)
        constructor.__agogosType = constructor.name;
    else
        return null;
}
exports.typedef = typedef;
function getTypedef(constructor) {
    if (constructor)
        return constructor.__agogosType;
    else
        return null;
}
exports.getTypedef = getTypedef;
function iterableProcess(constructor) {
    if (constructor)
        constructor.__iterableProcess = true;
}
exports.iterableProcess = iterableProcess;
function isIterableProcess(constructor) {
    if (constructor)
        return constructor.__iterableProcess ? true : false;
    return false;
}
exports.isIterableProcess = isIterableProcess;
//# sourceMappingURL=meta-data.js.map