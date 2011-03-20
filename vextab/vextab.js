/**
 * VexTab Parser - A recursive descent parser for the VexTab language.
 * Copyright Mohit Cheppudira 2010 <mohit@muthanna.com>
 *
 * Requires the VexFlow rendering API - vexflow.js from:
 *
 *   http://vexflow.com
 *
 * Learn all about the VexTab language at:
 *
 *   http://vexflow.com/tabdiv/tutorial.html
 *
 * This file is licensed under the MIT license:
 *
 *   http://www.opensource.org/licenses/mit-license.php
 */

/**
 * @constructor
 * @requires Vex.Flow This parser depends on the VexFlow rendering API.
 *
 * Initialize and return a new VexTab parser. Example usage:
 *
 *   var JUSTIFY_WIDTH = 400;
 *   var CONTEXT = new Vex.Flow.Renderer(
 *      document.getElementById("canvas_id"),
 *      Vex.Flow.Renderer.Backends.CANVAS).getContext();
 *
 *   var parser = new Vex.Flow.VexTab();
 *
 *   try {
 *     parser.parse(vextab_code);
 *     if (parser.isValid()) {
 *       var elements = parser.getElements();
 *
 *       for (var i = 0; i < staves.length; ++i) {
 *         var stave = elements.staves[i];
 *         var voice_notes = elements.tabnotes[i];
 *         var voice_ties = elements.ties[i];
 *
 *         // Draw stave
 *         stave.setWidth(JUSTIFY_WIDTH);
 *         stave.setContext(CONTEXT).draw();
 *
 *         // Draw notes and modifiers.
 *         if (voice_notes) {
 *           Vex.Flow.Formatter.FormatAndDraw(CONTEXT, stave,
 *               voice_notes, JUSTIFY_WIDTH - 20);
 *         }
 *
 *         // Draw ties
 *         for (var j = 0; j < voice_ties.length; ++j) {
 *           voice_ties[j].setContext(CONTEXT).draw();
 *         }
 *       }
 *     }
 *   } catch (e) {
 *      console.log(e.message);
 *   }
 *
 */
Vex.Flow.VexTab = function() {
  this.init();
}

/**
 * Initialize VexTab.
 * @constructor
 */
Vex.Flow.VexTab.prototype.init = function() {
  // The VexFlow elements generated from the VexTab code.
  this.elements = {
    staves: [],
    tabnotes: [],
    notes: [],
    ties: [],
    beams: []
  };

  // Pre-parser state. This is used for error-reporting and
  // element generation.
  this.state = {
    current_line: 0,
    current_stave: -1,
    current_duration: "8",
    has_notation: false,
    has_tab: true,
    beam_start: null
  };

  this.valid = false;         // Valid (parseable) VexTab?
  this.last_error = "";       // Last error message generated.
  this.last_error_line = 0;   // Line number of last error.
  this.height = 0;            // Total height of generated elements.
  this.tuning = new Vex.Flow.Tuning(); // Defaults to standard tuning.
}

/**
 * Returns true if the passed-in code parsed without errors.
 *
 * @return {Boolean} True if code is error-free.
 */
Vex.Flow.VexTab.prototype.isValid = function() { return this.valid; }

/**
 * Returns the generated VexFlow elements. Remember to call #isValid before
 * calling this method.
 *
 * @return {!Object} The generated VexFlow elements.
 */
Vex.Flow.VexTab.prototype.getElements = function() {
  return this.elements;
}

/**
 * @return {Number} The total height (in pixels) of the generated elements.
 */
Vex.Flow.VexTab.prototype.getHeight = function() { return this.height; }

/**
 * This method parses the VexTab code provided, and generates VexFlow
 * elements from it. The elements can be retrieved with the #getElements
 * method.
 *
 * If the parse fails, a Vex.RuntimeError of the type "ParseError" is
 * thrown with the line number and specific error message.
 *
 * Upon success, no exception is thrown and #isValid returns true.
 *
 * @param {String} code The VexTab code to parse.
 */
