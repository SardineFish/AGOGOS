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

export default agogosEditor;
export { React, ReactDOM, Editor, EditorProps, EditorState };