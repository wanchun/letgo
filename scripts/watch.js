/* eslint-disable @typescript-eslint/no-var-requires */
const chokidar = require('chokidar');
const { getNeedCompilePkg, getResourcePath } = require('./build-shard');

const pkgs = getNeedCompilePkg();

const watcher = chokidar.watch(pkgs.map(getResourcePath), {
    interval: 200,
    ignoreInitial: true,
});

function watch(callback) {
    watcher.on('add', callback).on('change', callback);
}

module.exports = {
    watcher,
    watch,
};
