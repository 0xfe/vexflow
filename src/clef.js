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

  // Every clef name is associated with a glyph code from the font file, a
  // point size, and a default stave line number.
  Clef.types = {
    "treble": {
      code: "v83",
      point: 40,
      line: 3
    },
    "bass": {
      code: "v79",
      point: 40,
      line: 1
    },
    "alto": {
      code: "vad",
      point: 40,
      line: 2
    },
    "tenor": {
      code: "vad",
      point: 40,
      line: 1
    },
    "percussion": {
      code: "v59",
      point: 40,
      line: 2
    },
    "soprano": {
      code: "vad",
      point: 40,
      line: 4
    },
    "mezzo-soprano": {
      code: "vad",
      point: 40,
      line: 3
    },
    "baritone-c": {
      code: "vad",
      point: 40,
      line: 0
    },
    "baritone-f": {
      code: "v79",
      point: 40,
      line: 2
    },
    "subbass": {
      code: "v79",
      point: 40,
      line: 0
    },
    "french": {
      code: "v83",
      point: 40,
      line: 4
    },
  };
  // sizes affect the point-size of the clef
  Clef.sizes = {
    "small": {
      "treble": 32,
      "bass": 32,
      "alto": 32,
      "tenor": 32,
      "percussion": 32,
      "soprano": 32,
      "mezzo-soprano": 32,
      "baritone-c": 32,
      "baritone-f": 32,
      "subbass": 32,
      "french": 32
    } 
  };
  
  
  // annotations attach to clefs -- such as "8" for octave up or down...
  Clef.annotations = {
    "8va": {
      code: "v8",
      sizes: {
        "default": {
          point: 20,
          clef_attachments: {
            "treble": {
              line: -1.2,
              x_shift: 11
            }
          }
        },
        "small": {
          point: 18,
          clef_attachments: {
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
          clef_attachments: {
            "treble": {
              line: 6.3,
              x_shift: 10
            }
          }
        },
        "small": {
          point: 18,
          clef_attachments: {
            "treble": {
              line: 5.8,
              x_shift: 6
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
      if (this.size != "default" && Vex.Flow.Clef.sizes[this.size] !== undefined) {
        this.clef.point = Vex.Flow.Clef.sizes[this.size][clef];
      }
      
      if (annotation !== undefined) {
        var anno_dict = Vex.Flow.Clef.annotations[annotation];
        this.annotation = {
          code: anno_dict.code,
          point: anno_dict.sizes[this.size].point,
          line: anno_dict.sizes[this.size].clef_attachments[clef].line,
          x_shift: anno_dict.sizes[this.size].clef_attachments[clef].x_shift
        };
      }
      L("Creating clef:", clef);
    },

    // Add this clef to the start of the given `stave`.
    addModifier: function(stave) {
      var glyph = new Vex.Flow.Glyph(this.clef.code, this.clef.point);
      this.placeGlyphOnLine(glyph, stave, this.clef.line);
      if (this.annotation !== undefined) {
        var ottavaGlyph = new Vex.Flow.Glyph(this.annotation.code, this.annotation.point);
        ottavaGlyph.metrics.x_max = 0;
        ottavaGlyph.setXShift(this.annotation.x_shift);
        this.placeGlyphOnLine(ottavaGlyph, stave, this.annotation.line);
        stave.addGlyph(ottavaGlyph);
      }
      stave.addGlyph(glyph);
    },

    // Add this clef to the end of the given `stave`.
    addEndModifier: function(stave) {
      var glyph = new Vex.Flow.Glyph(this.clef.code, this.clef.point);
      this.placeGlyphOnLine(glyph, stave, this.clef.line);
      stave.addEndGlyph(glyph);
      if (this.annotation !== undefined) {
        var ottavaGlyph = new Vex.Flow.Glyph(this.annotation.code, this.annotation.point);
        ottavaGlyph.metrics.x_max = 0;
        ottavaGlyph.setXShift(this.annotation.x_shift);
        this.placeGlyphOnLine(ottavaGlyph, stave, this.annotation.line);
        stave.addEndGlyph(ottavaGlyph);
      }
    }
  });

  return Clef;
}());