Vex.Flow.VexTab.prototype.parse = function(code) {
  // Clear elements and initialize parse state
  this.init();

  // Separate code into lines
  var lines = code.split("\n");
  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i];
    this.state.current_line++;
    // Strip leading and trailing spaces
    line = line.replace(/(^\s*)|(\s*$)/gi,"");
    // Skip blank lines
    if (line == "") continue;

    // This line has entropy. Parse it.
    this.parseLine(line);
  }

  this.valid = true;
  this.height += 30;

  return this;
}

/**
 * Throws a Vex.RuntimeError exception with the code set to "ParseError". The
 * error includes the line number and specific error message.
 *
 * @param {String} message The error string.
 * @private
 */
Vex.Flow.VexTab.prototype.parseError = function(message) {
  this.valid = false;
  this.last_error = message;
  this.last_error_line = this.state.current_line;

  // Create and throw the RuntimeError exception.
  var error = new Vex.RERR("ParseError",
      "Line " + this.state.current_line + ": " + message);
  error.line = this.state.current_line;
  throw error;
}

/**
 * A line of VexTab code is essentially structured as:
 *
 *    command [param] [param] ...
 *
 * This function parses out valid commands and executes the
 * relevant sub-parser to work on the parameters.
 *
 * @param {String} line One line of VexTab code.
 * @private
 */
Vex.Flow.VexTab.prototype.parseLine = function(line) {
  // Split line into tokens
  var tokens = line.split(/\s+/);

  // The first token is the command. Run it.
  var command = tokens[0];
  switch(command) {
    // Generate a TAB stave.
    case "tabstave": this.parseTabStave(tokens); break;

    // Parse tab notes.
    case "notes": this.parseNotes(tokens); break;

    // Unrecognized command. Throw an error.
    default: this.parseError("Invalid keyword: " + command);
  }
}

Vex.Flow.VexTab.prototype.parseKeyValue = function(token) {
  var pair = token.split(/\s*=\s*/);
  if (pair.length != 2) this.parseError("Invalid key value pair: " + token);
  return { key: pair[0], value: pair[1] };
}

Vex.Flow.VexTab.prototype.parseTabStave = function(tokens) {
  var has_standard_notation = false;
  var has_tablature = true;
  var has_clef = "treble";
  for (var i = 1; i < tokens.length; ++i) {
    var pair = this.parseKeyValue(tokens[i]);
    if (pair.key.toLowerCase() == "notation") {
      switch (pair.value.toLowerCase()) {
        case "true": has_standard_notation = true; break;
        case "false": has_standard_notation = false; break;
        default: this.parseError(
                     'notation must be "true" or "false": ' + pair.value);
      }
    } else if (pair.key.toLowerCase() == "tablature") {
      switch (pair.value.toLowerCase()) {
        case "true": has_tablature = true; break;
        case "false": has_tablature = false; break;
        default: this.parseError(
                     'tablature must be "true" or "false": ' + pair.value);
      }
    } else if (pair.key.toLowerCase() == "clef") {
      switch (pair.value.toLowerCase()) {
        case "treble": has_clef = "treble"; break;
        case "alto": has_clef = "alto"; break;
				case "tenor": has_clef = "tenor"; break;
        case "bass": has_clef = "bass"; break;
        default: this.parseError(
                     'clef must be treble, alto, tenor or bass: ' + pair.value);
      }
    } else {
      this.parseError("Invalid parameter for tabstave: " + pair.key)
    }
  }

  if (!has_tablature && !has_standard_notation) {
    this.parseError('notation & tablature cannot both be "false"');
  }

  this.genTabStave({ notation: has_standard_notation, tablature: has_tablature, clef: has_clef });
}

/**
 * VexTab notes consists of note-groups separated by spaces. For
 * example:
 *
 *   4-5-6/4 5 | (4/5.5/6.6.7)
 *
 * Each note group is parsed by a recursive-descent parser.
 *
 * @param {Array.<String>} tokens An array of note-groups.
 * @private
 */
