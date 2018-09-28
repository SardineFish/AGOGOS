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
const PackageJSONFile = "package.json";
class AGOGOSProject extends package_json_1.IPackageJSON {
    constructor(path) {
        super();
        this.projectDirectory = "/";
        this.projectDirectory = path;
    }
    get packageJSONPath() { return path_1.default.join(this.projectDirectory, PackageJSONFile); }
    open() {
        return new Promise((resolve, reject) => {
            fs_1.default.readFile(this.packageJSONPath, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                let packageJson = JSON.parse(data.toString());
                for (const key in packageJson) {
                    if (packageJson.hasOwnProperty(key)) {
                        this[key] = packageJson[key];
                    }
                }
                resolve(this);
            });
        });
    }
    init(name) {
        return new Promise((resolve, reject) => {
            if (fs_1.default.existsSync(this.packageJSONPath))
                reject(new Error("Project existed."));
            this.name = name;
            return this.save()
                .then(resolve)
                .catch(reject);
        });
    }
    save() {
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(this.packageJSONPath, lib_1.JSONStringrify(this), (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this);
            });
        });
    }
}
__decorate([
    meta_data_1.jsonIgnore(true)
], AGOGOSProject.prototype, "projectDirectory", void 0);
exports.AGOGOSProject = AGOGOSProject;
//# sourceMappingURL=project.js.map