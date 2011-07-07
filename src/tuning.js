// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements varies types of tunings for tablature.

/**
 * @constructor
 */
Vex.Flow.Tuning = function(tuningString) {
  this.init(tuningString);
}

Vex.Flow.Tuning.names = {
  "standard": "E/5,B/4,G/4,D/4,A/3,E/3",
  "dagdad": "D/5,A/4,G/4,D/4,A/3,D/3",
  "dropd": "E/5,B/4,G/4,D/4,A/3,D/3",
  "eb": "Eb/5,Bb/4,Gb/4,Db/4,Ab/3,Db/3"
}

Vex.Flow.Tuning.prototype.init = function(tuningString) {
  // Default to standard tuning.
  this.setTuning(tuningString || "E/5,B/4,G/4,D/4,A/3,E/3");
}

Vex.Flow.Tuning.prototype.noteToInteger = function(noteString) {
  return Vex.Flow.keyProperties(noteString).int_value;
}

Vex.Flow.Tuning.prototype.setTuning = function(noteString) {
  if (Vex.Flow.Tuning.names[noteString])
    noteString = Vex.Flow.Tuning.names[noteString];

  this.tuningString = noteString;
  this.tuningValues = [];
  this.numStrings = 0;

  var keys = noteString.split(/\s*,\s*/);
  if (keys.length == 0)
    throw new Vex.RERR("BadArguments", "Invalid tuning string: " + noteString);

  this.numStrings = keys.length;
  for (var i = 0; i < this.numStrings; ++i) {
    this.tuningValues[i] = this.noteToInteger(keys[i]);
  }
}

Vex.Flow.Tuning.prototype.getValueForString = function(stringNum) {
  var s = parseInt(stringNum);
  if (s < 1 || s > this.numStrings)
    throw new Vex.RERR("BadArguments", "String number must be between 1 and " +
        this.numStrings + ": " + stringNum);

  return this.tuningValues[s - 1];
}

Vex.Flow.Tuning.prototype.getValueForFret = function(fretNum, stringNum) {
  var stringValue = this.getValueForString(stringNum);
  var f = parseInt(fretNum);

  if (f < 0) {
    throw new Vex.RERR("BadArguments", "Fret number must be 0 or higher: " +
        fretNum);
  }

  return stringValue + f;
}

Vex.Flow.Tuning.prototype.getNoteForFret = function(fretNum, stringNum) {
  var noteValue = this.getValueForFret(fretNum, stringNum);

  var octave = Math.floor(noteValue / 12);
  var value = noteValue % 12;

  return Vex.Flow.integerToNote(value) + "/" + octave;
}