Vex.Flow.VexTab.prototype.parseNotes = function(tokens) {
  for (var i = 1; i < tokens.length; ++i) {
    var token = tokens[i];
    switch (token) {
      // Bars are simple. No parsing necessary.
      case "|": this.genBar(); break;

      // Open beam
      case "[": this.parseOpenBeam(); break;

      // Close beam
      case "]": this.parseCloseBeam(); break;

      // Everything else goes through the recdescent toke parser.
      default:
        this.parseToken(tokens[i]);
        this.genElements();
    }
  }

  // Verify that all beams are closed.
  if (this.state.beam_start != null)
    this.parseError("Beam not closed");
}

/**
 * This method is a regular-expression based lexer. Its job is to:
 *
 *    1) Extract the next token.
 *    2) Strip out the remaining string.
 *    3) Keep track of errors (e.g., unexpected EOL, unrecognized token, etc.)
 *
 * The valid tokens are:
 *
 *    "t" - Taps (represented as Annotations in VexFlow)
 *    "s" - Slides (represented as Ties in VexFlow)
 *    "h" - Hammer-ons (represented as Ties in VexFlow)
 *    "p" - Pull-offs (represented as Ties in VexFlow)
 *    "b" - Bends / Open beams
 *    "v" - Soft vibrato
 *    "V" - Harsh vibrato
 *    "-" - Fret separators
 *    "/" - String separator
 *    "(" - Open chord
 *    "." - Note separator inside a chord
 *    ")" - Close chord
 *    ":(\S+)" - Duration
 *    \d+ - A fret or string number
 *
 * @private
 */
Vex.Flow.VexTab.prototype.getNextRegExp = function(re) {
  if (this.parse_state.done)
    this.parseError("Unexpected end of line");

  var match = this.parse_state.str.match(re);

  if (match) {
    this.parse_state.value = match[1];
    this.parse_state.str = match[2];
    if (this.parse_state.str == "") this.parse_state.done = true;
    return true;
  }

  this.parseError("Error parsing notes at: " + this.parse_state.str);
  return false;
}

Vex.Flow.VexTab.prototype.getNextToken = function() {
  return this.getNextRegExp(/^(\d+|[\)\(-tbhpsvV\.\/\|\:])(.*)/);
}

Vex.Flow.VexTab.prototype.getNextDurationToken = function() {
  return this.getNextRegExp(/^([0-9a-z]+|:)(.*)/);
}

/**
 * This is the start of the recdescent grammar for notes-lines. A notes-line
 * can begin with a "(", "t", or a fret number.
 *
 * @param {String} str A notes-line token.
 * @private
 */
Vex.Flow.VexTab.prototype.parseToken = function(str) {
  // Initialize the recursive descent parser state.
  this.parse_state = {
    str: str,                 // The leftover string to parse
    done: false,              // Finished parsing everything?
    expecting_string: false,  // Expecting a string number (as opposed to fret)

    // This keeps track of positions in time. A position can have multipe
    // string-fret combos (incase of chords), or just one.
    positions: [],
    durations: [],
    position_index: -1,
    annotations: [],          // Annotations associated with positions
    bends: [],                // Bends associated with positions
    vibratos: [],             // Vibrations associated with positions
    ties: [],                 // Ties associated with positions
    chord_ties: [],           // Chord ties associated with positions

    inside_bend: false,       // Are we inside a bend
    chord_index: -1          // The current chord index
  };

  var done = false;
  while (!done && this.getNextToken()) {
    switch (this.parse_state.value) {
      case "(": this.parseOpenChord(); break;
      case "t": this.parseTapAnnotation(); break;
      default: this.parseFret();
    }

    done = this.parse_state.done;
  }
}

Vex.Flow.VexTab.validDurations = {
  "w": "w",
  "h": "h",
  "q": "q",
  "8": "8",
  "8d": "8d",
  "16": "16",
  "16d": "16d",
  "32": "32",
  "32d": "32d"
}

/**
 * Parse ":" - Note duration
 *
 * @private
 */
