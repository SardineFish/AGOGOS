"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const meta_data_1 = require("./meta-data");
const linq_1 = __importDefault(require("linq"));
const uuidv4 = require("uuid/v4");
const utility_1 = require("./utility");
exports.UUIDNamespace = "18de3d21-d38a-4e78-884f-89463c8eb1c7";
exports.AGOGOSProgramExtension = "ago";
function getUUID() {
    return uuidv4();
}
exports.getUUID = getUUID;
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static plus(u, v) {
        return exports.vec2(u.x + v.x, u.y + v.y);
    }
    static minus(u, v) {
        return exports.vec2(u.x - v.x, u.y - v.y);
    }
}
exports.Vector2 = Vector2;
exports.vec2 = (x, y) => new Vector2(x, y);
function equalEndpoint(a, b) {
    return a.port === b.port &&
        a.process === b.process &&
        a.property === b.property;
}
exports.equalEndpoint = equalEndpoint;
function swapEndpoint(connection) {
    let t = connection.source;
    connection.source = connection.target;
    connection.target = t;
    return connection;
}
exports.swapEndpoint = swapEndpoint;
function getPropertyRecursive(property, propertyPath) {
    let paths = propertyPath.split(".");
    if (paths.length <= 0 || propertyPath === "")
        return property;
    if (paths.length === 1)
        return property.properties[paths[0]];
    else if (paths.length > 1)
        return getPropertyRecursive(property.properties[paths[0]], paths.slice(1).join("."));
}
function getPropertyAtEndpoint(process, endpoint) {
    let paths = endpoint.property.split(".");
    if (paths[0] === "output")
        return getPropertyRecursive(process.processOutput, paths.slice(1).join("."));
    else
        return getPropertyRecursive(process.properties[paths[0]], paths.slice(1).join("."));
}
exports.getPropertyAtEndpoint = getPropertyAtEndpoint;
function ObjectCast(obj) {
    let out = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && !meta_data_1.getJsonIgnore(obj, key)) {
            const element = obj[key];
            if (element instanceof Object)
                out[key] = ObjectCast(element);
            else
                out[key] = element;
        }
    }
    return out;
}
function JSONStringrify(obj) {
    return JSON.stringify(ObjectCast(obj));
}
exports.JSONStringrify = JSONStringrify;
function diffFiles(oldFiles, newFiles) {
    oldFiles = linq_1.default.from(oldFiles).orderBy(f => f.name).toArray();
    newFiles = linq_1.default.from(newFiles).orderBy(f => f.name).toArray();
    let diffResult = diff(oldFiles, newFiles, (a, b) => a.name === b.name);
    let remove = linq_1.default.from(diffResult).where(r => r.operation === "remove").firstOrDefault();
    let add = linq_1.default.from(diffResult).where(r => r.operation === "add").firstOrDefault();
    if (add) {
        if (remove)
            return { newItem: add.newItem, oldItem: remove.oldItem, operation: "change" };
        return add;
    }
    else
        return remove;
}
exports.diffFiles = diffFiles;
function diff(listOld, listNew, cmpFunc) {
    let valueGraph = [];
    let operate = [];
    let ans = [];
    for (let i = 0; i <= listOld.length; i++) {
        valueGraph[i] = [];
        operate[i] = [];
        for (let j = 0; j <= listNew.length; j++) {
            valueGraph[i][j] = Number.MAX_SAFE_INTEGER;
        }
    }
    valueGraph[0][0] = 0;
    for (let k = 0; k < listOld.length + listNew.length; k++) {
        let j = Math.min(k, listNew.length);
        let i = k - j;
        for (; i <= k && i <= listOld.length && j >= 0; i++, j--) {
            // Add only
            if (i >= listOld.length) {
                if (valueGraph[i][j + 1] >= valueGraph[i][j] + 1) {
                    valueGraph[i][j + 1] = valueGraph[i][j] + 1;
                    operate[i][j + 1] = "add";
                }
                continue;
            }
            // Delete only
            if (j >= listNew.length) {
                if (valueGraph[i + 1][j] > valueGraph[i][j] + 1) {
                    valueGraph[i + 1][j] = valueGraph[i][j] + 1;
                    operate[i + 1][j] = "remove";
                }
                continue;
            }
            if (cmpFunc ? cmpFunc(listOld[i], listNew[j]) : listOld[i] === listNew[j]) {
                valueGraph[i + 1][j + 1] = valueGraph[i][j];
                operate[i + 1][j + 1] = "keep";
            }
            if (valueGraph[i + 1][j] > valueGraph[i][j] + 1) {
                valueGraph[i + 1][j] = valueGraph[i][j] + 1;
                operate[i + 1][j] = "remove";
            }
            if (valueGraph[i][j + 1] >= valueGraph[i][j] + 1) {
                valueGraph[i][j + 1] = valueGraph[i][j] + 1;
                operate[i][j + 1] = "add";
            }
        }
    }
    for (let i = listOld.length, j = listNew.length; i > 0 || j > 0;) {
        switch (operate[i][j]) {
            case "keep":
                i--, j--;
                break;
            case "remove":
                ans.push({ oldItem: listOld[--i], operation: "remove" });
                break;
            case "add":
                ans.push({ newItem: listNew[--j], operation: "add" });
        }
    }
    return ans.reverse();
}
exports.diff = diff;
function switchCase(value, cases) {
    for (const key in cases) {
        if (key === value)
            return cases[key];
    }
}
exports.switchCase = switchCase;
async function foreachAsync(list, callback) {
    for (let i = 0; i < list.length; i++) {
        await callback(list[i], i);
    }
    return list;
}
exports.foreachAsync = foreachAsync;
async function mapAsync(list, func) {
    let result = [];
    for (let i = 0; i < list.length; i++) {
        result[i] = await func(list[i], i);
    }
    return result;
}
exports.mapAsync = mapAsync;
function toMapObject(map, cast = (t) => t) {
    let mapObj = {};
    for (const key of map.keys()) {
        if (cast)
            mapObj[key] = cast(map.get(key));
        else
            mapObj[key] = map.get(key);
    }
    return mapObj;
}
exports.toMapObject = toMapObject;
class PropertyData {
}
exports.PropertyData = PropertyData;
const atomType = ["number", "string", "boolean"];
function getPropertyData(name, type, obj, moduleManager) {
    let data = {
        name: name,
        type: type,
        properties: {},
        elements: []
    };
    if (type.endsWith("[]")) {
        data.type = "array";
        data.elementType = getElementType(type);
        if (obj && obj instanceof Array) {
            for (var i = 0; i < obj.length; i++)
                data.elements[i] = getPropertyData(i.toString(), data.elementType, obj[i], moduleManager);
        }
        return data;
    }
    const typeData = moduleManager.typeManager.getTypeData(type);
    if (atomType.includes(type) || !obj || !typeData) {
        data.value = obj;
        return data;
    }
    if (typeData) {
        utility_1.getKeys(typeData.properties).forEach(key => {
            data.properties[key] = getPropertyData(key, typeData.properties[key].type, data[key], moduleManager);
        });
    }
    return data;
}
exports.getPropertyData = getPropertyData;
class TypeData {
}
exports.TypeData = TypeData;
class ObjectData {
    constructor() {
        this.properties = new Map();
    }
}
exports.ObjectData = ObjectData;
class NullSafe {
    constructor(obj) {
        this.nullSafeObj = obj;
    }
    safe(callback) {
        if (!callback)
            return this.nullSafeObj;
        if (this.nullSafeObj === undefined || this.nullSafeObj === null)
            return new NullSafe(null);
        return new NullSafe(callback(this.nullSafeObj));
    }
}
exports.NullSafe = NullSafe;
function NULL(obj) {
    return new NullSafe(obj);
}
exports.NULL = NULL;
function getElementType(typeName) {
    if (!typeName.endsWith("[]"))
        return null;
    return typeName.substr(0, typeName.length - 2);
}
exports.getElementType = getElementType;
function removeAt(list, idx) {
    if (idx >= list.length)
        return null;
    let element = list[idx];
    for (let i = idx; i < list.length - 1; i++)
        list[i] = list[i + 1];
    list.length--;
    return element;
}
exports.removeAt = removeAt;
//# sourceMappingURL=lib.js.map