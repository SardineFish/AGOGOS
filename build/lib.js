"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=lib.js.map