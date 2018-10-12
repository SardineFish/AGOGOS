import typescript from "typescript";
import Path from "path";
import { promisify } from "util";
import fs from "fs";
import { IPCClient } from "./ipc";

console.log("ready");

let ipc = new IPCClient(process);
let compiler: TSCompiler;
ipc.add("init", init);

async function init(root: string, out: string): Promise<void>
{
    compiler = new TSCompiler(root, out);
    await compiler.init();

    ipc.add("compile", () =>
    {
        return compiler.compile();
    });
}

class TSCompiler
{
    public ts: typescript.Program;
    public srcDirectory: string;
    public outDirectory: string;
    public tsConfig: typescript.CompilerOptions;
    public get configPath() { return Path.resolve(this.srcDirectory, "tsconfig.json"); }
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
        let createProgram = typescript.createSemanticDiagnosticsBuilderProgram;
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