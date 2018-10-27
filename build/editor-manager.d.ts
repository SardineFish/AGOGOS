import { Editor } from "./process-editor";
export declare class EditorManager {
    private editorLib;
    private default;
    reset(): void;
    setDefault(editor: typeof Editor): void;
    addEditor(name: string, editor: typeof Editor): void;
    getEditor(name: string): typeof Editor;
}
