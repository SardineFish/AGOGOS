"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_unit_1 = require("./process-unit");
const meta_data_1 = require("./meta-data");
const path_1 = __importDefault(require("path"));
const agogos_1 = __importDefault(require("./user-lib/agogos"));
class ModuleManager {
    constructor() {
        this.typeManager = new TypeManager();
        this.processManager = new ProcessManager();
    }
    reset() {
        this.typeManager.resetLib();
        this.processManager.resetLib();
    }
    importSourceFile(filePath) {
        try {
            const importObj = require(filePath);
            if (importObj.default) {
                let obj = new importObj.default();
                let processName = meta_data_1.getProcess(importObj.default);
                let typeName = meta_data_1.getTypedef(importObj.default);
                if (processName) {
                    this.processManager.addProcess(processName, importObj.default);
                    return {
                        name: path_1.default.basename(filePath),
                        path: path_1.default.resolve(filePath),
                        type: "file",
                        moduleType: "process",
                        moduleName: processName
                    };
                }
                if (typeName) {
                    this.typeManager.addType(typeName, importObj.default);
                    return {
                        name: path_1.default.basename(filePath),
                        path: path_1.default.resolve(filePath),
                        type: "file",
                        moduleType: "typedef",
                        moduleName: processName
                    };
                }
            }
        }
        catch (err) {
            agogos_1.default.console.error(`Failed to import source file ${filePath} \r\n${err.message}`);
        }
        return null;
    }
}
exports.ModuleManager = ModuleManager;
class TypeManager {
    constructor() {
        this.typeLib = new Map();
    }
    isInherit(derived, base) {
        switch (derived) {
            case meta_data_1.BuildinTypes.number:
            case meta_data_1.BuildinTypes.boolean:
            case meta_data_1.BuildinTypes.string:
                return derived === base;
            default:
                return derived === base; //return (this.types.get(derived) instanceof this.types.get(base));
        }
    }
    resetLib() {
        this.typeLib.clear();
    }
    addType(name, constructor) {
        if (this.typeLib.has(name))
            throw new Error("Type existed.");
        this.typeLib.set(name, constructor);
    }
}
class ProcessManager {
    constructor() {
        this.processLib = new Map();
    }
    getProcessData(name) {
        let constructor = this.processLib.get(name);
        if (!constructor)
            return;
        let process = new constructor();
        if (process.name === "Process")
            process.name = name;
        return process_unit_1.ProcessUtility.getProcessData(new constructor());
    }
    resetLib() {
        this.processLib.clear();
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
}
//# sourceMappingURL=module-manager.js.map