/* eslint-disable @typescript-eslint/no-var-requires */
const chokidar = require('chokidar');
const { getNeedCompilePkg, getResourcePath } = require('./build-shard');

let watcher;
function watch(callback) {
    if (watcher) {
        watcher.on('add', callback).on('change', callback);
    } else {
        const pkgs = getNeedCompilePkg();
        watcher = chokidar.watch(pkgs.map(getResourcePath), {
            ignoreInitial: true,
        });
        watcher.on('add', callback).on('change', callback);
    }
}

module.exports = {
    watch,
};
