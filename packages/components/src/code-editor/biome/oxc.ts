import initWasm, { Oxc, OxcCodegenOptions, OxcLinterOptions, OxcMinifierOptions, OxcParserOptions, OxcRunOptions, OxcTypeCheckingOptions } from '@qlin/oxc-wasm-web';

function convertToUtf8(sourceTextUtf8: Uint8Array, d: number) {
    return new TextDecoder().decode(sourceTextUtf8.slice(0, d)).length;
};

export class OxcWrap {
    oxc: Oxc;
    runOptions = new OxcRunOptions();
    linterOptions = new OxcLinterOptions();
    parserOptions = new OxcParserOptions();
    codegenOptions = new OxcCodegenOptions();
    minifierOptions = new OxcMinifierOptions();
    typeCheckOptions = new OxcTypeCheckingOptions();

    sourceTextUtf8: Uint8Array;
    constructor() {
        this.initOxc();
    }

    async initOxc() {
        try {
            await initWasm();
            this.oxc = new Oxc();

            this.runOptions.syntax = true;
            this.runOptions.lint = true;
            this.parserOptions.allowReturnOutsideFunction = true;
        }
        catch (error) {
            console.error(error);
        }
    }

    runOxc(sourceText: string) {
        if (!this.oxc)
            return;
        this.oxc.sourceText = sourceText;
        this.sourceTextUtf8 = new TextEncoder().encode(sourceText);
        this.oxc.run(
            this.runOptions,
            this.parserOptions,
            this.linterOptions,
            this.codegenOptions,
            this.minifierOptions,
            this.typeCheckOptions,
        );
    }

    getDiagnostics() {
        const diagnostics = (this.oxc ? this.oxc.getDiagnostics() : []).map(d => ({
            from: convertToUtf8(this.sourceTextUtf8, d.start),
            to: convertToUtf8(this.sourceTextUtf8, d.end),
            severity: d.severity.toLowerCase(),
            message: d.message,
        }));
        return diagnostics;
    }
}
