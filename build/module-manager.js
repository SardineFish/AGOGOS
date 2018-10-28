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
        this.editorModules = [];
        this.moduleLib = new Map();
    }
    reset() {
        this.typeManager.resetLib();
        this.processManager.resetLib();
        this.editorModules = [];
        for (const path of this.moduleLib.keys()) {
            delete require.cache[path];
        }
        this.processManager.resetLib();
    }
    importSourceFile(filePath) {
        try {
            const importObj = require(filePath);
            if (importObj.default) {
                //let obj = new importObj.default();
                let processName = meta_data_1.getProcess(importObj.default);
                let typeName = meta_data_1.getTypedef(importObj.default);
                let editorName = meta_data_1.getEditor(importObj.default);
                let srcFile;
                if (processName) {
                    this.processManager.addProcess(processName, importObj.default);
                    srcFile = {
                        name: path_1.default.basename(filePath),
                        path: path_1.default.resolve(filePath),
                        type: "file",
                        moduleType: "process",
                        moduleName: processName
                    };
                }
                if (typeName) {
                    this.typeManager.addType(typeName, importObj.default);
                    srcFile = {
                        name: path_1.default.basename(filePath),
                        path: path_1.default.resolve(filePath),
                        type: "file",
                        moduleType: "typedef",
                        moduleName: typeName
                    };
                }
                if (editorName) {
                    srcFile = {
                        name: path_1.default.basename(filePath),
                        path: path_1.default.resolve(filePath),
                        type: "file",
                        moduleType: "editor",
                        moduleName: editorName
                    };
                    this.editorModules.push(srcFile);
                }
                this.moduleLib.set(filePath, srcFile);
                return srcFile;
            }
        }
        catch (err) {
            agogos_1.default.console.error(`Failed to import source file ${filePath} \r\n${err.message}`);
        }
        return null;
    }
}
exports.ModuleManager = ModuleManager;
const IgnoreResolveTypes = [
    meta_data_1.BuildinTypes.array,
    meta_data_1.BuildinTypes.boolean,
    meta_data_1.BuildinTypes.number,
    meta_data_1.BuildinTypes.object,
    meta_data_1.BuildinTypes.string,
    meta_data_1.BuildinTypes.void
];
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
        for (const typedef of this.typeLib.values()) {
        }
        this.typeLib.clear();
    }
    addType(name, constructor) {
        if (this.typeLib.has(name))
            throw new Error("Type existed.");
        this.typeLib.set(name, constructor);
    }
    getType(name) {
        if (!this.typeLib.has(name))
            return null;
        return this.typeLib.get(name);
    }
    getTypeData(name) {
        let constructor = this.getType(name);
        if (!constructor)
            return null;
        let obj = new constructor();
        let properties = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                properties[key] = {
                    type: meta_data_1.getType(obj, key)
                };
            }
        }
        return {
            type: name,
            properties: properties
        };
    }
    exportTypesData() {
        let mapObj = {};
        for (const key of this.typeLib.keys()) {
            mapObj[key] = this.getTypeData(key);
        }
        return mapObj;
    }
    instantiate(name) {
        let constructor = this.getType(name);
        if (!constructor)
            return null;
        return new constructor();
    }
}
class ProcessManager {
    constructor() {
        this.processLib = new Map();
    }
    getProcessData(name) {
        return process_unit_1.ProcessUtility.getProcessData(this.instantiateProcess(name));
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
        if (!Process)
            return null;
        let process = new Process();
        if (process.name === "Process")
            process.name = name;
        process.__processType = name;
        return process;
    }
    exportProcessData() {
        let mapObj = {};
        for (const key of this.processLib.keys()) {
            mapObj[key] = this.getProcessData(key);
        }
        return mapObj;
    }
}
//# sourceMappingURL=module-manager.js.map