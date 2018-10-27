"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EditorManager {
    constructor() {
        this.editorLib = new Map();
    }
    reset() {
        this.editorLib.clear();
    }
    setDefault(editor) {
        this.default = editor;
    }
    addEditor(name, editor) {
        if (this.editorLib.has(name))
            throw new Error("Editor already existed.");
        this.editorLib.set(name, editor);
    }
    getEditor(name) {
        if (!this.editorLib.has(name))
            return this.default;
        return this.editorLib.get(name);
    }
}
exports.EditorManager = EditorManager;
//# sourceMappingURL=editor-manager.js.map