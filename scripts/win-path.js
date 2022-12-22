const winPath = function (path) {
    const isExtendedLengthPath = /^\\\\\?\\/.test(path);
    if (isExtendedLengthPath) {
        return path;
    }

    return path.replace(/\\/g, '/');
};

module.exports = winPath;
