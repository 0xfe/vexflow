// VexFlow - Music Engraving for HTML5
// Copyright Mike Corrigan 2012 <corrigan@gmail.com>
//
// This class implements tremelo notation.

/**
 * @constructor
 */
Vex.Flow.Tremelo = function(num) {
  if (arguments.length > 0) this.init(num);
}
Vex.Flow.Tremelo.prototype = new Vex.Flow.Modifier();
Vex.Flow.Tremelo.prototype.constructor = Vex.Flow.Tremelo;
Vex.Flow.Tremelo.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.Tremelo.prototype.init = function(num) {
  var superclass = Vex.Flow.Tremelo.superclass;
  superclass.init.call(this);

  this.num = num;
  this.note = null;
  this.index = null;
  this.position = Vex.Flow.Modifier.Position.CENTER;
  this.code = "v74";
  this.shift_right = -2;
  this.y_spacing = 4;

  this.render_options = {
    font_scale: 35,
    stroke_px: 3,
    stroke_spacing: 10
  };

  this.font = {
    family: "Arial",
    size: 16,
    weight: ""
  };
}

Vex.Flow.Tremelo.prototype.getCategory = function() { return "tremelo"; }

Vex.Flow.Tremelo.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw Tremelo without a context.");
  if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
    "Can't draw Tremelo without a note and index.");

  var start = this.note.getModifierStartXY(this.position, this.index);
  var x = start.x;
  var y = start.y;

  x += this.shift_right;
  for (var i = 0; i < this.num; ++i) {
    Vex.Flow.renderGlyph(this.context, x, y,
                         this.render_options.font_scale, this.code);
    y += this.y_spacing;
  }
}
