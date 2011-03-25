// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

/*
  NoteToGlyph:

  Take a note in the format "Key/Octave" (e.g., "C/5") and return properties.
*/
Vex.Flow.keyProperties = function(key) {
  var pieces = key.split("/");

  if (pieces.length != 2) {
    throw new Vex.RERR("BadArguments",
        "Key must have note + octave: " + key);
  }

  var k = pieces[0].toUpperCase();
  var value = Vex.Flow.keyProperties.note_values[k];
  if (!value) throw new Vex.RERR("BadArguments", "Invalid key name: " + k);
  if (value.octave) pieces[1] = value.octave;

  var o = pieces[1];
  var base_index = (o * 7) - (4 * 7);
  var line = (base_index + value.index) / 2;
  var stroke = 0;

  if (line <= 0 && (((line * 2) % 2) == 0)) stroke = 1;  // stroke up
  if (line >= 6 && (((line * 2) % 2) == 0)) stroke = -1; // stroke down

  // Integer value for note arithmetic.
  var int_value = (typeof(value.int_val)!='undefined') ? (o * 12) +
    value.int_val : null;

  return {
    key: k,
    octave: o,
    line: line,
    int_value: int_value,
    accidental: value.accidental,
    code: value.code,
    stroke: stroke,
    shift_right: value.shift_right,
    displaced: false
  };
};

Vex.Flow.keyProperties.note_values = {
  'C':  { index: 0, int_val: 0, accidental: null },
  'CN': { index: 0, int_val: 0, accidental: "n" },
  'C#': { index: 0, int_val: 1, accidental: "#" },
  'C##': { index: 0, int_val: 2, accidental: "##" },
  'CB': { index: 0, int_val: -1, accidental: "b" },
  'CBB': { index: 0, int_val: -2, accidental: "bb" },
  'D':  { index: 1, int_val: 2, accidental: null },
  'DN': { index: 1, int_val: 2, accidental: "n" },
  'D#': { index: 1, int_val: 3, accidental: "#" },
  'D##': { index: 1, int_val: 4, accidental: "##" },
  'DB': { index: 1, int_val: 1, accidental: "b" },
  'DBB': { index: 1, int_val: 0, accidental: "bb" },
  'E':  { index: 2, int_val: 4, accidental: null },
  'EN': { index: 2, int_val: 4, accidental: "n" },
  'E#': { index: 2, int_val: 5, accidental: "#" },
  'E##': { index: 2, int_val: 6, accidental: "##" },
  'EB': { index: 2, int_val: 3, accidental: "b" },
  'EBB': { index: 2, int_val: 2, accidental: "bb" },
  'F':  { index: 3, int_val: 5, accidental: null },
  'FN': { index: 3, int_val: 5, accidental: "n" },
  'F#': { index: 3, int_val: 6, accidental: "#" },
  'F##': { index: 3, int_val: 7, accidental: "##" },
  'FB': { index: 3, int_val: 4, accidental: "b" },
  'FBB': { index: 3, int_val: 3, accidental: "bb" },
  'G':  { index: 4, int_val: 7, accidental: null },
  'GN': { index: 4, int_val: 7, accidental: "n" },
  'G#': { index: 4, int_val: 8, accidental: "#" },
  'G##': { index: 4, int_val: 9, accidental: "##" },
  'GB': { index: 4, int_val: 6, accidental: "b" },
  'GBB': { index: 4, int_val: 5, accidental: "bb" },
  'A':  { index: 5, int_val: 9, accidental: null },
  'AN': { index: 5, int_val: 9, accidental: "n" },
  'A#': { index: 5, int_val: 10, accidental: "#" },
  'A##': { index: 5, int_val: 11, accidental: "##" },
  'AB': { index: 5, int_val: 8, accidental: "b" },
  'ABB': { index: 5, int_val: 7, accidental: "bb" },
  'B':  { index: 6, int_val: 11, accidental: null },
  'BN': { index: 6, int_val: 11, accidental: "n" },
  'B#': { index: 6, int_val: 12, accidental: "#" },
  'B##': { index: 6, int_val: 13, accidental: "##" },
  'BB': { index: 6, int_val: 10, accidental: "b" },
  'BBB': { index: 6, int_val: 9, accidental: "bb" },
  'R': { index: 6, int_val: 9, rest: true }, // Rest
  'X':  {
    index: 6,
    accidental: "",
    octave: 4,
    code: "v3e",
    shift_right: 5.5
  }
}


Vex.Flow.integerToNote = function(integer) {
  if (typeof(integer) == "undefined")
    throw new Vex.RERR("BadArguments", "Undefined integer for integerToNote");

  if (integer < -2)
    throw new Vex.RERR("BadArguments",
        "integerToNote requires integer > -2: " + integer);

  var noteValue = Vex.Flow.integerToNote.table[integer];
  if (!noteValue)
    throw new Vex.RERR("BadArguments", "Unkown note value for integer: " +
        integer);

  return noteValue;
}

