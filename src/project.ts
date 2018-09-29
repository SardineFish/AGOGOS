import npm from "npm";
import { IPackageJSON } from "./package-json";
import path from "path";
import fs, { exists, statSync, stat } from "fs";
import { jsonIgnore } from "./meta-data";
import { JSONStringrify } from "./lib";

const PackageJSONFile = "package.json";
const AGOGOSFolder = ".agogos";

export class AGOGOSProject extends IPackageJSON
{
    @jsonIgnore(true)
    public projectDirectory: string = "/";
    get packageJSONPath() { return path.join(this.projectDirectory, PackageJSONFile); }
    get agogosFolder() { return path.join(this.projectDirectory, AGOGOSFolder); }
    constructor(path: string)
    {
        super();
        this.projectDirectory = path;
    }
    public open(): Promise<AGOGOSProject>
    {
        return new Promise((resolve, reject) =>
        {
            fs.readFile(this.packageJSONPath, (err, data) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                let packageJson = JSON.parse(data.toString());
                for (const key in packageJson)
                {
                    if (packageJson.hasOwnProperty(key))
                    {
                        this[key] = packageJson[key];
                    }
                }
                this.checkAGOGOSFolder().then(resolve);
            });
        });
    }
    public checkAGOGOSFolder(): Promise<AGOGOSProject>
    {
        return new Promise((resolve, reject) =>
        {
            fs.exists(this.agogosFolder, exists =>
            {
                if (!exists)
                    fs.mkdir(this.agogosFolder, err =>
                    {
                        if (err)
                        {
                            reject(err);
                            return;
                        }
                        resolve(this);
                    });
                else
                    fs.stat(this.agogosFolder, (err, stats) =>
                    {
                        if (err)
                            reject(err);
                        else if (!stats.isDirectory())
                            reject(new Error("Invalid project."));
                        else
                            resolve(this);
                    });
            }) 
        });
    }
    public init(name: string): Promise<AGOGOSProject>
    {
        return new Promise((resolve, reject) =>
        {
            if (fs.existsSync(this.packageJSONPath))
                reject(new Error("Project existed."));
            this.name = name;
            return this.save()
                .then(resolve)
                .catch(reject);
        });
    }
    public save(): Promise<AGOGOSProject>
    {
        return new Promise((resolve, reject) =>
        {
            fs.writeFile(this.packageJSONPath, JSONStringrify(this), (err) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                resolve(this);
            });
        });
    }
}