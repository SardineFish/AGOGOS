import { SourceFile } from "./lib";
import { Editor } from "./editor-lib";
export declare class EditorManager {
    private editorLib;
    private default;
    reset(): void;
    importEditor(src: SourceFile): void;
    setDefault(editor: typeof Editor): void;
    addEditor(name: string, editor: typeof Editor): void;
    getEditor(name: string): typeof Editor;
}
