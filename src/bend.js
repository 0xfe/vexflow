// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements tablature bends.

/**
   @param text Text for bend ("Full", "Half", etc.) (DEPRECATED)
   @param release If true, render a release. (DEPRECATED)
   @param phrase If set, ignore "text" and "release", and use the more
                 sophisticated phrase specified.

   Example of a phrase:

     [{
       type: UP,
       text: "whole"
       width: 8;
     },
     {
       type: DOWN,
       text: "whole"
       width: 8;
     },
     {
       type: UP,
       text: "half"
       width: 8;
     },
     {
       type: UP,
       text: "whole"
       width: 8;
     },
     {
       type: DOWN,
       text: "1 1/2"
       width: 8;
     }]
 */
Vex.Flow.Bend = (function() {
  function Bend(text, release, phrase) {
    if (arguments.length > 0) this.init(text, release, phrase);
  }
  Bend.CATEGORY = "bends";

  Bend.UP = 0;
  Bend.DOWN = 1;

  var Modifier = Vex.Flow.Modifier;

  // ## Static Methods
  // Arrange bends in `ModifierContext`
  Bend.format = function(bends, state) {
    if (!bends || bends.length === 0) return false;

    var last_width = 0;
    // Bends are always on top.
    var text_line = state.top_text_line;

    // Format Bends
    for (var i = 0; i < bends.length; ++i) {
      var bend = bends[i];
      bend.setXShift(last_width);
      last_width = bend.getWidth();
      bend.setTextLine(text_line);
    }

    state.right_shift += last_width;
    state.top_text_line += 1;
    return true;
  };

  // ## Prototype Methods
  Vex.Inherit(Bend, Modifier, {
    init: function(text, release, phrase) {
      var superclass = Vex.Flow.Bend.superclass;
      superclass.init.call(this);

      this.text = text;
      this.x_shift = 0;
      this.release = release || false;
      this.font = "10pt Arial";
      this.render_options = {
        line_width: 1.5,
        line_style: "#777777",
        bend_width: 8,
        release_width: 8
      };

      if (phrase) {
        this.phrase = phrase;
      } else {
        // Backward compatibility
        this.phrase = [{type: Bend.UP, text: this.text}];
        if (this.release) this.phrase.push({type: Bend.DOWN, text: ""});
      }

      this.updateWidth();
    },

    setXShift: function(value) {
      this.x_shift = value;
      this.updateWidth();
    },

    setFont: function(font) { this.font = font; return this; },

    getText: function() { return this.text; },

    updateWidth: function() {
      var that = this;

      function measure_text(text) {
        var text_width;
        if (that.context) {
          text_width = that.context.measureText(text).width;
        } else {
          text_width = Vex.Flow.textWidth(text);
        }

        return text_width;
      }

      var total_width = 0;
      for (var i=0; i<this.phrase.length; ++i) {
        var bend = this.phrase[i];
        if ('width' in bend) {
          total_width += bend.width;
        } else {
          var additional_width = (bend.type == Bend.UP) ?
            this.render_options.bend_width : this.render_options.release_width;

          bend.width = Vex.Max(additional_width, measure_text(bend.text)) + 3;
          bend.draw_width = bend.width / 2;
          total_width += bend.width;
        }
      }

      this.setWidth(total_width + this.x_shift);
      return this;
    },

    draw: function() {
        if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw bend without a context.");
      if (!(this.note && (this.index != null))) throw new Vex.RERR("NoNoteForBend",
        "Can't draw bend without a note or index.");

      var start = this.note.getModifierStartXY(Modifier.Position.RIGHT,
          this.index);
      start.x += 3;
      start.y += 0.5;
      var x_shift = this.x_shift;

      var ctx = this.context;
      var bend_height = this.note.getStave().getYForTopText(this.text_line) + 3;
      var annotation_y = this.note.getStave().getYForTopText(this.text_line) - 1;
      var that = this;

      function renderBend(x, y, width, height) {
        var cp_x = x + width;
        var cp_y = y;

        ctx.save();
        ctx.beginPath();
        ctx.setLineWidth(that.render_options.line_width);
        ctx.setStrokeStyle(that.render_options.line_style);
        ctx.setFillStyle(that.render_options.line_style);
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(cp_x, cp_y, x + width, height);
        ctx.stroke();
        ctx.restore();
      }

      function renderRelease(x, y, width, height) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineWidth(that.render_options.line_width);
        ctx.setStrokeStyle(that.render_options.line_style);
        ctx.setFillStyle(that.render_options.line_style);
        ctx.moveTo(x, height);
        ctx.quadraticCurveTo(
            x + width, height,
            x + width, y);
        ctx.stroke();
        ctx.restore();
      }

      function renderArrowHead(x, y, direction) {
        var width = 4;
        var dir = direction || 1;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - width, y + width * dir);
        ctx.lineTo(x + width, y + width * dir);
        ctx.closePath();
        ctx.fill();
      }

      function renderText(x, text) {
        ctx.save();
        ctx.setRawFont(that.font);
        var render_x = x - (ctx.measureText(text).width / 2);
        ctx.fillText(text, render_x, annotation_y);
        ctx.restore();
      }

      var last_bend = null;
      var last_drawn_width = 0;
      for (var i=0; i<this.phrase.length; ++i) {
        var bend = this.phrase[i];
        if (i === 0) bend.draw_width += x_shift;

        last_drawn_width = bend.draw_width + (last_bend?last_bend.draw_width:0) - (i==1?x_shift:0);
        if (bend.type == Bend.UP) {
          if (last_bend && last_bend.type == Bend.UP) {
            renderArrowHead(start.x, bend_height);
          }

          renderBend(start.x, start.y, last_drawn_width, bend_height);
        }

        if (bend.type == Bend.DOWN) {
          if (last_bend && last_bend.type == Bend.UP) {
            renderRelease(start.x, start.y, last_drawn_width, bend_height);
          }

          if (last_bend && last_bend.type == Bend.DOWN) {
            renderArrowHead(start.x, start.y, -1);
            renderRelease(start.x, start.y, last_drawn_width, bend_height);
          }

          if (last_bend == null) {
            last_drawn_width = bend.draw_width;
            renderRelease(start.x, start.y, last_drawn_width, bend_height);
          }
        }

        renderText(start.x + last_drawn_width, bend.text);
        last_bend = bend;
        last_bend.x = start.x;

        start.x += last_drawn_width;
      }

      // Final arrowhead and text
      if (last_bend.type == Bend.UP) {
        renderArrowHead(last_bend.x + last_drawn_width, bend_height);
      } else if (last_bend.type == Bend.DOWN) {
        renderArrowHead(last_bend.x + last_drawn_width, start.y, -1);
      }
    }
  });

  return Bend;
}());
