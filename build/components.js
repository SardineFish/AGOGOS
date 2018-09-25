"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const dist_1 = __importDefault(require("../../react-free-viewport/dist"));
const process_node_1 = require("./process-node");
const process_editor_1 = require("./process-editor");
const lib_1 = require("./lib");
class Pane extends react_1.default.Component {
    render() {
        return (react_1.default.createElement("section", { className: [this.props.className, "pane"].join(" "), id: this.props.id, key: this.props.key },
            react_1.default.createElement("header", { className: "pane-header" }, this.props.header),
            react_1.default.createElement("div", { className: "pane-content" }, this.props.children)));
    }
}
exports.Pane = Pane;
class ProcessSpace extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.domRef = react_1.default.createRef();
    }
    addProcess(process) {
        let startPos;
        let holdPos;
        const onDragStart = (e) => {
            let style = getComputedStyle(element);
            startPos = lib_1.vec2(parseFloat(style.left), parseFloat(style.top));
            holdPos = this.viewport.mousePosition(lib_1.vec2(e.startX, e.startY));
        };
        const onNodeDragMove = (e) => {
            let dp = lib_1.Vector2.minus(this.viewport.mousePosition(lib_1.vec2(e.x, e.y)), holdPos);
            let pos = lib_1.Vector2.plus(startPos, dp);
            element.style.left = `${pos.x}px`;
            element.style.top = `${pos.y}px`;
        };
        let element = process_editor_1.renderProcessNode(process, onDragStart, onNodeDragMove);
        this.domRef.current.querySelector(".viewport-wrapper").appendChild(element);
    }
    componentDidMount() {
        this.viewport = this.refs["viewport"];
        this.addProcess(new process_node_1.TestProcessNode());
        this.addProcess(new process_node_1.TestProcessNode());
        this.addProcess(new process_node_1.TestProcessNode());
    }
    render() {
        const { children, ...other } = this.props;
        return (react_1.default.createElement(dist_1.default, { id: this.props.id, ref: "viewport", button: 1, refobj: this.domRef }));
    }
}
exports.ProcessSpace = ProcessSpace;
//# sourceMappingURL=components.js.map