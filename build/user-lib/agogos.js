"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const meta_data_1 = require("../meta-data");
const agogos_1 = __importDefault(require("../agogos"));
class Unit {
    process() {
    }
}
__decorate([
    meta_data_1.type(meta_data_1.BuildinTypes.string)
], Unit.prototype, "name", void 0);
exports.Unit = Unit;
const agogos = {
    type: meta_data_1.type,
    Unit,
    console: agogos_1.default.console,
    ...meta_data_1.BuildinTypes
};
exports.default = agogos;
//# sourceMappingURL=agogos.js.map