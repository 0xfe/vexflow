export const GonvilleMetrics = {
    name: 'Gonville',
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
                leftSideBearing: 0,
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
                leftSideBearing: 0,
                advanceWidth: 155,
                yOffset: 250,
            },
            csymParensRightTall: {
                leftSideBearing: -40,
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
                leftSideBearing: 0,
                advanceWidth: 121,
                yOffset: 350,
            },
            csymParensRightVeryTall: {
                leftSideBearing: 50,
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
                leftSideBearing: 40,
                advanceWidth: 250,
                yOffset: -402,
            },
            accidentalFlat: {
                leftSideBearing: -50,
                advanceWidth: 208,
                yOffset: -184,
            },
        },
    },
    clef_default: {
        width: 26,
        annotations: {
            '8va': {
                point: 20,
                treble: {
                    line: -1.2,
                    shiftX: 11,
                },
            },
            '8vb': {
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
        },
    },
    clef_small: {
        width: 20,
        annotations: {
            '8va': {
                point: 18,
                treble: {
                    line: -0.4,
                    shiftX: 8,
                },
            },
            '8vb': {
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
    ornament: {
        brassScoop: {
            xOffset: -12,
            yOffset: 0,
            stemUpYOffset: 0,
            reportedWidth: 15,
        },
        brassDoitMedium: {
            xOffset: 16,
            yOffset: 0,
            stemUpYOffset: 0,
            reportedWidth: 22,
        },
        brassFallLipShort: {
            xOffset: 17,
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
            stemUpYOffset: 24,
            reportedWidth: 5,
        },
        brassMuteClosed: {
            xOffset: 3,
            yOffset: -9,
            stemUpYOffset: 24,
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
            yOffset: -4,
            stemUpYOffset: 7,
            reportedWidth: 5,
        },
        brassJazzTurn: {
            xOffset: 3,
            yOffset: -4,
            stemUpYOffset: 10,
            reportedWidth: 28,
        },
        brassSmear: {
            xOffset: 10,
            yOffset: -4,
            stemUpYOffset: 9,
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
            point: 40,
        },
    },
    digits: {
        point: 40,
        tupletPoint: 28,
    },
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
    noteHead: {
        minPadding: 2,
    },
    stem: {
        heightAdjustmentForFlag: -3,
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
        clef_default: {
            point: 40,
            '6stringTabClef': {
                point: 40,
                shiftY: -5.5,
            },
        },
        clef_small: {
            point: 32,
        },
        clefNote_default: {
            point: 40,
        },
        clefNote_small: {
            point: 32,
        },
        textNote: {
            point: 40,
            default: {},
            ornamentTrill: {
                shiftX: -5,
                shiftY: 4,
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
                scale: 0.95,
            },
        },
        ornament: {
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
        tremolo: {
            default: {
                shiftY: -10,
            },
            grace: {
                shiftY: -5,
            },
        },
    },
};
