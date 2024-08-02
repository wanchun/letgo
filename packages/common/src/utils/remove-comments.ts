export function removeComments(code: string) {
    // Takes a string of code, not an actual function.
    return code.replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*/g, '').trim();// Strip comments
}
