export const BravuraMetrics = {
  name: 'Bravura',
  smufl: true,
  clef: {
    default: {
      point: 32,
      width: 26,
    },
    small: {
      point: 26,
      width: 20,
    },

    annotations: {
      '8va': {
        smuflCode: 'timeSig8',
        default: {
          point: 18,
          treble: {
            line: -1.4,
            shiftX: 12,
          },
        },
        small: {
          point: 16,
          treble: {
            line: -0.2,
            shiftX: 8,
          },
        }
      },
      '8vb': {
        smuflCode: 'timeSig8',
        default: {
          point: 18,
          treble: {
            line: 6,
            shiftX: 10,
          },
          bass: {
            line: 3.5,
            shiftX: 1,
          }
        },
        small: {
          point: 16,
          treble: {
            line: 5.3,
            shiftX: 6,
          },
          bass: {
            line: 3.1,
            shiftX: 0.5,
          }
        }
      }
    },

    // These may no longer be necessary
    lineCount: {
      '8': { point: 55, shiftY: 14 },
      '7': { point: 47, shiftY: 8 },
      '6': { point: 32, shiftY: 1 },
      '5': { point: 30, shiftY: -6 },
      '4': { point: 23, shiftY: -12 },
    }
  },

  timeSig: {
    shiftTopLine: -1,
    shiftBottomLine: -1,
    point: 34,
  },

  articulation: {
    articStaccatissimoAbove: {
      padding: 2,
    },
    articStaccatissimoBelow: {
      padding: 2,
    }
  },

  stem: {
    noteHead: {
      noteheadTriangleUpHalf: {
        offsetYBaseStemUp: 4,
        offsetYBaseStemDown: 4,
      },
      noteheadTriangleUpBlack: {
        offsetYBaseStemUp: 4,
        offsetYBaseStemDown: 4,
      },
      noteheadTriangleUpWhole: {
        offsetYBaseStemUp: 4,
        offsetYBaseStemDown: 4,
      },
      noteheadXHalf: {
        offsetYBaseStemUp: -4,
        offsetYBaseStemDown: 4,
      },
      noteheadXBlack: {
        offsetYBaseStemUp: -4,
        offsetYBaseStemDown: 4,
      },
      noteheadXWhole: {
        offsetYBaseStemUp: -4,
        offsetYBaseStemDown: 4,
      },
      noteheadBlack: {
        offsetYBaseStemDown: 2,
      }
    }
  },

  // Values under here are used by the Glyph class to reposition and rescale
  // glyphs based on their category. This should be the first stop for
  // custom font glyph repositioning.
  glyphs: {
    flag: {
      shiftX: -0.75,
      tabStem: {
        shiftX: -1.75,
      }
    },
    clef: {
      gClef: {
        default: { scale: 1.1, shiftY: 1 },
        small: { shiftY: 1.5 }
      },
      fClef: {
        default: { shiftY: -0.5 }
      }
    },
    noteHead: {
      custom: {
        'noteheadDiamondHalfStemUp': {
          shiftX: 1.5,
        },
        'noteheadDiamondBlackStemUp': {
          shiftX: 1.5,
        },
        'noteheadDiamondWholeStemUp': {
          shiftX: 1,
        },
        'noteheadXHalfStemUp': {
          shiftX: -2,
        },
        'noteheadXWholeStemUp': {
          shiftX: -2,
        },
      },
    },
  }
}