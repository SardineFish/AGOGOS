import typescript from "typescript";
import Path from "path";
import { promisify } from "util";
import fs from "fs";
import { ProcessIPC } from "./ipc";

//console.log("ready");

export const CompilerIpc = {
    Init: "init",
    Compile: "compile",
    StartWatch: "start-watch",
    EndWatch: "end-watch",
    Diagnostic: "on-diagnostic",
    Status: "on-status"
};

let ipc = new ProcessIPC(process);
let compiler: TSCompiler;
ipc.add("init", init);

async function init(root: string, out: string): Promise<void>
{
    compiler = new TSCompiler(root, out);
    await compiler.init();

    ipc.add(CompilerIpc.Compile, () =>
    {
        return compiler.compile();
    });
    ipc.add(CompilerIpc.StartWatch, () => compiler.startWatch());
}

export interface CompilerDiagnostic
{
    code: number;
    message: string;
    file?: string;
    line?: number;
    
}

class TSCompiler
{
    public ts: typescript.Program;
    public srcDirectory: string;
    public outDirectory: string;
    public tsConfig: typescript.CompilerOptions;
    public get configPath() { return Path.resolve(this.srcDirectory, "tsconfig.json"); }
    private formatHost: typescript.FormatDiagnosticsHost;
    constructor(srcDir: string, outDir: string)
    {
        this.srcDirectory = srcDir;
        this.outDirectory = outDir;
        this.tsConfig = {
            target: typescript.ScriptTarget.ESNext,
            module: typescript.ModuleKind.CommonJS,
            strict: true,
            strictNullChecks: false,
            outDir: outDir,
            rootDir: srcDir,
            experimentalDecorators: true
        };
        this.ts = typescript.createProgram([this.srcDirectory], this.tsConfig);
        this.formatHost = {
            getCanonicalFileName: path => path,
            getCurrentDirectory: ()=>this.srcDirectory,
            getNewLine: () => typescript.sys.newLine
        };
    }
    public async init(): Promise<TSCompiler>
    {
        if (!await promisify(fs.exists)(this.configPath))
        {
            await promisify(fs.writeFile)(this.configPath, JSON.stringify({
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
        this.tsConfig = typescript.parseJsonConfigFileContent(
            typescript.readConfigFile(this.configPath, typescript.sys.readFile).config,
            typescript.sys,
            this.srcDirectory
        ).options;
        return this;
    }
    startWatch()
    {
        const reportDiagnostic = (diagnostic: typescript.Diagnostic) =>
        {
            ipc.call(CompilerIpc.Diagnostic, typescript.formatDiagnostic(diagnostic, this.formatHost));
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
        const reportWatchStatusChanged = (diagnostic: typescript.Diagnostic) =>
        {
            ipc.call(CompilerIpc.Status, typescript.formatDiagnostic(diagnostic, this.formatHost));
            //console.info(typescript.formatDiagnostic(diagnostic, formatHost));
        };


        let parseResult = typescript.parseJsonConfigFileContent(
            typescript.readConfigFile(this.configPath, typescript.sys.readFile).config,
            typescript.sys,
            this.srcDirectory
        );
        let rootFileNames = parseResult.fileNames;



        let createProgram = typescript.createSemanticDiagnosticsBuilderProgram;
        const host = typescript.createWatchCompilerHost(
            rootFileNames,
            parseResult.options,
            typescript.sys,
            createProgram,
            reportDiagnostic,
            reportWatchStatusChanged
        );

        // You can technically override any given hook on the host, though you probably
        // don't need to.
        // Note that we're assuming `origCreateProgram` and `origPostProgramCreate`
        // doesn't use `this` at all.
        const origCreateProgram = host.createProgram;
        host.createProgram = (
            rootNames: ReadonlyArray<string>,
            options,
            host,
            oldProgram
        ) =>
        {
            //console.log("** We're about to create the program! **");
            return origCreateProgram(rootNames, options, host, oldProgram);
        };
        const origPostProgramCreate = host.afterProgramCreate;
        host.afterProgramCreate = program =>
        {
            //console.log("** We finished making the program! **");
            origPostProgramCreate!(program);
        };

        // `createWatchProgram` creates an initial program, watches files, and updates
        // the program over time.
        typescript.createWatchProgram(host);
    }
    compile(): ReadonlyArray<typescript.Diagnostic>
    {
        let parseResult = typescript.parseJsonConfigFileContent(
            typescript.readConfigFile(this.configPath, typescript.sys.readFile).config,
            typescript.sys,
            this.srcDirectory
        );

        let compileHost = typescript.createCompilerHost(parseResult.options);

        this.ts = typescript.createProgram({
            rootNames: parseResult.fileNames,
            options: parseResult.options,
            host: compileHost,

        });
        let emitResult = this.ts.emit();
        return emitResult.diagnostics;

    }
}