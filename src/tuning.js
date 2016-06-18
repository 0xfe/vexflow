// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This class implements varies types of tunings for tablature.

import { Vex } from './vex';
import { Flow } from './tables';

export var Tuning = (function() {
  function Tuning(tuningString) {
    this.init(tuningString);
  }

  Tuning.names = {
    "standard": "E/5,B/4,G/4,D/4,A/3,E/3",
    "standard7": "E/5,B/4,G/4,D/4,A/3,E/3,B/2",
    "standard8": "E/5,B/4,G/4,D/4,A/3,E/3,B/2,F#/2",
    "standard9": "E/5,B/4,G/4,D/4,A/3,E/3,B/2,F#/2,C#/2",
    "standard10": "E/5,B/4,G/4,D/4,A/3,E/3,B/2,F#/2,C#/2,G#/1",
    "dagdad": "D/5,A/4,G/4,D/4,A/3,D/3",
    "dropd": "E/5,B/4,G/4,D/4,A/3,D/3",
    "eb": "Eb/5,Bb/4,Gb/4,Db/4,Ab/3,Db/3",
    "standardbass": "G/3,D/3,A/2,E/2",
    "standard5bass": "G/3,D/3,A/2,E/2,B/1",
    "standardBanjo": "D/5,B/4,G/4,D/4,G/5"
  };

  Tuning.prototype = {
    init: function(tuningString) {
      // Default to standard tuning.
      this.setTuning(tuningString || "E/5,B/4,G/4,D/4,A/3,E/3,B/2,E/2"); 
    },

    noteToInteger: function(noteString) {
      return Flow.keyProperties(noteString).int_value;
    },

    setTuning: function(noteString) {
      if (Tuning.names[noteString])
        noteString = Tuning.names[noteString];

      this.tuningString = noteString;
      this.tuningValues = [];
      this.numStrings = 0;

      var keys = noteString.split(/\s*,\s*/);
      if (keys.length === 0)
        throw new Vex.RERR("BadArguments", "Invalid tuning string: " + noteString);

      this.numStrings = keys.length;
      for (var i = 0; i < this.numStrings; ++i) {
        this.tuningValues[i] = this.noteToInteger(keys[i]);
      }
    },

    getValueForString: function(stringNum) {
      var s = parseInt(stringNum, 10);
      if (s < 1 || s > this.numStrings)
        throw new Vex.RERR("BadArguments", "String number must be between 1 and " +
            this.numStrings + ": " + stringNum);

      return this.tuningValues[s - 1];
    },

    getValueForFret: function(fretNum, stringNum) {
      var stringValue = this.getValueForString(stringNum);
      var f = parseInt(fretNum, 10);

      if (f < 0) {
        throw new Vex.RERR("BadArguments", "Fret number must be 0 or higher: " +
            fretNum);
      }

      return stringValue + f;
    },

    getNoteForFret: function(fretNum, stringNum) {
      var noteValue = this.getValueForFret(fretNum, stringNum);

      var octave = Math.floor(noteValue / 12);
      var value = noteValue % 12;

      return Flow.integerToNote(value) + "/" + octave;
    }
  };

  return Tuning;
}());
