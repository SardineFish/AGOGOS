import npm from "npm";
import { IPackageJSON } from "./package-json";
import Path from "path";
import fs, { exists, statSync, stat } from "fs";
import { jsonIgnore } from "./meta-data";
import { JSONStringrify, diffFiles, foreachAsync, locateDirectory } from "./lib";
import { promisify } from "util";
import linq from "linq";

type FileWatchCallback = (operation: "add" | "delete" | "rename", oldFile?: ProjectFile, newFile?: ProjectFile) => void;

const PackageJSONFile = "package.json";
const AGOGOSFolder = ".agogos";

export class AGOGOSProject extends IPackageJSON
{
    @jsonIgnore(true)
    public projectDirectory: string = "/";
    @jsonIgnore(true)
    public projectFiles: ProjectFile;

    public fileWatchCallback: FileWatchCallback;

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
        await this.checkAGOGOSFolder();
        await this.scanFiles();
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
export interface ProjectFile
{
    name: string;
    type: "file" | "folder" | string;
    path: string;
    children?: ProjectFile[];
    watcher?: fs.FSWatcher;
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
    return linq.from(files)
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
        .orderBy(f => f.type === "folder" ? 0 : 1)
        .toArray();
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
        let parentFolder = locateDirectory(file, fullname);
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