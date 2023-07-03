import { Formatter } from './formatter.js';
import { Modifier } from './modifier.js';
import { Tables } from './tables.js';
import { Voice } from './voice.js';
export class NoteSubGroup extends Modifier {
    static get CATEGORY() {
        return "NoteSubGroup";
    }
    static format(groups, state) {
        if (!groups || groups.length === 0)
            return false;
        let width = 0;
        for (let i = 0; i < groups.length; ++i) {
            const group = groups[i];
            group.preFormat();
            width += group.getWidth();
        }
        state.left_shift += width;
        return true;
    }
    constructor(subNotes) {
        super();
        this.preFormatted = false;
        this.position = Modifier.Position.LEFT;
        this.subNotes = subNotes;
        this.subNotes.forEach((subNote) => {
            subNote.setIgnoreTicks(false);
        });
        this.width = 0;
        this.formatter = new Formatter();
        this.voice = new Voice({
            num_beats: 4,
            beat_value: 4,
            resolution: Tables.RESOLUTION,
        }).setStrict(false);
        this.voice.addTickables(this.subNotes);
    }
    preFormat() {
        if (this.preFormatted)
            return;
        this.formatter.joinVoices([this.voice]).format([this.voice], 0);
        this.setWidth(this.formatter.getMinTotalWidth());
        this.preFormatted = true;
    }
    setWidth(width) {
        this.width = width;
        return this;
    }
    getWidth() {
        return this.width;
    }
    draw() {
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        this.alignSubNotesWithNote(this.subNotes, note);
        this.subNotes.forEach((subNote) => subNote.setContext(ctx).drawWithStyle());
    }
}
