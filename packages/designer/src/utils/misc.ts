import type { ISimulator } from '../types';

/**
 * make a handler that listen all sensors:document, avoid frame lost
 */
export function makeEventsHandler(
    boostEvent: MouseEvent | DragEvent,
    sensors: ISimulator[],
): (fn: (sDoc: Document) => void) => void {
    const topDoc = window.document;
    const sourceDoc = boostEvent.view?.document || topDoc;
    const docs = new Set<Document>();
    docs.add(topDoc);
    docs.add(sourceDoc);
    sensors.forEach((sim) => {
        const doc = sim.contentDocument;
        if (doc)
            docs.add(doc);
    });

    return (handle: (sDoc: Document) => void) => {
        docs.forEach(doc => handle(doc));
    };
}
