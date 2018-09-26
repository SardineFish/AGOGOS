"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process_node_1 = require("./process-node");
const lib_renderer_1 = require("./lib-renderer");
const meta_data_1 = require("./meta-data");
class ProcessManager {
    getProcess(name) {
        return this.processes.get(name);
    }
    inherit(derived, base) {
        return (this.types.get(derived) instanceof this.types.get(base));
    }
    getProcessData(process) {
        let data = new lib_renderer_1.ProcessNodeData();
        data.name = process.name;
        for (const key in process) {
            if (process.hasOwnProperty(key)) {
                data.properties.set(key, { type: meta_data_1.getType(process, key), value: process[key] });
            }
        }
        data.processOutput = { type: meta_data_1.getType(process, process_node_1.KeyProcess), value: null };
        console.log(JSON.stringify(data));
        return data;
    }
}
exports.default = new ProcessManager();
//# sourceMappingURL=process-manager.js.map