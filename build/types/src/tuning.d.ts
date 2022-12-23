/** `Tuning` implements varies types of tunings for tablature. */
export declare class Tuning {
    protected tuningValues: number[];
    static get names(): Record<string, string>;
    /**
     * Constructor.
     * @param tuningString tuning name (eg. 'dagdad') or comma separated note strings
     */
    constructor(tuningString?: string);
    /** Return the note number associated to the note string. */
    noteToInteger(noteString: string): number;
    /**
     * Set tuning identified by tuning name (eg. 'dagdad')
     * @param tuningString tuning name (eg. 'dagdad') or comma separated note strings
     */
    setTuning(tuningString: string): void;
    /** Return the note number associated with a tablature string. */
    getValueForString(stringNum: string | number): number;
    /** Return the note number associated with a tablature string and fret. */
    getValueForFret(fretNum: string | number, stringNum: string | number): number;
    /** Return the note string associated with tablature string and fret. */
    getNoteForFret(fretNum: string | number, stringNum: string | number): string;
}
