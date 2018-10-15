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
//console.log("ready");
exports.CompilerIpc = {
    Init: "init",
    Compile: "compile",
    StartWatch: "start-watch",
    EndWatch: "end-watch",
    Diagnostic: "on-diagnostic",
    Status: "on-status",
    PostCompile: "post-compile"
};
let ipc = new ipc_1.ProcessIPC(process);
let compiler;
ipc.add("init", init);
async function init(root, out) {
    compiler = new TSCompiler(root, out);
    await compiler.init();
    ipc.add(exports.CompilerIpc.Compile, () => {
        return compiler.compile();
    });
    ipc.add(exports.CompilerIpc.StartWatch, () => compiler.startWatch());
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
        this.formatHost = {
            getCanonicalFileName: path => path,
            getCurrentDirectory: () => this.srcDirectory,
            getNewLine: () => typescript_1.default.sys.newLine
        };
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
        const reportDiagnostic = (diagnostic) => {
            ipc.call(exports.CompilerIpc.Diagnostic, typescript_1.default.formatDiagnostic(diagnostic, this.formatHost));
            /*console.error(
                "Error",
                diagnostic.code,
                ":",
                typescript.flattenDiagnosticMessageText(
                    diagnostic.messageText,
                    formatHost.getNewLine()
                )
            );*/
        };
        /**
         * Prints a diagnostic every time the watch status changes.
         * This is mainly for messages like "Starting compilation" or "Compilation completed".
         */
        const reportWatchStatusChanged = (diagnostic) => {
            ipc.call(exports.CompilerIpc.Status, typescript_1.default.formatDiagnostic(diagnostic, this.formatHost));
            //console.info(typescript.formatDiagnostic(diagnostic, formatHost));
        };
        let parseResult = typescript_1.default.parseJsonConfigFileContent(typescript_1.default.readConfigFile(this.configPath, typescript_1.default.sys.readFile).config, typescript_1.default.sys, this.srcDirectory);
        let rootFileNames = parseResult.fileNames;
        let createProgram = typescript_1.default.createSemanticDiagnosticsBuilderProgram;
        /*const host = typescript.createWatchCompilerHost(
            rootFileNames,
            parseResult.options,
            typescript.sys,
            createProgram,
            reportDiagnostic,
            reportWatchStatusChanged
        );*/
        const host = typescript_1.default.createWatchCompilerHost(this.configPath, {}, typescript_1.default.sys, createProgram, reportDiagnostic, reportWatchStatusChanged);
        // You can technically override any given hook on the host, though you probably
        // don't need to.
        // Note that we're assuming `origCreateProgram` and `origPostProgramCreate`
        // doesn't use `this` at all.
        const origCreateProgram = host.createProgram;
        host.createProgram = (rootNames, options, host, oldProgram) => {
            //console.log("** We're about to create the program! **");
            return origCreateProgram(rootNames, options, host, oldProgram);
        };
        const origPostProgramCreate = host.afterProgramCreate;
        host.afterProgramCreate = program => {
            //console.log(program.getProgram().getRootFileNames());
            //console.log("** We finished making the program! **");
            ipc.call(exports.CompilerIpc.PostCompile, {
                files: program.getProgram().getRootFileNames()
                    .map(f => path_1.default.relative(this.srcDirectory, f))
            });
            origPostProgramCreate(program);
        };
        // `createWatchProgram` creates an initial program, watches files, and updates
        // the program over time.
        typescript_1.default.createWatchProgram(host);
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