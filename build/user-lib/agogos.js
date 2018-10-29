"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const meta_data_1 = require("../meta-data");
const agogos_1 = require("../agogos");
const process_unit_1 = require("../process-unit");
const editor_lib_1 = require("../editor-lib");
const meta_data_2 = require("../meta-data");
const React = __importStar(require("react"));
exports.React = React;
const ReactDOM = __importStar(require("react-dom"));
exports.ReactDOM = ReactDOM;
const agogosEditor = {
    Editor: editor_lib_1.Editor,
    NumberEditor: editor_lib_1.NumberEditor,
    StringEditor: editor_lib_1.StringEditor,
    BooleanEditor: editor_lib_1.BooleanEditor,
    EditorContent: editor_lib_1.EditorContent,
    customEditor: meta_data_2.editor
};
const agogos = {
    type: meta_data_1.type,
    Unit: process_unit_1.ProcessUnit,
    process: meta_data_1.process,
    iterable: meta_data_1.iterableProcess,
    typedef: meta_data_1.typedef,
    editor: agogosEditor,
    console: {
        log: (message) => agogos_1.AGOGOS.instance.console.log(message),
        warn: (message) => agogos_1.AGOGOS.instance.console.warn(message),
        error: (message) => agogos_1.AGOGOS.instance.console.error(message),
    },
    ...meta_data_1.BuildinTypes
};
exports.default = agogos;
//# sourceMappingURL=agogos.js.map