Vex.Flow.VexTab.prototype.parseDuration = function() {
  this.getNextDurationToken();

  var duration = Vex.Flow.VexTab.validDurations[this.parse_state.value];
  if (duration) {
    this.state.current_duration = duration;
  } else {
    this.parseError("Invalid duration: " + this.parse_state.value);
  }

  if (!this.parse_state.done) {
    this.getNextDurationToken();
    if (this.parse_state.value != ":")
      this.parseError("Unexpected token: " + this.parse_state.str);

    if (!this.parse_state.done)
      this.parseError("Unexpected token: " + this.parse_state.str);
  }
}


/**
 * Parse "(" - Start a chord.
 *
 * @private
 */
Vex.Flow.VexTab.prototype.parseOpenChord = function() {
  // Add a position for this chord.
  this.parse_state.positions.push([]);
  this.parse_state.durations.push(this.state.current_duration);
  this.parse_state.position_index++;

  // Reset the chord-index.
  this.parse_state.chord_index = -1;

  // The next token must be a fret.
  this.getNextToken();
  this.parseChordFret();
}

/**
 * Parse "t" - Tap annotations.
 *
 * @private
 */
Vex.Flow.VexTab.prototype.parseTapAnnotation = function() {
  // Create an annotation and assosiate it with the note in the
  // next position.
  this.parse_state.annotations.push({
      position: this.parse_state.position_index + 1,
      text: "T" });

  // The next token must be a fret.
  this.getNextToken();
  switch (this.parse_state.value) {
    case "(": this.parseOpenChord(); break;
    default: this.parseFret();
  }
}


/**
 * Parse one note in a chord. The note must have a fret and string, and
 * may contain a bend.
 *
 * @private
 */
Vex.Flow.VexTab.prototype.parseChordFret = function() {
  // Extract duration (if available)
  if (this.parse_state.value == ":") {
    this.parseFretDuration();
    this.parse_state.durations[this.parse_state.durations.length - 1] =
      this.state.current_duration;
    if (this.parse_state.done) return;
    this.getNextToken();
  }

  // Do we have a valid fret?
  var fret = this.parse_state.value;
  if (isNaN(parseInt(fret)))
    this.parseError("Invalid fret number: " + fret);

  // The next token can either be a bend or a slash
  this.getNextToken();
  if (this.parse_state.value == "b") {
    // This is a bend, parse it out.
    this.parseChordBend();
  } else if (this.parse_state.value != "/") {
    this.parseError("Expecting / for string number: " + this.parse_state.value);
  }

  // We found a slash, parse out the string number and make sure
  // it's valid.
  this.getNextToken();
  var str = parseInt(this.parse_state.value);
  if (isNaN(parseInt(str)))
    this.parseError("Invalid string number: " + this.parse_state.value);

  // Add current fret-string to current position. Don't create a new
  // position because this is a chord.
  this.parse_state.positions[this.parse_state.position_index].push(
      { fret: fret, str: str });
  this.parse_state.chord_index++;

  // Next token can either be a chord separator ".", or a close chord ")"
  this.getNextToken();
  switch(this.parse_state.value) {
    case ".": this.getNextToken(); this.parseChordFret(); break;
    case ")": this.parseCloseChord(); break;
    default: this.parseError("Unexpected token: " + this.parse_state.value);
  }
}

/**
 * Parse a close chord token ")".
 *
 * @private
 */
Vex.Flow.VexTab.prototype.parseCloseChord = function() {
  // Reset chord index.
  this.chord_index = -1;

  // This is a valid place for parsing to end.
  if (this.parse_state.done) return;

  // There are more tokens. The only legitimate next token can be a
  // vibrato.
  this.getNextToken();
  switch (this.parse_state.value) {
    case "h": this.parseChordTie(); break;
    case "p": this.parseChordTie(); break;
    case "s": this.parseChordTie(); break;
    case "t": this.parseChordTie(); break;
    case "v": this.parseVibrato(); break;
    case "V": this.parseVibrato(); break;
    default: this.parseError("Unexpected token: " + this.parse_state.value);
  }
}

/**
 * Parse bends inside chords.
 * @private
 */
