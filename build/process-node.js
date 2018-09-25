"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const meta_data_1 = require("./meta-data");
exports.KeyProcess = "process";
class ProcessNode {
    constructor() {
        this.nodeName = "Node";
        this.name = "Node";
        this.inputMap = new Map();
    }
    process() {
    }
}
__decorate([
    meta_data_1.type("string")
], ProcessNode.prototype, "name", void 0);
exports.ProcessNode = ProcessNode;
class ValuePort {
}
class TestProcessNode extends ProcessNode {
    constructor() {
        super(...arguments);
        this.num = 0;
        this.text = "";
        this.isTrue = false;
        this.next = null;
    }
    process() {
    }
}
__decorate([
    meta_data_1.type(meta_data_1.BuildinTypes.number)
], TestProcessNode.prototype, "num", void 0);
__decorate([
    meta_data_1.type(meta_data_1.BuildinTypes.string)
], TestProcessNode.prototype, "text", void 0);
__decorate([
    meta_data_1.type(meta_data_1.BuildinTypes.boolean)
], TestProcessNode.prototype, "isTrue", void 0);
__decorate([
    meta_data_1.type(meta_data_1.BuildinTypes.object)
], TestProcessNode.prototype, "next", void 0);
__decorate([
    meta_data_1.type(meta_data_1.BuildinTypes.string)
], TestProcessNode.prototype, "process", null);
exports.TestProcessNode = TestProcessNode;
//# sourceMappingURL=process-node.js.map