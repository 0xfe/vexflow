export const CommonMetrics = {
  smufl: true,

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
    glyphs: {
      csymDiminished: {
        leftSideBearing: -32,
        advanceWidth: 506,
        yOffset: 0,
      },
      csymHalfDiminished: {
        leftSideBearing: -32,
        advanceWidth: 506,
        yOffset: 0,
      },
      csymAugmented: {
        leftSideBearing: 0,
        advanceWidth: 530,
        yOffset: 0,
      },
      csymParensLeftTall: {
        leftSideBearing: -20,
        advanceWidth: 184,
        yOffset: 250,
      },
      csymParensRightTall: {
        leftSideBearing: 0,
        advanceWidth: 189,
        yOffset: 250,
      },
      csymBracketLeftTall: {
        leftSideBearing: 0,
        advanceWidth: 328,
        yOffset: 0,
      },
      csymBracketRightTall: {
        leftSideBearing: 1,
        advanceWidth: 600,
        yOffset: 0,
      },
      csymParensLeftVeryTall: {
        leftSideBearing: 50,
        advanceWidth: 121,
        yOffset: 350,
      },
      csymParensRightVeryTall: {
        leftSideBearing: 0,
        advanceWidth: 111,
        yOffset: 350,
      },
      csymDiagonalArrangementSlash: {
        leftSideBearing: -1,
        advanceWidth: 990,
        yOffset: 0,
      },
      csymMinor: {
        leftSideBearing: 0,
        advanceWidth: 482,
        yOffset: 0,
      },
      csymMajorSeventh: {
        leftSideBearing: 200,
        yOffset: 0,
        advanceWidth: 600,
      },
      accidentalSharp: {
        leftSideBearing: 20,
        advanceWidth: 250,
        yOffset: -302,
      },
      accidentalFlat: {
        leftSideBearing: -20,
        advanceWidth: 226,
        yOffset: -184,
      },
    },
  },

  clef_default: {
    width: 26,
    annotations: {
      '8va': {
        point: 18,
        treble: {
          line: -1.4,
          shiftX: 12,
        },
      },
      '8vb': {
        point: 18,
        treble: {
          line: 6,
          shiftX: 10,
        },
        bass: {
          line: 3.5,
          shiftX: 1,
        },
      },
    },
  },

  clef_small: {
    width: 20,
    annotations: {
      '8va': {
        point: 16,
        treble: {
          line: -0.2,
          shiftX: 8,
        },
      },
      '8vb': {
        point: 16,
        treble: {
          line: 5.3,
          shiftX: 6,
        },
        bass: {
          line: 3.1,
          shiftX: 0.5,
        },
      },
    },
  },

  ornament: {
    brassScoop: {
      xOffset: -12,
      yOffset: 0,
      stemUpYOffset: 0,
      reportedWidth: 20,
    },
    brassDoitMedium: {
      xOffset: 16,
      yOffset: 0,
      stemUpYOffset: 0,
      reportedWidth: 22,
    },
    brassFallLipShort: {
      xOffset: 16,
      yOffset: 0,
      stemUpYOffset: 0,
      reportedWidth: 15,
    },
    brassLiftMedium: {
      xOffset: 16,
      yOffset: 5,
      stemUpYOffset: 0,
      reportedWidth: 5,
    },
    brassFallRoughMedium: {
      xOffset: 16,
      yOffset: 28,
      stemUpYOffset: 0,
      reportedWidth: 5,
    },
    brassBend: {
      xOffset: 2,
      yOffset: -8,
      stemUpYOffset: 25,
      reportedWidth: 5,
    },
    brassMuteClosed: {
      xOffset: 3,
      yOffset: -8,
      stemUpYOffset: 25,
      reportedWidth: 5,
    },
    brassMuteOpen: {
      xOffset: 3,
      yOffset: -7,
      stemUpYOffset: 25,
      reportedWidth: 5,
    },
    brassFlip: {
      xOffset: 10,
      yOffset: 0,
      stemUpYOffset: 7,
      reportedWidth: 10,
    },
    brassJazzTurn: {
      xOffset: 0,
      yOffset: 0,
      stemUpYOffset: 8,
      reportedWidth: 31,
    },
    brassSmear: {
      xOffset: 10,
      yOffset: 0,
      stemUpYOffset: 8,
      reportedWidth: 5,
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
      point: 34,
    },
  },

  // These are for numeric digits, such as in time signatures
  digits: {
    // used by TimeSignature objects
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
    },
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
      offsetY: 10,
    },
  },

  noteHead: {
    minPadding: 2,
  },

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
        offsetYBaseStemUp: -2.55,
        offsetYBaseStemDown: 2.65,
      },
      noteheadBlack: {
        offsetYBaseStemUp: -2,
        offsetYBaseStemDown: 2,
      },
      noteheadSquareWhite: {
        offsetYBaseStemDown: -5,
        offsetYBaseStemUp: 5,
      },
    },
  },

  stringNumber: {
    verticalPadding: 8,
    stemPadding: 2,
    leftPadding: 5,
    rightPadding: 6,
  },

  tuplet: {
    noteHeadOffset: 20,
    stemOffset: 10,
    bottomLine: 4,
    topModifierOffset: 15,
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
      staveTempo: {
        shiftX: -1,
      },
    },
    clef_default: {
      point: 32,
      gClef: {
        scale: 1.1,
        shiftY: 1,
      },
      fClef: {
        shiftY: -0.5,
      },
      '6stringTabClef': {
        point: 32,
        shiftY: -5.5,
      },
    },
    clef_small: {
      point: 26,
      gClef: {
        shiftY: 1.5,
      },
    },
    clefNote_default: {
      point: 32,
    },
    clefNote_small: {
      point: 26,
    },
    ornament: {
      ornamentTurn: {
        scale: 1.2,
      },
      ornamentTurnSlash: {
        scale: 1.2,
      },
      brassScoop: {
        scale: 1.0,
      },
      brassDoitMedium: {
        scale: 1.0,
      },
      brassFallLipShort: {
        scale: 1.0,
      },
      brassLiftMedium: {
        scale: 1.0,
      },
      brassFallRoughMedium: {
        scale: 1.0,
      },
      brassBend: {
        scale: 1.0,
      },
      brassMuteClosed: {
        scale: 1.0,
      },
      brassMuteOpen: {
        scale: 1.0,
      },
      brassFlip: {
        scale: 1.0,
      },
      brassJazzTurn: {
        scale: 1.0,
      },
      brassSmear: {
        scale: 1.0,
      },
    },
    stroke_straight: {
      arrowheadBlackDown: {
        shiftX: -4.5,
      },
      arrowheadBlackUp: {
        shiftX: -0.85,
      },
    },
    stroke_wiggly: {
      arrowheadBlackDown: {
        shiftX: -1,
        shiftY: 1,
      },
      arrowheadBlackUp: {
        shiftX: -1,
        shiftY: 1,
      },
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
      },
    },
    noteHead: {
      restQuarterStemUp: {
        point: 35,
      },
      restQuarterStemDown: {
        point: 35,
      },
    },
    chordSymbol: {
      csymDiminished: {
        scale: 0.8,
      },
      csymHalfDiminished: {
        scale: 0.8,
      },
      csymAugmented: {
        scale: 1,
      },
      csymParensLeftTall: {
        scale: 0.8,
      },
      csymParensRightTall: {
        scale: 0.8,
      },
      csymBracketLeftTall: {
        scale: 0.8,
      },
      csymBracketRightTall: {
        scale: 0.8,
      },
      csymParensLeftVeryTall: {
        scale: 0.9,
      },
      csymParensRightVeryTall: {
        scale: 0.9,
      },
      csymDiagonalArrangementSlash: {
        scale: 0.6,
      },
      csymMinor: {
        scale: 0.8,
      },
      csymMajorSeventh: {
        scale: 0.9,
      },
      accidentalSharp: {
        scale: 0.75,
      },
      accidentalFlat: {
        scale: 0.9,
      },
    },
  },
};
