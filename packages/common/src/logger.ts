import { EventEmitter } from 'eventemitter3';

const emitter = new EventEmitter();

export type Level = 'debug' | 'log' | 'info' | 'warn' | 'error';
interface Options {
    belong: string;
}

const defaultOptions: Options = {
    belong: '*',
};

/**
 * code
 * 1xx 引擎
 * 2xx 插件
 * 3xx 渲染器
 * 8xx 自定义异常
 */
type LogParams = string | {
    msg: string | Error;
    code?: string;
    [key: string]: string | Error;
};

export interface LogContent {
    level: Level;
    belong: string;
    msg: string | Error;
    time: number;
    code?: string;
    [key: string]: string | number | Error;
}

class Logger {
    belong: string;
    constructor(options: Options) {
        options = { ...defaultOptions, ...options };
        this.belong = options.belong;
    }

    private emitLog(level: Level, data: LogParams) {
        const log: LogContent = {
            level,
            belong: this.belong,
            ...(typeof data === 'string' ? { msg: data } : data),
            time: Date.now(),
        };
        emitter.emit('log', log);
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

export function onLogger(fn: (log: LogContent) => void) {
    emitter.on('log', fn);
    return () => {
        emitter.off('log', fn);
    };
}

export function getLogger(config: { belong: string }): Logger {
    return new Logger(config);
}
