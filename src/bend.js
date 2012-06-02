// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements bends.

/**
 * @constructor
 */
Vex.Flow.Bend = function(text, release) {
  if (arguments.length > 0) this.init(text, release);
}
Vex.Flow.Bend.prototype = new Vex.Flow.Modifier();
Vex.Flow.Bend.prototype.constructor = Vex.Flow.Bend;
Vex.Flow.Bend.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.Bend.prototype.init = function(text, release) {
  var superclass = Vex.Flow.Bend.superclass;
  superclass.init.call(this);

  this.text = text;
  this.release = release || false;
  this.font = "10pt Arial";
  this.render_options = {
    bend_width: 8,
    release_width: 8
  };

  this.bend_width = this.render_options.bend_width;
  this.release_width = this.release ? this.render_options.release_width:0;

  this.updateWidth();
}

Vex.Flow.Bend.prototype.getCategory = function() { return "bends"; }
Vex.Flow.Bend.prototype.getText = function() { return this.text; }
Vex.Flow.Bend.prototype.updateWidth = function() {
  var text_width;
  if (this.context) {
    text_width = this.context.measureText(this.text).width;
  } else {
    text_width = Vex.Flow.textWidth(this.text);
  }

  this.setWidth(
      this.bend_width +
      this.release_width +
      text_width / 2);
}
Vex.Flow.Bend.prototype.setBendWidth = function(width) {
  this.bend_width = width; this.updateWidth();
}
Vex.Flow.Bend.prototype.setReleaseWidth = function(width) {
  this.release_width = width; this.updateWidth();
}
Vex.Flow.Bend.prototype.hasRelease = function() { return this.release; }
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

  var ctx = this.context;
  var that = this;
  var bend_height = this.note.getStave().getYForTopText(this.text_line) + 3;

  function renderBend(x, y) {
    var cp_x = x + that.bend_width;
    var cp_y = y;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cp_x, cp_y, x + that.bend_width, bend_height);

    if (that.release) {
      ctx.quadraticCurveTo(
          x + that.bend_width + that.release_width + 2, bend_height,
          x + that.bend_width + that.release_width, y);
    }

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

  renderBend(start.x, start.y + 0.5);
  if (!this.release) {
    renderArrowHead(start.x + this.bend_width, bend_height);
  } else {
    renderArrowHead(start.x + this.bend_width + this.release_width,
        start.y + 0.5, -1);
  }

  var annotation_y = this.note.getStave().getYForTopText(this.text_line) - 1;
  ctx.save();
  ctx.font = this.font;
  var text_x = start.x + this.bend_width - (ctx.measureText(this.text).width / 2);
  ctx.fillText(this.text, text_x, annotation_y);
  ctx.restore();
}
