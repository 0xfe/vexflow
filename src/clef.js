// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna Cheppudira 2013.
// Co-author: Benjamin W. Bohl
//
// ## Description
//
// This file implements various types of clefs that can be rendered on a stave.
//
// See `tests/clef_tests.js` for usage examples.

Vex.Flow.Clef = (function() {
  function Clef(clef, size, annotation) {
    if (arguments.length > 0) this.init(clef, size, annotation);
  }

  // To enable logging for this class, set `Vex.Flow.Clef.DEBUG` to `true`.
  function L() { if (Vex.Flow.Clef.DEBUG) Vex.L("Vex.Flow.Clef", arguments); }

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
    init: function(clef, size, annotation) {
      var superclass = Vex.Flow.Clef.superclass;
      superclass.init.call(this);

      this.clef = Vex.Flow.Clef.types[clef];
      if (size === undefined) {
        this.size = "default";
      } else {
        this.size = size;
      }
      this.clef.point = Vex.Flow.Clef.sizes[this.size];

      // If an annotation, such as 8va, is specified, add it to the Clef object.
      if (annotation !== undefined) {
        var anno_dict = Vex.Flow.Clef.annotations[annotation];
        this.annotation = {
          code: anno_dict.code,
          point: anno_dict.sizes[this.size].point,
          line: anno_dict.sizes[this.size].attachments[clef].line,
          x_shift: anno_dict.sizes[this.size].attachments[clef].x_shift
        };
      }
      L("Creating clef:", clef);
    },

    // Add this clef to the start of the given `stave`.
    addModifier: function(stave) {
      var glyph = new Vex.Flow.Glyph(this.clef.code, this.clef.point);
      this.placeGlyphOnLine(glyph, stave, this.clef.line);
      if (this.annotation !== undefined) {
        var attachment = new Vex.Flow.Glyph(this.annotation.code, this.annotation.point);
        attachment.metrics.x_max = 0;
        attachment.setXShift(this.annotation.x_shift);
        this.placeGlyphOnLine(attachment, stave, this.annotation.line);
        stave.addGlyph(attachment);
      }
      stave.addGlyph(glyph);
    },

    // Add this clef to the end of the given `stave`.
    addEndModifier: function(stave) {
      var glyph = new Vex.Flow.Glyph(this.clef.code, this.clef.point);
      this.placeGlyphOnLine(glyph, stave, this.clef.line);
      stave.addEndGlyph(glyph);
      if (this.annotation !== undefined) {
        var attachment = new Vex.Flow.Glyph(this.annotation.code, this.annotation.point);
        attachment.metrics.x_max = 0;
        attachment.setXShift(this.annotation.x_shift);
        this.placeGlyphOnLine(attachment, stave, this.annotation.line);
        stave.addEndGlyph(attachment);
      }
    }
  });

  return Clef;
}());
