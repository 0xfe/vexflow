import { Accidental } from './accidental';
import { PartialBeamDirection } from './beam';
import { Factory } from './factory';
import { Note } from './note';
import { Grammar, Match, Parser, Result, Rule, RuleFunction } from './parser';
import { RenderContext } from './rendercontext';
import { StemmableNote } from './stemmablenote';
import { TupletOptions } from './tuplet';
import { Voice } from './voice';
export type CommitHook = (obj: any, note: StemmableNote, builder: Builder) => void;
export declare class EasyScoreGrammar implements Grammar {
    builder: Builder;
    constructor(builder: Builder);
    begin(): RuleFunction;
    LINE(): Rule;
    PIECE(): Rule;
    PIECES(): Rule;
    PARAMS(): Rule;
    CHORDORNOTE(): Rule;
    CHORD(): Rule;
    NOTES(): Rule;
    NOTE(): Rule;
    SINGLENOTE(): Rule;
    ACCIDENTAL(): Rule;
    DOTS(): Rule;
    TYPE(): Rule;
    DURATION(): Rule;
    OPTS(): Rule;
    KEYVALS(): Rule;
    KEYVAL(): Rule;
    VAL(): Rule;
    KEY(): Rule;
    DVAL(): Rule;
    SVAL(): Rule;
    NOTENAME(): Rule;
    OCTAVE(): Rule;
    ACCIDENTALS(): Rule;
    MICROTONES(): Rule;
    DURATIONS(): Rule;
    TYPES(): Rule;
    LPAREN(): Rule;
    RPAREN(): Rule;
    COMMA(): Rule;
    DOT(): Rule;
    SLASH(): Rule;
    MAYBESLASH(): Rule;
    EQUALS(): Rule;
    LBRACKET(): Rule;
    RBRACKET(): Rule;
    EOL(): Rule;
}
export interface NotePiece {
    key: string;
    accid?: string | null;
    octave?: string;
}
export declare class Piece {
    chord: NotePiece[];
    duration: string;
    dots: number;
    type?: string;
    options: {
        [x: string]: string;
    };
    constructor(duration: string);
}
export interface BuilderElements {
    notes: StemmableNote[];
    accidentals: (Accidental | undefined)[][];
}
export interface BuilderOptions extends Record<string, any> {
    stem?: string;
    clef?: string;
}
export declare class Builder {
    factory: Factory;
    elements: BuilderElements;
    options: BuilderOptions;
    piece: Piece;
    commitHooks: CommitHook[];
    rollingDuration: string;
    constructor(factory: Factory);
    reset(options?: BuilderOptions): void;
    getFactory(): Factory;
    getElements(): BuilderElements;
    addCommitHook(commitHook: CommitHook): void;
    resetPiece(): void;
    setNoteDots(dots: Match[]): void;
    setNoteDuration(duration?: string): void;
    setNoteType(type?: string): void;
    addNoteOption(key: string, value: string): void;
    addNote(key?: string, accid?: string | null, octave?: string): void;
    addSingleNote(key: string, accid?: string | null, octave?: string): void;
    addChord(notes: Match[]): void;
    commitPiece(): void;
}
export interface EasyScoreOptions {
    factory?: Factory;
    builder?: Builder;
    commitHooks?: CommitHook[];
    throwOnError?: boolean;
}
export interface EasyScoreDefaults extends Record<string, any> {
    clef?: string;
    time?: string;
    stem?: string;
}
/**
 * EasyScore implements a parser for a simple language to generate VexFlow objects.
 */
export declare class EasyScore {
    static DEBUG: boolean;
    defaults: EasyScoreDefaults;
    options: EasyScoreOptions;
    factory: Factory;
    builder: Builder;
    grammar: EasyScoreGrammar;
    parser: Parser;
    constructor(options?: EasyScoreOptions);
    /**
     * Set the score defaults.
     * clef must be set appropriately to avoid errors when adding Staves.
     * @param defaults.clef default clef ( treble | bass ...) see {@link Clef.types}
     * @param defaults.time default time signature ( 4/4 | 9/8 ...)
     * @param defaults.stem default stem arrangement (auto | up | down)
     * @returns this
     */
    set(defaults: EasyScoreDefaults): this;
    /**
     * @param options.factory is required.
     * @returns this
     */
    setOptions(options: EasyScoreOptions): this;
    setContext(context: RenderContext): this;
    parse(line: string, options?: BuilderOptions): Result;
    beam(notes: StemmableNote[], options?: {
        autoStem?: boolean;
        secondaryBeamBreaks?: number[];
        partialBeamDirections?: {
            [noteIndex: number]: PartialBeamDirection;
        };
    }): StemmableNote[];
    tuplet(notes: StemmableNote[], options?: TupletOptions): StemmableNote[];
    notes(line: string, options?: BuilderOptions): StemmableNote[];
    voice(notes: Note[], options?: {
        time?: string;
        options?: {
            softmaxFactor: number;
        };
    }): Voice;
    addCommitHook(commitHook: CommitHook): void;
}
