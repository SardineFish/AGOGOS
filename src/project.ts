import npm from "npm";
import { IPackageJSON } from "./package-json";
import path from "path";
import fs from "fs";
import { jsonIgnore } from "./meta-data";
import { JSONStringrify } from "./lib";

const PackageJSONFile = "package.json";

export class AGOGOSProject extends IPackageJSON
{
    @jsonIgnore(true)
    public projectDirectory: string = "/";
    get packageJSONPath() { return path.join(this.projectDirectory, PackageJSONFile); }
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
                resolve(this);
            });
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