Vex.Flow.integerToNote.table = {
  0: "C",
  1: "C#",
  2: "D",
  3: "D#",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "G#",
  9: "A",
  10: "A#",
  11: "B"
};


Vex.Flow.tabToGlyph = function(fret) {
  var glyph = null;
  var width = 0;
  var shift_y = 0;

  if (fret.toString().toUpperCase() == "X") {
    glyph = "v7f";
    width = 7;
    shift_y = -4.5;
  } else {
    width = 5 * fret.toString().length;
  }

  return {
    text: fret,
    code: glyph,
    width: width,
    shift_y: shift_y
  };
};

Vex.Flow.textWidth = function(text) {
  return 5 * text.toString().length;
}

Vex.Flow.accidentalCodes = function(acc) {
  return Vex.Flow.accidentalCodes.accidentals[acc];
}

Vex.Flow.accidentalCodes.accidentals = {
  "#": {
    code: "v18",
    width: 10,
    shift_right: 0,
    shift_down: 0
  },
  "##": {
    code: "v7f",
    width: 13,
    shift_right: -1,
    shift_down: 0
  },
  "b": {
    code: "v44",
    width: 8,
    shift_right: 0,
    shift_down: 0
  },
  "bb": {
    code: "v26",
    width: 14,
    shift_right: -3,
    shift_down: 0
  },
  "n": {
    code: "v4e",
    width: 8,
    shift_right: 0,
    shift_down: 0
  }
};

Vex.Flow.keySignature = function(spec) {
  var keySpec = Vex.Flow.keySignature.keySpecs[spec];

  if (keySpec == undefined) {
    throw new Vex.RERR("BadKeySignature",
        "Bad key signature spec: '" + spec + "'");
  }

  if (!keySpec.acc) {
    return [];
  }

  var code = Vex.Flow.accidentalCodes.accidentals[keySpec.acc].code;
  var notes = Vex.Flow.keySignature.accidentalList(keySpec.acc);

  var acc_list = new Array();
  for (var i = 0; i < keySpec.num; ++i) {
    var line = notes[i];
    acc_list.push({glyphCode: code, line: line});
  }

  return acc_list;
}

Vex.Flow.keySignature.keySpecs = {
  "C": {acc: null, num: 0},
  "Am": {acc: null, num: 0},
  "F": {acc: "b", num: 1},
  "Dm": {acc: "b", num: 1},
  "Bb": {acc: "b", num: 2},
  "Gm": {acc: "b", num: 2},
  "Eb": {acc: "b", num: 3},
  "Cm": {acc: "b", num: 3},
  "Ab": {acc: "b", num: 4},
  "Fm": {acc: "b", num: 4},
  "Db": {acc: "b", num: 5},
  "Bbm": {acc: "b", num: 5},
  "Gb": {acc: "b", num: 6},
  "Ebm": {acc: "b", num: 6},
  "Cb": {acc: "b", num: 7},
  "Abm": {acc: "b", num: 7},
  "G": {acc: "#", num: 1},
  "Em": {acc: "#", num: 1},
  "D": {acc: "#", num: 2},
  "Bm": {acc: "#", num: 2},
  "A": {acc: "#", num: 3},
  "F#m": {acc: "#", num: 3},
  "E": {acc: "#", num: 4},
  "C#m": {acc: "#", num: 4},
  "B": {acc: "#", num: 5},
  "G#m": {acc: "#", num: 5},
  "F#": {acc: "#", num: 6},
  "D#m": {acc: "#", num: 6},
  "C#": {acc: "#", num: 7},
  "A#m": {acc: "#", num: 7}
};

Vex.Flow.keySignature.accidentalList = function(acc) {
  if (acc == "b") {
    return [2, 0.5, 2.5, 1, 3, 1.5, 3.5];
  }
  else if (acc == "#") {
    return [0, 1.5, -0.5, 1, 2.5, 0.5, 2]; }
}

