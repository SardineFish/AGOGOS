"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meta_data_1 = require("./meta-data");
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
//# sourceMappingURL=lib.js.map