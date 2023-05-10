function inlineToExtract() {
    return {
        name: 'inline-to-extract',
        generateBundle(options_, bundle) {
            let cssFileName = '';
            let needInjectCssBundle = null;
            Object.keys(bundle).forEach((name) => {
                const bundleItem = bundle[name];
                if (name.includes('.css'))
                    cssFileName = name;

                else
                    needInjectCssBundle = bundleItem;
            });

            if (cssFileName && needInjectCssBundle) {
                const cssPath = `./${cssFileName}`;
                needInjectCssBundle.importedBindings[cssPath] = [];
                needInjectCssBundle.imports.push(cssPath);
                needInjectCssBundle.code = `import '${cssPath}';\n${needInjectCssBundle.code}`;
            }
        },
    };
}

module.exports = inlineToExtract;
