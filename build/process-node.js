"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_dom_1 = __importDefault(require("react-dom"));
const react_1 = __importDefault(require("react"));
const components_1 = require("./components");
class ProcessNode {
    constructor() {
        this.name = "Node";
    }
}
exports.ProcessNode = ProcessNode;
function renderProcessNode(node) {
    let element = document.createElement("div");
    const reactElement = (react_1.default.createElement(components_1.ReactProcessNode, { node: node }));
    react_dom_1.default.render(reactElement, element);
    return element;
}
exports.renderProcessNode = renderProcessNode;
//# sourceMappingURL=process-node.js.map