Vex.Flow.durationToTicks = {
  "w":    Vex.Flow.RESOLUTION / 1,
  "wr":   Vex.Flow.RESOLUTION / 1,
  "h":    Vex.Flow.RESOLUTION / 2,
  "hr":   Vex.Flow.RESOLUTION / 2,
  "hd":   (Vex.Flow.RESOLUTION / 2) + (Vex.Flow.RESOLUTION / 4),
  "q":    Vex.Flow.RESOLUTION / 4,
  "qr":   Vex.Flow.RESOLUTION / 4,
  "qd":   (Vex.Flow.RESOLUTION / 4) + (Vex.Flow.RESOLUTION / 8),
  "8":    Vex.Flow.RESOLUTION / 8,
  "8r":   Vex.Flow.RESOLUTION / 8,
  "8d":   (Vex.Flow.RESOLUTION / 8) + (Vex.Flow.RESOLUTION / 16),
  "16":   Vex.Flow.RESOLUTION / 16,
  "16r":  Vex.Flow.RESOLUTION / 16,
  "16d":  (Vex.Flow.RESOLUTION / 16) + (Vex.Flow.RESOLUTION / 32),
  "32":   Vex.Flow.RESOLUTION / 32,
  "32d":  (Vex.Flow.RESOLUTION / 32) + (Vex.Flow.RESOLUTION / 64),
  "32r":  Vex.Flow.RESOLUTION / 32,
  "b":    Vex.Flow.RESOLUTION / 32
};

Vex.Flow.durationToGlyph = function(duration) {
  return Vex.Flow.durationToGlyph.duration_codes[duration];
}

Vex.Flow.durationIsDotted = function(duration) {
  var ret = Vex.Flow.durationToGlyph.duration_codes[duration].dot;
  if (ret == undefined)
    return false;
  return ret;
}

Vex.Flow.durationToGlyph.duration_codes = {
  "w": { // Whole note
    code_head: "v1d",
    code_rest: "v5c",
    head_width: 16.5,
    stem: false,
    flag: false
  },
  "wr": { // Whole rest
    code_head: "v5c",
    head_width: 10.5,
    stem: false,
    flag: false,
    rest: true,
    position: "D/5"
  },
  "h": { // Half note
    code_head: "v81",
    code_rest: "vc",
    head_width: 10.5,
    stem: true,
    flag: false
  },
  "hr": { // Half rest
    code_head: "vc",
    head_width: 10.5,
    stem: false,
    flag: false,
    rest: true,
    position: "B/4"
  },
  "hd": { // Dotted half note
    code_head: "v81",
    code_rest: "vc",
    head_width: 10.5,
    stem: true,
    flag: false,
    dot: true
  },
  "q": { // Quarter note
    code_head: "vb",
    code_rest: "v7c",
    head_width: 10.5,
    stem: true,
    flag: false
  },
  "qr": { // Quarter rest
    code_head: "v7c",
    head_width: 10.5,
    rest: true,
    position: "B/4",
    stem: false,
    flag: false
  },
  "qd": { // Dotted quarter note
    code_head: "vb",
    code_rest: "v7c",
    head_width: 10.5,
    stem: true,
    flag: false,
    dot: true
  },
  "8": { // Eighth note
    code_head: "vb",
    code_rest: "va5",
    head_width: 10.5,
    stem: true,
    flag: true,
    beam_count: 1,
    code_flag_upstem: "v54",
    code_flag_downstem: "v9a"
  },
  "8r": { // Eighth rest
    code_head: "va5",
    head_width: 10.5,
    stem: false,
    flag: false,
    rest: true,
    beam_count: 1,
    position: "B/4"
  },
  "8d": {
    code_head: "vb",
    code_rest: "va5",
    head_width: 10.5,
    stem: true,
    flag: true,
    beam_count: 1,
    code_flag_upstem: "v54",
    code_flag_downstem: "v9a",
    dot: true
  },
  "16": {
    beam_count: 2,
    code_head: "vb",
    code_rest: "v3c",
    head_width: 10.5,
    stem: true,
    flag: true,
    code_flag_upstem: "v3f",
    code_flag_downstem: "v8f"
  },
  "16r": {
    beam_count: 2,
    code_head: "v3c",
    head_width: 10.5,
    stem: false,
    flag: false,
    rest: true,
    position: "B/4"
  },
  "16d": {
    beam_count: 2,
    code_head: "vb",
    code_rest: "v3c",
    head_width: 10.5,
    stem: true,
    flag: true,
    code_flag_upstem: "v3f",
    code_flag_downstem: "v8f",
    dot: true
  },
  "32": {
    beam_count: 3,
    code_head: "vb",
    code_rest: "v55",
    head_width: 10.5,
    stem: true,
    flag: true,
    code_flag_upstem: "v47",
    code_flag_downstem: "v2a"
  },
  "32d": {
    beam_count: 3,
    code_head: "vb",
    code_rest: "v55",
    head_width: 10.5,
    dot: true,
    flag: true,
    code_flag_upstem: "v47",
    code_flag_downstem: "v2a",
    stem: true
  },
  "32r": {
    beam_count: 3,
    code_head: "v55",
    head_width: 10.5,
    stem: false,
    flag: false,
    rest: true,
    position: "B/4"
  }
};

// Some defaults
Vex.Flow.TIME4_4 = {
  num_beats: 4,
  beat_value: 4,
  resolution: Vex.Flow.RESOLUTION
};
