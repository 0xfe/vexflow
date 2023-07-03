import { Font, FontStyle, FontWeight } from './font.js';
import { Registry } from './registry.js';
import { defined, prefix } from './util.js';
class Element {
    static get CATEGORY() {
        return "Element";
    }
    static newID() {
        return `auto${Element.ID++}`;
    }
    constructor() {
        var _a;
        this.children = [];
        this.attrs = {
            id: Element.newID(),
            type: this.getCategory(),
            class: '',
        };
        this.rendered = false;
        (_a = Registry.getDefaultRegistry()) === null || _a === void 0 ? void 0 : _a.register(this);
    }
    addChildElement(child) {
        this.children.push(child);
        return this;
    }
    getCategory() {
        return this.constructor.CATEGORY;
    }
    setStyle(style) {
        this.style = style;
        return this;
    }
    setGroupStyle(style) {
        this.style = style;
        this.children.forEach((child) => child.setGroupStyle(style));
        return this;
    }
    getStyle() {
        return this.style;
    }
    applyStyle(context = this.context, style = this.getStyle()) {
        if (!style)
            return this;
        if (!context)
            return this;
        context.save();
        if (style.shadowColor)
            context.setShadowColor(style.shadowColor);
        if (style.shadowBlur)
            context.setShadowBlur(style.shadowBlur);
        if (style.fillStyle)
            context.setFillStyle(style.fillStyle);
        if (style.strokeStyle)
            context.setStrokeStyle(style.strokeStyle);
        if (style.lineWidth)
            context.setLineWidth(style.lineWidth);
        return this;
    }
    restoreStyle(context = this.context, style = this.getStyle()) {
        if (!style)
            return this;
        if (!context)
            return this;
        context.restore();
        return this;
    }
    drawWithStyle() {
        this.checkContext();
        this.applyStyle();
        this.draw();
        this.restoreStyle();
    }
    hasClass(className) {
        var _a;
        if (!this.attrs.class)
            return false;
        return ((_a = this.attrs.class) === null || _a === void 0 ? void 0 : _a.split(' ').indexOf(className)) != -1;
    }
    addClass(className) {
        var _a;
        if (this.hasClass(className))
            return this;
        if (!this.attrs.class)
            this.attrs.class = `${className}`;
        else
            this.attrs.class = `${this.attrs.class} ${className}`;
        (_a = this.registry) === null || _a === void 0 ? void 0 : _a.onUpdate({
            id: this.attrs.id,
            name: 'class',
            value: className,
            oldValue: undefined,
        });
        return this;
    }
    removeClass(className) {
        var _a, _b;
        if (!this.hasClass(className))
            return this;
        const arr = (_a = this.attrs.class) === null || _a === void 0 ? void 0 : _a.split(' ');
        if (arr) {
            arr.splice(arr.indexOf(className));
            this.attrs.class = arr.join(' ');
        }
        (_b = this.registry) === null || _b === void 0 ? void 0 : _b.onUpdate({
            id: this.attrs.id,
            name: 'class',
            value: undefined,
            oldValue: className,
        });
        return this;
    }
    onRegister(registry) {
        this.registry = registry;
        return this;
    }
    isRendered() {
        return this.rendered;
    }
    setRendered(rendered = true) {
        this.rendered = rendered;
        return this;
    }
    getAttributes() {
        return this.attrs;
    }
    getAttribute(name) {
        return this.attrs[name];
    }
    getSVGElement(suffix = '') {
        const id = prefix(this.attrs.id + suffix);
        const element = document.getElementById(id);
        if (element)
            return element;
    }
    setAttribute(name, value) {
        var _a;
        const oldID = this.attrs.id;
        const oldValue = this.attrs[name];
        this.attrs[name] = value;
        (_a = this.registry) === null || _a === void 0 ? void 0 : _a.onUpdate({ id: oldID, name, value, oldValue });
        return this;
    }
    getBoundingBox() {
        return this.boundingBox;
    }
    getContext() {
        return this.context;
    }
    setContext(context) {
        this.context = context;
        return this;
    }
    checkContext() {
        return defined(this.context, 'NoContext', 'No rendering context attached to instance.');
    }
    set font(f) {
        this.setFont(f);
    }
    get font() {
        return Font.toCSSString(this.textFont);
    }
    setFont(font, size, weight, style) {
        const defaultTextFont = this.constructor.TEXT_FONT;
        const fontIsObject = typeof font === 'object';
        const fontIsString = typeof font === 'string';
        const fontIsUndefined = font === undefined;
        const sizeWeightStyleAreUndefined = size === undefined && weight === undefined && style === undefined;
        if (fontIsObject) {
            this.textFont = Object.assign(Object.assign({}, defaultTextFont), font);
        }
        else if (fontIsString && sizeWeightStyleAreUndefined) {
            this.textFont = Font.fromCSSString(font);
        }
        else if (fontIsUndefined && sizeWeightStyleAreUndefined) {
            this.textFont = Object.assign({}, defaultTextFont);
        }
        else {
            this.textFont = Font.validate(font !== null && font !== void 0 ? font : defaultTextFont.family, size !== null && size !== void 0 ? size : defaultTextFont.size, weight !== null && weight !== void 0 ? weight : defaultTextFont.weight, style !== null && style !== void 0 ? style : defaultTextFont.style);
        }
        return this;
    }
    getFont() {
        if (!this.textFont) {
            this.resetFont();
        }
        return Font.toCSSString(this.textFont);
    }
    resetFont() {
        this.setFont();
    }
    get fontInfo() {
        if (!this.textFont) {
            this.resetFont();
        }
        return Object.assign({}, this.textFont);
    }
    set fontInfo(fontInfo) {
        this.setFont(fontInfo);
    }
    setFontSize(size) {
        const fontInfo = this.fontInfo;
        this.setFont(fontInfo.family, size, fontInfo.weight, fontInfo.style);
        return this;
    }
    getFontSize() {
        return this.fontSize;
    }
    set fontSize(size) {
        this.setFontSize(size);
    }
    get fontSize() {
        let size = this.fontInfo.size;
        if (typeof size === 'number') {
            size = `${size}pt`;
        }
        return size;
    }
    get fontSizeInPoints() {
        return Font.convertSizeToPointValue(this.fontSize);
    }
    get fontSizeInPixels() {
        return Font.convertSizeToPixelValue(this.fontSize);
    }
    get fontStyle() {
        return this.fontInfo.style;
    }
    set fontStyle(style) {
        const fontInfo = this.fontInfo;
        this.setFont(fontInfo.family, fontInfo.size, fontInfo.weight, style);
    }
    get fontWeight() {
        return this.fontInfo.weight + '';
    }
    set fontWeight(weight) {
        const fontInfo = this.fontInfo;
        this.setFont(fontInfo.family, fontInfo.size, weight, fontInfo.style);
    }
}
Element.ID = 1000;
Element.TEXT_FONT = {
    family: Font.SANS_SERIF,
    size: Font.SIZE,
    weight: FontWeight.NORMAL,
    style: FontStyle.NORMAL,
};
export { Element };
