"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const meta_data_1 = require("./meta-data");
const linq_1 = __importDefault(require("linq"));
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
//# sourceMappingURL=lib.js.map