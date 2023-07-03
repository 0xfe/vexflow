import { Note } from './note.js';
import { TickContext } from './tickcontext.js';
import { log } from './util.js';
function L(...args) {
    if (Crescendo.DEBUG)
        log('Vex.Flow.Crescendo', args);
}
function renderHairpin(ctx, params) {
    const begin_x = params.begin_x;
    const end_x = params.end_x;
    const y = params.y;
    const half_height = params.height / 2;
    ctx.beginPath();
    if (params.reverse) {
        ctx.moveTo(begin_x, y - half_height);
        ctx.lineTo(end_x, y);
        ctx.lineTo(begin_x, y + half_height);
    }
    else {
        ctx.moveTo(end_x, y - half_height);
        ctx.lineTo(begin_x, y);
        ctx.lineTo(end_x, y + half_height);
    }
    ctx.stroke();
    ctx.closePath();
}
class Crescendo extends Note {
    static get CATEGORY() {
        return "Crescendo";
    }
    constructor(noteStruct) {
        super(noteStruct);
        this.options = {
            extend_left: 0,
            extend_right: 0,
            y_shift: 0,
        };
        this.decrescendo = false;
        this.line = noteStruct.line || 0;
        this.height = 15;
    }
    setLine(line) {
        this.line = line;
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
    setDecrescendo(decresc) {
        this.decrescendo = decresc;
        return this;
    }
    preFormat() {
        this.preFormatted = true;
        return this;
    }
    draw() {
        const ctx = this.checkContext();
        const stave = this.checkStave();
        this.setRendered();
        const tick_context = this.getTickContext();
        const next_context = TickContext.getNextContext(tick_context);
        const begin_x = this.getAbsoluteX();
        const end_x = next_context ? next_context.getX() : stave.getX() + stave.getWidth();
        const y = stave.getYForLine(this.line + -3) + 1;
        L('Drawing ', this.decrescendo ? 'decrescendo ' : 'crescendo ', this.height, 'x', begin_x - end_x);
        renderHairpin(ctx, {
            begin_x: begin_x - this.options.extend_left,
            end_x: end_x + this.options.extend_right,
            y: y + this.options.y_shift,
            height: this.height,
            reverse: this.decrescendo,
        });
    }
}
Crescendo.DEBUG = false;
export { Crescendo };
