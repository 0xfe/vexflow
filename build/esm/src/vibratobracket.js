import { Element } from './element.js';
import { log } from './util.js';
import { Vibrato } from './vibrato.js';
function L(...args) {
    if (VibratoBracket.DEBUG)
        log('Vex.Flow.VibratoBracket', args);
}
class VibratoBracket extends Element {
    static get CATEGORY() {
        return "VibratoBracket";
    }
    constructor(bracket_data) {
        super();
        if (bracket_data.start)
            this.start = bracket_data.start;
        if (bracket_data.stop)
            this.stop = bracket_data.stop;
        this.line = 1;
        this.render_options = {
            harsh: false,
            wave_height: 6,
            wave_width: 4,
            wave_girth: 2,
            vibrato_width: 0,
        };
    }
    setLine(line) {
        this.line = line;
        return this;
    }
    setHarsh(harsh) {
        this.render_options.harsh = harsh;
        return this;
    }
    draw() {
        const ctx = this.checkContext();
        this.setRendered();
        const y = (this.start && this.start.checkStave().getYForTopText(this.line)) ||
            (this.stop && this.stop.checkStave().getYForTopText(this.line)) ||
            0;
        const start_x = (this.start && this.start.getAbsoluteX()) || (this.stop && this.stop.checkStave().getTieStartX()) || 0;
        const stop_x = (this.stop && this.stop.getAbsoluteX() - this.stop.getWidth() - 5) ||
            (this.start && this.start.checkStave().getTieEndX() - 10) ||
            0;
        this.render_options.vibrato_width = stop_x - start_x;
        L('Rendering VibratoBracket: start_x:', start_x, 'stop_x:', stop_x, 'y:', y);
        Vibrato.renderVibrato(ctx, start_x, y, this.render_options);
    }
}
VibratoBracket.DEBUG = false;
export { VibratoBracket };