Vex.Flow.VexTab.prototype.parseChordBend = function() {
  // Next token has to be a fret number.
  this.getNextToken();
  var fret = parseInt(this.parse_state.value);
  if (isNaN(fret)) this.parseError("Expecting fret: " + this.parse_state.value);

  // If we're already inside a bend, then mark this as a release, otherwise
  // create a new bendj
  if (this.parse_state.inside_bend) {
    var this_bend = this.parse_state.bends.length - 1;
    // We're actually incrementing a bend count here because we want to
    // be able to support multiple sequential bends on one string.
    this.parse_state.bends[this_bend].count++;
  } else {
    this.parse_state.inside_bend = true;
    this.parse_state.bends.push(
        { position: this.parse_state.position_index, count: 1,
          index: this.parse_state.chord_index + 1, to_fret: fret });
  }

  // Next token can either be another bend, or a slash. (Remember, we're inside
  // a chord, so we can't really do slides or hammer/pulloff unambiguously.)
  this.getNextToken();
  switch (this.parse_state.value) {
    case "b": this.parseChordBend(); break;
    case "/": break;
    default:
      this.parseError("Unexpected token: " + this.parse_state.value);
  }

  this.parse_state.inside_bend = false;
}

/**
 * Parse ":" (note duration) within notes stanza.
 *
 * @private
 */
Vex.Flow.VexTab.prototype.parseFretDuration = function() {
  this.getNextDurationToken();

  var duration = Vex.Flow.VexTab.validDurations[this.parse_state.value];
  if (duration) {
    this.state.current_duration = duration;
  } else {
    this.parseError("Invalid duration: " + this.parse_state.value);
  }

  if (this.parse_state.done) return;

  this.getNextDurationToken();
  if (this.parse_state.value != ":")
    this.parseError("Unexpected token: " + this.parse_state.str);
}

/**
 * Parse fret number (outside a chord context).
 * @private
 */
Vex.Flow.VexTab.prototype.parseFret = function() {
  // Extract duration (if available)
  if (this.parse_state.value == ":") {
    this.parseFretDuration();
    if (this.parse_state.done) return;
    this.getNextToken();
  }

  // Fret number must be valid.
  var str = this.parse_state.value;
  if (isNaN(parseInt(str)))
    this.parseError("Invalid fret number: " + str);

  // Create a new position for this fret/string pair.
  this.parse_state.positions.push([{ fret: str }]);
  this.parse_state.durations.push(this.state.current_duration);
  this.parse_state.position_index++;

  // Extract and parse next token.
  this.getNextToken();
  switch(this.parse_state.value) {
    case "-": this.parseDash(); break;
    case "/": this.parseSlash(); break;
    case "b": this.parseBend(); break;
    case "s": this.parseTie(); break;
    case "t": this.parseTie(); break;
    case "h": this.parseTie(); break;
    case "p": this.parseTie(); break;
    case "v": this.parseFretVibrato(); break;
    case "V": this.parseFretVibrato(); break;
    default: this.parseError("Unexpected token: " + this.parse_state.value);
  }
}

/**
 * Parse dashes.
 * @private
 */
Vex.Flow.VexTab.prototype.parseDash = function() {
  // Dashes break us out of bend contexts
  this.parse_state.inside_bend = false;

  // Dashes are not alloed on strings
  if (this.parse_state.expecting_string)
    this.parseError("No dashes on strings: " + this.parse_state.str);
}

/**
 * Parse vibratos.
 * @private
 */
Vex.Flow.VexTab.prototype.parseVibrato = function() {
  var harsh = false;

  // Capital V means harsh vibrato.
  if (this.parse_state.value == "V") harsh = true;

  var position = this.parse_state.position_index;
  if (this.parse_state.inside_bend) {
    // If we're inside a bend we associate the vibrato with the first
    // fret of the bend
    var count = this.parse_state.bends[this.parse_state.bends.length - 1].count;
    position -= count;
  }

  this.parse_state.vibratos.push({position: position, harsh: harsh});
}

/**
 * Parse vibratos inside a fret context.
 * @private
 */
