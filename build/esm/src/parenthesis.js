import { Glyph } from './glyph.js';
import { Modifier, ModifierPosition } from './modifier.js';
import { Tables } from './tables.js';
import { isGraceNote } from './typeguard.js';
export class Parenthesis extends Modifier {
    constructor(position) {
        super();
        this.position = position !== null && position !== void 0 ? position : Modifier.Position.LEFT;
        this.point = Tables.currentMusicFont().lookupMetric('parenthesis.default.point');
        this.setWidth(Tables.currentMusicFont().lookupMetric('parenthesis.default.width'));
    }
    static get CATEGORY() {
        return "Parenthesis";
    }
    static buildAndAttach(notes) {
        for (const note of notes) {
            for (let i = 0; i < note.keys.length; i++) {
                note.addModifier(new Parenthesis(ModifierPosition.LEFT), i);
                note.addModifier(new Parenthesis(ModifierPosition.RIGHT), i);
            }
        }
    }
    static format(parentheses, state) {
        if (!parentheses || parentheses.length === 0)
            return false;
        let x_widthL = 0;
        let x_widthR = 0;
        for (let i = 0; i < parentheses.length; ++i) {
            const parenthesis = parentheses[i];
            const note = parenthesis.getNote();
            const pos = parenthesis.getPosition();
            const index = parenthesis.checkIndex();
            let shift = 0;
            if (pos === ModifierPosition.RIGHT) {
                shift = note.getRightParenthesisPx(index);
                x_widthR = x_widthR > shift + parenthesis.width ? x_widthR : shift + parenthesis.width;
            }
            if (pos === ModifierPosition.LEFT) {
                shift = note.getLeftParenthesisPx(index);
                x_widthL = x_widthL > shift + parenthesis.width ? x_widthL : shift + parenthesis.width;
            }
            parenthesis.setXShift(shift);
        }
        state.left_shift += x_widthL;
        state.right_shift += x_widthR;
        return true;
    }
    setNote(note) {
        this.note = note;
        this.point = Tables.currentMusicFont().lookupMetric('parenthesis.default.point');
        this.setWidth(Tables.currentMusicFont().lookupMetric('parenthesis.default.width'));
        if (isGraceNote(note)) {
            this.point = Tables.currentMusicFont().lookupMetric('parenthesis.gracenote.point');
            this.setWidth(Tables.currentMusicFont().lookupMetric('parenthesis.gracenote.width'));
        }
        return this;
    }
    draw() {
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        const start = note.getModifierStartXY(this.position, this.index, { forceFlagRight: true });
        const x = start.x + this.x_shift;
        const y = start.y + this.y_shift;
        if (this.position == Modifier.Position.RIGHT) {
            Glyph.renderGlyph(ctx, x + 1, y, this.point, 'noteheadParenthesisRight', {
                category: `noteHead.standard.noteheadParenthesisRight`,
            });
        }
        else if (this.position == Modifier.Position.LEFT) {
            Glyph.renderGlyph(ctx, x - 2, y, this.point, 'noteheadParenthesisLeft', {
                category: `noteHead.standard.noteheadParenthesisLeft`,
            });
        }
    }
}
