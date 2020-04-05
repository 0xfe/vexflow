export const BravuraMetrics = {
  name: 'Bravura',
  smufl: true,
  clef: {
    'default': {
      point: 32,
      width: 26,
      treble: {
        shiftY: 1,
      },
      bass: {
        shiftY: -1,
      }
    },
    'small': {
      point: 26,
      width: 20,
      treble: {
        shiftY: 1.5,
      },
    },
  },

  // Values under here are used by the Glyph class to reposition and rescale
  // glyphs based on their category. This should be the first stop for
  // custom font glyph repositioning.
  glyphs: {
    flag: {
      shiftX: -0.75,
    }
  }
}