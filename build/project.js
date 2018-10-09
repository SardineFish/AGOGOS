"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = require("./package-json");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const meta_data_1 = require("./meta-data");
const lib_1 = require("./lib");
const util_1 = require("util");
const linq_1 = __importDefault(require("linq"));
const PackageJSONFile = "package.json";
const AGOGOSFolder = ".agogos";
class AGOGOSProject extends package_json_1.IPackageJSON {
    constructor(path) {
        super();
        this.projectDirectory = "/";
        this.projectDirectory = path;
        this.projectFiles = {
            name: path_1.default.basename(this.projectDirectory),
            path: this.projectDirectory,
            type: "folder",
            children: []
        };
    }
    get packageJSONPath() { return path_1.default.join(this.projectDirectory, PackageJSONFile); }
    get agogosFolder() { return path_1.default.join(this.projectDirectory, AGOGOSFolder); }
    async open() {
        let data = await util_1.promisify(fs_1.default.readFile)(this.packageJSONPath);
        let packageJson = JSON.parse(data.toString());
        for (const key in packageJson) {
            if (packageJson.hasOwnProperty(key)) {
                this[key] = packageJson[key];
            }
        }
        await this.checkAGOGOSFolder();
        await this.scanFiles();
        return await this.startWatch((operation, oldFile, newFile) => {
            if (this.fileWatchCallback)
                this.fileWatchCallback(operation, oldFile, newFile);
        });
    }
    async checkAGOGOSFolder() {
        if (await util_1.promisify(fs_1.default.exists)(this.agogosFolder)) {
            if (!(await util_1.promisify(fs_1.default.stat)(this.agogosFolder)).isDirectory())
                throw new Error("Invalid project.");
        }
        else {
            await util_1.promisify(fs_1.default.mkdir)(this.agogosFolder);
        }
        return this;
    }
    async init(name) {
        if (fs_1.default.existsSync(this.packageJSONPath))
            throw new Error("Project existed.");
        this.name = name;
        await this.save();
        return await this.open();
    }
    async save() {
        await util_1.promisify(fs_1.default.writeFile)(this.packageJSONPath, lib_1.JSONStringrify(this));
        return this;
    }
    async scanFiles() {
        this.projectFiles.children = await ScanFilesRecursive(this.projectDirectory, /^\..*$/);
        return this;
    }
    startWatch(callback) {
        watchFilesRecursive(this.projectFiles, /^\..*$/, callback);
        return this;
    }
}
__decorate([
    meta_data_1.jsonIgnore(true)
], AGOGOSProject.prototype, "projectDirectory", void 0);
__decorate([
    meta_data_1.jsonIgnore(true)
], AGOGOSProject.prototype, "projectFiles", void 0);
exports.AGOGOSProject = AGOGOSProject;
async function ScanFilesRecursive(rootPath, ignore) {
    let files = await ScanFiles(rootPath, ignore);
    files
        .filter(f => f.type === "folder")
        .forEach(async (f) => f.children = await ScanFilesRecursive(f.path, ignore));
    return files;
}
async function ScanFiles(directory, ignore) {
    let files = await util_1.promisify(fs_1.default.readdir)(directory);
    return files.filter(f => !ignore.test(f))
        .map(f => {
        let p = path_1.default.join(directory, f);
        let isDir = fs_1.default.statSync(p).isDirectory();
        return {
            name: f,
            type: isDir ? "folder" : "file",
            path: path_1.default.join(directory, f),
            children: isDir ? [] : null
        };
    });
}
function watchFilesRecursive(file, ignore, callback) {
    if (file.type !== "folder")
        return;
    if (file.watcher)
        file.watcher.close();
    file.watcher = fs_1.default.watch(file.path, { recursive: false }, async (event, filename) => {
        let newName = path_1.default.basename(filename);
        let oldChildrens = file.children;
        let subFiles = await ScanFiles(file.path, ignore);
        file.children = subFiles;
        if (subFiles.length > oldChildrens.length)
            callback("add", null, linq_1.default.from(subFiles).where(f => f.name === newName).firstOrDefault());
        else if (subFiles.length < oldChildrens.length)
            callback("delete", linq_1.default.from(oldChildrens).where(f => f.name === newName).firstOrDefault(), null);
        else if (subFiles.length == oldChildrens.length) {
            let diffReslt = lib_1.diffFiles(oldChildrens, subFiles);
            if (diffReslt.operation === "change")
                callback("rename", diffReslt.oldItem, diffReslt.newItem);
            //callback("rename", linq.from(oldChildrens).where(f=>f.name === ))
        }
        file.children = subFiles;
    });
    if (file.children)
        file.children.forEach(f => watchFilesRecursive(f, ignore, callback));
}
//# sourceMappingURL=project.js.map