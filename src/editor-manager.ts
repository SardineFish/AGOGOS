import { SourceFile } from "./lib";
import { getEditor } from "./meta-data";
import { AGOGOSRenderer } from "./lib-renderer";
import { Editor } from "./editor-lib";

export class EditorManager
{
    private editorLib: Map<string, typeof Editor> = new Map();
    private default: typeof Editor;
    public reset()
    {
        this.editorLib.clear();
    }
    public importEditor(src: SourceFile)
    {
        try
        {
            const importObj = require(src.compiledFile);
            var editor = importObj.default as (typeof Editor);
            var editorName = getEditor(editor);
            if (!editorName)
                return;
            this.addEditor(editorName, editor);
        }
        catch (ex)
        {
            AGOGOSRenderer.instance.console.log(`Import failed: ${ex.message}`, "error");
        }
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