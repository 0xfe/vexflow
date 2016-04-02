// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Larry Kuhns.
//
// ## Description
//
// This file implements articulations and accents as modifiers that can be
// attached to notes. The complete list of articulations is available in
// `tables.js` under `Vex.Flow.articulationCodes`.
//
// See `tests/articulation_tests.js` for usage examples.

Vex.Flow.Articulation = (function() {
  function Articulation(type) {
    if (arguments.length > 0) this.init(type);
  }
  Articulation.CATEGORY = "articulations";

  // To enable logging for this class. Set `Vex.Flow.Articulation.DEBUG` to `true`.
  function L() { if (Articulation.DEBUG) Vex.L("Vex.Flow.Articulation", arguments); }

  var Modifier = Vex.Flow.Modifier;

  // ## Static Methods
  // Arrange articulations inside `ModifierContext`
  Articulation.format = function(articulations, state) {
    if (!articulations || articulations.length === 0) return false;

    var width = 0;
    for (var i = 0; i < articulations.length; ++i) {
      var increment = 1;
      var articulation = articulations[i];
      width = Math.max(articulation.getWidth(), width);

      var type = Vex.Flow.articulationCodes(articulation.type);

      if (!type.between_lines) increment += 1.5;

      if (articulation.getPosition() === Modifier.Position.ABOVE) {
        articulation.setTextLine(state.top_text_line);
        state.top_text_line += increment;
      } else {
        articulation.setTextLine(state.text_line);
        state.text_line += increment;
      }
    }

    state.left_shift += width / 2;
    state.right_shift += width / 2;
    return true;
  };

  // ## Prototype Methods
  Vex.Inherit(Articulation, Modifier, {
    // Create a new articulation of type `type`, which is an entry in
    // `Vex.Flow.articulationCodes` in `tables.js`.
    init: function(type) {
      Articulation.superclass.init.call(this);

      this.note = null;
      this.index = null;
      this.type = type;
      this.position = Modifier.Position.BELOW;

      this.render_options = {
        font_scale: 38
      };

      this.articulation = Vex.Flow.articulationCodes(this.type);
      if (!this.articulation) throw new Vex.RERR("ArgumentError",
         "Articulation not found: '" + this.type + "'");

      // Default width comes from articulation table.
      this.setWidth(this.articulation.width);
    },

    // Render articulation in position next to note.
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw Articulation without a context.");
      if (!(this.note && (this.index !== null))) throw new Vex.RERR("NoAttachedNote",
        "Can't draw Articulation without a note and index.");

      var stem_direction = this.note.getStemDirection();
      var stave = this.note.getStave();

      var is_on_head = (this.position === Modifier.Position.ABOVE &&
                        stem_direction === Vex.Flow.StaveNote.STEM_DOWN) ||
                       (this.position === Modifier.Position.BELOW &&
                        stem_direction === Vex.Flow.StaveNote.STEM_UP);

      var needsLineAdjustment = function(articulation, note_line, line_spacing) {
        var offset_direction = (articulation.position === Modifier.Position.ABOVE) ? 1 : -1;
        var duration = articulation.getNote().getDuration();
        if(!is_on_head && Vex.Flow.durationToNumber(duration) <= 1){
          // Add stem length, unless it's on a whole note.
          note_line += offset_direction * 3.5;
        }

        var articulation_line = note_line + (offset_direction * line_spacing);

        if(articulation_line >= 1 &&
           articulation_line <= 5 &&
           articulation_line % 1 === 0){
          return true;
        }

        return false;
      };

      // Articulations are centered over/under the note head.
      var start = this.note.getModifierStartXY(this.position, this.index);
      var glyph_y = start.y;
      var shiftY = 0;
      var line_spacing = 1;
      var spacing = stave.getSpacingBetweenLines();
      var is_tabnote = this.note.getCategory() === 'tabnotes';
      var stem_ext = this.note.getStem().getExtents();

      var top = stem_ext.topY;
      var bottom = stem_ext.baseY;

      if (stem_direction === Vex.Flow.StaveNote.STEM_DOWN) {
        top = stem_ext.baseY;
        bottom = stem_ext.topY;
      }

      // TabNotes don't have stems attached to them. Tab stems are rendered
      // outside the stave.
      if (is_tabnote) {
        if (this.note.hasStem()){
          if (stem_direction === Vex.Flow.StaveNote.STEM_UP) {
            bottom = stave.getYForBottomText(this.text_line - 2);
          } else if (stem_direction === Vex.Flow.StaveNote.STEM_DOWN ) {
            top = stave.getYForTopText(this.text_line - 1.5);
          }
        } else { // Without a stem
          top = stave.getYForTopText(this.text_line - 1);
          bottom = stave.getYForBottomText(this.text_line - 2);
        }
      }

      var is_above = (this.position === Modifier.Position.ABOVE) ? true : false;
      var note_line = this.note.getLineNumber(is_above);

      // Beamed stems are longer than quarter note stems.
      if (!is_on_head && this.note.beam) line_spacing += 0.5;

      // If articulation will overlap a line, reposition it.
      if (needsLineAdjustment(this, note_line, line_spacing)) line_spacing += 0.5;

      var glyph_y_between_lines;
      if (this.position === Modifier.Position.ABOVE) {
        shiftY = this.articulation.shift_up;
        glyph_y_between_lines = (top - 7) - (spacing * (this.text_line + line_spacing));

        if (this.articulation.between_lines) {
          glyph_y = glyph_y_between_lines;
        } else {
          glyph_y = Math.min(stave.getYForTopText(this.text_line) - 3, glyph_y_between_lines);
        }
      } else {
        shiftY = this.articulation.shift_down - 10;

        glyph_y_between_lines = bottom + 10 + spacing * (this.text_line + line_spacing);
        if (this.articulation.between_lines) {
          glyph_y = glyph_y_between_lines;
        } else {
          glyph_y = Math.max(stave.getYForBottomText(this.text_line), glyph_y_between_lines);
        }
      }

      var glyph_x = start.x + this.articulation.shift_right;
      glyph_y += shiftY + this.y_shift;

      L("Rendering articulation: ", this.articulation, glyph_x, glyph_y);
      Vex.Flow.renderGlyph(this.context, glyph_x, glyph_y,
                           this.render_options.font_scale, this.articulation.code);
    }
  });

  return Articulation;
}());