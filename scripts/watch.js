/* eslint-disable @typescript-eslint/no-var-requires */
const chokidar = require('chokidar');
const { getNeedCompilePkg, getResourcePath } = require('./build-shard');

let watcher;

function watch(callback) {
    if (!watcher) {
        const pkgs = getNeedCompilePkg();

        watcher = chokidar.watch(pkgs.map(getResourcePath), {
            interval: 200,
            ignoreInitial: true,
        });
    }
    watcher.on('add', callback).on('change', callback);
}

module.exports = {
    watcher,
    watch,
};
