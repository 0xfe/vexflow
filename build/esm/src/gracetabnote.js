import { Font } from './font.js';
import { TabNote } from './tabnote.js';
export class GraceTabNote extends TabNote {
    static get CATEGORY() {
        return "GraceTabNote";
    }
    constructor(noteStruct) {
        super(noteStruct, false);
        this.render_options = Object.assign(Object.assign({}, this.render_options), { y_shift: 0.3, scale: 0.6, font: `7.5pt ${Font.SANS_SERIF}` });
        this.updateWidth();
    }
}
