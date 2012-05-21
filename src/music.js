// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements some standard music theory routines.
//
// requires: vex.js   (Vex)
// requires: flow.js  (Vex.Flow)

/**
 * @constructor
 */
Vex.Flow.Music = function() {
  this.init();
}

Vex.Flow.Music.NUM_TONES = 12;

Vex.Flow.Music.roots = [ "c", "d", "e", "f", "g", "a", "b" ];
Vex.Flow.Music.root_values = [ 0, 2, 4, 5, 7, 9, 11 ];
Vex.Flow.Music.root_indices = {
  "c": 0,
  "d": 1,
  "e": 2,
  "f": 3,
  "g": 4,
  "a": 5,
  "b": 6
};

Vex.Flow.Music.canonical_notes = [
  "c", "c#", "d", "d#",
  "e", "f", "f#", "g",
  "g#", "a", "a#", "b"
];

Vex.Flow.Music.diatonic_intervals = [
  "unison", "m2", "M2", "m3", "M3",
  "p4", "dim5", "p5", "m6", "M6",
  "b7", "M7", "octave"
];

Vex.Flow.Music.diatonic_accidentals = {
  "unison": {note: 0, accidental: 0},
  "m2":     {note: 1, accidental: -1},
  "M2":     {note: 1, accidental: 0},
  "m3":     {note: 2, accidental: -1},
  "M3":     {note: 2, accidental: 0},
  "p4":     {note: 3, accidental: 0},
  "dim5":   {note: 4, accidental: -1},
  "p5":     {note: 4, accidental: 0},
  "m6":     {note: 5, accidental: -1},
  "M6":     {note: 5, accidental: 0},
  "b7":     {note: 6, accidental: -1},
  "M7":     {note: 6, accidental: 0},
  "octave": {note: 7, accidental: 0}
}

Vex.Flow.Music.intervals = {
  "u":  0, "unison": 0,
  "m2": 1, "b2": 1, "min2": 1, "S": 1, "H": 1,
  "2": 2, "M2": 2, "maj2": 2, "T": 2, "W": 2,
  "m3": 3, "b3": 3, "min3": 3,
  "M3": 4, "3": 4, "maj3": 4,
  "4":  5, "p4":  5,
  "#4": 6, "b5": 6, "aug4": 6, "dim5": 6,
  "5":  7, "p5":  7,
  "#5": 8, "b6": 8, "aug5": 8,
  "6":  9, "M6":  9, "maj6": 9,
  "b7": 10, "m7": 10, "min7": 10, "dom7": 10,
  "M7": 11, "maj7": 11,
  "8": 12, "octave": 12
};

Vex.Flow.Music.scales = {
  major: [2, 2, 1, 2, 2, 2, 1],
  ionian: [2, 2, 1, 2, 2, 2, 1],
  dorian: [2, 1, 2, 2, 2, 1, 2],
  phrygian: [1, 2, 2, 2, 1, 2, 2],
  lydian: [2, 2, 2, 1, 2, 2, 1],
  mixolydian: [2, 2, 1, 2, 2, 1, 2],
  minor: [2, 1, 2, 2, 1, 2, 2],
  aeolian: [2, 1, 2, 2, 1, 2, 2],
  locrian: [1, 2, 2, 1, 2, 2, 2],
  majorPentatonic: [2,2,3,2],
  minorPentatonic: [3,2,2,3],
  blues: [3, 2, 1, 1, 3]
};

Vex.Flow.Music.scaleIntervalUp = {
  major: "unison",
  ionian: "unison",
  dorian: "2",
  phrygian: "M3",
  lydian: "p4",
  mixolydian: "p5",
  minor: "M6",
  aeolian: "M6",
  locrian: "M7",
  minorPentatonic: "unison",
  majorPentatonic: "M6",
  blues: "M6"
};

Vex.Flow.Music.PreferredKey = {
  'a#':'bb',
  'c#':'db',
  'd#':'eb',
  'g#':'ab'
};

//Vex.Flow.Music.scaleInfo = {
// major: {
//    isMode: false,
//    hasModes: true,
//    modes: ["ionian","dorian", "phrygian","lydian","mixolydian","aeolian","locrian"],
//    tonality: major
// },
// minor: {
//   isMode: false,
//   hasModes: false,
//   modes: [],
//   tonality: minor
// }
//};

Vex.Flow.Music.accidentals = [ "bb", "b", "n", "#", "##" ];

