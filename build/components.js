"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const dist_1 = __importDefault(require("../../react-free-viewport/dist"));
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
        this.viewportRef = react_1.default.createRef();
    }
    componentDidMount() {
        console.log(this.domRef.current);
    }
    render() {
        const { children, ...other } = this.props;
        return (react_1.default.createElement(dist_1.default, { id: this.props.id, button: 1, refobj: this.domRef }));
    }
}
exports.ProcessSpace = ProcessSpace;
class ReactProcessNode extends react_1.default.Component {
    render() {
        return (react_1.default.createElement("div", { className: "node-wrapper" },
            react_1.default.createElement("header", { className: "node-header" }, this.props.node.name),
            react_1.default.createElement("div", { className: "node-content" })));
    }
}
exports.ReactProcessNode = ReactProcessNode;
//# sourceMappingURL=components.js.map