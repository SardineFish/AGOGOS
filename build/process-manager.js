"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process_node_1 = require("./process-node");
const lib_renderer_1 = require("./lib-renderer");
const meta_data_1 = require("./meta-data");
class ProcessManager {
    constructor() {
        this.types = new Map();
        this.processLib = new Map();
    }
    inherit(derived, base) {
        switch (derived) {
            case meta_data_1.BuildinTypes.number:
            case meta_data_1.BuildinTypes.boolean:
            case meta_data_1.BuildinTypes.string:
                return derived === base;
            default:
                return derived === base; //return (this.types.get(derived) instanceof this.types.get(base));
        }
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
    addProcess(name, ProcessType) {
        this.processLib.set(name, ProcessType);
    }
    instantiateProcess(name) {
        if (!this.processLib.has(name))
            return null;
        let Process = this.processLib.get(name);
        return new Process();
    }
    addType(name, Type) {
        this.types.set(name, Type);
    }
}
exports.default = new ProcessManager();
//# sourceMappingURL=process-manager.js.map