import { Font, FontStyle, FontWeight } from './font.js';
import { log } from './util.js';
function L(...args) {
    if (TextFormatter.DEBUG)
        log('Vex.Flow.TextFormatter', args);
}
const textWidthCache = {};
const textHeightCache = {};
const registry = {};
class TextFormatter {
    static getFontFamilies() {
        const registeredFonts = [];
        for (const fontFamily in registry) {
            const formatterInfo = registry[fontFamily];
            registeredFonts.push(Object.assign({}, formatterInfo));
        }
        return registeredFonts;
    }
    static create(requestedFont = {}) {
        L('create: ', requestedFont);
        if (!requestedFont.family) {
            requestedFont.family = Font.SANS_SERIF;
        }
        const candidates = [];
        const requestedFamilies = requestedFont.family.split(/\s*,\s*/);
        for (const requestedFamily of requestedFamilies) {
            for (const fontFamily in registry) {
                if (fontFamily.startsWith(requestedFamily)) {
                    candidates.push(registry[fontFamily]);
                }
            }
            if (candidates.length > 0) {
                break;
            }
        }
        let formatter;
        if (candidates.length === 0) {
            formatter = new TextFormatter(Object.values(registry)[0]);
        }
        else if (candidates.length === 1) {
            formatter = new TextFormatter(candidates[0]);
        }
        else {
            const bold = Font.isBold(requestedFont.weight);
            const italic = Font.isItalic(requestedFont.style);
            const perfectMatch = candidates.find((f) => f.bold === bold && f.italic === italic);
            if (perfectMatch) {
                formatter = new TextFormatter(perfectMatch);
            }
            else {
                const partialMatch = candidates.find((f) => f.italic === italic || f.bold === bold);
                if (partialMatch) {
                    formatter = new TextFormatter(partialMatch);
                }
                else {
                    formatter = new TextFormatter(candidates[0]);
                }
            }
        }
        const fontSize = requestedFont.size;
        if (typeof fontSize !== 'undefined') {
            const fontSizeInPt = Font.convertSizeToPointValue(fontSize);
            formatter.setFontSize(fontSizeInPt);
        }
        return formatter;
    }
    static getInfo(fontFamily) {
        return registry[fontFamily];
    }
    static registerInfo(info, overwrite = false) {
        L('registerInfo: ', info, overwrite);
        const fontFamily = info.family;
        const currFontInfo = registry[fontFamily];
        if (currFontInfo === undefined || overwrite) {
            registry[fontFamily] = info;
        }
    }
    constructor(formatterInfo) {
        this.family = '';
        this.size = 14;
        this.resolution = 1000;
        this.glyphs = {};
        this.serifs = false;
        this.monospaced = false;
        this.italic = false;
        this.bold = false;
        this.superscriptOffset = 0;
        this.subscriptOffset = 0;
        this.maxSizeGlyph = '@';
        this.cacheKey = '';
        this.updateParams(formatterInfo);
    }
    get localHeightCache() {
        var _a;
        if (textHeightCache[this.cacheKey] === undefined) {
            textHeightCache[this.cacheKey] = {};
        }
        return (_a = textHeightCache[this.cacheKey]) !== null && _a !== void 0 ? _a : {};
    }
    updateParams(params) {
        if (params.family)
            this.family = params.family;
        if (params.resolution)
            this.resolution = params.resolution;
        if (params.glyphs)
            this.glyphs = params.glyphs;
        if (params.serifs)
            this.serifs = params.serifs;
        if (params.monospaced)
            this.monospaced = params.monospaced;
        if (params.italic)
            this.italic = params.italic;
        if (params.bold)
            this.bold = params.bold;
        if (params.maxSizeGlyph)
            this.maxSizeGlyph = params.maxSizeGlyph;
        if (params.superscriptOffset)
            this.superscriptOffset = params.superscriptOffset;
        if (params.subscriptOffset)
            this.subscriptOffset = params.subscriptOffset;
        this.updateCacheKey();
    }
    updateCacheKey() {
        const family = this.family.replace(/\s+/g, '_');
        const size = this.size;
        const weight = this.bold ? FontWeight.BOLD : FontWeight.NORMAL;
        const style = this.italic ? FontStyle.ITALIC : FontStyle.NORMAL;
        this.cacheKey = `${family}%${size}%${weight}%${style}`;
    }
    getGlyphMetrics(character) {
        if (this.glyphs[character]) {
            return this.glyphs[character];
        }
        else {
            return this.glyphs[this.maxSizeGlyph];
        }
    }
    get maxHeight() {
        const metrics = this.getGlyphMetrics(this.maxSizeGlyph);
        return (metrics.ha / this.resolution) * this.fontSizeInPixels;
    }
    getWidthForCharacterInEm(c) {
        var _a;
        const metrics = this.getGlyphMetrics(c);
        if (!metrics) {
            return 0.65;
        }
        else {
            const advanceWidth = (_a = metrics.advanceWidth) !== null && _a !== void 0 ? _a : 0;
            return advanceWidth / this.resolution;
        }
    }
    getYForCharacterInPx(c) {
        const metrics = this.getGlyphMetrics(c);
        const rv = { yMin: 0, yMax: this.maxHeight, height: this.maxHeight };
        if (!metrics) {
            return rv;
        }
        else {
            if (typeof metrics.y_min === 'number') {
                rv.yMin = (metrics.y_min / this.resolution) * this.fontSizeInPixels;
            }
            if (typeof metrics.y_max === 'number') {
                rv.yMax = (metrics.y_max / this.resolution) * this.fontSizeInPixels;
            }
            rv.height = rv.yMax - rv.yMin;
            return rv;
        }
    }
    getYForStringInPx(str) {
        const entry = this.localHeightCache;
        const extent = { yMin: 0, yMax: this.maxHeight, height: this.maxHeight };
        const cache = entry[str];
        if (cache !== undefined) {
            return cache;
        }
        for (let i = 0; i < str.length; ++i) {
            const curY = this.getYForCharacterInPx(str[i]);
            extent.yMin = Math.min(extent.yMin, curY.yMin);
            extent.yMax = Math.max(extent.yMax, curY.yMax);
            extent.height = extent.yMax - extent.yMin;
        }
        entry[str] = extent;
        return extent;
    }
    getWidthForTextInEm(text) {
        const key = this.cacheKey;
        let cachedWidths = textWidthCache[key];
        if (cachedWidths === undefined) {
            cachedWidths = {};
            textWidthCache[key] = cachedWidths;
        }
        let width = cachedWidths[text];
        if (width === undefined) {
            width = 0;
            for (let i = 0; i < text.length; ++i) {
                width += this.getWidthForCharacterInEm(text[i]);
            }
            cachedWidths[text] = width;
        }
        return width;
    }
    getWidthForTextInPx(text) {
        return this.getWidthForTextInEm(text) * this.fontSizeInPixels;
    }
    setFontSize(size) {
        this.size = size;
        this.updateCacheKey();
        return this;
    }
    get fontSizeInPixels() {
        return this.size * Font.scaleToPxFrom.pt;
    }
    getResolution() {
        return this.resolution;
    }
}
TextFormatter.DEBUG = false;
export { TextFormatter };
