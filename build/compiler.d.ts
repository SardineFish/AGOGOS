export declare const CompilerIpc: {
    Init: string;
    Compile: string;
    StartWatch: string;
    EndWatch: string;
    Diagnostic: string;
    Status: string;
    PostCompile: string;
};
export interface CompilerDiagnostic {
    code: number;
    message: string;
    file?: string;
    line?: number;
}
export interface CompileResult {
    files: string[];
}
