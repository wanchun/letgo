export function isJsonFilename(filename: string): boolean {
    return filename.endsWith('.json');
}

export function getFileState(
    state: Pick<PlaygroundState, 'files'>,
    filename: string,
): PlaygroundFileState {
    return (
        state.files[filename] ?? {
            content: '',
            biome: emptyBiomeOutput,
        }
    );
}
