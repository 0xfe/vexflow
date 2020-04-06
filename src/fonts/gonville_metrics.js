export const GonvilleMetrics = {
  name: 'Gonville',
  smufl: false,
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

    // These are for numeric digits, such as in time signatures
    digits: {
      point: 40,
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
}