Vex.Flow.Music.noteValues = {
  'c':   { root_index: 0, int_val: 0 },
  'cn':  { root_index: 0, int_val: 0 },
  'c#':  { root_index: 0, int_val: 1 },
  'c##': { root_index: 0, int_val: 2 },
  'cb':  { root_index: 0, int_val: 11 },
  'cbb': { root_index: 0, int_val: 10 },
  'd':   { root_index: 1, int_val: 2 },
  'dn':  { root_index: 1, int_val: 2 },
  'd#':  { root_index: 1, int_val: 3 },
  'd##': { root_index: 1, int_val: 4 },
  'db':  { root_index: 1, int_val: 1 },
  'dbb': { root_index: 1, int_val: 0 },
  'e':   { root_index: 2, int_val: 4 },
  'en':  { root_index: 2, int_val: 4 },
  'e#':  { root_index: 2, int_val: 5 },
  'e##': { root_index: 2, int_val: 6 },
  'eb':  { root_index: 2, int_val: 3 },
  'ebb': { root_index: 2, int_val: 2 },
  'f':   { root_index: 3, int_val: 5 },
  'fn':  { root_index: 3, int_val: 5 },
  'f#':  { root_index: 3, int_val: 6 },
  'f##': { root_index: 3, int_val: 7 },
  'fb':  { root_index: 3, int_val: 4 },
  'fbb': { root_index: 3, int_val: 3 },
  'g':   { root_index: 4, int_val: 7 },
  'gn':  { root_index: 4, int_val: 7 },
  'g#':  { root_index: 4, int_val: 8 },
  'g##': { root_index: 4, int_val: 9 },
  'gb':  { root_index: 4, int_val: 6 },
  'gbb': { root_index: 4, int_val: 5 },
  'a':   { root_index: 5, int_val: 9 },
  'an':  { root_index: 5, int_val: 9 },
  'a#':  { root_index: 5, int_val: 10 },
  'a##': { root_index: 5, int_val: 11 },
  'ab':  { root_index: 5, int_val: 8 },
  'abb': { root_index: 5, int_val: 7 },
  'b':   { root_index: 6, int_val: 11 },
  'bn':  { root_index: 6, int_val: 11 },
  'b#':  { root_index: 6, int_val: 0 },
  'b##': { root_index: 6, int_val: 1 },
  'bb':  { root_index: 6, int_val: 10 },
  'bbb': { root_index: 6, int_val: 9 }
};

Vex.Flow.Music.prototype.init = function() {}

Vex.Flow.Music.prototype.isValidNoteValue = function(note) {
  if (note == null || note < 0 || note >= Vex.Flow.Music.NUM_TONES)
    return false;
  return true;
}

Vex.Flow.Music.prototype.isValidIntervalValue = function(interval) {
  return this.isValidNoteValue(interval);
}

