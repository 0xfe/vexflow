// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Larry Kuhns 2013
// Class to draws string numbers into the notation.

/**
 * @constructor
 */
Vex.Flow.FretHandFinger = (function() {
  function FretHandFinger(number) {
    if (arguments.length > 0) this.init(number);
  }

  var Modifier = Vex.Flow.Modifier;
  Vex.Inherit(FretHandFinger, Modifier, {
    init: function(number) {
      var superclass = Vex.Flow.FretHandFinger.superclass;
      superclass.init.call(this);

      this.note = null;
      this.index = null;
      this.finger = number;
      this.width = 7;
      this.position = Modifier.Position.LEFT;  // Default position above stem or note head
      this.x_shift = 0;
      this.y_shift = 0;
      this.x_offset = 0;       // Horizontal offset from default
      this.y_offset = 0;       // Vertical offset from default
      this.font = {
        family: "sans-serif",
        size: 9,
        weight: "bold"
      };
    },

    getCategory: function() { return "frethandfinger"; },
    getNote: function() { return this.note; },
    setNote: function(note) { this.note = note; return this; },
    getIndex: function() { return this.index; },
    setIndex: function(index) { this.index = index; return this; },
    getPosition: function() { return this.position; },
    setPosition: function(position) {
      if (position >= Modifier.Position.LEFT &&
          position <= Modifier.Position.BELOW)
        this.position = position;
      return this;
    },
    setFretHandFinger: function(number) { this.finger = number; return this; },
    setOffsetX: function(x) { this.x_offset = x; return this; },
    setOffsetY: function(y) { this.y_offset = y; return this; },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw string number without a context.");
      if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
        "Can't draw string number without a note and index.");

      var ctx = this.context;
      var start = this.note.getModifierStartXY(this.position, this.index);
      var dot_x = (start.x + this.x_shift + this.x_offset);
      var dot_y = start.y + this.y_shift + this.y_offset + 5;

      switch (this.position) {
        case Modifier.Position.ABOVE:
          dot_x -= 4;
          dot_y -= 12;
          break;
        case Modifier.Position.BELOW:
          dot_x -= 2;
          dot_y += 10;
          break;
        case Modifier.Position.LEFT:
          dot_x -= this.width;
          break;
        case Modifier.Position.RIGHT:
          dot_x += 1;
          break;
      }

      ctx.save();
      ctx.setFont(this.font.family, this.font.size, this.font.weight);
      ctx.fillText("" + this.finger, dot_x, dot_y);

      ctx.restore();
    }
  });

  return FretHandFinger;
}());