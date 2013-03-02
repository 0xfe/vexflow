// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

Vex.Flow.clefProperties = function(clef) {
  if (!clef) throw new Vex.RERR("BadArgument", "Invalid clef: " + clef);

  var props = Vex.Flow.clefProperties.values[clef];
  if (!props) throw new Vex.RERR("BadArgument", "Invalid clef: " + clef);

  return props;
}

Vex.Flow.clefProperties.values = {
  'treble':  { line_shift: 0 },
  'bass':    { line_shift: 6 },
  'tenor':   { line_shift: 4 },
  'alto':    { line_shift: 3 },
  'percussion': { line_shift: 0 }
};

/*
  Take a note in the format "Key/Octave" (e.g., "C/5") and return properties.
*/
Vex.Flow.keyProperties = function(key, clef) {
  if (clef === undefined) {
    clef = 'treble';
  }

  var pieces = key.split("/");

  if (pieces.length < 2) {
    throw new Vex.RERR("BadArguments",
        "Key must have note + octave and an optional glyph: " + key);
  }

  var k = pieces[0].toUpperCase();
  var value = Vex.Flow.keyProperties.note_values[k];
  if (!value) throw new Vex.RERR("BadArguments", "Invalid key name: " + k);
  if (value.octave) pieces[1] = value.octave;

  var o = pieces[1];
  var base_index = (o * 7) - (4 * 7);
  var line = (base_index + value.index) / 2;
  line += Vex.Flow.clefProperties(clef).line_shift;

  var stroke = 0;

  if (line <= 0 && (((line * 2) % 2) == 0)) stroke = 1;  // stroke up
  if (line >= 6 && (((line * 2) % 2) == 0)) stroke = -1; // stroke down

  // Integer value for note arithmetic.
  var int_value = (typeof(value.int_val)!='undefined') ? (o * 12) +
    value.int_val : null;

  /* Check if the user specified a glyph. */
  var code = value.code;
  var shift_right = value.shift_right;
  if ((pieces.length > 2) && (pieces[2])) {
    var glyph_name = pieces[2].toUpperCase();
    var note_glyph = Vex.Flow.keyProperties.note_glyph[glyph_name];
    if (note_glyph) {
      code = note_glyph.code;
      shift_right = note_glyph.shift_right;
    }
  }

  return {
    key: k,
    octave: o,
    line: line,
    int_value: int_value,
    accidental: value.accidental,
    code: code,
    stroke: stroke,
    shift_right: shift_right,
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

Vex.Flow.keyProperties.note_glyph = {
  /* Diamond */
  'D0':  { code: "v27", shift_right: -0.5 },
  'D1':  { code: "v2d", shift_right: -0.5 },
  'D2':  { code: "v22", shift_right: -0.5 },
  'D3':  { code: "v70", shift_right: -0.5 },

  /* Triangle */
  'T0':  { code: "v49", shift_right: -2 },
  'T1':  { code: "v93", shift_right: 0.5 },
  'T2':  { code: "v40", shift_right: 0.5 },
  'T3':  { code: "v7d", shift_right: 0.5 },

  /* Cross */
  'X0':  { code: "v92", shift_right: -2 },
  'X1':  { code: "v95", shift_right: -0.5 },
  'X2':  { code: "v7f", shift_right: 0.5 },
  'X3':  { code: "v3b", shift_right: -2 }
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
    width = Vex.Flow.textWidth(fret.toString());
  }

  return {
    text: fret,
    code: glyph,
    width: width,
    shift_y: shift_y
  };
};

Vex.Flow.textWidth = function(text) {
  return 6 * text.toString().length;
}

Vex.Flow.articulationCodes = function(artic) {
  return Vex.Flow.articulationCodes.articulations[artic];
}

Vex.Flow.articulationCodes.articulations = {
  "a.": {   // Stacato
    code: "v23",
    width: 4,
    shift_right: -2,
    shift_up: 0,
    shift_down: 0
  },
  "av": {   // Staccatissimo
    code: "v28",
    width: 4,
    shift_right: 0,
    shift_up: 2,
    shift_down: 5
  },
  "a>": {   // Accent
    code: "v42",
    width: 10,
    shift_right: 5,
    shift_up: -2,
    shift_down: 2
  },
  "a-": {   // Tenuto
    code: "v25",
    width: 9,
    shift_right: -4,
    shift_up: 8,
    shift_down: 10
  },
  "a^": {   // Marcato
    code: "va",
    width: 8,
    shift_right: 0,
    shift_up: -10,
    shift_down: -1
  },
  "a+": {   // Left hand pizzicato
    code: "v8b",
    width: 9,
    shift_right: -4,
    shift_up: 6,
    shift_down: 12
  },
  "ao": {   // Snap pizzicato
    code: "v94",
    width: 8,
    shift_right: 0,
    shift_up: -4,
    shift_down: 4
  },
  "ah": {   // Natural harmonic or open note
    code: "vb9",
    width: 7,
    shift_right: 0,
    shift_up: -4,
    shift_down: 4
  },
  "a@a": {   // Fermata above staff
    code: "v43",
    width: 25,
    shift_right: 0,
    shift_up: 5,
    shift_down: 0
  },
  "a@u": {   // Fermata below staff
    code: "v5b",
    width: 25,
    shift_right: 0,
    shift_up: 0,
    shift_down: -3
  },
  "a|": {   // Bow up - up stroke
    code: "v75",
    width: 8,
    shift_right: 0,
    shift_up: 0,
    shift_down: 11
  },
  "am": {   // Bow down - down stroke
    code: "v97",
    width: 13,
    shift_right: 0,
    shift_up: 0,
    shift_down: 14
  },
  "a,": {   // Choked
    code: "vb3",
    width: 6,
    shift_right: 8,
    shift_up: -4,
    shift_down: 4
  }
};

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
  },
  "{": {   // Left paren for cautionary accidentals
    code: "v9c",
    width: 5,
    shift_right: 2,
    shift_down: 0
  },
  "}": {   // Right paren for cautionary accidentals
    code: "v84",
    width: 5,
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

Vex.Flow.parseNoteDurationString = function(durationString) {
  if (typeof(durationString) !== "string") {
    return null;
  }

  var regexp = /(\d+|[a-z])(d*)([nrhms]|$)/;

  var result = regexp.exec(durationString);
  if (!result) {
    return null;
  }

  var duration = result[1];
  var dots = result[2].length;
  var type = result[3];

  if (type.length === 0) {
    type = "n";
  }

  return {
    duration: duration,
    dots: dots,
    type: type
  };
}

Vex.Flow.parseNoteData = function(noteData) {
  var duration = noteData.duration;

  // Preserve backwards-compatibility
  var durationStringData = Vex.Flow.parseNoteDurationString(duration);
  if (!durationStringData) {
    return null;
  }

  var ticks = Vex.Flow.durationToTicks(durationStringData.duration);
  if (ticks == null) {
    return null;
  }

  var type = noteData.type;

  if (type) {
    if (!(type === "n" || type === "r" || type === "h" ||
          type === "m" || type === "s")) {
      return null;
    }
  } else {
    type = durationStringData.type;
    if (!type) {
      type = "n";
    }
  }

  var dots = 0;
  if (noteData.dots) {
    dots = noteData.dots;
  } else {
    dots = durationStringData.dots;
  }

  if (typeof(dots) !== "number") {
    return null;
  }

  var currentTicks = ticks;

  for (var i = 0; i < dots; i++) {
    if (currentTicks <= 1) {
      return null;
    }

    currentTicks = currentTicks / 2;
    ticks += currentTicks;
  }

  return {
    duration: durationStringData.duration,
    type: type,
    dots: dots,
    ticks: ticks
  };
}

Vex.Flow.durationToTicks = function(duration) {
  var alias = Vex.Flow.durationAliases[duration];
  if (alias !== undefined) {
    duration = alias;
  }

  var ticks = Vex.Flow.durationToTicks.durations[duration];
  if (ticks === undefined) {
    return null;
  }

  return ticks;
}

Vex.Flow.durationToTicks.durations = {
  "1":    Vex.Flow.RESOLUTION / 1,
  "2":    Vex.Flow.RESOLUTION / 2,
  "4":    Vex.Flow.RESOLUTION / 4,
  "8":    Vex.Flow.RESOLUTION / 8,
  "16":   Vex.Flow.RESOLUTION / 16,
  "32":   Vex.Flow.RESOLUTION / 32,
  "64":   Vex.Flow.RESOLUTION / 64,
  "256":   Vex.Flow.RESOLUTION / 256
};

Vex.Flow.durationAliases = {
  "w": "1",
  "h": "2",
  "q": "4",

  // This is the default duration used to render bars (BarNote). Bars no longer
  // consume ticks, so this should be a no-op.
  //
  // TODO(0xfe): This needs to be cleaned up.
  "b": "256"
}

Vex.Flow.durationToGlyph = function(duration, type) {
  var alias = Vex.Flow.durationAliases[duration];
  if (alias !== undefined) {
    duration = alias;
  }

  var code = Vex.Flow.durationToGlyph.duration_codes[duration];
  if (code === undefined) {
    return null;
  }

  if (!type) {
    type = "n";
  }

  glyphTypeProperties = code.type[type];
  if (glyphTypeProperties === undefined) {
    return null;
  }

  return Vex.Merge(Vex.Merge({}, code.common), glyphTypeProperties);
}

Vex.Flow.durationToGlyph.duration_codes = {
  "1": {
    common: {
      head_width: 16.5,
      stem: false,
      stem_offset: 0,
      flag: false,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Whole note
        code_head: "v1d"
      },
      "h": { // Whole note harmonic
        code_head: "v46"
      },
      "m": { // Whole note muted
        code_head: "v92",
        stem_offset: -3
      },
      "r": { // Whole rest
        code_head: "v5c",
        head_width: 12.5,
        rest: true,
        position: "D/5,",
        dot_shiftY: 0.5
      },
      "s": { // Whole note slash
        // Drawn with canvas primitives
        head_width: 15,
        position: "B/4"
      }
    }
  },
  "2": {
    common: {
      head_width: 10.5,
      stem: true,
      stem_offset: 0,
      flag: false,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Half note
        code_head: "v81"
      },
      "h": { // Half note harmonic
        code_head: "v2d"
      },
      "m": { // Half note muted
        code_head: "v95",
        stem_offset: -3
      },
      "r": { // Half rest
        code_head: "vc",
        head_width: 12.5,
        stem: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -0.5
      },
      "s": { // Half note slash
        // Drawn with canvas primitives
        head_width: 15,
        position: "B/4"
      }
    }
  },
  "4": {
    common: {
      head_width: 10.5,
      stem: true,
      stem_offset: 0,
      flag: false,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Quarter note
        code_head: "vb"
      },
      "h": { // Quarter harmonic
        code_head: "v22"
      },
      "m": { // Quarter muted
        code_head: "v3e",
        stem_offset: -3
      },
      "r": { // Quarter rest
        code_head: "v7c",
        head_width: 8,
        stem: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -0.5,
        line_above: 1.5,
        line_below: 1.5
      },
      "s": { // Quarter slash
         // Drawn with canvas primitives
         head_width: 15,
         position: "B/4"
      }
    }
  },
  "8": {
    common: {
      head_width: 10.5,
      stem: true,
      stem_offset: 0,
      flag: true,
      beam_count: 1,
      code_flag_upstem: "v54",
      code_flag_downstem: "v9a",
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Eighth note
        code_head: "vb"
      },
      "h": { // Eighth note harmonic
        code_head: "v22"
      },
      "m": { // Eighth note muted
        code_head: "v3e"
      },
      "r": { // Eighth rest
        code_head: "va5",
        stem: false,
        flag: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -0.5,
        line_above: 1.0,
        line_below: 1.0
      },
      "s": { // Eight slash
        // Drawn with canvas primitives
        head_width: 15,
        position: "B/4"
      }
    }
  },
  "16": {
    common: {
      beam_count: 2,
      head_width: 10.5,
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: "v3f",
      code_flag_downstem: "v8f",
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Sixteenth note
        code_head: "vb"
      },
      "h": { // Sixteenth note harmonic
        code_head: "v22"
      },
      "m": { // Sixteenth note muted
        code_head: "v3e"
      },
      "r": { // Sixteenth rest
        code_head: "v3c",
        head_width: 13,
        stem: false,
        flag: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -0.5,
        line_above: 1.0,
        line_below: 2.0
      },
      "s": { // Sixteenth slash
        // Drawn with canvas primitives
        head_width: 15,
        position: "B/4"
      }
    }
  },
  "32": {
    common: {
      beam_count: 3,
      head_width: 10.5,
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: "v47",
      code_flag_downstem: "v2a",
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Thirty-second note
        code_head: "vb"
      },
      "h": { // Thirty-second harmonic
        code_head: "v22"
      },
      "m": { // Thirty-second muted
        code_head: "v3e"
      },
      "r": { // Thirty-second rest
        code_head: "v55",
        head_width: 16,
        stem: false,
        flag: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -1.5,
        line_above: 2.0,
        line_below: 2.0
      },
      "s": { // Thirty-second slash
        // Drawn with canvas primitives
        head_width: 15,
        position: "B/4"
      }
    }
  },
  "64": {
    common: {
      beam_count: 3,
      head_width: 10.5,
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: "va9",
      code_flag_downstem: "v58",
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Sixty-fourth note
        code_head: "vb"
      },
      "h": { // Sixty-fourth harmonic
        code_head: "v22"
      },
      "m": { // Sixty-fourth muted
        code_head: "v3e"
      },
      "r": { // Sixty-fourth rest
        code_head: "v38",
        head_width: 18,
        stem: false,
        flag: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -1.5,
        line_above: 2.0,
        line_below: 3.0
      },
      "s": { // Sixty-fourth slash
        // Drawn with canvas primitives
        head_width: 15,
        position: "B/4"
      }
    }
  }
};

// Some defaults
Vex.Flow.TIME4_4 = {
  num_beats: 4,
  beat_value: 4,
  resolution: Vex.Flow.RESOLUTION
};
