import { type, BuildinTypes, process, typedef, iterableProcess } from "../meta-data";
import { AGOGOS } from "../agogos";
import { ProcessUnit } from "../process-unit";
import { Editor, NumberEditor, StringEditor, BooleanEditor, ObjectEditor, EditorProps, EditorState } from "../editor-lib";
import { editor } from "../meta-data";
import * as React from "react";
import * as ReactDOM from "react-dom";
const agogosEditor = {
    Editor,
    NumberEditor,
    StringEditor,
    BooleanEditor,
    ObjectEditor,
    customEditor: editor
};

const agogos = {
    type,
    Unit: ProcessUnit,
    process,
    iterable: iterableProcess,
    typedef,
    editor: agogosEditor,
    console: {
        log: (message: any) => AGOGOS.instance.console.log(message),
        warn: (message: any) => AGOGOS.instance.console.warn(message),
        error: (message: any) => AGOGOS.instance.console.error(message),
    },
    ...BuildinTypes
};


export default agogos;
export { React, ReactDOM };