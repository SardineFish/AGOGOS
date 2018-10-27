import { Editor } from "./process-editor";

export class EditorManager
{
    private editorLib: Map<string, typeof Editor> = new Map();
    private default: typeof Editor;
    public reset()
    {
        this.editorLib.clear();
    }
    public setDefault(editor: typeof Editor)
    {
        this.default = editor;
    }
    public addEditor(name: string, editor: typeof Editor)
    {
        if (this.editorLib.has(name))
            throw new Error("Editor already existed.");
        this.editorLib.set(name, editor);
    }
    public getEditor(name: string):typeof Editor
    {
        if (!this.editorLib.has(name))
            return this.default;
        return this.editorLib.get(name);
    }
}