import { Tables } from './tables.js';
import { RuntimeError } from './util.js';
export class Tuning {
    static get names() {
        return {
            standard: 'E/5,B/4,G/4,D/4,A/3,E/3',
            dagdad: 'D/5,A/4,G/4,D/4,A/3,D/3',
            dropd: 'E/5,B/4,G/4,D/4,A/3,D/3',
            eb: 'Eb/5,Bb/4,Gb/4,Db/4,Ab/3,Db/3',
            standardBanjo: 'D/5,B/4,G/4,D/4,G/5',
        };
    }
    constructor(tuningString = 'E/5,B/4,G/4,D/4,A/3,E/3,B/2,E/2') {
        this.tuningValues = [];
        this.setTuning(tuningString);
    }
    noteToInteger(noteString) {
        var _a;
        return (_a = Tables.keyProperties(noteString).int_value) !== null && _a !== void 0 ? _a : -1;
    }
    setTuning(tuningString) {
        if (Tuning.names[tuningString]) {
            tuningString = Tuning.names[tuningString];
        }
        this.tuningValues = [];
        const keys = tuningString.split(/\s*,\s*/);
        if (keys.length === 0) {
            throw new RuntimeError('BadArguments', `Invalid tuning string: ${tuningString}`);
        }
        for (let i = 0; i < keys.length; ++i) {
            this.tuningValues[i] = this.noteToInteger(keys[i]);
        }
    }
    getValueForString(stringNum) {
        const s = Number(stringNum);
        if (s < 1 || s > this.tuningValues.length) {
            throw new RuntimeError('BadArguments', `String number must be between 1 and ${this.tuningValues.length}:${stringNum}`);
        }
        return this.tuningValues[s - 1];
    }
    getValueForFret(fretNum, stringNum) {
        const stringValue = this.getValueForString(stringNum);
        const f = Number(fretNum);
        if (f < 0) {
            throw new RuntimeError('BadArguments', `Fret number must be 0 or higher: ${fretNum}`);
        }
        return stringValue + f;
    }
    getNoteForFret(fretNum, stringNum) {
        const noteValue = this.getValueForFret(fretNum, stringNum);
        const octave = Math.floor(noteValue / 12);
        const value = noteValue % 12;
        return `${Tables.integerToNote(value)}/${octave}`;
    }
}
