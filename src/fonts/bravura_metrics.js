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

  pedalMarking: {
    up: {
      point: 40
    },
    down: {
      point: 34
    }
  },

  // These are for numeric digits, such as in time signatures
  digits: {
    shiftLine: -1,
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
    // These are stem (Y) offsets to the note heads. To shift the
    // noteheads (x-position) themselves, see glyphs.notehead.custom.
    noteHead: {
      noteheadTriangleUpHalf: {
        offsetYBaseStemUp: 5,
        offsetYBaseStemDown: 4,
      },
      noteheadTriangleUpBlack: {
        offsetYBaseStemUp: 5,
        offsetYBaseStemDown: 4,
      },
      noteheadTriangleUpWhole: {
        offsetYBaseStemUp: 5,
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
      },
      noteheadSquareWhite: {
        offsetYBaseStemDown: -5,
        offsetYBaseStemUp: 5,
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
        'noteheadCircleXStemUp': {
          shiftX: 1.5,
        },
        'noteheadCircleXStemDown': {
          shiftX: 0.25,
        },
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
        'noteheadXHalfStemDown': {
          shiftX: 1,
        },
        'noteheadXWholeStemUp': {
          shiftX: -4,
        },
        'noteheadXWholeStemDown': {
          shiftX: 1,
        },
        'noteheadSquareWhiteStemDown': {
          shiftX: 0.25,
        },
        'noteheadSquareWhiteStemUp': {
          shiftX: -0.75,
        },
        'noteheadSquareBlackStemUp': {
          shiftX: -0.75,
        },
        'noteheadTriangleUpWholeStemUp': {
          shiftX: -0.75,
        }
      },
    },
  }
}