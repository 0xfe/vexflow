export interface NoteAccidental {
    note: number;
    accidental: AccidentalValue;
}
export interface NoteParts {
    root: string;
    accidental: string;
}
export interface KeyParts {
    root: string;
    accidental: string;
    type: string;
}
export type KeyValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type RootValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type AccidentalValue = -2 | -1 | 0 | 1 | 2;
export interface Key {
    root_index: RootValue;
    int_val: KeyValue;
}
/** Music implements some standard music theory routines. */
export declare class Music {
    /** Number of an canonical notes (12). */
    static get NUM_TONES(): number;
    /** Names of root notes ('c', 'd',...) */
    static get roots(): string[];
    /** Values of the root notes.*/
    static get root_values(): KeyValue[];
    /** Indices of the root notes.*/
    static get root_indices(): Record<string, RootValue>;
    /** Names of canonical notes ('c', 'c#', 'd',...). */
    static get canonical_notes(): string[];
    /** Names of diatonic intervals ('unison', 'm2', 'M2',...). */
    static get diatonic_intervals(): string[];
    /** NoteAccidental associated to diatonic intervals. */
    static get diatonic_accidentals(): Record<string, NoteAccidental>;
    /** Semitones shift associated to intervals .*/
    static get intervals(): Record<string, number>;
    /** Semitones shifts associated with scales. */
    static get scales(): Record<string, number[]>;
    /** Scales associated with m (minor) and M (major). */
    static get scaleTypes(): Record<string, number[]>;
    /** Accidentals abbreviations. */
    static get accidentals(): string[];
    /** Note values. */
    static get noteValues(): Record<string, Key>;
    protected isValidNoteValue(note: number): boolean;
    protected isValidIntervalValue(interval: number): boolean;
    /** Return root and accidental associated to a note. */
    getNoteParts(noteString: string): NoteParts;
    /** Return root, accidental and type associated to a key. */
    getKeyParts(keyString: string): KeyParts;
    /** Note value associated to a note name. */
    getNoteValue(noteString: string): number;
    /** Interval value associated to an interval name. */
    getIntervalValue(intervalString: string): number;
    /** Canonical note name associated to a value. */
    getCanonicalNoteName(noteValue: number): string;
    /** Interval name associated to a value. */
    getCanonicalIntervalName(intervalValue: number): string;
    /**
     * Given a note, interval, and interval direction, produce the relative note.
     */
    getRelativeNoteValue(noteValue: number, intervalValue: number, direction?: number): number;
    /**
     * Given a root and note value, produce the relative note name.
     */
    getRelativeNoteName(root: string, noteValue: number): string;
    /**
     * Return scale tones, given intervals. Each successive interval is
     * relative to the previous one, e.g., Major Scale:
     *
     *   TTSTTTS = [2,2,1,2,2,2,1]
     *
     * When used with key = 0, returns C scale (which is isomorphic to
     * interval list).
     */
    getScaleTones(key: number, intervals: number[]): number[];
    /**
     * Return the interval of a note, given a diatonic scale.
     * e.g., given the scale C, and the note E, returns M3.
     */
    getIntervalBetween(note1: number, note2: number, direction?: number): number;
    /**
     * Create a scale map that represents the pitch state for a
     * `keySignature`. For example, passing a `G` to `keySignature` would
     * return a scale map with every note naturalized except for `F` which
     * has an `F#` state.
     */
    createScaleMap(keySignature: string): Record<string, string>;
}
