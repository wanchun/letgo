export function inlineToExtract() {
    return {
        name: 'inline-to-extract',
        generateBundle(options_, bundle) {
            let cssFileName = '';
            let needInjectCssBundle = null;
            Object.keys(bundle).forEach((name) => {
                const bundleItem = bundle[name];
                if (name.includes('.css'))
                    cssFileName = name;

                else needInjectCssBundle = bundleItem;
            });

            if (!cssFileName && needInjectCssBundle) {
                needInjectCssBundle.importedBindings = Object.keys(needInjectCssBundle.importedBindings).reduce((acc, key) => {
                    const value = needInjectCssBundle.importedBindings[key];
                    if (key.endsWith('.less'))
                        key = key.replace('.less', '.css');

                    acc[key] = value;
                    return acc;
                }, {});
                needInjectCssBundle.imports = needInjectCssBundle.imports.map((item) => {
                    if (item.endsWith('.less'))
                        return item.replace('.less', '.css');

                    return item;
                });
                needInjectCssBundle.code = needInjectCssBundle.code.replaceAll('.less', '.css');
            }

            if (cssFileName && needInjectCssBundle) {
                const cssPath = `./${cssFileName}`;
                needInjectCssBundle.importedBindings[cssPath] = [];
                needInjectCssBundle.imports.push(cssPath);
                needInjectCssBundle.code = `import '${cssPath}';\n${needInjectCssBundle.code}`;
            }
        },
    };
}
