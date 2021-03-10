// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This class implements varies types of tunings for tablature.

import { Vex } from './vex';
import { Flow } from './tables';

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
    // Default to standard tuning.
    this.setTuning(tuningString);
  }

  noteToInteger(noteString) {
    return Flow.keyProperties(noteString).int_value;
  }

  setTuning(noteString) {
    if (Tuning.names[noteString]) {
      noteString = Tuning.names[noteString];
    }

    this.tuningString = noteString;
    this.tuningValues = [];
    this.numStrings = 0;

    const keys = noteString.split(/\s*,\s*/);
    if (keys.length === 0) {
      throw new Vex.RERR('BadArguments', 'Invalid tuning string: ' + noteString);
    }

    this.numStrings = keys.length;
    for (let i = 0; i < this.numStrings; ++i) {
      this.tuningValues[i] = this.noteToInteger(keys[i]);
    }
  }

  getValueForString(stringNum) {
    const s = parseInt(stringNum, 10);
    if (s < 1 || s > this.numStrings) {
      throw new Vex.RERR('BadArguments', `String number must be between 1 and ${this.numStrings}:${stringNum}`);
    }

    return this.tuningValues[s - 1];
  }

  getValueForFret(fretNum, stringNum) {
    const stringValue = this.getValueForString(stringNum);
    const f = parseInt(fretNum, 10);

    if (f < 0) {
      throw new Vex.RERR('BadArguments', 'Fret number must be 0 or higher: ' + fretNum);
    }

    return stringValue + f;
  }

  getNoteForFret(fretNum, stringNum) {
    const noteValue = this.getValueForFret(fretNum, stringNum);

    const octave = Math.floor(noteValue / 12);
    const value = noteValue % 12;

    return Flow.integerToNote(value) + '/' + octave;
  }
}
