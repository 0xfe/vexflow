export const GonvilleMetrics = {
  name: 'Gonville',
  smufl: false,
  stave: {
    padding: 12,
  },

  clef: {
    'default': {
      point: 40,
      width: 26
    },
    'small': {
      point: 32,
      width: 20,
    },

    annotations: {
      '8va': {
        smuflCode: 'timeSig8',
        default: {
          point: 20,
          treble: {
            line: -1.2,
            shiftX: 11,
          },
        },
        small: {
          point: 18,
          treble: {
            line: -0.4,
            shiftX: 8,
          },
        }
      },
      '8vb': {
        smuflCode: 'timeSig8',
        default: {
          point: 20,
          treble: {
            line: 6.3,
            shiftX: 10,
          },
          bass: {
            line: 4,
            shiftX: 1,
          }
        },
        small: {
          point: 18,
          treble: {
            line: 5.8,
            shiftX: 6,
          },
          bass: {
            line: 3.5,
            shiftX: 0.5,
          }
        }
      }
    },

    // May not need these anymore
    lineCount: {
      '8': { point: 55, shiftY: 14 },
      '7': { point: 47, shiftY: 8 },
      '6': { point: 40, shiftY: 1 },
      '5': { point: 30, shiftY: -6 },
      '4': { point: 23, shiftY: -12 },
    }
  },

  pedalMarking: {
    up: {
      point: 40
    },
    down: {
      point: 40
    }
  },

  tremolo: {
    default: {
      point: 40,
      spacing: 4,
      offsetYStemUp: -9,
      offsetYStemDown: -21,
      offsetXStemUp: 6,
      offsetXStemDown: -2,
    },
    grace: {
      point: 30,
      spacing: 4,
      offsetYStemUp: -9,
      offsetYStemDown: -21,
      offsetXStemUp: 6,
      offsetXStemDown: -2,
    }
  },

  // These are for numeric digits, such as in time signatures
  digits: {
    point: 40,
    tupletPoint: 28,
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

  glyphs: {
    textNote: {
      point: 40,
      default: {
      },
      ornamentTrill: {
        shiftX: -5,
        shiftY: 4,
      }
    },
    noteHead: {
      custom: {
        'noteheadDiamondWholeStemUp': {
          shiftX: -6,
        },
        'noteheadCircleXStemUp': {
          shiftX: -1.5,
        },
        'noteheadXWholeStemUp': {
          shiftX: -5,
        },
        'noteheadTriangleUpWholeStemUp': {
          shiftX: -6,
        },
      },
    },
    chordSymbol: {
      global: {
        superscriptOffset: -8,
        subscriptOffset: 4,
        kerningOffset: -2
      },
      csymAugmented: {
        scale: 1,
        shiftY: -2,
        shiftX: 0
      },
      csymParensLeftTall: {
        scale: 0.8,
        shiftY: 1,
        shiftX: 0
      },
      csymParensRightTall: {
        scale: 0.8,
        shiftY: 1,
        shiftX: 0
      },
      csymBracketLeftTall: {
        scale: 0.8,
        shiftY: 1,
        shiftX: 0
      },
      csymBracketRightTall: {
        scale: 0.8,
        shiftY: 1,
        shiftX: 0
      },
      csymParensLeftVeryTall: {
        scale: 0.8,
        shiftY: 0,
        shiftX: 0
      },
      csymParensRightVeryTall: {
        scale: 0.8,
        shiftY: 0,
        shiftX: 0
      },
      csymDiagonalArrangementSlash: {
        scale: 0.6,
        shiftY: 0,
        shiftX: -2
      },
      accidentalSharp: {
        scale: 1,
        shiftY: -3,
        shiftX: 0
      },
      accidentalFlat: {
        scale: 1,
        shiftY: -2,
        shiftX: 0
      }
    }
  }
};
