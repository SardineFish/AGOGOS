"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function DectatorFactory(name, dataWrapper = v => v) {
    const metadataKey = Symbol(name);
    return [
        (value) => Reflect.metadata(metadataKey, value),
        (target, propKey) => Reflect.getMetadata(metadataKey, target, propKey)
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
const [jsonIgnore, getJsonIgnore] = DectatorFactory("jsonIgnore");
exports.jsonIgnore = jsonIgnore;
exports.getJsonIgnore = getJsonIgnore;
//# sourceMappingURL=meta-data.js.map