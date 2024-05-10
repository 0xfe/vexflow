import { Font, FontStyle, FontWeight } from './font.js';
import { Glyph } from './glyph.js';
import { Modifier } from './modifier.js';
import { Tables } from './tables.js';
import { TextFormatter } from './textformatter.js';
import { isStemmableNote } from './typeguard.js';
import { log, RuntimeError } from './util.js';
function L(...args) {
    if (ChordSymbol.DEBUG)
        log('Vex.Flow.ChordSymbol', args);
}
export var ChordSymbolHorizontalJustify;
(function (ChordSymbolHorizontalJustify) {
    ChordSymbolHorizontalJustify[ChordSymbolHorizontalJustify["LEFT"] = 1] = "LEFT";
    ChordSymbolHorizontalJustify[ChordSymbolHorizontalJustify["CENTER"] = 2] = "CENTER";
    ChordSymbolHorizontalJustify[ChordSymbolHorizontalJustify["RIGHT"] = 3] = "RIGHT";
    ChordSymbolHorizontalJustify[ChordSymbolHorizontalJustify["CENTER_STEM"] = 4] = "CENTER_STEM";
})(ChordSymbolHorizontalJustify || (ChordSymbolHorizontalJustify = {}));
export var ChordSymbolVerticalJustify;
(function (ChordSymbolVerticalJustify) {
    ChordSymbolVerticalJustify[ChordSymbolVerticalJustify["TOP"] = 1] = "TOP";
    ChordSymbolVerticalJustify[ChordSymbolVerticalJustify["BOTTOM"] = 2] = "BOTTOM";
})(ChordSymbolVerticalJustify || (ChordSymbolVerticalJustify = {}));
export var SymbolTypes;
(function (SymbolTypes) {
    SymbolTypes[SymbolTypes["GLYPH"] = 1] = "GLYPH";
    SymbolTypes[SymbolTypes["TEXT"] = 2] = "TEXT";
    SymbolTypes[SymbolTypes["LINE"] = 3] = "LINE";
})(SymbolTypes || (SymbolTypes = {}));
export var SymbolModifiers;
(function (SymbolModifiers) {
    SymbolModifiers[SymbolModifiers["NONE"] = 1] = "NONE";
    SymbolModifiers[SymbolModifiers["SUBSCRIPT"] = 2] = "SUBSCRIPT";
    SymbolModifiers[SymbolModifiers["SUPERSCRIPT"] = 3] = "SUPERSCRIPT";
})(SymbolModifiers || (SymbolModifiers = {}));
class ChordSymbol extends Modifier {
    static get CATEGORY() {
        return "ChordSymbol";
    }
    static get superSubRatio() {
        return ChordSymbol.metrics.global.superSubRatio;
    }
    static set NO_TEXT_FORMAT(val) {
        ChordSymbol.noFormat = val;
    }
    static get NO_TEXT_FORMAT() {
        return ChordSymbol.noFormat;
    }
    static getMetricForGlyph(glyphCode) {
        if (ChordSymbol.metrics.glyphs[glyphCode]) {
            return ChordSymbol.metrics.glyphs[glyphCode];
        }
        return undefined;
    }
    static get engravingFontResolution() {
        return Tables.currentMusicFont().getResolution();
    }
    static get spacingBetweenBlocks() {
        return ChordSymbol.metrics.global.spacing / ChordSymbol.engravingFontResolution;
    }
    static getWidthForGlyph(glyph) {
        const metric = ChordSymbol.getMetricForGlyph(glyph.code);
        if (!metric) {
            return 0.65;
        }
        return metric.advanceWidth / ChordSymbol.engravingFontResolution;
    }
    static getYShiftForGlyph(glyph) {
        const metric = ChordSymbol.getMetricForGlyph(glyph.code);
        if (!metric) {
            return 0;
        }
        return metric.yOffset / ChordSymbol.engravingFontResolution;
    }
    static getXShiftForGlyph(glyph) {
        const metric = ChordSymbol.getMetricForGlyph(glyph.code);
        if (!metric) {
            return 0;
        }
        return (-1 * metric.leftSideBearing) / ChordSymbol.engravingFontResolution;
    }
    static get superscriptOffset() {
        return ChordSymbol.metrics.global.superscriptOffset / ChordSymbol.engravingFontResolution;
    }
    static get subscriptOffset() {
        return ChordSymbol.metrics.global.subscriptOffset / ChordSymbol.engravingFontResolution;
    }
    static get kerningOffset() {
        return ChordSymbol.metrics.global.kerningOffset / ChordSymbol.engravingFontResolution;
    }
    static get metrics() {
        const chordSymbol = Tables.currentMusicFont().getMetrics().chordSymbol;
        if (!chordSymbol)
            throw new RuntimeError('BadMetrics', `chordSymbol missing`);
        return chordSymbol;
    }
    static get lowerKerningText() {
        return ChordSymbol.metrics.global.lowerKerningText;
    }
    static get upperKerningText() {
        return ChordSymbol.metrics.global.upperKerningText;
    }
    static isSuperscript(block) {
        return block.symbolModifier !== undefined && block.symbolModifier === SymbolModifiers.SUPERSCRIPT;
    }
    static isSubscript(block) {
        return block.symbolModifier !== undefined && block.symbolModifier === SymbolModifiers.SUBSCRIPT;
    }
    static get minPadding() {
        const musicFont = Tables.currentMusicFont();
        return musicFont.lookupMetric('noteHead.minPadding');
    }
    static format(symbols, state) {
        var _a;
        if (!symbols || symbols.length === 0)
            return false;
        let width = 0;
        let nonSuperWidth = 0;
        let leftWidth = 0;
        let rightWidth = 0;
        let maxLeftGlyphWidth = 0;
        let maxRightGlyphWidth = 0;
        for (const symbol of symbols) {
            const fontSize = Font.convertSizeToPointValue((_a = symbol.textFont) === null || _a === void 0 ? void 0 : _a.size);
            const fontAdj = Font.scaleSize(fontSize, 0.05);
            const glyphAdj = fontAdj * 2;
            const note = symbol.checkAttachedNote();
            let symbolWidth = 0;
            let lineSpaces = 1;
            let vAlign = false;
            for (let j = 0; j < symbol.symbolBlocks.length; ++j) {
                const block = symbol.symbolBlocks[j];
                const sup = ChordSymbol.isSuperscript(block);
                const sub = ChordSymbol.isSubscript(block);
                const superSubScale = sup || sub ? ChordSymbol.superSubRatio : 1;
                const adj = block.symbolType === SymbolTypes.GLYPH ? glyphAdj * superSubScale : fontAdj * superSubScale;
                if (sup || sub) {
                    lineSpaces = 2;
                }
                const fontSize = symbol.textFormatter.fontSizeInPixels;
                const superSubFontSize = fontSize * superSubScale;
                if (block.symbolType === SymbolTypes.GLYPH && block.glyph !== undefined) {
                    block.width = ChordSymbol.getWidthForGlyph(block.glyph) * superSubFontSize;
                    block.yShift += ChordSymbol.getYShiftForGlyph(block.glyph) * superSubFontSize;
                    block.xShift += ChordSymbol.getXShiftForGlyph(block.glyph) * superSubFontSize;
                    block.glyph.scale = block.glyph.scale * adj;
                }
                else if (block.symbolType === SymbolTypes.TEXT) {
                    block.width = block.width * superSubFontSize;
                    block.yShift += symbol.getYOffsetForText(block.text) * adj;
                }
                if (block.symbolType === SymbolTypes.GLYPH &&
                    block.glyph !== undefined &&
                    block.glyph.code === ChordSymbol.glyphs.over.code) {
                    lineSpaces = 2;
                }
                block.width += ChordSymbol.spacingBetweenBlocks * fontSize * superSubScale;
                if (sup && j > 0) {
                    const prev = symbol.symbolBlocks[j - 1];
                    if (!ChordSymbol.isSuperscript(prev)) {
                        nonSuperWidth = width;
                    }
                }
                if (sub && nonSuperWidth > 0) {
                    vAlign = true;
                    block.xShift = block.xShift + (nonSuperWidth - width);
                    width = nonSuperWidth;
                    nonSuperWidth = 0;
                    symbol.setEnableKerning(false);
                }
                if (!sup && !sub) {
                    nonSuperWidth = 0;
                }
                block.vAlign = vAlign;
                width += block.width;
                symbolWidth = width;
            }
            symbol.updateKerningAdjustments();
            symbol.updateOverBarAdjustments();
            if (symbol.getVertical() === ChordSymbolVerticalJustify.TOP) {
                symbol.setTextLine(state.top_text_line);
                state.top_text_line += lineSpaces;
            }
            else {
                symbol.setTextLine(state.text_line + 1);
                state.text_line += lineSpaces + 1;
            }
            if (symbol.getReportWidth() && isStemmableNote(note)) {
                const glyphWidth = note.getGlyphProps().getWidth();
                if (symbol.getHorizontal() === ChordSymbolHorizontalJustify.LEFT) {
                    maxLeftGlyphWidth = Math.max(glyphWidth, maxLeftGlyphWidth);
                    leftWidth = Math.max(leftWidth, symbolWidth) + ChordSymbol.minPadding;
                }
                else if (symbol.getHorizontal() === ChordSymbolHorizontalJustify.RIGHT) {
                    maxRightGlyphWidth = Math.max(glyphWidth, maxRightGlyphWidth);
                    rightWidth = Math.max(rightWidth, symbolWidth);
                }
                else {
                    leftWidth = Math.max(leftWidth, symbolWidth / 2) + ChordSymbol.minPadding;
                    rightWidth = Math.max(rightWidth, symbolWidth / 2);
                    maxLeftGlyphWidth = Math.max(glyphWidth / 2, maxLeftGlyphWidth);
                    maxRightGlyphWidth = Math.max(glyphWidth / 2, maxRightGlyphWidth);
                }
            }
            width = 0;
        }
        const rightOverlap = Math.min(Math.max(rightWidth - maxRightGlyphWidth, 0), Math.max(rightWidth - state.right_shift, 0));
        const leftOverlap = Math.min(Math.max(leftWidth - maxLeftGlyphWidth, 0), Math.max(leftWidth - state.left_shift, 0));
        state.left_shift += leftOverlap;
        state.right_shift += rightOverlap;
        return true;
    }
    constructor() {
        super();
        this.symbolBlocks = [];
        this.horizontal = ChordSymbolHorizontalJustify.LEFT;
        this.vertical = ChordSymbolVerticalJustify.TOP;
        this.useKerning = true;
        this.reportWidth = true;
        this.resetFont();
    }
    static get TEXT_FONT() {
        let family = 'Roboto Slab, Times, serif';
        if (Tables.currentMusicFont().getName() === 'Petaluma') {
            family = 'PetalumaScript, Arial, sans-serif';
        }
        return {
            family,
            size: 12,
            weight: FontWeight.NORMAL,
            style: FontStyle.NORMAL,
        };
    }
    get superscriptOffset() {
        return ChordSymbol.superscriptOffset * this.textFormatter.fontSizeInPixels;
    }
    get subscriptOffset() {
        return ChordSymbol.subscriptOffset * this.textFormatter.fontSizeInPixels;
    }
    setReportWidth(value) {
        this.reportWidth = value;
        return this;
    }
    getReportWidth() {
        return this.reportWidth;
    }
    updateOverBarAdjustments() {
        const barIndex = this.symbolBlocks.findIndex(({ symbolType, glyph }) => symbolType === SymbolTypes.GLYPH && glyph !== undefined && glyph.code === 'csymDiagonalArrangementSlash');
        if (barIndex < 0) {
            return;
        }
        const bar = this.symbolBlocks[barIndex];
        const xoff = bar.width / 4;
        const yoff = 0.25 * this.textFormatter.fontSizeInPixels;
        let symIndex = 0;
        for (symIndex === 0; symIndex < barIndex; ++symIndex) {
            const symbol = this.symbolBlocks[symIndex];
            symbol.xShift = symbol.xShift + xoff;
            symbol.yShift = symbol.yShift - yoff;
        }
        for (symIndex = barIndex + 1; symIndex < this.symbolBlocks.length; ++symIndex) {
            const symbol = this.symbolBlocks[symIndex];
            symbol.xShift = symbol.xShift - xoff;
            symbol.yShift = symbol.yShift + yoff;
        }
    }
    updateKerningAdjustments() {
        let accum = 0;
        for (let j = 0; j < this.symbolBlocks.length; ++j) {
            const symbol = this.symbolBlocks[j];
            accum += this.getKerningAdjustment(j);
            symbol.xShift += accum;
        }
    }
    getKerningAdjustment(j) {
        if (!this.useKerning) {
            return 0;
        }
        const currSymbol = this.symbolBlocks[j];
        const prevSymbol = j > 0 ? this.symbolBlocks[j - 1] : undefined;
        let adjustment = 0;
        if (currSymbol.symbolType === SymbolTypes.GLYPH &&
            currSymbol.glyph !== undefined &&
            currSymbol.glyph.code === ChordSymbol.glyphs.over.code) {
            adjustment += currSymbol.glyph.metrics.x_shift;
        }
        if (prevSymbol !== undefined &&
            prevSymbol.symbolType === SymbolTypes.GLYPH &&
            prevSymbol.glyph !== undefined &&
            prevSymbol.glyph.code === ChordSymbol.glyphs.over.code) {
            adjustment += prevSymbol.glyph.metrics.x_shift;
        }
        let preKernUpper = false;
        let preKernLower = false;
        if (prevSymbol !== undefined && prevSymbol.symbolType === SymbolTypes.TEXT) {
            preKernUpper = ChordSymbol.upperKerningText.some((xx) => xx === prevSymbol.text[prevSymbol.text.length - 1]);
            preKernLower = ChordSymbol.lowerKerningText.some((xx) => xx === prevSymbol.text[prevSymbol.text.length - 1]);
        }
        const kerningOffsetPixels = ChordSymbol.kerningOffset * this.textFormatter.fontSizeInPixels;
        if (preKernUpper && currSymbol.symbolModifier === SymbolModifiers.SUPERSCRIPT) {
            adjustment += kerningOffsetPixels;
        }
        if (preKernLower && currSymbol.symbolType === SymbolTypes.TEXT) {
            if (currSymbol.text[0] >= 'a' && currSymbol.text[0] <= 'z') {
                adjustment += kerningOffsetPixels / 2;
            }
            if (ChordSymbol.upperKerningText.some((xx) => xx === (prevSymbol === null || prevSymbol === void 0 ? void 0 : prevSymbol.text[prevSymbol.text.length - 1]))) {
                adjustment += kerningOffsetPixels / 2;
            }
        }
        return adjustment;
    }
    getSymbolBlock(params = {}) {
        var _a, _b, _c;
        const symbolType = (_a = params.symbolType) !== null && _a !== void 0 ? _a : SymbolTypes.TEXT;
        const symbolBlock = {
            text: (_b = params.text) !== null && _b !== void 0 ? _b : '',
            symbolType,
            symbolModifier: (_c = params.symbolModifier) !== null && _c !== void 0 ? _c : SymbolModifiers.NONE,
            xShift: 0,
            yShift: 0,
            vAlign: false,
            width: 0,
        };
        if (symbolType === SymbolTypes.GLYPH && typeof params.glyph === 'string') {
            const glyphArgs = ChordSymbol.glyphs[params.glyph];
            const glyphPoints = 20;
            symbolBlock.glyph = new Glyph(glyphArgs.code, glyphPoints, { category: 'chordSymbol' });
        }
        else if (symbolType === SymbolTypes.TEXT) {
            symbolBlock.width = this.textFormatter.getWidthForTextInEm(symbolBlock.text);
        }
        else if (symbolType === SymbolTypes.LINE) {
            symbolBlock.width = params.width;
        }
        return symbolBlock;
    }
    addSymbolBlock(parameters) {
        this.symbolBlocks.push(this.getSymbolBlock(parameters));
        return this;
    }
    addText(text, parameters = {}) {
        const symbolType = SymbolTypes.TEXT;
        return this.addSymbolBlock(Object.assign(Object.assign({}, parameters), { text, symbolType }));
    }
    addTextSuperscript(text) {
        const symbolType = SymbolTypes.TEXT;
        const symbolModifier = SymbolModifiers.SUPERSCRIPT;
        return this.addSymbolBlock({ text, symbolType, symbolModifier });
    }
    addTextSubscript(text) {
        const symbolType = SymbolTypes.TEXT;
        const symbolModifier = SymbolModifiers.SUBSCRIPT;
        return this.addSymbolBlock({ text, symbolType, symbolModifier });
    }
    addGlyphSuperscript(glyph) {
        const symbolType = SymbolTypes.GLYPH;
        const symbolModifier = SymbolModifiers.SUPERSCRIPT;
        return this.addSymbolBlock({ glyph, symbolType, symbolModifier });
    }
    addGlyph(glyph, params = {}) {
        const symbolType = SymbolTypes.GLYPH;
        return this.addSymbolBlock(Object.assign(Object.assign({}, params), { glyph, symbolType }));
    }
    addGlyphOrText(text, params = {}) {
        let str = '';
        for (let i = 0; i < text.length; ++i) {
            const char = text[i];
            if (ChordSymbol.glyphs[char]) {
                if (str.length > 0) {
                    this.addText(str, params);
                    str = '';
                }
                this.addGlyph(char, params);
            }
            else {
                str += char;
            }
        }
        if (str.length > 0) {
            this.addText(str, params);
        }
        return this;
    }
    addLine(width, params = {}) {
        const symbolType = SymbolTypes.LINE;
        return this.addSymbolBlock(Object.assign(Object.assign({}, params), { symbolType, width }));
    }
    setFont(f, size, weight, style) {
        super.setFont(f, size, weight, style);
        this.textFormatter = TextFormatter.create(this.textFont);
        return this;
    }
    setEnableKerning(val) {
        this.useKerning = val;
        return this;
    }
    setVertical(vj) {
        this.vertical = typeof vj === 'string' ? ChordSymbol.VerticalJustifyString[vj] : vj;
        return this;
    }
    getVertical() {
        return this.vertical;
    }
    setHorizontal(hj) {
        this.horizontal = typeof hj === 'string' ? ChordSymbol.HorizontalJustifyString[hj] : hj;
        return this;
    }
    getHorizontal() {
        return this.horizontal;
    }
    getWidth() {
        let width = 0;
        this.symbolBlocks.forEach((symbol) => {
            width += symbol.vAlign ? 0 : symbol.width;
        });
        return width;
    }
    getYOffsetForText(text) {
        var _a;
        let acc = 0;
        let i = 0;
        for (i = 0; i < text.length; ++i) {
            const metrics = this.textFormatter.getGlyphMetrics(text[i]);
            if (metrics) {
                const yMax = (_a = metrics.y_max) !== null && _a !== void 0 ? _a : 0;
                acc = yMax < acc ? yMax : acc;
            }
        }
        const resolution = this.textFormatter.getResolution();
        return i > 0 ? -1 * (acc / resolution) : 0;
    }
    draw() {
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        ctx.save();
        this.applyStyle();
        ctx.openGroup('chordsymbol', this.getAttribute('id'));
        const start = note.getModifierStartXY(Modifier.Position.ABOVE, this.index);
        ctx.setFont(this.textFont);
        let y;
        const hasStem = note.hasStem();
        const stave = note.checkStave();
        if (this.vertical === ChordSymbolVerticalJustify.BOTTOM) {
            y = stave.getYForBottomText(this.text_line + Tables.TEXT_HEIGHT_OFFSET_HACK);
            if (hasStem) {
                const stem_ext = note.checkStem().getExtents();
                const spacing = stave.getSpacingBetweenLines();
                const stem_base = note.getStemDirection() === 1 ? stem_ext.baseY : stem_ext.topY;
                y = Math.max(y, stem_base + spacing * (this.text_line + 2));
            }
        }
        else {
            const topY = Math.min(...note.getYs());
            y = Math.min(stave.getYForTopText(this.text_line), topY - 10);
            if (hasStem) {
                const stem_ext = note.checkStem().getExtents();
                const spacing = stave.getSpacingBetweenLines();
                y = Math.min(y, stem_ext.topY - 5 - spacing * this.text_line);
            }
        }
        let x = start.x;
        if (this.horizontal === ChordSymbolHorizontalJustify.LEFT) {
            x = start.x;
        }
        else if (this.horizontal === ChordSymbolHorizontalJustify.RIGHT) {
            x = start.x + this.getWidth();
        }
        else if (this.horizontal === ChordSymbolHorizontalJustify.CENTER) {
            x = start.x - this.getWidth() / 2;
        }
        else {
            x = note.getStemX() - this.getWidth() / 2;
        }
        L('Rendering ChordSymbol: ', this.textFormatter, x, y);
        this.symbolBlocks.forEach((symbol) => {
            const isSuper = ChordSymbol.isSuperscript(symbol);
            const isSub = ChordSymbol.isSubscript(symbol);
            let curY = y;
            L('shift was ', symbol.xShift, symbol.yShift);
            L('curY pre sub ', curY);
            if (isSuper) {
                curY += this.superscriptOffset;
            }
            if (isSub) {
                curY += this.subscriptOffset;
            }
            L('curY sup/sub ', curY);
            if (symbol.symbolType === SymbolTypes.TEXT) {
                if (isSuper || isSub) {
                    ctx.save();
                    if (this.textFont) {
                        const { family, size, weight, style } = this.textFont;
                        const smallerFontSize = Font.scaleSize(size, ChordSymbol.superSubRatio);
                        ctx.setFont(family, smallerFontSize, weight, style);
                    }
                }
                L('Rendering Text: ', symbol.text, x + symbol.xShift, curY + symbol.yShift);
                ctx.fillText(symbol.text, x + symbol.xShift, curY + symbol.yShift);
                if (isSuper || isSub) {
                    ctx.restore();
                }
            }
            else if (symbol.symbolType === SymbolTypes.GLYPH && symbol.glyph) {
                curY += symbol.yShift;
                L('Rendering Glyph: ', symbol.glyph.code, x + symbol.xShift, curY);
                symbol.glyph.render(ctx, x + symbol.xShift, curY);
            }
            else if (symbol.symbolType === SymbolTypes.LINE) {
                L('Rendering Line : ', symbol.width, x, curY);
                ctx.beginPath();
                ctx.setLineWidth(1);
                ctx.moveTo(x, y);
                ctx.lineTo(x + symbol.width, curY);
                ctx.stroke();
            }
            x += symbol.width;
            if (symbol.vAlign) {
                x += symbol.xShift;
            }
        });
        ctx.closeGroup();
        this.restoreStyle();
        ctx.restore();
    }
}
ChordSymbol.DEBUG = false;
ChordSymbol.HorizontalJustify = ChordSymbolHorizontalJustify;
ChordSymbol.HorizontalJustifyString = {
    left: ChordSymbolHorizontalJustify.LEFT,
    right: ChordSymbolHorizontalJustify.RIGHT,
    center: ChordSymbolHorizontalJustify.CENTER,
    centerStem: ChordSymbolHorizontalJustify.CENTER_STEM,
};
ChordSymbol.VerticalJustify = ChordSymbolVerticalJustify;
ChordSymbol.VerticalJustifyString = {
    top: ChordSymbolVerticalJustify.TOP,
    above: ChordSymbolVerticalJustify.TOP,
    below: ChordSymbolVerticalJustify.BOTTOM,
    bottom: ChordSymbolVerticalJustify.BOTTOM,
};
ChordSymbol.glyphs = {
    diminished: {
        code: 'csymDiminished',
    },
    dim: {
        code: 'csymDiminished',
    },
    halfDiminished: {
        code: 'csymHalfDiminished',
    },
    '+': {
        code: 'csymAugmented',
    },
    augmented: {
        code: 'csymAugmented',
    },
    majorSeventh: {
        code: 'csymMajorSeventh',
    },
    minor: {
        code: 'csymMinor',
    },
    '-': {
        code: 'csymMinor',
    },
    '(': {
        code: 'csymParensLeftTall',
    },
    leftParen: {
        code: 'csymParensLeftTall',
    },
    ')': {
        code: 'csymParensRightTall',
    },
    rightParen: {
        code: 'csymParensRightTall',
    },
    leftBracket: {
        code: 'csymBracketLeftTall',
    },
    rightBracket: {
        code: 'csymBracketRightTall',
    },
    leftParenTall: {
        code: 'csymParensLeftVeryTall',
    },
    rightParenTall: {
        code: 'csymParensRightVeryTall',
    },
    '/': {
        code: 'csymDiagonalArrangementSlash',
    },
    over: {
        code: 'csymDiagonalArrangementSlash',
    },
    '#': {
        code: 'accidentalSharp',
    },
    b: {
        code: 'accidentalFlat',
    },
};
ChordSymbol.symbolTypes = SymbolTypes;
ChordSymbol.symbolModifiers = SymbolModifiers;
ChordSymbol.noFormat = false;
export { ChordSymbol };
