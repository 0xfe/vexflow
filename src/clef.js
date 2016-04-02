// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna Cheppudira 2013.
// Co-author: Benjamin W. Bohl
//
// ## Description
//
// This file implements various types of clefs that can be rendered on a stave.
//
// See `tests/clef_tests.js` for usage examples.

Vex.Flow.Clef = (function() {
  function Clef(type, size, annotation) {
    if (arguments.length > 0) this.init(type, size, annotation);
  }

  // To enable logging for this class, set `Vex.Flow.Clef.DEBUG` to `true`.
  function L() { if (Vex.Flow.Clef.DEBUG) Vex.L("Vex.Flow.Clef", arguments); }

  Clef.category = 'clefs';

  // Every clef name is associated with a glyph code from the font file
  // and a default stave line number.
  Clef.types = {
    "treble": {
      code: "v83",
      line: 3
    },
    "bass": {
      code: "v79",
      line: 1
    },
    "alto": {
      code: "vad",
      line: 2
    },
    "tenor": {
      code: "vad",
      line: 1
    },
    "percussion": {
      code: "v59",
      line: 2
    },
    "soprano": {
      code: "vad",
      line: 4
    },
    "mezzo-soprano": {
      code: "vad",
      line: 3
    },
    "baritone-c": {
      code: "vad",
      line: 0
    },
    "baritone-f": {
      code: "v79",
      line: 2
    },
    "subbass": {
      code: "v79",
      line: 0
    },
    "french": {
      code: "v83",
      line: 4
    },
    "tab": {
      code: "v2f"
    }
  };
  // Sizes affect the point-size of the clef.
  Clef.sizes = {
    "default": 40,
    "small": 32
  };

  // Annotations attach to clefs -- such as "8" for octave up or down.
  Clef.annotations = {
    "8va": {
      code: "v8",
      sizes: {
        "default": {
          point: 20,
          attachments: {
            "treble": {
              line: -1.2,
              x_shift: 11
            }
          }
        },
        "small": {
          point: 18,
          attachments: {
            "treble": {
              line: -0.4,
              x_shift: 8
            }
          }
        }
      }
    },
    "8vb": {
      code: "v8",
      sizes: {
        "default": {
          point: 20,
          attachments: {
            "treble": {
              line: 6.3,
              x_shift: 10
            },
            "bass": {
              line: 4,
              x_shift: 1
            }
          }
        },
        "small": {
          point: 18,
          attachments: {
            "treble": {
              line: 5.8,
              x_shift: 6
            },
            "bass": {
              line: 3.5,
              x_shift: 0.5
            }
          }
        }
      }
    },
  };
  // ## Prototype Methods
  Vex.Inherit(Clef, Vex.Flow.StaveModifier, {
    // Create a new clef. The parameter `clef` must be a key from
    // `Clef.types`.
    init: function(type, size, annotation) {
      var superclass = Vex.Flow.Clef.superclass;
      superclass.init.call(this);

      this.setPosition(Vex.Flow.StaveModifier.Position.BEGIN);
      this.setType(type, size, annotation);
      this.setWidth(this.glyph.getMetrics().width);
      L("Creating clef:", type);
    },

    getCategory: function() { return Clef.category; },

    setType: function(type, size, annotation) {
      this.type = type;
      this.clef = Vex.Flow.Clef.types[type];
      if (size === undefined) {
        this.size = "default";
      } else {
        this.size = size;
      }
      this.clef.point = Vex.Flow.Clef.sizes[this.size];
      this.glyph = new Vex.Flow.Glyph(this.clef.code, this.clef.point);

      // If an annotation, such as 8va, is specified, add it to the Clef object.
      if (annotation !== undefined) {
        var anno_dict = Vex.Flow.Clef.annotations[annotation];
        this.annotation = {
          code: anno_dict.code,
          point: anno_dict.sizes[this.size].point,
          line: anno_dict.sizes[this.size].attachments[this.type].line,
          x_shift: anno_dict.sizes[this.size].attachments[this.type].x_shift
        };

        this.attachment = new Vex.Flow.Glyph(this.annotation.code, this.annotation.point);
        this.attachment.metrics.x_max = 0;
        this.attachment.setXShift(this.annotation.x_shift);
      }
      else {
        this.annotation = undefined;
      }

      return this;
    },

    getWidth: function() {
      if (this.type === 'tab' && !this.stave) {
        throw new Vex.RERR("ClefError", "Can't get width without stave.");
      }

      return this.width;
    },

    setStave: function(stave) {
      this.stave = stave;

      if (this.type !== 'tab') return;

      var glyphScale;
      var glyphOffset;
      switch(this.stave.getOptions().num_lines) {
        case 8:
          glyphScale = 55;
          glyphOffset = 14;
          break;
        case 7:
          glyphScale = 47;
          glyphOffset = 8;
          break;
        case 6:
          glyphScale = 40;
          glyphOffset = 1;
          break;
        case 5:
          glyphScale = 30;
          glyphOffset = -6;
          break;
        case 4:
          glyphScale = 23;
          glyphOffset = -12;
          break;
      }

      this.glyph.setPoint(glyphScale);
      this.glyph.setYShift(glyphOffset);

      return this;
    },

    draw: function() {
      if (!this.x) throw new Vex.RERR("ClefError", "Can't draw clef without x.");
      if (!this.stave) throw new Vex.RERR("ClefError", "Can't draw clef without stave.");

      this.glyph.setStave(this.stave);
      this.glyph.setContext(this.stave.context);
      if (this.clef.line !== undefined) {
        this.placeGlyphOnLine(this.glyph, this.stave, this.clef.line);
      }

      this.glyph.renderToStave(this.x);

      if (this.annotation !== undefined) {
        this.placeGlyphOnLine(this.attachment, this.stave, this.annotation.line);
        this.attachment.setStave(this.stave);
        this.attachment.setContext(this.stave.context);
        this.attachment.renderToStave(this.x);
      }
    }
  });

  return Clef;
}());
