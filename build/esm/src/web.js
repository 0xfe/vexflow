import { globalObject } from './util.js';
export function isHTMLCanvas(element) {
    if (!element)
        return false;
    const global = globalObject();
    return ((typeof global.HTMLCanvasElement === 'function' && element instanceof global.HTMLCanvasElement) ||
        (typeof element.getContext === 'function' && typeof element.toDataURL === 'function'));
}
export function isHTMLDiv(element) {
    if (!element)
        return false;
    const global = globalObject();
    return ((typeof global.HTMLDivElement === 'function' && element instanceof global.HTMLDivElement) ||
        (typeof element.appendChild === 'function' && typeof element.style === 'object'));
}
