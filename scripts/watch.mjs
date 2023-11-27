import chokidar from 'chokidar';
import { getNeedCompileEsPkg, getResourcePath } from './build-shard.mjs';

let watcher;

export function watch(callback, removeCallback) {
    if (!watcher) {
        const pkgs = getNeedCompileEsPkg();

        watcher = chokidar.watch(pkgs.map(getResourcePath), {
            interval: 200,
            ignoreInitial: true,
        });
    }
    watcher.on('add', callback).on('change', callback);
    if (removeCallback)
        watcher.on('unlink', removeCallback);
}
