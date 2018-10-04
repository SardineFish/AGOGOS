var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
System.register("src/package-json", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var IPackageJSON;
    return {
        setters: [],
        execute: function () {
            IPackageJSON = class IPackageJSON extends Object {
            };
            exports_1("IPackageJSON", IPackageJSON);
        }
    };
});
System.register("src/meta-data", ["reflect-metadata"], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    function DectatorFactory(name, dataWrapper = v => v) {
        const metadataKey = Symbol(name);
        return [
            (value) => Reflect.metadata(metadataKey, value),
            (target, propKey) => Reflect.getMetadata(metadataKey, target, propKey)
        ];
    }
    function type(typeName) {
        return Reflect.metadata(typeMetadataKey, typeName);
    }
    exports_2("type", type);
    function getType(target, propertyKey) {
        return Reflect.getMetadata(typeMetadataKey, target, propertyKey);
    }
    exports_2("getType", getType);
    var typeMetadataKey, BuildinTypes, _a, jsonIgnore, getJsonIgnore;
    return {
        setters: [
            function (_1) {
            }
        ],
        execute: function () {
            typeMetadataKey = Symbol("type");
            (function (BuildinTypes) {
                BuildinTypes["string"] = "string";
                BuildinTypes["number"] = "number";
                BuildinTypes["boolean"] = "boolean";
                BuildinTypes["object"] = "object";
            })(BuildinTypes || (BuildinTypes = {}));
            exports_2("BuildinTypes", BuildinTypes);
            _a = DectatorFactory("jsonIgnore"), jsonIgnore = _a[0], getJsonIgnore = _a[1];
            exports_2("jsonIgnore", jsonIgnore);
            exports_2("getJsonIgnore", getJsonIgnore);
        }
    };
});
System.register("src/project", ["src/package-json", "path", "fs", "src/meta-data", "src/lib", "util", "linq"], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
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
            if (subFiles.length > file.children.length)
                callback("add", null, linq_1.default.from(subFiles).where(f => f.name === newName).firstOrDefault());
            else if (subFiles.length < file.children.length)
                callback("remove", linq_1.default.from(oldChildrens).where(f => f.name === newName).firstOrDefault(), null);
            else if (subFiles.length == file.children.length) {
                let old = linq_1.default.from(file.children).where(f => subFiles.map(sf => sf.name).includes(f.name)).firstOrDefault();
                //callback("rename", linq.from(oldChildrens).where(f=>f.name === ))
            }
            file.children = subFiles;
        });
        if (file.children)
            file.children.forEach(f => watchFilesRecursive(f, ignore, callback));
    }
    var package_json_1, path_1, fs_1, meta_data_1, lib_1, util_1, linq_1, PackageJSONFile, AGOGOSFolder, AGOGOSProject;
    return {
        setters: [
            function (package_json_1_1) {
                package_json_1 = package_json_1_1;
            },
            function (path_1_1) {
                path_1 = path_1_1;
            },
            function (fs_1_1) {
                fs_1 = fs_1_1;
            },
            function (meta_data_1_1) {
                meta_data_1 = meta_data_1_1;
            },
            function (lib_1_1) {
                lib_1 = lib_1_1;
            },
            function (util_1_1) {
                util_1 = util_1_1;
            },
            function (linq_1_1) {
                linq_1 = linq_1_1;
            }
        ],
        execute: function () {
            PackageJSONFile = "package.json";
            AGOGOSFolder = ".agogos";
            AGOGOSProject = class AGOGOSProject extends package_json_1.IPackageJSON {
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
                    return await this.startWatch(() => {
                        if (this.fileChangedCallback)
                            this.fileChangedCallback();
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
                    this.projectFiles.children = await ScanFilesRecursive(this.projectDirectory, /\..*/);
                    return this;
                }
                startWatch(callback) {
                    watchFilesRecursive(this.projectFiles, /\..*/, () => callback(this.projectFiles));
                    return this;
                }
            };
            __decorate([
                meta_data_1.jsonIgnore(true)
            ], AGOGOSProject.prototype, "projectDirectory", void 0);
            __decorate([
                meta_data_1.jsonIgnore(true)
            ], AGOGOSProject.prototype, "projectFiles", void 0);
            exports_3("AGOGOSProject", AGOGOSProject);
        }
    };
});
System.register("src/ipc", ["util", "electron"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    async function waitIpcRenderer(channel, timeout = 500) {
        return new Promise((resolve, reject) => {
            electron_1.ipcRenderer.once(channel, (event, args) => {
                resolve(args);
            });
            util_2.promisify(setTimeout)(timeout).then(() => reject(new Error("Ipc Timeout.")));
        });
    }
    exports_4("waitIpcRenderer", waitIpcRenderer);
    async function waitIpcMain(channel, timeout = 500) {
        return new Promise((resolve, reject) => {
            electron_1.ipcMain.once(channel, (event, args) => {
                resolve(args);
            });
            util_2.promisify(setTimeout)(timeout).then(() => reject(new Error("Ipc Timeout.")));
        });
    }
    exports_4("waitIpcMain", waitIpcMain);
    var util_2, electron_1, ChannelStartup, ChannelProjectSettings, ChannelFileChanged;
    return {
        setters: [
            function (util_2_1) {
                util_2 = util_2_1;
            },
            function (electron_1_1) {
                electron_1 = electron_1_1;
            }
        ],
        execute: function () {
            exports_4("ChannelStartup", ChannelStartup = "startup");
            exports_4("ChannelProjectSettings", ChannelProjectSettings = "proj-settings");
            exports_4("ChannelFileChanged", ChannelFileChanged = "file-chenged");
        }
    };
});
System.register("src/lib-renderer", ["electron", "src/ipc"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    function GetProjectSettings() {
        return electron_2.ipcRenderer.sendSync(ipc_1.ChannelProjectSettings);
    }
    exports_5("GetProjectSettings", GetProjectSettings);
    function PopupProjectMenu(context) {
        Menu.buildFromTemplate([
            {
                label: "New File",
            },
            {
                label: "New Folder",
            },
            {
                label: "Rename"
            }
        ]).popup({});
    }
    exports_5("PopupProjectMenu", PopupProjectMenu);
    function diffProjectFilesRenderer(files, fileNode) {
        for (let i = 0; i < files.children.length; i++) {
            for (let j = 0; j < fileNode.children.length; j++) {
            }
        }
    }
    exports_5("diffProjectFilesRenderer", diffProjectFilesRenderer);
    var electron_2, ipc_1, Menu, PropertyData, ProcessNodeData, ObjectData;
    return {
        setters: [
            function (electron_2_1) {
                electron_2 = electron_2_1;
            },
            function (ipc_1_1) {
                ipc_1 = ipc_1_1;
            }
        ],
        execute: function () {
            Menu = electron_2.remote.Menu;
            PropertyData = class PropertyData {
            };
            exports_5("PropertyData", PropertyData);
            ProcessNodeData = class ProcessNodeData {
                constructor() {
                    this.properties = new Map();
                }
            };
            exports_5("ProcessNodeData", ProcessNodeData);
            ObjectData = class ObjectData {
                constructor() {
                    this.properties = new Map();
                }
            };
            exports_5("ObjectData", ObjectData);
        }
    };
});
System.register("src/lib", ["src/meta-data", "linq"], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    function ObjectCast(obj) {
        let out = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && !meta_data_2.getJsonIgnore(obj, key)) {
                const element = obj[key];
                if (element instanceof Object)
                    out[key] = ObjectCast(element);
                else
                    out[key] = element;
            }
        }
        return out;
    }
    function JSONStringrify(obj) {
        return JSON.stringify(ObjectCast(obj));
    }
    exports_6("JSONStringrify", JSONStringrify);
    function diffFiles(oldFiles, newFiles) {
        oldFiles = linq_2.default.from(oldFiles).orderBy(f => f.name).toArray();
        newFiles = linq_2.default.from(newFiles).orderBy(f => f.name).toArray();
    }
    exports_6("diffFiles", diffFiles);
    function diff(listOld, listNew) {
        let valueGraph = [];
        let operate = [];
        let ans = [];
        for (let i = 0; i <= listOld.length; i++) {
            valueGraph[i] = [];
            operate[i] = [];
            for (let j = 0; j <= listNew.length; j++) {
                valueGraph[i][j] = Number.MAX_SAFE_INTEGER;
            }
        }
        valueGraph[0][0] = 0;
        for (let k = 0; k < listOld.length + listNew.length; k++) {
            for (let i = 0, j = k; i <= k && j >= 0; i++, j--) {
                if (listOld[i] === listOld[j]) {
                    valueGraph[i + 1][j + 1] = valueGraph[i][j];
                    operate[i][j] = "keep";
                }
                if (valueGraph[i + 1][j] >= valueGraph[i][j] + 1) {
                    valueGraph[i + 1][j] = valueGraph[i][j] + 1;
                    operate[i + 1][j] = "remove";
                }
                if (valueGraph[i][j + 1] > valueGraph[i][j] + 1) {
                    valueGraph[i][j + 1] = valueGraph[i][j] + 1;
                    operate[i][j + 1] = "add";
                }
            }
        }
        for (let i = listOld.length, j = listNew.length; i > 0 && j > 0;) {
            switch (operate[i][j]) {
                case "keep":
                    i--, j--;
                    break;
                case "remove":
                    ans.push({ oldItem: listOld[i--], operation: "remove" });
                    break;
                case "add":
                    ans.push({ newItem: listNew[j--], operation: "add" });
            }
        }
        return ans.reverse();
    }
    exports_6("diff", diff);
    var meta_data_2, linq_2, Vector2, vec2;
    return {
        setters: [
            function (meta_data_2_1) {
                meta_data_2 = meta_data_2_1;
            },
            function (linq_2_1) {
                linq_2 = linq_2_1;
            }
        ],
        execute: function () {
            Vector2 = class Vector2 {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                }
                static plus(u, v) {
                    return vec2(u.x + v.x, u.y + v.y);
                }
                static minus(u, v) {
                    return vec2(u.x - v.x, u.y - v.y);
                }
            };
            exports_6("Vector2", Vector2);
            exports_6("vec2", vec2 = (x, y) => new Vector2(x, y));
        }
    };
});
System.register("test/diffTest", ["src/lib"], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var lib_2, ans;
    return {
        setters: [
            function (lib_2_1) {
                lib_2 = lib_2_1;
            }
        ],
        execute: function () {
            lib_2.diff;
            ans = lib_2.diff([1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 2, 3, 4, 5, 6, 6, 6, 8, 7]);
            console.log(ans);
        }
    };
});