Vex.Flow.VexTab.prototype.parseFretVibrato = function() {
  this.parseVibrato();
  this.getNextToken();
  switch(this.parse_state.value) {
    case "-": this.parseDash(); break;
    case "s": this.parseTie(); break;
    case "h": this.parseTie(); break;
    case "p": this.parseTie(); break;
    case "t": this.parseTie(); break;
    case "/": this.parseSlash(); break;
    default: this.parseError("Unexpected token: " + this.parse_state.value);
  }
}

/**
 * Parse string separator "/".
 * @private
 */
Vex.Flow.VexTab.prototype.parseSlash = function(str) {
  this.parse_state.inside_bend = false;
  this.parse_state.expecting_string = true;

  // Next token must be a string number
  this.getNextToken();
  this.parseString();
}

/**
 * Parse string number.
 * @private
 */
Vex.Flow.VexTab.prototype.parseString = function() {
  var str = this.parse_state.value;
  if (this.parse_state.positions.length == 0)
    this.parseError("String without frets: " + str);

  // Associate string with all positions in this note-group.
  for (var i = 0; i < this.parse_state.positions.length; ++i) {
    this.parse_state.positions[i][0].str = str;
  }
}

/**
 * Parse ties, hammerons, slides, etc.
 * @private
 */
Vex.Flow.VexTab.prototype.parseTie = function() {
  this.parse_state.inside_bend = false;
  if (this.parse_state.expecting_string)
    this.parseError("Unexpected token on string: " + this.parse_state.str);

  this.parse_state.ties.push({
    position: this.parse_state.position_index,
    index: this.parse_state.chord_index + 1,
    effect: this.parse_state.value.toUpperCase()
  });

  // Next token has to be a fret number.
  this.getNextToken();
  this.parseFret();
}

/**
 * Parse ties, hammerons, slides, etc. in chords.
 * @private
 */
Vex.Flow.VexTab.prototype.parseChordTie = function() {
  this.parse_state.chord_ties.push({
    position: this.parse_state.position_index,
    effect: this.parse_state.value.toUpperCase()
  });

  // Next token has to be a fret number.
  this.getNextToken();
  if (this.parse_state.value != "(")
    this.parseError("Expecting ( after chord ties/slides");
  this.parseOpenChord();
}


/**
 * Parse bends outside a chord context.
 * @private
 */
Vex.Flow.VexTab.prototype.parseBend = function() {
  if (this.parse_state.expecting_string)
    this.parseError("Unexpected token on string: " + this.parse_state.str);

  if (this.parse_state.inside_bend) {
    var this_bend = this.parse_state.bends.length - 1;
    this.parse_state.bends[this_bend].count++;
  } else {
    this.parse_state.inside_bend = true;
    this.parse_state.bends.push(
        { position: this.parse_state.position_index, count: 1, index: 0 });
  }

  // Next token must be a fret.
  this.getNextToken();
  this.parseFret();
}

/**
 * Generate VexFlow elements from current parser state. The elements can
 * be retrieved with #getElements.
 *
 * @private
 */
