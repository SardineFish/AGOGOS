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
function type(typeName) {
    return Reflect.metadata(typeMetadataKey, typeName);
}
exports.type = type;
function getType(target, propertyKey) {
    return Reflect.getMetadata(typeMetadataKey, target, propertyKey);
}
exports.getType = getType;
var BuildinTypes;
(function (BuildinTypes) {
    BuildinTypes["string"] = "string";
    BuildinTypes["number"] = "number";
    BuildinTypes["boolean"] = "boolean";
    BuildinTypes["object"] = "object";
})(BuildinTypes = exports.BuildinTypes || (exports.BuildinTypes = {}));
const [jsonIgnore, getJsonIgnore] = DectatorFactory("jsonIgnore", true);
exports.jsonIgnore = jsonIgnore;
exports.getJsonIgnore = getJsonIgnore;
//const [process, getProcess] = DectatorFactory<string>("process", "");
function process(constructor) {
    constructor.__agogosProcess = constructor.name;
}
exports.process = process;
function getProcess(constructor) {
    return constructor.__agogosProcess;
}
exports.getProcess = getProcess;
//# sourceMappingURL=meta-data.js.map