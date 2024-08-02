import type { LogContent } from '@webank/letgo-common';
import { uniqueId } from '@webank/letgo-common';

export interface FormattedLog extends LogContent {
    _id: string;
    formattedMsg: string;
}

function isError(e: any): e is Error {
    return e && e.name && e.message && typeof e.stack === 'string';
}

function formatMsg(log: LogContent) {
    let prefix = '';
    if (log.idType) {
        const paths = log.paths ? `.${log.paths.join('.')}` : '';
        prefix += `[ ${log.id}${paths} ]`;
    }

    if (isError(log.msg))
        prefix += ` [ ${log.msg.name} ]：`;
    else if (prefix)
        prefix += `：`;

    let msg: string | unknown;
    if (isError(log.msg))
        msg = log.msg.message;
    else if (typeof log.msg === 'object')
        msg = JSON.stringify(log.msg);
    else
        msg = log.msg;

    return `${prefix} ${msg}`;
}

export function formatLog(log: LogContent): FormattedLog {
    const newLog: FormattedLog = {
        ...log,
        _id: `${log.id}_${uniqueId('log')}`,
        formattedMsg: formatMsg(log),
    };

    return newLog;
}
