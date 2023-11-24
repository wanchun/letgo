import type { IPublicTypeIconSchema } from '@harrywan/letgo-types';

export function getSvgSymbol(iconSchema: IPublicTypeIconSchema) {
    const svgMarkup = iconSchema.svg;

    const symbolElem = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
    const node = document.createElement('div'); // Create any old element
    node.innerHTML = svgMarkup;

    // Grab the inner HTML and move into a symbol element
    symbolElem.innerHTML = node.querySelector('svg')!.innerHTML;
    symbolElem.setAttribute('viewBox', node.querySelector('svg')!.getAttribute('viewBox')!);
    symbolElem.id = iconSchema.name;

    return symbolElem?.outerHTML;
}

export function getIconSprite(icons: IPublicTypeIconSchema[]) {
    const svg = document.createElement('svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.overflow = 'hidden';
    svg.innerHTML = `${icons.map(icon => getSvgSymbol(icon)).join('')}`;
    return svg.outerHTML;
}

export function insertIconSprite(icons: IPublicTypeIconSchema[]) {
    const svgs = getIconSprite(icons);
    const wrap = document.createElement('div');
    wrap.innerHTML = svgs;
    const svg = wrap.getElementsByTagName('svg')[0];
    if (!svg)
        return;
    document.body.insertBefore(svg, document.body.firstChild);
}
