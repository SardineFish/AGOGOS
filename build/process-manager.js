"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_node_1 = require("./process-node");
const meta_data_1 = require("./meta-data");
const path_1 = __importDefault(require("path"));
const lib_1 = require("./lib");
class ProcessManager {
    constructor() {
        this.types = new Map();
        this.processLib = new Map();
        this.processFile = new Map();
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
        let data = new lib_1.ProcessNodeData();
        data.name = process.name;
        for (const key in process) {
            if (process.hasOwnProperty(key)) {
                data.properties.set(key, { type: meta_data_1.getType(process, key), value: process[key] });
            }
        }
        data.processOutput = { type: meta_data_1.getType(process, process_node_1.KeyProcess), value: null };
        //console.log(JSON.stringify(data));
        return data;
    }
    resetLib() {
        this.processLib.clear();
    }
    importProcess(filename) {
        filename = path_1.default.resolve(filename);
        const importObj = require(filename);
        if (importObj.default) {
            let processName = meta_data_1.getProcess(importObj.default);
            if (!processName)
                return null;
            this.addProcess(processName, importObj.default);
            return processName;
        }
        return null;
    }
    addProcess(name, ProcessType) {
        if (this.processLib.has(name))
            throw new Error("Process existed.");
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
exports.ProcessManager = ProcessManager;
//# sourceMappingURL=process-manager.js.map