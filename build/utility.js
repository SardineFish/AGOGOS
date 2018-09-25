"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getKeys(obj) {
    let keys = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}
exports.getKeys = getKeys;
//# sourceMappingURL=utility.js.map