Vex.Flow.Music.prototype.getNoteParts = function(noteString) {
  if (!noteString || noteString.length < 1)
    throw new Vex.RERR("BadArguments", "Invalid note name: " + noteString);

  if (noteString.length > 3)
    throw new Vex.RERR("BadArguments", "Invalid note name: " + noteString);

  var note = noteString.toLowerCase();

  var regex = /^([cdefgab])(b|bb|n|#|##)?$/;
  var match = regex.exec(note);

  if (match != null) {
    var root = match[1];
    var accidental = match[2];

    return {
      'root': root,
      'accidental': accidental
    }
  } else {
    throw new Vex.RERR("BadArguments", "Invalid note name: " + noteString);
  }
}

Vex.Flow.Music.prototype.getKeyParts = function(keyString) {
  if (!keyString || keyString.length < 1)
    throw new Vex.RERR("BadArguments", "Invalid key: " + keyString);

  var key = keyString.toLowerCase();

  // Support Major, Minor, Melodic Minor, and Harmonic Minor key types.
  var regex = /^([cdefgab])(b|#)?(mel|harm|m|M)?$/;
  var match = regex.exec(key);

  if (match != null) {
    var root = match[1];
    var accidental = match[2];
    var type = match[3];

    // Unspecified type implies major
    if (!type) type = "M";

    return {
      'root': root,
      'accidental': accidental,
      'type': type
    }
  } else {
    throw new Vex.RERR("BadArguments", "Invalid key: " + keyString);
  }
}

Vex.Flow.Music.prototype.getNoteValue = function(noteString) {
  var value = Vex.Flow.Music.noteValues[noteString];
  if (value == null)
    throw new Vex.RERR("BadArguments", "Invalid note name: " + noteString);

  return value.int_val;
}

Vex.Flow.Music.prototype.getIntervalValue = function(intervalString) {
  var value = Vex.Flow.Music.intervals[intervalString];
  if (value == null)
    throw new Vex.RERR("BadArguments",
                       "Invalid interval name: " + intervalString);

  return value;
}

Vex.Flow.Music.prototype.getCanonicalNoteName = function(noteValue) {
  if (!this.isValidNoteValue(noteValue))
    throw new Vex.RERR("BadArguments",
                       "Invalid note value: " + noteValue);

  return Vex.Flow.Music.canonical_notes[noteValue];
}

Vex.Flow.Music.prototype.getCanonicalIntervalName = function(intervalValue) {
  if (!this.isValidIntervalValue(intervalValue))
    throw new Vex.RERR("BadArguments",
                       "Invalid interval value: " + intervalValue);

  return Vex.Flow.Music.diatonic_intervals[intervalValue];
}

/* Given a note, interval, and interval direction, product the
 * relative note.
 */
Vex.Flow.Music.prototype.getRelativeNoteValue =
  function(noteValue, intervalValue, direction) {
  if (direction == null) direction = 1;
  if (direction != 1 && direction != -1)
    throw new Vex.RERR("BadArguments", "Invalid direction: " + direction);

  var sum = (noteValue + (direction * intervalValue)) %
    Vex.Flow.Music.NUM_TONES;
  if (sum < 0) sum += Vex.Flow.Music.NUM_TONES;

  return sum;
}

Vex.Flow.Music.prototype.getRelativeNoteName =
  function(root, noteValue) {
  var parts = this.getNoteParts(root);
  var rootValue = this.getNoteValue(parts.root);
  var interval = noteValue - rootValue;

  if (Math.abs(interval) > Vex.Flow.Music.NUM_TONES - 3) {
    var multiplier = 1;
    if (interval > 0 ) multiplier = -1;

    // Possibly wrap around. (Add +1 for modulo operator)
    var reverse_interval = (((noteValue + 1) + (rootValue + 1)) %
      Vex.Flow.Music.NUM_TONES) * multiplier;

    if (Math.abs(reverse_interval) > 2) {
      throw new Vex.RERR("BadArguments", "Notes not related: " + root + ", " +
                        noteValue);
    } else {
      interval = reverse_interval;
    }
  }

  if (Math.abs(interval) > 2)
      throw new Vex.RERR("BadArguments", "Notes not related: " + root + ", " +
                        noteValue);

  var relativeNoteName = parts.root;
  if (interval > 0) {
    for (var i = 1; i <= interval; ++i)
      relativeNoteName += "#";
  } else if (interval < 0) {
    for (var i = -1; i >= interval; --i)
      relativeNoteName += "b";
  }

  return relativeNoteName;
}

/* Return scale tones, given intervals. Each successive interval is
 * relative to the previous one, e.g., Major Scale:
 *
 *   TTSTTTS = [2,2,1,2,2,2,1]
 *
 * When used with key = 0, returns C scale (which is isomorphic to
 * interval list).
 */
Vex.Flow.Music.prototype.getScaleTones = function(key, intervals) {
  var tones = [];
  tones.push(key);

  var nextNote = key;
  for (var i = 0; i < intervals.length; ++i) {
    nextNote = this.getRelativeNoteValue(nextNote,
                                         intervals[i]);
    if (nextNote != key) tones.push(nextNote);
  }

  return tones;
}

/* Returns the interval of a note, given a diatonic scale.
 *
 * E.g., Given the scale C, and the note E, returns M3
 */
Vex.Flow.Music.prototype.getIntervalBetween =
  function(note1, note2, direction) {
  if (direction == null) direction = 1;
  if (direction != 1 && direction != -1)
    throw new Vex.RERR("BadArguments", "Invalid direction: " + direction);
  if (!this.isValidNoteValue(note1) || !this.isValidNoteValue(note2))
    throw new Vex.RERR("BadArguments",
                       "Invalid notes: " + note1 + ", " + note2);
  if (direction == 1)
    var difference = note2 - note1;
  else
    var difference = note1 - note2;

  if (difference < 0) difference += Vex.Flow.Music.NUM_TONES;
  return difference;
}


/* Returns the notes of a scale.
 *
 */


//Mode	          Tonality	    Steps Down	1/2 Steps Down	Interval Down	1/2 Steps Up	Interval Up
//Ionian (Major)	Major         0/12        Unison/Octave	  12/0	        Unison/Octave
//Dorian          Minor	        W         	2	              Major 2nd	    10	          Minor 7th
//Phrygian        Minor	        WW        	4	              Major 3rd	    8	            Minor 6th
//Lydian          Major	        WWH       	5	              Perfect 4th 	7	            Perfect 5th
//Mixolydian      Major / Dom	  WWHW      	7	              Perfect 5th 	5	            Perfect 4th
//Aeolian (Minor) Minor   	    WWHWW     	9	              Major 6th   	3	            Minor 3rd
//Locrian       	Diminished	  WWHWWW      11	            Major 7th   	1	            Minor 2nd
//(Ionian)	      Major     	  WWHWWWH 	  12/0	          Unison/Octave	0/12	        Unison/Octave

Vex.Flow.Music.prototype.getScaleNotes =
  function(tonalCenter, scale) {

  var scaleNotes = [];

  var relNoteValue = this.getRelativeNoteValue(
    this.getNoteValue(tonalCenter),
    this.getIntervalValue(Vex.Flow.Music.scaleIntervalUp[scale]), -1);

  var canNoteName = this.getCanonicalNoteName(relNoteValue);

  if(Vex.Flow.Music.PreferredKey[canNoteName]) {
    canNoteName = Vex.Flow.Music.PreferredKey[canNoteName];
  }

  var manager = new Vex.Flow.KeyManager(canNoteName + 'M');

  var scaleTones = this.getScaleTones(this.getNoteValue(tonalCenter), Vex.Flow.Music.scales[scale]);

  for (var i = 0; i < scaleTones.length; ++i) {
    var note = this.getCanonicalNoteName(scaleTones[i]);
    scaleNotes.push(manager.selectNote(note).note);
  }

  return scaleNotes;
}