import npm from "npm";
import { IPackageJSON } from "./package-json";
import Path from "path";
import fs, { exists, statSync, stat } from "fs";
import { jsonIgnore } from "./meta-data";
import { JSONStringrify, diffFiles, foreachAsync } from "./lib";
import { promisify } from "util";
import linq from "linq";
import * as typescript from "typescript";
import { ProcessIPC } from "./ipc";
import { fork } from "child_process";

type FileWatchCallback = (operation: "add" | "delete" | "rename", oldFile?: ProjectFile, newFile?: ProjectFile) => void;

const PackageJSONFile = "package.json";
const AGOGOSFolder = ".agogos";
const ProjectBuildOutputFolder = "build";

export class AGOGOSProject extends IPackageJSON
{
    @jsonIgnore(true)
    public projectDirectory: string = "/";
    @jsonIgnore(true)
    public projectFiles: ProjectFile;

    public fileWatchCallback: FileWatchCallback;

    @jsonIgnore(true)
    public tsCompiler: TSCompiler;

    get packageJSONPath() { return Path.join(this.projectDirectory, PackageJSONFile); }
    get agogosFolder() { return Path.join(this.projectDirectory, AGOGOSFolder); }
    constructor(path: string)
    {
        super();
        this.projectDirectory = path;
        this.projectFiles = {
            name: Path.basename(this.projectDirectory),
            path: this.projectDirectory,
            type: "folder",
            children: []
        };
    }
    public async open(): Promise<AGOGOSProject>
    {
        let data = await promisify(fs.readFile)(this.packageJSONPath);
        let packageJson = JSON.parse(data.toString());
        for (const key in packageJson)
        {
            if (packageJson.hasOwnProperty(key))
            {
                this[key] = packageJson[key];
            }
        }
        this.tsCompiler = new TSCompiler(this.projectDirectory, Path.join(this.agogosFolder, ProjectBuildOutputFolder));
        await this.checkAGOGOSFolder();
        await this.scanFiles();
        //await this.tsCompiler.init();
        return await this.startWatch((operation,oldFile,newFile) =>
        {
            if (this.fileWatchCallback)
                this.fileWatchCallback(operation, oldFile, newFile);
        });
    }
    public async checkAGOGOSFolder(): Promise<AGOGOSProject>
    {
        if (await promisify(fs.exists)(this.agogosFolder))
        {
            if (!(await promisify(fs.stat)(this.agogosFolder)).isDirectory())
                throw new Error("Invalid project.");
        }
        else
        {
            await promisify(fs.mkdir)(this.agogosFolder);
        }
        return this;
    }
    public async init(name: string): Promise<AGOGOSProject>
    {
        if (fs.existsSync(this.packageJSONPath))
            throw new Error("Project existed.");
        this.name = name;
        await this.save();
        

        return await this.open();
    }
    public async save(): Promise<AGOGOSProject>
    {
        await promisify(fs.writeFile)(this.packageJSONPath, JSONStringrify(this));
        return this;
    }
    public async scanFiles(): Promise<AGOGOSProject>
    {
        this.projectFiles.children = await ScanFilesRecursive(this.projectDirectory, /^\..*$/);
        return this;
    }
    public startWatch(callback: FileWatchCallback): AGOGOSProject
    {
        watchFile(this.projectFiles, /^\..*$/, callback);
        //watchFilesRecursive(this.projectFiles, /^\..*$/, callback);
        return this;
    }
}
class TSCompiler
{
    ready: boolean = false;
    compileProcessIPC: ProcessIPC;
    srcDirectory: string;
    outDirectory: string;
    constructor(src: string, out: string)
    {
        this.srcDirectory = src;
        this.outDirectory = out;
    }
    async init(): Promise<void>
    {
        this.compileProcessIPC = new ProcessIPC(fork("./build/compiler.js"));
        await this.compileProcessIPC.call("init", this.srcDirectory, this.outDirectory);
        this.ready = true;
    }
    async compile(): Promise<ReadonlyArray<typescript.Diagnostic>>
    {
        return await this.compileProcessIPC.call<ReadonlyArray<typescript.Diagnostic>>("compile");
    }
}
export interface ProjectFile
{
    name: string;
    type: "file" | "folder" | string;
    path: string;
    children?: ProjectFile[];
    watcher?: fs.FSWatcher;
}
export class ProjFile
{
    public static getDirectory(root: ProjectFile, path: string, pathType: "relative" | "absolute" = "relative"): ProjectFile
    {
        let relativePath = path;
        if (pathType === "absolute")
            relativePath = Path.relative(root.path, path);
        let pathSlice = relativePath.split(Path.sep);
        let file = root;
        for (let i = 0; i < pathSlice.length - 1; i++)
        {
            file = file.children.filter(f => f.name === pathSlice[i])[0];
        }
        return file;
    }

