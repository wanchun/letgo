export function invariant(check: any, message: string, thing?: any) {
    if (!check) {
        throw new Error(
            `[engine] Invariant failed: ${message}${
                thing ? ` in '${thing}'` : ''
            }`,
        );
    }
}
