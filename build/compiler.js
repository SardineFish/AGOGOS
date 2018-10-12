"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const ipc_1 = require("./ipc");
console.log("ready");
let ipc = new ipc_1.IPCClient(process);
let compiler;
ipc.add("init", init);
async function init(root, out) {
    compiler = new TSCompiler(root, out);
    await compiler.init();
    ipc.add("compile", () => {
        return compiler.compile();
    });
}
class TSCompiler {
    get configPath() { return path_1.default.resolve(this.srcDirectory, "tsconfig.json"); }
    constructor(srcDir, outDir) {
        this.srcDirectory = srcDir;
        this.outDirectory = outDir;
        this.tsConfig = {
            target: typescript_1.default.ScriptTarget.ESNext,
            module: typescript_1.default.ModuleKind.CommonJS,
            strict: true,
            strictNullChecks: false,
            outDir: outDir,
            rootDir: srcDir,
            experimentalDecorators: true
        };
        this.ts = typescript_1.default.createProgram([this.srcDirectory], this.tsConfig);
    }
    async init() {
        if (!await util_1.promisify(fs_1.default.exists)(this.configPath)) {
            await util_1.promisify(fs_1.default.writeFile)(this.configPath, JSON.stringify({
                compilerOptions: {
                    target: "esnext",
                    module: "commonjs",
                    strict: true,
                    strictNullChecks: false,
                    outDir: this.outDirectory,
                    rootDir: this.srcDirectory,
                    experimentalDecorators: true
                },
            }));
        }
        this.tsConfig = typescript_1.default.parseJsonConfigFileContent(typescript_1.default.readConfigFile(this.configPath, typescript_1.default.sys.readFile).config, typescript_1.default.sys, this.srcDirectory).options;
        return this;
    }
    startWatch() {
        let createProgram = typescript_1.default.createSemanticDiagnosticsBuilderProgram;
    }
    compile() {
        let parseResult = typescript_1.default.parseJsonConfigFileContent(typescript_1.default.readConfigFile(this.configPath, typescript_1.default.sys.readFile).config, typescript_1.default.sys, this.srcDirectory);
        let compileHost = typescript_1.default.createCompilerHost(parseResult.options);
        this.ts = typescript_1.default.createProgram({
            rootNames: parseResult.fileNames,
            options: parseResult.options,
            host: compileHost,
        });
        let emitResult = this.ts.emit();
        return emitResult.diagnostics;
    }
}
//# sourceMappingURL=compiler.js.map