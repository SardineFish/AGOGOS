"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
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
//# sourceMappingURL=meta-data.js.map