Vex.Flow.VexTab.prototype.genElements = function() {
  // If there's no Tab Stave, generate one.
  if (this.state.current_stave == -1) this.genTabStave();

  // Start by building notes.
  var positions = this.parse_state.positions;
  var durations = this.parse_state.durations;
  var tabnotes = [];
  var notes = [];

  // Associate notes with relevant positions.
  for (var i = 0; i < positions.length; ++i) {
    var position = positions[i];
    var duration = durations[i];

    var tabnote = new Vex.Flow.TabNote(
        {positions: position, duration: duration});
    tabnotes.push({note: tabnote, persist: true});

    if (this.state.has_notation) {
      var keys = [];
      var accidentals = [];

      for (var j = 0; j < position.length; ++j) {
        var notefret = position[j];
        var spec = this.tuning.getNoteForFret(notefret.fret, notefret.str);

        var props = Vex.Flow.keyProperties(spec);
        accidentals.push(props.accidental);
        keys.push(spec);
      }

      var note = new Vex.Flow.StaveNote({ keys: keys, duration: duration });

      for (var j = 0; j < accidentals.length; ++j) {
        var acc = accidentals[j];

        if (acc) {
          note.addAccidental(j, new Vex.Flow.Accidental(accidentals[j]));
        }
      }

      notes.push(note);
    }
  }

  // Add bends.
  var bends = this.parse_state.bends;
  for (var i = 0; i < bends.length; ++i) {
      var bend = bends[i];
      var from_fret = parseInt(positions[bend.position][bend.index].fret);
      var to_fret;

      // Bent notes must not persist in position list.
      if (bends[i].to_fret) {
      to_fret = bends[i].to_fret;
      } else {
      to_fret = parseInt(positions[bend.position + 1][bend.index].fret);

      for (var count = 1; count <= bend.count; ++count) {
          tabnotes[bend.position + count].persist = false;
      }
      }

      var release = false;
      if (bend.count > 1) release = true;

      var bent_note = tabnotes[bend.position].note;

      // Calculate bend amount and annotate appropriately.
      switch (to_fret - from_fret) {
      case 1: bent_note.addModifier(
                  new Vex.Flow.Bend("1/2", release), bend.index); break;
      case 2: bent_note.addModifier(
                  new Vex.Flow.Bend("Full", release), bend.index); break;
      case 3: bent_note.addModifier(
                  new Vex.Flow.Bend("1 1/2", release), bend.index); break;
      case 4: bent_note.addModifier(
                  new Vex.Flow.Bend("2 Steps", release), bend.index); break;
      default: bent_note.addModifier(
                  new Vex.Flow.Bend("Bend to " + to_fret, release), bend.index);
      }
  }

  function persistentPosition(pos) {
    for (var i = pos; i >= 0; --i) {
      if (tabnotes[i].persist == true) return i;
    }
    throw new Vex.RERR("GenError", "Invalid position: " + pos);
  }

  // Add vibratos
  var vibratos = this.parse_state.vibratos;
  for (var i = 0; i < vibratos.length; ++i) {
    var vibrato = vibratos[i];
    tabnotes[vibrato.position].note.addModifier(new Vex.Flow.Vibrato().
      setHarsh(vibrato.harsh));
  }

  // Add annotations
  var annotations = this.parse_state.annotations;
  for (var i = 0; i < annotations.length; ++i) {
    var annotation = annotations[i];
    tabnotes[annotation.position].note.addModifier(
        new Vex.Flow.Annotation(annotation.text));
  }


  // Add ties
  var ties = this.parse_state.ties;
  for (var i = 0; i < ties.length; ++i) {
    var tie = ties[i];
    var effect = null;
    var pos = persistentPosition(tie.position);

    if (this.state.has_tablature) {
      if (tie.effect == "S") {
        // Slides are a special case.
        effect = new Vex.Flow.TabSlide({
          first_note: tabnotes[pos].note,
          last_note: tabnotes[tie.position + 1].note
        });
      } else {
        effect = new Vex.Flow.TabTie({
          first_note: tabnotes[pos].note,
          last_note: tabnotes[tie.position + 1].note
        }, tie.effect);
      }
    }

    if (this.state.has_notation) {
      this.elements.ties[this.state.current_stave].push(
          new Vex.Flow.StaveTie({
            first_note: notes[pos],
            last_note: notes[tie.position + 1]
          }));
    }
    if (effect) this.elements.ties[this.state.current_stave].push(effect);

  }

  // Add chord ties
  var chord_ties = this.parse_state.chord_ties;
  for (var i = 0; i < chord_ties.length; ++i) {
    var tie = chord_ties[i];
    var effect;
    var pos = persistentPosition(tie.position);

    // Organize indices by string number.
    var indices = [];
    for (var p = 0; p < positions[pos].length; ++p) {
      var position = positions[pos][p];
      indices[position.str] = {from: p};
    }
    for (var p = 0; p < positions[tie.position + 1].length; ++p) {
      var position = positions[tie.position + 1][p];
      if (!indices[position.str]) indices[position.str] = {};
      indices[position.str].to = p;
    }

    // Build indices for the ties.
    var first_indices = [];
    var last_indices = [];

    for (var j = 0; j < indices.length; ++j) {
      var index = indices[j];
      if (!index) continue;

      // Ensure that we only have tie notes that have both
      // and from and to fret.
      if (typeof(index.from) == "undefined" ||
          typeof(index.to) == "undefined") continue;

      first_indices.push(index.from);
      last_indices.push(index.to);
    }

    if (this.state.has_tablature) {
      if (tie.effect == "S") {
        // Slides are a special case.
        effect = new Vex.Flow.TabSlide({
          first_note: tabnotes[pos].note,
          last_note: tabnotes[tie.position + 1].note,
          first_indices: first_indices,
          last_indices: last_indices
        });
      } else {
        effect = new Vex.Flow.TabTie({
          first_note: tabnotes[pos].note,
          last_note: tabnotes[tie.position + 1].note,
          first_indices: first_indices,
          last_indices: last_indices
        }, tie.effect);
      }
    }

    if (this.state.has_notation) {
      this.elements.ties[this.state.current_stave].push(
          new Vex.Flow.StaveTie({
            first_note: notes[pos],
            last_note: notes[tie.position + 1],
            first_indices: first_indices,
            last_indices: last_indices
          }));
    }

    this.elements.ties[this.state.current_stave].push(effect);
  }

  // Push tabnotes, skipping non-persistent notes.
  for (var i = 0; i < tabnotes.length; ++i) {
    var note = tabnotes[i];
    if (note.persist) {
      this.elements.tabnotes[this.state.current_stave].push(note.note);
    } else {
      this.elements.tabnotes[this.state.current_stave].push(
          new Vex.Flow.GhostNote(this.state.current_duration));
    }
  }

  // Push notes, skipping non-persistent notes.
  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    this.elements.notes[this.state.current_stave].push(note);
  }
}

