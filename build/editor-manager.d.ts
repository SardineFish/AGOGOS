import { Editor } from "./process-editor";
import { SourceFile } from "./lib";
export declare class EditorManager {
    private editorLib;
    private default;
    reset(): void;
    importEditor(src: SourceFile): void;
    setDefault(editor: typeof Editor): void;
    addEditor(name: string, editor: typeof Editor): void;
    getEditor(name: string): typeof Editor;
}
