export const PetalumaMetrics = {
    name: 'Petaluma',
    smufl: true,
    stave: {
        padding: 15,
        endPaddingMax: 15,
        endPaddingMin: 7,
        unalignedNotePadding: 12,
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
            kerningOffset: -150,
            lowerKerningText: ['D', 'F', 'P', 'T', 'V', 'Y'],
            upperKerningText: ['L'],
            spacing: 20,
            superSubRatio: 0.73,
        },
        glyphs: {
            csymDiminished: {
                leftSideBearing: -95,
                advanceWidth: 506,
                yOffset: 0,
            },
            csymHalfDiminished: {
                leftSideBearing: -32,
                advanceWidth: 506,
                yOffset: 0,
            },
            csymAugmented: {
                leftSideBearing: -25,
                advanceWidth: 530,
                yOffset: 0,
            },
            csymParensLeftTall: {
                leftSideBearing: 0,
                advanceWidth: 155,
                yOffset: 150,
            },
            csymParensRightTall: {
                leftSideBearing: 40,
                advanceWidth: 189,
                yOffset: 150,
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
                advanceWidth: 210,
                yOffset: 250,
            },
            csymParensRightVeryTall: {
                leftSideBearing: -100,
                advanceWidth: 111,
                yOffset: 250,
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
                leftSideBearing: 100,
                yOffset: 0,
                advanceWidth: 600,
            },
            accidentalSharp: {
                leftSideBearing: 0,
                advanceWidth: 425,
                yOffset: -422,
            },
            accidentalFlat: {
                leftSideBearing: -10,
                advanceWidth: 228,
                yOffset: -284,
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
            reportedWidth: 15,
        },
        brassDoitMedium: {
            xOffset: 16,
            yOffset: 0,
            stemUpYOffset: 0,
            reportedWidth: 19,
        },
        brassFallLipShort: {
            xOffset: 16,
            yOffset: 0,
            stemUpYOffset: 0,
            reportedWidth: 19,
        },
        brassLiftMedium: {
            xOffset: 16,
            yOffset: 5,
            stemUpYOffset: 0,
            reportedWidth: 15,
        },
        brassFallRoughMedium: {
            xOffset: 16,
            yOffset: 26,
            stemUpYOffset: 0,
            reportedWidth: 5,
        },
        brassBend: {
            xOffset: 3,
            yOffset: -8,
            stemUpYOffset: 28,
            reportedWidth: 5,
        },
        brassMuteClosed: {
            xOffset: 3,
            yOffset: -8,
            stemUpYOffset: 26,
            reportedWidth: 5,
        },
        brassMuteOpen: {
            xOffset: 4,
            yOffset: -8,
            stemUpYOffset: 27,
            reportedWidth: 5,
        },
        brassFlip: {
            xOffset: 10,
            yOffset: -4,
            stemUpYOffset: 7,
            reportedWidth: 5,
        },
        brassJazzTurn: {
            xOffset: 6,
            yOffset: -4,
            stemUpYOffset: 5,
            reportedWidth: 30,
        },
        brassSmear: {
            xOffset: 10,
            yOffset: -4,
            stemUpYOffset: 5,
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
    digits: {
        shiftLine: -1,
        point: 22,
        tupletPoint: 16,
        shiftY: -2,
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
            offsetXStemUp: 13,
            offsetXStemDown: 1,
        },
        grace: {
            point: 18,
            spacing: 4,
            offsetYStemUp: -5,
            offsetYStemDown: 5,
            offsetXStemUp: 8,
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
        displacedShiftX: -2,
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
                offsetYBaseStemDown: 1.8,
                offsetYBaseStemUp: -1.8,
            },
            noteheadBlack: {
                offsetYBaseStemDown: 2,
                offsetYBaseStemUp: -2,
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
        topModifierOffset: 20,
    },
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
            shiftX: -0.77,
            flag16thUp: {
                shiftX: -0.75,
            },
            flag32ndUp: {
                shiftX: -0.85,
            },
            flag64thUp: {
                shiftX: -1.55,
            },
            flag128thUp: {
                shiftX: -1.3,
            },
            flag16thDown: {
                shiftX: -0.75,
            },
            flag32ndDown: {
                shiftX: -0.76,
            },
            flag64thDown: {
                shiftX: -1.5,
            },
            flag128thDown: {
                shiftX: -1.2,
            },
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
                shiftX: -10,
                shiftY: 8,
            },
            ornamentMordent: {
                shiftX: -8,
            },
            ornamentShortTrill: {
                shiftX: -8,
            },
        },
        noteHead: {
            noteheadBlackStemUp: {
                shiftX: 0.5,
            },
            noteheadHalfStemUp: {
                shiftX: 0.725,
            },
            noteheadWholeStemUp: {
                shiftX: 1,
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
                scale: 0.95,
            },
            csymParensRightVeryTall: {
                scale: 0.9,
            },
            csymDiagonalArrangementSlash: {
                scale: 0.6,
            },
            csymMinor: {
                scale: 0.7,
            },
            csymMajorSeventh: {
                scale: 0.8,
            },
            accidentalSharp: {
                scale: 0.7,
            },
            accidentalFlat: {
                scale: 0.8,
            },
        },
    },
};