/**
 * Generate the tab stave and add it to the element list.
 * @private
 */
Vex.Flow.VexTab.prototype.genTabStave = function(params) {
  var notation = false;
  var tablature = true;
  var clef = "treble";
  if (params) notation = params.notation;
  if (params) tablature = params.tablature;
  if (params) clef = params.clef;

  var notestave = notation ?
    new Vex.Flow.Stave(
        20, this.height, 380).addClef(clef).setNoteStartX(40) :
    null;

  var tabstave = tablature ? 
    new Vex.Flow.TabStave(20,
      notation ? notestave.getHeight() + this.height : this.height, 380).
    addTabGlyph().setNoteStartX(40) : null;

  this.elements.staves.push({tab: tabstave, note: notestave});
  this.height += (tablature ? tabstave.getHeight() : null) +
    (notation ? notestave.getHeight() : null);

  this.state.current_stave++;
  this.state.has_notation = notation;
  this.state.has_tablature = tablature;
  this.elements.tabnotes[this.state.current_stave] = [];
  this.elements.notes[this.state.current_stave] = [];
  this.elements.ties[this.state.current_stave] = [];
}

Vex.Flow.VexTab.prototype.parseOpenBeam = function() {
  if (this.state.beam_start != null)
    this.parseError("Beam already open: [");

  this.state.beam_start = this.elements.notes[this.state.current_stave].length;
}

Vex.Flow.VexTab.prototype.parseCloseBeam = function() {
  if (this.state.beam_start == null)
    this.parseError("Can't close beam without openeing: ]");

  var beam_end = this.elements.notes[this.state.current_stave].length;

  if ((beam_end - this.state.beam_start) < 2)
    this.parseError("Must have at least two notes in a beam.");

  var beam_notes = [];

  for (var i = this.state.beam_start; i < beam_end; ++i) {
    beam_notes.push(this.elements.notes[this.state.current_stave][i]);
  }

  this.elements.beams.push(new Vex.Flow.Beam(beam_notes));
  this.state.beam_start = null;
}

/**
 * Generate bar line and add it to the element list.
 * @private
 */
Vex.Flow.VexTab.prototype.genBar = function() {
  // If there's no Tab Stave, generate one.
  if (this.state.current_stave == -1) this.genTabStave();
  this.elements.tabnotes[this.state.current_stave].push(new Vex.Flow.BarNote());
  this.elements.notes[this.state.current_stave].push(new Vex.Flow.BarNote());
}
