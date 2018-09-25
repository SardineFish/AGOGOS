"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProcessManager {
    getProcess(name) {
        return this.processes.get(name);
    }
}
exports.default = new ProcessManager();
//# sourceMappingURL=process-manager.js.map