import type { LogContent } from '@webank/letgo-common';
import { uniqueId } from '@webank/letgo-common';

export interface FormattedLog extends LogContent {
    formattedMsg: string;
}

function isError(e: any): e is Error {
    return e && e.name && e.message && typeof e.stack === 'string';
}

function formatMsg(log: LogContent) {
    let msg = '';
    if (log.idType)
        msg += `[${log.id}]: `;

    if (isError(log.msg))
        msg += `${log.msg.name} ${log.msg.message}`;
    else
        msg += JSON.stringify(log.msg);

    return msg;
}

export function formatLog(log: LogContent): FormattedLog {
    const newLog: FormattedLog = {
        ...log,
        formattedMsg: formatMsg(log),
    };

    if (!newLog.id)
        newLog.id = uniqueId('log');

    return newLog;
}
