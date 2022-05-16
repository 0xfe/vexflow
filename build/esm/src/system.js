import { BoundingBox } from './boundingbox.js';
import { Element } from './element.js';
import { Formatter } from './formatter.js';
import { Note } from './note.js';
import { Stave } from './stave.js';
import { RuntimeError } from './util.js';
export class System extends Element {
    constructor(params = {}) {
        super();
        this.setOptions(params);
        this.parts = [];
    }
    static get CATEGORY() {
        return "System";
    }
    setOptions(options = {}) {
        if (!options.factory) {
            throw new RuntimeError('NoFactory', 'System.setOptions(options) requires a factory.');
        }
        this.factory = options.factory;
        this.options = Object.assign(Object.assign({ factory: this.factory, x: 10, y: 10, width: 500, spaceBetweenStaves: 12, autoWidth: false, noJustification: false, debugFormatter: false, formatIterations: 0, noPadding: false }, options), { details: Object.assign({ alpha: 0.5 }, options.details), formatOptions: Object.assign({}, options.formatOptions) });
        if (this.options.noJustification === false && typeof options.width === 'undefined') {
            this.options.autoWidth = true;
        }
    }
    setContext(context) {
        super.setContext(context);
        this.factory.setContext(context);
        return this;
    }
    addConnector(type = 'double') {
        this.connector = this.factory.StaveConnector({
            top_stave: this.parts[0].stave,
            bottom_stave: this.parts[this.parts.length - 1].stave,
            type,
        });
        return this.connector;
    }
    addStave(params) {
        var _a;
        const staveOptions = Object.assign({ left_bar: false }, params.options);
        const stave = (_a = params.stave) !== null && _a !== void 0 ? _a : this.factory.Stave({ x: this.options.x, y: this.options.y, width: this.options.width, options: staveOptions });
        const p = Object.assign(Object.assign({ stave, spaceAbove: 0, spaceBelow: 0, debugNoteMetrics: false, noJustification: false }, params), { options: staveOptions });
        const ctx = this.getContext();
        p.voices.forEach((voice) => voice
            .setContext(ctx)
            .setStave(stave)
            .getTickables()
            .forEach((tickable) => tickable.setStave(stave)));
        this.parts.push(p);
        return stave;
    }
    format() {
        const options_details = this.options.details;
        let justifyWidth = 0;
        const formatter = new Formatter(options_details);
        this.formatter = formatter;
        let y = this.options.y;
        let startX = 0;
        let allVoices = [];
        const debugNoteMetricsYs = [];
        this.parts.forEach((part) => {
            y = y + part.stave.space(part.spaceAbove);
            part.stave.setY(y);
            formatter.joinVoices(part.voices);
            y = y + part.stave.space(part.spaceBelow);
            y = y + part.stave.space(this.options.spaceBetweenStaves);
            if (part.debugNoteMetrics) {
                debugNoteMetricsYs.push({ y, voice: part.voices[0] });
                y += 15;
            }
            allVoices = allVoices.concat(part.voices);
            startX = Math.max(startX, part.stave.getNoteStartX());
        });
        this.parts.forEach((part) => part.stave.setNoteStartX(startX));
        if (this.options.autoWidth) {
            justifyWidth = formatter.preCalculateMinTotalWidth(allVoices);
            this.parts.forEach((part) => {
                part.stave.setWidth(justifyWidth + Stave.rightPadding + (startX - this.options.x));
            });
        }
        else {
            justifyWidth = this.options.noPadding
                ? this.options.width - this.options.x
                : this.options.width - (startX - this.options.x) - Stave.defaultPadding;
        }
        formatter.format(allVoices, this.options.noJustification ? 0 : justifyWidth, this.options.formatOptions);
        for (let i = 0; i < this.options.formatIterations; i++) {
            formatter.tune(options_details);
        }
        this.startX = startX;
        this.debugNoteMetricsYs = debugNoteMetricsYs;
        this.lastY = y;
        this.boundingBox = new BoundingBox(this.options.x, this.options.y, this.options.width, this.lastY - this.options.y);
    }
    draw() {
        const ctx = this.checkContext();
        if (!this.formatter || !this.startX || !this.lastY || !this.debugNoteMetricsYs) {
            throw new RuntimeError('NoFormatter', 'format() must be called before draw()');
        }
        this.setRendered();
        if (this.options.debugFormatter) {
            Formatter.plotDebugging(ctx, this.formatter, this.startX, this.options.y, this.lastY);
        }
        this.debugNoteMetricsYs.forEach((d) => {
            d.voice.getTickables().forEach((tickable) => Note.plotMetrics(ctx, tickable, d.y));
        });
    }
}
