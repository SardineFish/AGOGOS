"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const editor_lib_1 = require("../editor-lib");
exports.Editor = editor_lib_1.Editor;
const meta_data_1 = require("../meta-data");
const React = __importStar(require("react"));
exports.React = React;
const ReactDOM = __importStar(require("react-dom"));
exports.ReactDOM = ReactDOM;
const agogosEditor = {
    Editor: editor_lib_1.Editor,
    NumberEditor: editor_lib_1.NumberEditor,
    StringEditor: editor_lib_1.StringEditor,
    BooleanEditor: editor_lib_1.BooleanEditor,
    ObjectEditor: editor_lib_1.ObjectEditor,
    customEditor: meta_data_1.editor
};
exports.default = agogosEditor;
//# sourceMappingURL=agogos-editor.js.map