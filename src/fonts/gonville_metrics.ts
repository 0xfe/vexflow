/**
 * The Gonville font was created by Simon Tatham.
 * https://www.chiark.greenend.org.uk/~sgtatham/gonville/
 */
export const GonvilleMetrics = {
  name: 'Gonville',
  smufl: false,

  stave: {
    padding: 12,
    endPaddingMax: 10,
    endPaddingMin: 5,
    unalignedNotePadding: 10,
  },

  accidental: {
    noteheadAccidentalPadding: 1,
    leftPadding: 2,
    accidentalSpacing: 3,
  },

  clef: {
    default: {
      point: 40,
      width: 26,
    },
    small: {
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
        },
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
          },
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
          },
        },
      },
    },

    // May not need these anymore
    lineCount: {
      '8': { point: 55, shiftY: 14 },
      '7': { point: 47, shiftY: 8 },
      '6': { point: 40, shiftY: 1 },
      '5': { point: 30, shiftY: -6 },
      '4': { point: 23, shiftY: -12 },
    },
  },

  parenthesis: {
    default: {
      point: 39,
      width: 7,
    },
    gracenote: {
      point: (39 * 3) / 5,
      width: 3,
    },
  },

  pedalMarking: {
    up: {
      point: 40,
    },
    down: {
      point: 40,
    },
  },

  // These are for numeric digits, such as in time signatures
  digits: {
    point: 40,
    tupletPoint: 28,
  },

  // articulation: {
  // },

  tremolo: {
    default: {
      point: 25,
      spacing: 4,
      offsetYStemUp: -7,
      offsetYStemDown: 7,
      offsetXStemUp: 9,
      offsetXStemDown: -0.5,
    },
    grace: {
      point: 15,
      spacing: 4,
      offsetYStemUp: -7,
      offsetYStemDown: 7,
      offsetXStemUp: 6.5,
      offsetXStemDown: -0.5,
    },
  },

  staveRepetition: {
    symbolText: {
      offsetX: 12,
      offsetY: 25,
      spacing: 5,
    },
    coda: {
      offsetY: 25,
    },
    segno: {
      offsetY: 0,
    },
  },

  // noteHead: {
  // },

  stem: {
    heightAdjustmentForFlag: -3,
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
      noteheadHalf: {
        offsetYBaseStemUp: -1.5,
        offsetYBaseStemDown: 1.5,
      },
      noteheadBlack: {
        offsetYBaseStemUp: -1.5,
        offsetYBaseStemDown: 1.5,
      },
      noteheadSquareWhite: {
        offsetYBaseStemDown: -5,
        offsetYBaseStemUp: 5,
      },
    },
  },

  glyphs: {
    flag: {
      shiftX: -0.08,
      flag8thDown: {
        shiftX: -0.16,
      },
      flag16thDown: {
        shiftX: -0.16,
      },
      flag32ndDown: {
        shiftX: -0.16,
        shiftY: 9,
      },
      flag64thDown: {
        shiftX: -0.16,
        shiftY: 13,
      },
      flag128thDown: {
        shiftX: -0.16,
        shiftY: 22,
      },
      flag32ndUp: {
        shiftY: -9,
      },
      flag64thUp: {
        shiftY: -13,
      },
      flag128thUp: {
        shiftY: -22,
      },
    },
    stringNumber: {
      verticalPadding: 8,
      stemPadding: 2,
      leftPadding: 5,
      rightPadding: 6,
    },
    textNote: {
      point: 40,
      default: {},
      ornamentTrill: {
        shiftX: -5,
        shiftY: 4,
      },
    },
    noteHead: {
      minPadding: 2,
      custom: {
        noteheadCircleXStemUp: {
          shiftX: -1.5,
        },
        noteheadXWholeStemUp: {
          shiftX: -5,
        },
        noteheadTriangleUpWholeStemUp: {
          shiftX: -6,
        },
      },
    },
    chordSymbol: {
      global: {
        superscriptOffset: -400,
        subscriptOffset: 300,
        kerningOffset: -250,
        lowerKerningText: ['D', 'F', 'P', 'T', 'V', 'Y'],
        upperKerningText: ['A', 'L'],
        spacing: 100,
        superSubRatio: 0.66,
      },
      csymDiminished: {
        scale: 0.8,
        leftSideBearing: 0,
        advanceWidth: 506,
        yOffset: 0,
      },
      csymHalfDiminished: {
        scale: 0.8,
        leftSideBearing: -32,
        advanceWidth: 506,
        yOffset: 0,
      },
      csymAugmented: {
        scale: 1,
        leftSideBearing: 0,
        advanceWidth: 530,
        yOffset: 0,
      },
      csymParensLeftTall: {
        scale: 0.8,
        leftSideBearing: 0,
        advanceWidth: 155,
        yOffset: 250,
      },
      csymParensRightTall: {
        scale: 0.8,
        leftSideBearing: -40,
        advanceWidth: 189,
        yOffset: 250,
      },
      csymBracketLeftTall: {
        scale: 0.8,
        leftSideBearing: 0,
        advanceWidth: 328,
        yOffset: 0,
      },
      csymBracketRightTall: {
        scale: 0.8,
        leftSideBearing: 1,
        advanceWidth: 600,
        yOffset: 0,
      },
      csymParensLeftVeryTall: {
        scale: 0.9,
        leftSideBearing: 0,
        advanceWidth: 121,
        yOffset: 350,
      },
      csymParensRightVeryTall: {
        scale: 0.9,
        leftSideBearing: 50,
        advanceWidth: 111,
        yOffset: 350,
      },
      csymDiagonalArrangementSlash: {
        scale: 0.6,
        leftSideBearing: -1,
        advanceWidth: 990,
        yOffset: 0,
      },
      csymMinor: {
        scale: 0.8,
        leftSideBearing: 0,
        advanceWidth: 482,
        yOffset: 0,
      },
      csymMajorSeventh: {
        scale: 0.9,
        leftSideBearing: 200,
        yOffset: 0,
        advanceWidth: 600,
      },
      accidentalSharp: {
        scale: 0.75,
        leftSideBearing: 40,
        advanceWidth: 250,
        yOffset: -402,
      },
      accidentalFlat: {
        scale: 0.95,
        leftSideBearing: -50,
        advanceWidth: 208,
        yOffset: -184,
      },
    },
    jazzOrnaments: {
      brassScoop: {
        scale: 1.0,
        xOffset: -12,
        yOffset: 0,
        stemUpYOffset: 0,
        reportedWidth: 15,
      },
      brassDoitMedium: {
        scale: 1.0,
        xOffset: 16,
        yOffset: 0,
        stemUpYOffset: 0,
        reportedWidth: 22,
      },
      brassFallLipShort: {
        scale: 1.0,
        xOffset: 17,
        yOffset: 0,
        stemUpYOffset: 0,
        reportedWidth: 15,
      },
      brassLiftMedium: {
        scale: 1.0,
        xOffset: 16,
        yOffset: 5,
        stemUpYOffset: 0,
        reportedWidth: 5,
      },
      brassFallRoughMedium: {
        scale: 1.0,
        xOffset: 16,
        yOffset: 28,
        stemUpYOffset: 0,
        reportedWidth: 5,
      },
      brassBend: {
        scale: 1.0,
        xOffset: 2,
        yOffset: -8,
        stemUpYOffset: 24,
        reportedWidth: 5,
      },
      brassMuteClosed: {
        scale: 1.0,
        xOffset: 3,
        yOffset: -9,
        stemUpYOffset: 24,
        reportedWidth: 5,
      },
      brassMuteOpen: {
        scale: 1.0,
        xOffset: 3,
        yOffset: -7,
        stemUpYOffset: 25,
        reportedWidth: 5,
      },
      brassFlip: {
        scale: 1.0,
        xOffset: 10,
        yOffset: -4,
        stemUpYOffset: 7,
        reportedWidth: 5,
      },
      brassJazzTurn: {
        scale: 1.0,
        xOffset: 3,
        yOffset: -4,
        stemUpYOffset: 10,
        reportedWidth: 28,
      },
      brassSmear: {
        scale: 1.0,
        xOffset: 10,
        yOffset: -4,
        stemUpYOffset: 9,
        reportedWidth: 5,
      },
    },
    tremolo: {
      default: {
        shiftY: -10,
      },
      grace: {
        shiftY: -5,
      },
    },
    tuplet: {
      noteHeadOffset: 20,
      stemOffset: 10,
      bottomLine: 4,
      topModifierOffset: 15,
    },
  },
};
