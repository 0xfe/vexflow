export const BravuraMetrics = {
  name: 'Bravura',
  smufl: true,

  stave: {
    padding: 12,
  },

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
    // used by timesig
    shiftLine: -1,
    point: 34,

    // used by tuplets
    tupletPoint: 22,
    shiftY: -6,
  },

  articulation: {
    articStaccatissimoAbove: {
      padding: 2,
    },
    articStaccatissimoBelow: {
      padding: 2,
    }
  },

  tremolo: {
    default: {
      point: 25,
      spacing: 5,
      offsetYStemUp: -5,
      offsetYStemDown: 5,
      offsetXStemUp: 11,
      offsetXStemDown: 1,
    },
    grace: {
      point: 18,
      spacing: 4,
      offsetYStemUp: -5,
      offsetYStemDown: 5,
      offsetXStemUp: 7,
      offsetXStemDown: 1,
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
  //
  // The glyph loader first looks up a specific set of settings based on the
  // glyph code, and if not found, uses the defaults from the category. See
  // glyphs.textNote for an example of this.
  //
  // Details in Glyph.lookupFontMetrics.
  glyphs: {
    coda: {
      point: 20,
      shiftX: -7,
      shiftY: 8,
    },
    segno: {
      shiftX: -7,
    },
    flag: {
      shiftX: -0.75,
      tabStem: {
        shiftX: -1.75,
      },
      staveTempo: {
        shiftX: -1,
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
    ornament: {
      ornamentTurn: {
        scale: 1.2,
      },
      ornamentTurnSlash: {
        scale: 1.2,
      },
    },
    stroke: {
      arrowheadBlackDown: {
        straight: {
          shiftX: -4.5,
        },
        wiggly: {
          shiftX: -1,
          shiftY: 1,
        }
      },
      arrowheadBlackUp: {
        straight: {
          shiftX: -0.85,
        },
        wiggly: {
          shiftX: -1,
          shiftY: 1,
        }
      }
    },
    textNote: {
      point: 34,
      breathMarkTick: {
        point: 36,
        shiftY: 9,
      },
      breathMarkComma: {
        point: 36,
      },
      segno: {
        point: 30,
        shiftX: -7,
        shiftY: 8,
      },
      coda: {
        point: 20,
        shiftX: -7,
        shiftY: 8,
      },
      ornamentTrill: {
        shiftX: -8,
        shiftY: 8,
      },
      ornamentTurn: {
        point: 42,
      },
      ornamentTurnSlash: {
        point: 42,
      },
      ornamentMordent: {
        shiftX: -8,
      },
      ornamentShortTrill: {
        shiftX: -8,
      }
    },
    noteHead: {
      standard: {
        restQuarterStemUp: {
          point: 35,
        },
        restQuarterStemDown: {
          point: 35,
        },
      },
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
