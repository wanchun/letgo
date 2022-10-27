/* eslint-disable @typescript-eslint/no-var-requires */
const chokidar = require('chokidar');
const { getNeedCompilePkg, getResourcePath } = require('./build-shard');

function watch(callback) {
    const pkgs = getNeedCompilePkg();
    const watcher = chokidar.watch(pkgs.map(getResourcePath), {
        ignoreInitial: true,
    });
    watcher.on('add', callback).on('change', callback);
}

module.exports = {
    watch,
};
