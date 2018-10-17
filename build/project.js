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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const npm_1 = __importDefault(require("npm"));
const package_json_1 = require("./package-json");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const meta_data_1 = require("./meta-data");
const lib_1 = require("./lib");
const util_1 = require("util");
const linq_1 = __importDefault(require("linq"));
const ipc_1 = require("./ipc");
const child_process_1 = require("child_process");
const compiler_1 = require("./compiler");
const module_manager_1 = require("./module-manager");
const agogos_1 = require("./agogos");
const PackageJSONFile = "package.json";
const AGOGOSFolder = ".agogos";
const ProjectBuildOutputFolder = "build";
class AGOGOSProject extends package_json_1.IPackageJSON {
    constructor(path) {
        super();
        this.projectDirectory = "/";
        this.moduleManager = new module_manager_1.ModuleManager();
        this.sourceFiles = [];
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
        agogos_1.AGOGOS.instance.showStatus("Loading Project", true);
        let data = await util_1.promisify(fs.readFile)(this.packageJSONPath);
        let packageJson = JSON.parse(data.toString());
        for (const key in packageJson) {
            if (packageJson.hasOwnProperty(key)) {
                this[key] = packageJson[key];
            }
        }
        this.dependencies["agogos"] = `file:${path_1.default.resolve("./build/user-lib")}`;
        await this.save();
        this.tsCompiler = new TSCompiler(this.projectDirectory, path_1.default.join(this.agogosFolder, ProjectBuildOutputFolder));
        await this.checkAGOGOSFolder();
        await this.scanFiles();
        agogos_1.AGOGOS.instance.showStatus("Resolving Packages", true);
        let err = await util_1.promisify(npm_1.default.load)({});
        err = await util_1.promisify(npm_1.default.commands.install)(this.projectDirectory, []);
        //await this.tsCompiler.init();
        return await this.startWatch((operation, oldFile, newFile) => {
            if (this.fileWatchCallback)
                this.fileWatchCallback(operation, oldFile, newFile);
        });
    }
    async checkAGOGOSFolder() {
        if (await util_1.promisify(fs.exists)(this.agogosFolder)) {
            if (!(await util_1.promisify(fs.stat)(this.agogosFolder)).isDirectory())
                throw new Error("Invalid project.");
        }
        else {
            await util_1.promisify(fs.mkdir)(this.agogosFolder);
        }
        return this;
    }
    async init(name) {
        if (fs.existsSync(this.packageJSONPath))
            throw new Error("Project existed.");
        this.name = name;
        await this.save();
        return await this.open();
    }
    async save() {
        await util_1.promisify(fs.writeFile)(this.packageJSONPath, lib_1.JSONStringrify(this));
        return this;
    }
    async scanFiles() {
        this.projectFiles.children = await ScanFilesRecursive(this.projectDirectory, /^\..*$/);
        return this;
    }
    startWatch(callback) {
        watchFile(this.projectFiles, /^\..*$/, callback);
        //watchFilesRecursive(this.projectFiles, /^\..*$/, callback);
        return this;
    }
}
__decorate([
    meta_data_1.jsonIgnore(true)
], AGOGOSProject.prototype, "projectDirectory", void 0);
__decorate([
    meta_data_1.jsonIgnore(true)
], AGOGOSProject.prototype, "projectFiles", void 0);
__decorate([
    meta_data_1.jsonIgnore()
], AGOGOSProject.prototype, "fileWatchCallback", void 0);
__decorate([
    meta_data_1.jsonIgnore(true)
], AGOGOSProject.prototype, "tsCompiler", void 0);
__decorate([
    meta_data_1.jsonIgnore()
], AGOGOSProject.prototype, "moduleManager", void 0);
__decorate([
    meta_data_1.jsonIgnore()
], AGOGOSProject.prototype, "sourceFiles", void 0);
exports.AGOGOSProject = AGOGOSProject;
class TSCompiler {
    constructor(src, out) {
        this.ready = false;
        this.outputMap = new Map();
        this.srcDirectory = src;
        this.outDirectory = out;
    }
    async init() {
        this.compileProcessIPC = new ipc_1.ProcessIPC(child_process_1.fork("./build/compiler.js"));
        await this.compileProcessIPC.call(compiler_1.CompilerIpc.Init, this.srcDirectory, this.outDirectory);
        this.ready = true;
    }
    async compile() {
        agogos_1.AGOGOS.instance.console.log("Compiling...");
        return await this.compileProcessIPC.call("compile");
    }
    async watch() {
        agogos_1.AGOGOS.instance.console.log("Start watching...");
        this.compileProcessIPC.add(compiler_1.CompilerIpc.Diagnostic, (diagnostic) => this.onDiagnostic(diagnostic));
        this.compileProcessIPC.add(compiler_1.CompilerIpc.Status, (status) => this.onStatusReport(status));
        this.compileProcessIPC.add(compiler_1.CompilerIpc.PostCompile, (result) => this.onCompileComplete(result));
        await this.compileProcessIPC.call(compiler_1.CompilerIpc.StartWatch);
        return this;
    }
    onCompileComplete(result) {
        this.srcFiles = result.files;
        this.outputMap = new Map();
        this.srcFiles.forEach(f => this.outputMap.set(f, path_1.default.resolve(this.outDirectory, path_1.default.join(path_1.default.dirname(f), path_1.default.parse(f).name + ".js"))));
        agogos_1.AGOGOS.instance.console.log(this.srcFiles);
        if (this.onCompileCompleteCallback)
            this.onCompileCompleteCallback();
    }
    onDiagnostic(diagnostic) {
        agogos_1.AGOGOS.instance.console.error(diagnostic);
    }
    onStatusReport(status) {
        agogos_1.AGOGOS.instance.console.log(`[Compiler] ${status}`);
    }
}
class ProjFile {
    static getDirectory(root, path, pathType = "relative") {
        let relativePath = path;
        if (pathType === "absolute")
            relativePath = path_1.default.relative(root.path, path);
        let pathSlice = relativePath.split(path_1.default.sep);
        let file = root;
        for (let i = 0; i < pathSlice.length - 1; i++) {
            file = file.children.filter(f => f.name === pathSlice[i])[0];
        }
        return file;
    }
    static getFile(root, path, pathType = "relative") {
        let relativePath = path;
        if (pathType === "absolute")
            relativePath = path_1.default.relative(root.path, path);
        let pathSlice = relativePath.split(path_1.default.sep);
        let file = root;
        for (let i = 0; i < pathSlice.length; i++) {
            file = file.children.filter(f => f.name === pathSlice[i])[0];
        }
        return file;
    }
    static orderFiles(files) {
        return linq_1.default.from(files)
            .orderBy(f => f.type === "folder" ? "0" + f.name : f.name)
            .toArray();
    }
}
exports.ProjFile = ProjFile;
async function ScanFilesRecursive(rootPath, ignore) {
    let files = await ScanFiles(rootPath, ignore);
    await lib_1.foreachAsync(files.filter(f => f.type === "folder"), async (f) => f.children = await ScanFilesRecursive(f.path, ignore));
    /*files
        .filter(f => f.type === "folder")
        .forEach(async (f) => f.children = await ScanFilesRecursive(f.path, ignore));*/
    return files;
}
async function ScanFiles(directory, ignore) {
    let files = await util_1.promisify(fs.readdir)(directory);
    return ProjFile.orderFiles(linq_1.default.from(files)
        .where(f => !ignore.test(f))
        .select(f => {
        let p = path_1.default.join(directory, f);
        let isDir = fs.statSync(p).isDirectory();
        return {
            name: f,
            type: isDir ? "folder" : "file",
            path: path_1.default.join(directory, f),
            children: isDir ? [] : null
        };
    })
        .toArray());
}
function watchFile(file, ignore, callback) {
    if (file.type !== "folder")
        return;
    if (file.watcher)
        file.watcher.close();
    file.watcher = fs.watch(file.path, { recursive: true }, async (event, filename) => {
        if (event === "change")
            return;
        let fullname = path_1.default.resolve(path_1.default.join(file.path, filename));
        let name = path_1.default.basename(fullname);
        let parentFolder = ProjFile.getDirectory(file, filename);
        let subFiles = await ScanFiles(parentFolder.path, ignore);
        let oldChildrens = parentFolder.children;
        parentFolder.children = subFiles;
        if (subFiles.length > oldChildrens.length)
            callback("add", null, linq_1.default.from(subFiles).where(f => f.name === name).firstOrDefault());
        else if (subFiles.length < oldChildrens.length)
            callback("delete", linq_1.default.from(oldChildrens).where(f => f.name === name).firstOrDefault(), null);
        else if (subFiles.length == oldChildrens.length) {
            let diffReslt = lib_1.diffFiles(oldChildrens, subFiles);
            if (!diffReslt)
                return;
            if (diffReslt.operation === "change")
                callback("rename", diffReslt.oldItem, diffReslt.newItem);
            //callback("rename", linq.from(oldChildrens).where(f=>f.name === ))
        }
    });
}
function watchFilesRecursive(file, ignore, callback) {
    if (file.type !== "folder")
        return;
    if (file.watcher)
        file.watcher.close();
    file.watcher = fs.watch(file.path, { recursive: false }, async (event, filename) => {
        if (event === "change")
            return;
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
        file.children.filter(child => child.type === "folder").forEach(f => watchFilesRecursive(f, ignore, callback));
}
//# sourceMappingURL=project.js.map