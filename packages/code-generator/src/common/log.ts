export interface Logger {
    warn: (msg: unknown) => void;
    error: (msg: unknown) => void;
}

let logger: Logger = console;

export function registerLogger(newLogger: Logger) {
    logger = newLogger;
}

export function logWarn(err: unknown) {
    logger.warn(err);
}

export function logError(err: unknown) {
    logger.error(err);
}
