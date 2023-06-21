import { Stave } from './stave.js';
export class TabStave extends Stave {
    static get CATEGORY() {
        return "TabStave";
    }
    constructor(x, y, width, options) {
        const tab_options = Object.assign({ spacing_between_lines_px: 13, num_lines: 6, top_text_position: 1 }, options);
        super(x, y, width, tab_options);
    }
    getYForGlyphs() {
        return this.getYForLine(2.5);
    }
    addTabGlyph() {
        this.addClef('tab');
        return this;
    }
}
