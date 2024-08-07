import { EventEmitter } from 'eventemitter3';

const emitter = new EventEmitter();

export type LogLevel = 'debug' | 'log' | 'info' | 'warn' | 'error';
export enum LogIdType {
    COMPONENT = 'component',
    CODE = 'code',
    STATIC = 'static',
};

interface Options {
    outputToConsole?: boolean;
    belong: string;
}

const defaultOptions: Options = {
    outputToConsole: false,
    belong: '*',
};

interface LogDetail {
    msg: unknown;
    idType?: LogIdType;
    id?: string;
    paths?: string[];
    content?: string | Record<string, any>;
    paramIndex?: number;
}

type LogParams = string | LogDetail;

export interface LogContent extends LogDetail {
    level: LogLevel;
    belong: string;
    time: number;
}

class Logger {
    belong: string;
    outputToConsole: boolean;
    constructor(options: Options) {
        options = { ...defaultOptions, ...options };
        this.belong = options.belong;
        this.outputToConsole = options.outputToConsole;
    }

    private emitLog(level: LogLevel, data: LogParams) {
        const log: LogContent = {
            level,
            belong: this.belong,
            ...(typeof data === 'string' ? { msg: data } : data),
            time: Date.now(),
        };
        emitter.emit('log', log, this.outputToConsole);
    }

    debug(data: LogParams): void {
        this.emitLog('debug', data);
    }

    log(data: LogParams): void {
        this.emitLog('log', data);
    }

    info(data: LogParams): void {
        this.emitLog('info', data);
    }

    warn(data: LogParams): void {
        this.emitLog('warn', data);
    }

    error(data: LogParams | Error): void {
        if (data instanceof Error) {
            this.emitLog('error', {
                msg: data,
            });
        }
        else {
            this.emitLog('error', data);
        }
    }
}

export { Logger };

export function onLogger(fn: (log: LogContent, outputToConsole: boolean) => void) {
    emitter.on('log', fn);
    return () => {
        emitter.off('log', fn);
    };
}

export function getLogger(config: Options): Logger {
    return new Logger(config);
}
