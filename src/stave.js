// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Cheppudira 2010

/** @constructor */
Vex.Flow.Stave = (function() {
  function Stave(x, y, width, options) {
    if (arguments.length > 0) this.init(x, y, width, options);
  }

  var THICKNESS = (Vex.Flow.STAVE_LINE_THICKNESS > 1 ?
        Vex.Flow.STAVE_LINE_THICKNESS : 0);
  Stave.prototype = {
    init: function(x, y, width, options) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.formatted = false;
      this.start_x = x + 5;
      this.end_x = x + width;
      this.context = null;
      this.modifiers = [];  // stave modifiers (clef, key, time, barlines, coda, segno, etc.)
      this.measure = 0;
      this.clef = "treble";
      this.font = {
        family: "sans-serif",
        size: 8,
        weight: ""
      };
      this.options = {
        vertical_bar_width: 10,       // Width around vertical bar end-marker
        glyph_spacing_px: 10,
        num_lines: 5,
        fill_style: "#999999",
        left_bar: true,               // draw vertical bar on left
        right_bar: true,               // draw vertical bar on right
        spacing_between_lines_px: 10, // in pixels
        space_above_staff_ln: 4,      // in staff lines
        space_below_staff_ln: 4,      // in staff lines
        top_text_position: 1          // in staff lines
      };
      this.bounds = {x: this.x, y: this.y, w: this.width, h: 0};
      Vex.Merge(this.options, options);

      this.resetLines();

      var BARTYPE = Vex.Flow.Barline.type;
      this.addModifier(new Vex.Flow.Barline(this.options.left_bar ? BARTYPE.SINGLE : BARTYPE.NONE));  // beg bar
      this.addEndModifier(new Vex.Flow.Barline(this.options.right_bar ? BARTYPE.SINGLE : BARTYPE.NONE)); // end bar
    },

    resetLines: function() {
      this.options.line_config = [];
      for (var i = 0; i < this.options.num_lines; i++) {
        this.options.line_config.push({visible: true});
      }
      this.height = (this.options.num_lines + this.options.space_above_staff_ln) *
         this.options.spacing_between_lines_px;
      this.options.bottom_text_position = this.options.num_lines + 1;
    },

    getOptions: function() { return this.options; },

    setNoteStartX: function(x) {
      if (!this.formatted) this.format();

      this.start_x = x;
      return this;
    },
    getNoteStartX: function() {
      if (!this.formatted) this.format();

      return this.start_x;
    },

    getNoteEndX: function() {
      if (!this.formatted) this.format();

      return this.end_x;
    },
    getTieStartX: function() { return this.start_x; },
    getTieEndX: function() { return this.x + this.width; },
    setContext: function(context) { this.context = context; return this; },
    getContext: function() { return this.context; },
    getX: function() { return this.x; },
    getNumLines: function() { return this.options.num_lines; },
    setNumLines: function(lines) {
      this.options.num_lines = parseInt(lines, 10);
      this.resetLines();
      return this;
    },
    setY: function(y) { this.y = y; return this; },

    setX: function(x){
      var shift = x - this.x;
      this.formatted = false;
      this.x = x;
      this.start_x += shift;
      this.end_x += shift;
      for(var i=0; i<this.modifiers.length; i++) {
      	var mod = this.modifiers[i];
        if (mod.x !== undefined) {
          mod.x += shift;
      	}
      }
      return this;
    },

    setWidth: function(width) {
      this.formatted = false;
      this.width = width;
      this.end_x = this.x + width;

      // reset the x position of the end barline (TODO(0xfe): This makes no sense)
      // this.modifiers[1].setX(this.end_x);
      return this;
    },

    getWidth: function() {
      return this.width;
    },

    setMeasure: function(measure) { this.measure = measure; return this; },

    /**
     * Gets the pixels to shift from the beginning of the stave
     * following the modifier at the provided index
     * @param  {Number} index The index from which to determine the shift
     * @return {Number}       The amount of pixels shifted
     */
    getModifierXShift: function(index) {
      if (typeof index !== 'number') new Vex.RERR("InvalidIndex",
        "Must be of number type");

      if (!this.formatted) this.format();

      if (this.getModifiers(Vex.Flow.StaveModifier.Position.BEGIN).length === 1) {
        return 0;
      }

      var start_x = this.start_x - this.x;
      var begBarline = this.modifiers[0];
      if (begBarline.getType() === Vex.Flow.Barline.type.REPEAT_BEGIN &&
          start_x > begBarline.getWidth()) {
        start_x -= begBarline.getWidth();
      }

      return start_x;
    },

    // Coda & Segno Symbol functions
    setRepetitionTypeLeft: function(type, y) {
      this.modifiers.push(new Vex.Flow.Repetition(type, this.x, y));
      return this;
    },

    setRepetitionTypeRight: function(type, y) {
      this.modifiers.push(new Vex.Flow.Repetition(type, this.x, y) );
      return this;
    },

    // Volta functions
    setVoltaType: function(type, number_t, y) {
      this.modifiers.push(new Vex.Flow.Volta(type, number_t, this.x, y));
      return this;
    },

    // Section functions
    setSection: function(section, y) {
      this.modifiers.push(new Vex.Flow.StaveSection(section, this.x, y));
      return this;
    },

    // Tempo functions
    setTempo: function(tempo, y) {
      this.modifiers.push(new Vex.Flow.StaveTempo(tempo, this.x, y));
      return this;
    },

    // Text functions
    setText: function(text, position, options) {
      this.modifiers.push(new Vex.Flow.StaveText(text, position, options));
      return this;
    },

    getHeight: function() {
      return this.height;
    },

    getSpacingBetweenLines: function() {
      return this.options.spacing_between_lines_px;
    },

    getBoundingBox: function() {
      return new Vex.Flow.BoundingBox(this.x, this.y, this.width, this.getBottomY() - this.y);
      // body...
    },

    getBottomY: function() {
      var options = this.options;
      var spacing = options.spacing_between_lines_px;
      var score_bottom = this.getYForLine(options.num_lines) +
         (options.space_below_staff_ln * spacing);

      return score_bottom;
    },

    getBottomLineY: function() {
      return this.getYForLine(this.options.num_lines);
    },

    getYForLine: function(line) {
      var options = this.options;
      var spacing = options.spacing_between_lines_px;
      var headroom = options.space_above_staff_ln;

      var y = this.y + ((line * spacing) + (headroom * spacing)) -
        (THICKNESS / 2);

      return y;
    },

    getLineForY: function(y){
      //Does the revers of getYForLine - somewhat dumb and just calls getYForLine until the right value is reaches

      var options = this.options;
      var spacing = options.spacing_between_lines_px;
      var headroom = options.space_above_staff_ln;
      return ((y - this.y + (THICKNESS / 2)) / spacing) - headroom;
    },

    getYForTopText: function(line) {
      var l = line || 0;
      return this.getYForLine(-l - this.options.top_text_position);
    },

    getYForBottomText: function(line) {
      var l = line || 0;
      return this.getYForLine(this.options.bottom_text_position + l);
    },

    getYForNote: function(line) {
      var options = this.options;
      var spacing = options.spacing_between_lines_px;
      var headroom = options.space_above_staff_ln;
      var y = this.y + (headroom * spacing) + (5 * spacing) - (line * spacing);

      return y;
    },

    getYForGlyphs: function() {
      return this.getYForLine(3);
    },

    addModifier: function(modifier, position) {
      if (position !== undefined) {
        modifier.setPosition(position);
      }

      modifier.setStave(this);
      this.formatted = false;
      this.modifiers.push(modifier);
      return this;
    },

    addEndModifier: function(modifier) {
      this.addModifier(modifier, Vex.Flow.StaveModifier.Position.END);
      return this;
    },

    // Bar Line functions
    setBegBarType: function(type) {
      // Only valid bar types at beginning of stave is none, single or begin repeat
      if (type == Vex.Flow.Barline.type.SINGLE ||
          type == Vex.Flow.Barline.type.REPEAT_BEGIN ||
          type == Vex.Flow.Barline.type.NONE) {
          this.modifiers[0].setType(type);
          this.formatted = false;
      }
      return this;
    },

    setEndBarType: function(type) {
      // Repeat end not valid at end of stave
      if (type != Vex.Flow.Barline.type.REPEAT_BEGIN) {
        this.modifiers[1].setType(type);
        this.formatted = false;
      }
      return this;
    },

    setClef: function(clefSpec, size, annotation, position) {
      if (position === undefined) {
        position = Vex.Flow.StaveModifier.Position.BEGIN;
      }

      this.clef = clefSpec;
      var clefs = this.getModifiers(position, Vex.Flow.Clef.category);
      if (clefs.length === 0) {
        this.addClef(clefSpec, size, annotation, position);
      } else {
        clefs[0].setType(clefSpec, size, annotation);
      }

      return this;
    },

    setEndClef: function(clefSpec, size, annotation) {
      this.setClef(clefSpec, size, annotation, Vex.Flow.StaveModifier.Position.END);
      return this;
    },

    setKeySignature: function(keySpec, cancelKeySpec, position) {
      if (position === undefined) {
        position = Vex.Flow.StaveModifier.Position.BEGIN;
      }

      var keySignatures = this.getModifiers(position, Vex.Flow.KeySignature.category);
      if (keySignatures.length === 0) {
        this.addKeySignature(keySpec, cancelKeySpec, position);
      } else {
        keySignatures[0].setKeySig(keySpec, cancelKeySpec);
      }

      return this;
    },

    setEndKeySignature: function(keySpec, cancelKeySpec) {
      this.setKeySignature(keySpec, cancelKeySpec, Vex.Flow.StaveModifier.Position.END);
      return this;
    },

    setTimeSignature: function(timeSpec, customPadding, position) {
      if (position === undefined) {
        position = Vex.Flow.StaveModifier.Position.BEGIN;
      }

      var timeSignatures = this.getModifiers(position, Vex.Flow.TimeSignature.category);
      if (timeSignatures.length === 0) {
        this.addTimeSignature(timeSpec, customPadding, position);
      } else {
        timeSignatures[0].setTimeSig(timeSpec);
      }

      return this;
    },

    setEndTimeSignature: function(timeSpec, customPadding) {
      this.setTimeSignature(timeSpec, customPadding, Vex.Flow.StaveModifier.Position.END);
      return this;
    },

    addKeySignature: function(keySpec, cancelKeySpec, position) {
      this.addModifier(new Vex.Flow.KeySignature(keySpec, cancelKeySpec), position);
      return this;
    },

    addClef: function(clef, size, annotation, position) {
      if (position === undefined ||
          position === Vex.Flow.StaveModifier.Position.BEGIN) {
        this.clef = clef;
      }

      this.addModifier(new Vex.Flow.Clef(clef, size, annotation), position);
      return this;
    },

    addEndClef: function(clef, size, annotation) {
      this.addClef(clef, size, annotation, Vex.Flow.StaveModifier.Position.END);
      return this;
    },

    addTimeSignature: function(timeSpec, customPadding, position) {
      this.addModifier(new Vex.Flow.TimeSignature(timeSpec, customPadding), position);
      return this;
    },

    addEndTimeSignature: function(timeSpec, customPadding) {
      this.addTimeSignature(timeSpec, customPadding, Vex.Flow.StaveModifier.Position.END);
      return this;
    },

    // Deprecated
    addTrebleGlyph: function() {
      this.addClef('treble');
      return this;
    },

    getModifiers: function(position, category) {
      if (position === undefined) return this.modifiers;

      return this.modifiers.filter(function(modifier) {
        return position === modifier.getPosition() &&
          (category === undefined || category === modifier.getCategory());
      });
    },

    sortByCategory: function(items, order) {
      for (var i = items.length - 1; i >= 0; i--) {
        for (var j = 0; j < i; j++) {
          if (order[items[j].getCategory()] > order[items[j + 1].getCategory()]) {
            var temp = items[j];
            items[j] = items[j + 1];
            items[j + 1] = temp;
          }
        }
      }
    },

    format: function() {
      var Barline = Vex.Flow.Barline;
      var begBarline = this.modifiers[0];
      var endBarline = this.modifiers[1];

      var begModifiers = this.getModifiers(Vex.Flow.StaveModifier.Position.BEGIN);
      var endModifiers = this.getModifiers(Vex.Flow.StaveModifier.Position.END);

      this.sortByCategory(begModifiers, {
        barlines: 0, clefs: 1, keysignatures: 2, timesignatures: 3
      });

      this.sortByCategory(endModifiers, {
        timesignatures: 0, keysignatures: 1, barlines: 2, clefs: 3
      });

      if (begModifiers.length > 1 &&
          begBarline.getType() === Barline.type.REPEAT_BEGIN) {
        begModifiers.push(begModifiers.splice(0, 1)[0]);
        begModifiers.splice(0, 0, new Barline(Barline.type.SINGLE));
      }

      if (endModifiers.indexOf(endBarline) > 0) {
        endModifiers.splice(0, 0, new Barline(Barline.type.NONE));
      }

      var width;
      var padding;
      var modifier;
      var offset = 0;
      var x = this.x;
      for (var i = 0; i < begModifiers.length; i++) {
        modifier = begModifiers[i];
        padding = modifier.getPadding(i + offset);
        width = modifier.getWidth();

        x += padding;
        modifier.setX(x);
        x += width;

        if (padding + width === 0) offset--;
      }

      this.start_x = x;
      x = this.x + this.width;

      for (i = 0; i < endModifiers.length; i++) {
        modifier = endModifiers[i];
        x -= modifier.getPadding(i);
        if (i !== 0)
          x -= modifier.getWidth();

        modifier.setX(x);

        if (i === 0)
          x -= modifier.getWidth();
      }

      this.end_x = endModifiers.length === 1 ? this.x + this.width : x;
      this.formatted = true;
    },

    /**
     * All drawing functions below need the context to be set.
     */
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw stave without canvas context.");

      if (!this.formatted) this.format();

      var num_lines = this.options.num_lines;
      var width = this.width;
      var x = this.x;
      var y;

      // Render lines
      for (var line=0; line < num_lines; line++) {
        y = this.getYForLine(line);

        this.context.save();
        this.context.setFillStyle(this.options.fill_style);
        this.context.setStrokeStyle(this.options.fill_style);
        if (this.options.line_config[line].visible) {
          this.context.fillRect(x, y, width, Vex.Flow.STAVE_LINE_THICKNESS);
        }
        this.context.restore();
      }

      // Draw the modifiers (bar lines, coda, segno, repeat brackets, etc.)
      for (var i = 0; i < this.modifiers.length; i++) {
        // Only draw modifier if it has a draw function
        if (typeof this.modifiers[i].draw == "function")
          this.modifiers[i].draw(this, this.getModifierXShift());
      }

      // Render measure numbers
      if (this.measure > 0) {
        this.context.save();
        this.context.setFont(this.font.family, this.font.size, this.font.weight);
        var text_width = this.context.measureText("" + this.measure).width;
        y = this.getYForTopText(0) + 3;
        this.context.fillText("" + this.measure, this.x - text_width / 2, y);
        this.context.restore();
      }

      return this;
    },

    // Draw Simple barlines for backward compatability
    // Do not delete - draws the beginning bar of the stave
    drawVertical: function(x, isDouble) {
      this.drawVerticalFixed(this.x + x, isDouble);
    },

    drawVerticalFixed: function(x, isDouble) {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw stave without canvas context.");

      var top_line = this.getYForLine(0);
      var bottom_line = this.getYForLine(this.options.num_lines - 1);
      if (isDouble)
        this.context.fillRect(x - 3, top_line, 1, bottom_line - top_line + 1);
      this.context.fillRect(x, top_line, 1, bottom_line - top_line + 1);
    },

    drawVerticalBar: function(x) {
      this.drawVerticalBarFixed(this.x + x, false);
    },

    drawVerticalBarFixed: function(x) {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw stave without canvas context.");

      var top_line = this.getYForLine(0);
      var bottom_line = this.getYForLine(this.options.num_lines - 1);
      this.context.fillRect(x, top_line, 1, bottom_line - top_line + 1);
    },

    /**
     * Get the current configuration for the Stave.
     * @return {Array} An array of configuration objects.
     */
    getConfigForLines: function() {
      return this.options.line_config;
    },

    /**
     * Configure properties of the lines in the Stave
     * @param line_number The index of the line to configure.
     * @param line_config An configuration object for the specified line.
     * @throws Vex.RERR "StaveConfigError" When the specified line number is out of
     *   range of the number of lines specified in the constructor.
     */
    setConfigForLine: function(line_number, line_config) {
      if (line_number >= this.options.num_lines || line_number < 0) {
        throw new Vex.RERR("StaveConfigError",
          "The line number must be within the range of the number of lines in the Stave.");
      }
      if (!line_config.hasOwnProperty('visible')) {
        throw new Vex.RERR("StaveConfigError",
          "The line configuration object is missing the 'visible' property.");
      }
      if (typeof(line_config.visible) !== 'boolean') {
        throw new Vex.RERR("StaveConfigError",
          "The line configuration objects 'visible' property must be true or false.");
      }

      this.options.line_config[line_number] = line_config;

      return this;
    },

    /**
     * Set the staff line configuration array for all of the lines at once.
     * @param lines_configuration An array of line configuration objects.  These objects
     *   are of the same format as the single one passed in to setLineConfiguration().
     *   The caller can set null for any line config entry if it is desired that the default be used
     * @throws Vex.RERR "StaveConfigError" When the lines_configuration array does not have
     *   exactly the same number of elements as the num_lines configuration object set in
     *   the constructor.
     */
    setConfigForLines: function(lines_configuration) {
      if (lines_configuration.length !== this.options.num_lines) {
        throw new Vex.RERR("StaveConfigError",
          "The length of the lines configuration array must match the number of lines in the Stave");
      }

      // Make sure the defaults are present in case an incomplete set of
      //  configuration options were supplied.
      for (var line_config in lines_configuration) {
        // Allow 'null' to be used if the caller just wants the default for a particular node.
        if (!lines_configuration[line_config]) {
          lines_configuration[line_config] = this.options.line_config[line_config];
        }
        Vex.Merge(this.options.line_config[line_config], lines_configuration[line_config]);
      }

      this.options.line_config = lines_configuration;

      return this;
    }
  };

  return Stave;
}());
