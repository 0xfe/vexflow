import { Accidental } from './accidental.js';
import { Annotation } from './annotation.js';
import { Articulation } from './articulation.js';
import { Bend } from './bend.js';
import { ChordSymbol } from './chordsymbol.js';
import { Dot } from './dot.js';
import { FretHandFinger } from './frethandfinger.js';
import { GraceNoteGroup } from './gracenotegroup.js';
import { NoteSubGroup } from './notesubgroup.js';
import { Ornament } from './ornament.js';
import { Parenthesis } from './parenthesis.js';
import { StaveNote } from './stavenote.js';
import { StringNumber } from './stringnumber.js';
import { Stroke } from './strokes.js';
import { log, RuntimeError } from './util.js';
import { Vibrato } from './vibrato.js';
function L(...args) {
    if (ModifierContext.DEBUG)
        log('Vex.Flow.ModifierContext', args);
}
export class ModifierContext {
    constructor() {
        this.preFormatted = false;
        this.postFormatted = false;
        this.members = {};
        this.width = 0;
        this.spacing = 0;
        this.state = {
            left_shift: 0,
            right_shift: 0,
            text_line: 0,
            top_text_line: 0,
        };
        this.PREFORMAT = [
            StaveNote,
            Parenthesis,
            Dot,
            FretHandFinger,
            Accidental,
            Stroke,
            GraceNoteGroup,
            NoteSubGroup,
            StringNumber,
            Articulation,
            Ornament,
            Annotation,
            ChordSymbol,
            Bend,
            Vibrato,
        ];
        this.POSTFORMAT = [StaveNote];
    }
    addModifier(member) {
        L('addModifier is deprecated, use addMember instead.');
        return this.addMember(member);
    }
    addMember(member) {
        const category = member.getCategory();
        if (!this.members[category]) {
            this.members[category] = [];
        }
        this.members[category].push(member);
        member.setModifierContext(this);
        this.preFormatted = false;
        return this;
    }
    getModifiers(category) {
        L('getModifiers is deprecated, use getMembers instead.');
        return this.getMembers(category);
    }
    getMembers(category) {
        return this.members[category];
    }
    getWidth() {
        return this.width;
    }
    getLeftShift() {
        return this.state.left_shift;
    }
    getRightShift() {
        return this.state.right_shift;
    }
    getState() {
        return this.state;
    }
    getMetrics() {
        if (!this.formatted) {
            throw new RuntimeError('UnformattedMember', 'Unformatted member has no metrics.');
        }
        return {
            width: this.state.left_shift + this.state.right_shift + this.spacing,
            spacing: this.spacing,
        };
    }
    preFormat() {
        if (this.preFormatted)
            return;
        this.PREFORMAT.forEach((member) => {
            L('Preformatting ModifierContext: ', member.CATEGORY);
            member.format(this.getMembers(member.CATEGORY), this.state, this);
        });
        this.width = this.state.left_shift + this.state.right_shift;
        this.preFormatted = true;
    }
    postFormat() {
        if (this.postFormatted)
            return;
        this.POSTFORMAT.forEach((member) => {
            L('Postformatting ModifierContext: ', member.CATEGORY);
            member.postFormat(this.getMembers(member.CATEGORY));
        });
    }
}
ModifierContext.DEBUG = false;
