import { uniqueId } from './unique-id';

export function genEventId() {
    return uniqueId('event');
}
