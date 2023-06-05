const chokidar = require('chokidar');
const { getNeedCompilePkg, getResourcePath } = require('./build-shard');

let watcher;

function watch(callback, removeCallback) {
    if (!watcher) {
        const pkgs = getNeedCompilePkg();

        watcher = chokidar.watch(pkgs.map(getResourcePath), {
            interval: 200,
            ignoreInitial: true,
        });
    }
    watcher.on('add', callback).on('change', callback);
    if (removeCallback)
        watcher.on('unlink', removeCallback);
}

module.exports = {
    watcher,
    watch,
};