    public static getFile(root: ProjectFile, path: string, pathType: "relative" | "absolute" = "relative"): ProjectFile
    {
        let relativePath = path;
        if (pathType === "absolute")
            relativePath = Path.relative(root.path, path);
        let pathSlice = relativePath.split(Path.sep);
        let file = root;
        for (let i = 0; i < pathSlice.length; i++)
        {
            file = file.children.filter(f => f.name === pathSlice[i])[0];
        }
        return file;
    }

    public static orderFiles(files: ProjectFile[]): ProjectFile[]
    {
        return linq.from(files)
            .orderBy(f => f.type === "folder" ? "0" + f.name : f.name)
            .toArray();
    }
}
async function ScanFilesRecursive(rootPath: string, ignore: RegExp): Promise<ProjectFile[]>
{
    let files = await ScanFiles(rootPath, ignore);
    await foreachAsync(files.filter(f => f.type === "folder"), async (f) => f.children = await ScanFilesRecursive(f.path, ignore));
    /*files
        .filter(f => f.type === "folder")
        .forEach(async (f) => f.children = await ScanFilesRecursive(f.path, ignore));*/
    return files;
}
async function ScanFiles(directory: string, ignore:RegExp): Promise<ProjectFile[]>
{
    let files = await promisify(fs.readdir)(directory);
    return ProjFile.orderFiles(
        linq.from(files)
        .where(f => !ignore.test(f))
        .select(f =>
        {
            let p = Path.join(directory, f);
            let isDir = fs.statSync(p).isDirectory();
            return <ProjectFile>{
                name: f,
                type: isDir ? "folder" : "file",
                path: Path.join(directory, f),
                children: isDir ? [] : null
            };
        })
        .toArray());
}
function watchFile(file: ProjectFile, ignore: RegExp, callback: FileWatchCallback)
{
    if (file.type !== "folder")
        return;
    if (file.watcher)
        file.watcher.close();
    file.watcher = fs.watch(file.path, { recursive: true }, async (event, filename: string) =>
    {
        if (event === "change")
            return;
        let fullname = Path.resolve(Path.join(file.path, filename));
        let name = Path.basename(fullname);
        let parentFolder = ProjFile.getDirectory(file, filename);
        let subFiles = await ScanFiles(parentFolder.path, ignore);
        let oldChildrens = parentFolder.children;
        parentFolder.children = subFiles;
        
        if (subFiles.length > oldChildrens.length)
            callback("add", null, linq.from(subFiles).where(f => f.name === name).firstOrDefault());
        else if (subFiles.length < oldChildrens.length)
            callback("delete", linq.from(oldChildrens).where(f => f.name === name).firstOrDefault(), null);
        else if (subFiles.length == oldChildrens.length)
        {
            let diffReslt = diffFiles(oldChildrens, subFiles);
            if (!diffReslt)
                return;
            if (diffReslt.operation === "change")
                callback("rename", diffReslt.oldItem, diffReslt.newItem);

            //callback("rename", linq.from(oldChildrens).where(f=>f.name === ))
        }
    });
}
function watchFilesRecursive(file: ProjectFile, ignore: RegExp, callback: FileWatchCallback)
{
    if (file.type !== "folder")
        return;
    if (file.watcher)
        file.watcher.close();
    file.watcher = fs.watch(file.path, { recursive: false }, async (event, filename: string) =>
    {
        if (event === "change")
            return;
        let newName = Path.basename(filename);
        let oldChildrens = file.children;
        let subFiles = await ScanFiles(file.path, ignore);
        file.children = subFiles;

        if (subFiles.length > oldChildrens.length)
            callback("add", null, linq.from(subFiles).where(f => f.name === newName).firstOrDefault());
        else if (subFiles.length < oldChildrens.length)
            callback("delete", linq.from(oldChildrens).where(f => f.name === newName).firstOrDefault(), null);
        else if (subFiles.length == oldChildrens.length)
        {
            let diffReslt = diffFiles(oldChildrens, subFiles);
            if (diffReslt.operation === "change")
                callback("rename", diffReslt.oldItem, diffReslt.newItem);
            
            //callback("rename", linq.from(oldChildrens).where(f=>f.name === ))
        }
        file.children = subFiles;
    });
    if (file.children)
        file.children.filter(child => child.type === "folder").forEach(f => watchFilesRecursive(f, ignore, callback));
}