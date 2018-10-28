import { Editor, NumberEditor, StringEditor, BooleanEditor, ObjectEditor, EditorProps, EditorState } from "../editor-lib";
import { editor } from "../meta-data";
import * as React from "react";
import * as ReactDOM from "react-dom";
declare const agogosEditor: {
    Editor: typeof Editor;
    NumberEditor: typeof NumberEditor;
    StringEditor: typeof StringEditor;
    BooleanEditor: typeof BooleanEditor;
    ObjectEditor: typeof ObjectEditor;
    customEditor: typeof editor;
};
export default agogosEditor;
export { React, ReactDOM, Editor, EditorProps, EditorState };
