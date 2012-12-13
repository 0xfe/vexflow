// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements bends.

/**
   @constructor

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
Vex.Flow.Bend = function(text, release, phrase) {
  if (arguments.length > 0) this.init(text, release, phrase);
}

Vex.Flow.Bend.UP = 0;
Vex.Flow.Bend.DOWN = 1;

Vex.Flow.Bend.prototype = new Vex.Flow.Modifier();
Vex.Flow.Bend.prototype.constructor = Vex.Flow.Bend;
Vex.Flow.Bend.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.Bend.prototype.init = function(text, release, phrase) {
  var superclass = Vex.Flow.Bend.superclass;
  superclass.init.call(this);

  this.text = text;
  this.x_shift = 0;
  this.release = release || false;
  this.font = "10pt Arial";
  this.render_options = {
    bend_width: 8,
    release_width: 8
  };

  if (phrase) {
    this.phrase = phrase;
  } else {
    // Backward compatibility
    this.phrase = [{type: Vex.Flow.Bend.UP, text: this.text}]
    if (this.release) this.phrase.push({type: Vex.Flow.Bend.DOWN, text: ""})
  }

  this.updateWidth();
}

Vex.Flow.Bend.prototype.setXShift = function(value) {
  this.x_shift = value;
  this.updateWidth();
}

Vex.Flow.Bend.prototype.getCategory = function() { return "bends"; }
Vex.Flow.Bend.prototype.getText = function() { return this.text; }
Vex.Flow.Bend.prototype.updateWidth = function() {
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
      var additional_width = (bend.type == Vex.Flow.Bend.UP) ?
        this.render_options.bend_width : this.render_options.release_width;

      bend.width = Vex.Max(additional_width, measure_text(bend.text)) + 3;
      bend.draw_width = bend.width / 2;
      total_width += bend.width;
    }
  }

  this.setWidth(total_width + this.x_shift);
  return this;
}

Vex.Flow.Bend.prototype.setFont = function(font) {
  this.font = font; return this; }

Vex.Flow.Bend.prototype.draw = function() {
    if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw bend without a context.");
  if (!(this.note && (this.index != null))) throw new Vex.RERR("NoNoteForBend",
    "Can't draw bend without a note or index.");

  var start = this.note.getModifierStartXY(Vex.Flow.Modifier.Position.RIGHT,
      this.index);
  start.x += 3;
  start.y += 0.5;
  var x_shift = this.x_shift;

  var ctx = this.context;
  var that = this;
  var bend_height = this.note.getStave().getYForTopText(this.text_line) + 3;
  var annotation_y = this.note.getStave().getYForTopText(this.text_line) - 1;

  function renderBend(x, y, width, height) {
    var cp_x = x + width;
    var cp_y = y;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cp_x, cp_y, x + width, height);
    ctx.stroke();
  }

  function renderRelease(x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.quadraticCurveTo(
        x + width, height,
        x + width, y);
    ctx.stroke();
  }

  function renderArrowHead(x, y, direction) {
    var width = 3;
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
    ctx.font = this.font;
    var render_x = x - (ctx.measureText(text).width / 2);
    ctx.fillText(text, render_x, annotation_y);
    ctx.restore();
  }

  var last_bend = null;
  var last_drawn_width = 0;
  for (var i=0; i<this.phrase.length; ++i) {
    var bend = this.phrase[i];
    if (i == 0) bend.draw_width += x_shift;

    last_drawn_width = bend.draw_width + (last_bend?last_bend.draw_width:0) - (i==1?x_shift:0);
    if (bend.type == Vex.Flow.Bend.UP) {
      if (last_bend && last_bend.type == Vex.Flow.Bend.UP) {
        renderArrowHead(start.x, bend_height);
      }

      renderBend(start.x, start.y, last_drawn_width, bend_height);
    }

    if (bend.type == Vex.Flow.Bend.DOWN) {
      if (last_bend && last_bend.type == Vex.Flow.Bend.UP) {
        renderRelease(start.x, start.y, last_drawn_width, bend_height);
      }

      if (last_bend && last_bend.type == Vex.Flow.Bend.DOWN) {
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
    last_bend.x = start.x

    start.x += last_drawn_width;
  }

  // Final arrowhead and text
  if (last_bend.type == Vex.Flow.Bend.UP) {
    renderArrowHead(last_bend.x + last_drawn_width, bend_height);
  } else if (last_bend.type == Vex.Flow.Bend.DOWN) {
    renderArrowHead(last_bend.x + last_drawn_width, start.y, -1);
  }
}
