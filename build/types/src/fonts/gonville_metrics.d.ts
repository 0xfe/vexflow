/**
 * The Gonville font was created by Simon Tatham.
 * https://www.chiark.greenend.org.uk/~sgtatham/gonville/
 */
export declare const GonvilleMetrics: {
    name: string;
    smufl: boolean;
    stave: {
        padding: number;
        endPaddingMax: number;
        endPaddingMin: number;
        unalignedNotePadding: number;
    };
    accidental: {
        noteheadAccidentalPadding: number;
        leftPadding: number;
        accidentalSpacing: number;
    };
    clef: {
        default: {
            point: number;
            width: number;
        };
        small: {
            point: number;
            width: number;
        };
        annotations: {
            '8va': {
                smuflCode: string;
                default: {
                    point: number;
                    treble: {
                        line: number;
                        shiftX: number;
                    };
                };
                small: {
                    point: number;
                    treble: {
                        line: number;
                        shiftX: number;
                    };
                };
            };
            '8vb': {
                smuflCode: string;
                default: {
                    point: number;
                    treble: {
                        line: number;
                        shiftX: number;
                    };
                    bass: {
                        line: number;
                        shiftX: number;
                    };
                };
                small: {
                    point: number;
                    treble: {
                        line: number;
                        shiftX: number;
                    };
                    bass: {
                        line: number;
                        shiftX: number;
                    };
                };
            };
        };
        lineCount: {
            '8': {
                point: number;
                shiftY: number;
            };
            '7': {
                point: number;
                shiftY: number;
            };
            '6': {
                point: number;
                shiftY: number;
            };
            '5': {
                point: number;
                shiftY: number;
            };
            '4': {
                point: number;
                shiftY: number;
            };
        };
    };
    parenthesis: {
        default: {
            point: number;
            width: number;
        };
        gracenote: {
            point: number;
            width: number;
        };
    };
    pedalMarking: {
        up: {
            point: number;
        };
        down: {
            point: number;
        };
    };
    digits: {
        point: number;
        tupletPoint: number;
    };
    tremolo: {
        default: {
            point: number;
            spacing: number;
            offsetYStemUp: number;
            offsetYStemDown: number;
            offsetXStemUp: number;
            offsetXStemDown: number;
        };
        grace: {
            point: number;
            spacing: number;
            offsetYStemUp: number;
            offsetYStemDown: number;
            offsetXStemUp: number;
            offsetXStemDown: number;
        };
    };
    staveRepetition: {
        symbolText: {
            offsetX: number;
            offsetY: number;
            spacing: number;
        };
        coda: {
            offsetY: number;
        };
        segno: {
            offsetY: number;
        };
    };
    stem: {
        heightAdjustmentForFlag: number;
        noteHead: {
            noteheadTriangleUpHalf: {
                offsetYBaseStemUp: number;
                offsetYBaseStemDown: number;
            };
            noteheadTriangleUpBlack: {
                offsetYBaseStemUp: number;
                offsetYBaseStemDown: number;
            };
            noteheadTriangleUpWhole: {
                offsetYBaseStemUp: number;
                offsetYBaseStemDown: number;
            };
            noteheadXHalf: {
                offsetYBaseStemUp: number;
                offsetYBaseStemDown: number;
            };
            noteheadXBlack: {
                offsetYBaseStemUp: number;
                offsetYBaseStemDown: number;
            };
            noteheadXWhole: {
                offsetYBaseStemUp: number;
                offsetYBaseStemDown: number;
            };
            noteheadHalf: {
                offsetYBaseStemUp: number;
                offsetYBaseStemDown: number;
            };
            noteheadBlack: {
                offsetYBaseStemUp: number;
                offsetYBaseStemDown: number;
            };
            noteheadSquareWhite: {
                offsetYBaseStemDown: number;
                offsetYBaseStemUp: number;
            };
        };
    };
    glyphs: {
        flag: {
            shiftX: number;
            flag8thDown: {
                shiftX: number;
            };
            flag16thDown: {
                shiftX: number;
            };
            flag32ndDown: {
                shiftX: number;
                shiftY: number;
            };
            flag64thDown: {
                shiftX: number;
                shiftY: number;
            };
            flag128thDown: {
                shiftX: number;
                shiftY: number;
            };
            flag32ndUp: {
                shiftY: number;
            };
            flag64thUp: {
                shiftY: number;
            };
            flag128thUp: {
                shiftY: number;
            };
        };
        stringNumber: {
            verticalPadding: number;
            stemPadding: number;
            leftPadding: number;
            rightPadding: number;
        };
        textNote: {
            point: number;
            default: {};
            ornamentTrill: {
                shiftX: number;
                shiftY: number;
            };
        };
        noteHead: {
            minPadding: number;
        };
        chordSymbol: {
            global: {
                superscriptOffset: number;
                subscriptOffset: number;
                kerningOffset: number;
                lowerKerningText: string[];
                upperKerningText: string[];
                spacing: number;
                superSubRatio: number;
            };
            csymDiminished: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            csymHalfDiminished: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            csymAugmented: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            csymParensLeftTall: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            csymParensRightTall: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            csymBracketLeftTall: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            csymBracketRightTall: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            csymParensLeftVeryTall: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            csymParensRightVeryTall: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            csymDiagonalArrangementSlash: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            csymMinor: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            csymMajorSeventh: {
                scale: number;
                leftSideBearing: number;
                yOffset: number;
                advanceWidth: number;
            };
            accidentalSharp: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
            accidentalFlat: {
                scale: number;
                leftSideBearing: number;
                advanceWidth: number;
                yOffset: number;
            };
        };
        jazzOrnaments: {
            brassScoop: {
                scale: number;
                xOffset: number;
                yOffset: number;
                stemUpYOffset: number;
                reportedWidth: number;
            };
            brassDoitMedium: {
                scale: number;
                xOffset: number;
                yOffset: number;
                stemUpYOffset: number;
                reportedWidth: number;
            };
            brassFallLipShort: {
                scale: number;
                xOffset: number;
                yOffset: number;
                stemUpYOffset: number;
                reportedWidth: number;
            };
            brassLiftMedium: {
                scale: number;
                xOffset: number;
                yOffset: number;
                stemUpYOffset: number;
                reportedWidth: number;
            };
            brassFallRoughMedium: {
                scale: number;
                xOffset: number;
                yOffset: number;
                stemUpYOffset: number;
                reportedWidth: number;
            };
            brassBend: {
                scale: number;
                xOffset: number;
                yOffset: number;
                stemUpYOffset: number;
                reportedWidth: number;
            };
            brassMuteClosed: {
                scale: number;
                xOffset: number;
                yOffset: number;
                stemUpYOffset: number;
                reportedWidth: number;
            };
            brassMuteOpen: {
                scale: number;
                xOffset: number;
                yOffset: number;
                stemUpYOffset: number;
                reportedWidth: number;
            };
            brassFlip: {
                scale: number;
                xOffset: number;
                yOffset: number;
                stemUpYOffset: number;
                reportedWidth: number;
            };
            brassJazzTurn: {
                scale: number;
                xOffset: number;
                yOffset: number;
                stemUpYOffset: number;
                reportedWidth: number;
            };
            brassSmear: {
                scale: number;
                xOffset: number;
                yOffset: number;
                stemUpYOffset: number;
                reportedWidth: number;
            };
        };
        tremolo: {
            default: {
                shiftY: number;
            };
            grace: {
                shiftY: number;
            };
        };
        tuplet: {
            noteHeadOffset: number;
            stemOffset: number;
            bottomLine: number;
            topModifierOffset: number;
        };
    };
};
