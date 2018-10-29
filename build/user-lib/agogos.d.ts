import { type, process, typedef, iterableProcess } from "../meta-data";
import { ProcessUnit } from "../process-unit";
import { Editor, NumberEditor, StringEditor, BooleanEditor, EditorContent } from "../editor-lib";
import { editor } from "../meta-data";
import * as React from "react";
import * as ReactDOM from "react-dom";
declare const agogos: {
    string: string;
    number: string;
    boolean: string;
    void: string;
    object: string;
    array: (type: string | Function) => string;
    type: typeof type;
    Unit: typeof ProcessUnit;
    process: typeof process;
    iterable: typeof iterableProcess;
    typedef: typeof typedef;
    editor: {
        Editor: typeof Editor;
        NumberEditor: typeof NumberEditor;
        StringEditor: typeof StringEditor;
        BooleanEditor: typeof BooleanEditor;
        EditorContent: typeof EditorContent;
        customEditor: typeof editor;
    };
    console: {
        log: (message: any) => void;
        warn: (message: any) => void;
        error: (message: any) => void;
    };
};
export default agogos;
export { React, ReactDOM };
