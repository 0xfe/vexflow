import { Music } from './music.js';
import { RuntimeError } from './util.js';
export class KeyManager {
    constructor(key) {
        this.music = new Music();
        this.setKey(key);
    }
    setKey(key) {
        this.key = key;
        this.reset();
        return this;
    }
    getKey() {
        return this.key;
    }
    reset() {
        this.keyParts = this.music.getKeyParts(this.key);
        this.keyString = this.keyParts.root;
        if (this.keyParts.accidental)
            this.keyString += this.keyParts.accidental;
        const is_supported_type = Music.scaleTypes[this.keyParts.type];
        if (!is_supported_type) {
            throw new RuntimeError('BadArguments', `Unsupported key type: ${this.key}`);
        }
        this.scale = this.music.getScaleTones(this.music.getNoteValue(this.keyString), Music.scaleTypes[this.keyParts.type]);
        this.scaleMap = {};
        this.scaleMapByValue = {};
        this.originalScaleMapByValue = {};
        const noteLocation = Music.root_indices[this.keyParts.root];
        for (let i = 0; i < Music.roots.length; ++i) {
            const index = (noteLocation + i) % Music.roots.length;
            const rootName = Music.roots[index];
            const noteName = this.music.getRelativeNoteName(rootName, this.scale[i]);
            this.scaleMap[rootName] = noteName;
            this.scaleMapByValue[this.scale[i]] = noteName;
            this.originalScaleMapByValue[this.scale[i]] = noteName;
        }
        return this;
    }
    getAccidental(key) {
        const root = this.music.getKeyParts(key).root;
        const parts = this.music.getNoteParts(this.scaleMap[root]);
        return {
            note: this.scaleMap[root],
            accidental: parts.accidental,
        };
    }
    selectNote(note) {
        note = note.toLowerCase();
        const parts = this.music.getNoteParts(note);
        const scaleNote = this.scaleMap[parts.root];
        const modparts = this.music.getNoteParts(scaleNote);
        if (scaleNote === note) {
            return {
                note: scaleNote,
                accidental: parts.accidental,
                change: false,
            };
        }
        const valueNote = this.scaleMapByValue[this.music.getNoteValue(note)];
        if (valueNote != null) {
            return {
                note: valueNote,
                accidental: this.music.getNoteParts(valueNote).accidental,
                change: false,
            };
        }
        const originalValueNote = this.originalScaleMapByValue[this.music.getNoteValue(note)];
        if (originalValueNote != null) {
            this.scaleMap[modparts.root] = originalValueNote;
            delete this.scaleMapByValue[this.music.getNoteValue(scaleNote)];
            this.scaleMapByValue[this.music.getNoteValue(note)] = originalValueNote;
            return {
                note: originalValueNote,
                accidental: this.music.getNoteParts(originalValueNote).accidental,
                change: true,
            };
        }
        if (modparts.root === note) {
            delete this.scaleMapByValue[this.music.getNoteValue(this.scaleMap[parts.root])];
            this.scaleMapByValue[this.music.getNoteValue(modparts.root)] = modparts.root;
            this.scaleMap[modparts.root] = modparts.root;
            return {
                note: modparts.root,
                accidental: undefined,
                change: true,
            };
        }
        delete this.scaleMapByValue[this.music.getNoteValue(this.scaleMap[parts.root])];
        this.scaleMapByValue[this.music.getNoteValue(note)] = note;
        delete this.scaleMap[modparts.root];
        this.scaleMap[modparts.root] = note;
        return {
            note,
            accidental: parts.accidental,
            change: true,
        };
    }
}
