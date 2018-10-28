"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meta_data_1 = require("./meta-data");
const lib_renderer_1 = require("./lib-renderer");
class EditorManager {
    constructor() {
        this.editorLib = new Map();
    }
    reset() {
        this.editorLib.clear();
    }
    importEditor(src) {
        try {
            const importObj = require(src.compiledFile);
            var editor = importObj.default;
            var editorName = meta_data_1.getEditor(editor);
            if (!editorName)
                return;
            this.addEditor(editorName, editor);
        }
        catch (ex) {
            lib_renderer_1.AGOGOSRenderer.instance.console.log(`Import failed: ${ex.message}`, "error");
        }
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