import { Glyph } from './glyph';
import { StaveModifier } from './stavemodifier';
import { TimeSignatureGlyph } from './timesigglyph';
export interface TimeSignatureInfo {
    glyph: Glyph;
    line: number;
    num: boolean;
}
/**
 * A TimeSignature is a StaveModifier that can make its appropriate Glyphs directly from
 * a provided "timeSpec" such as "4/4", "C|" (cut time), or even something more advanced
 * such as "3/4(6/8)" or "2/4+5/8".
 */
export declare class TimeSignature extends StaveModifier {
    static get CATEGORY(): string;
    static get glyphs(): Record<string, {
        code: string;
        line: number;
    }>;
    point: number;
    bottomLine: number;
    topLine: number;
    protected timeSpec: string;
    protected line: number;
    protected glyph: Glyph;
    protected is_numeric: boolean;
    protected validate_args: boolean;
    constructor(timeSpec?: string, customPadding?: number, validate_args?: boolean);
    /**
     * Return TimeSignatureInfo given a string, consisting of line (number),
     * num (boolean: same as TimeSignature.getIsNumeric()), and glyph (a Glyph or
     * TimeSignatureGlyph object).
     */
    parseTimeSpec(timeSpec: string): TimeSignatureInfo;
    /**
     * Returns a new TimeSignatureGlyph (a Glyph subclass that knows how to draw both
     * top and bottom digits along with plus signs etc.)
     */
    makeTimeSignatureGlyph(topDigits: string, botDigits: string): TimeSignatureGlyph;
    /**
     * Returns {line, num (=getIsNumeric), glyph} --
     * but these can also be accessed directly w/ getters and setters.
     */
    getInfo(): TimeSignatureInfo;
    /**
     * Set a new time signature specification without changing customPadding, etc.
     *
     * The getter for this is `getTimeSpec` not `getTimeSig`.
     */
    setTimeSig(timeSpec: string): this;
    /**
     * Return the timeSpec (such as '4/4' or 'C|' or even '2/4+3/8') of the TimeSignature
     */
    getTimeSpec(): string;
    /**
     * Return the staff line that the TimeSignature sits on.  Generally 0 for numerator/
     * denominator time signatures such as 3/4 and 2 for cut/common.
     */
    getLine(): number;
    /**
     * Set the line number that the TimeSignature sits on.  Half-values are acceptable
     * for spaces, etc. Can be altered, for instance, for signatures that sit above the
     * staff in large orchestral scores.
     */
    setLine(line: number): void;
    /**
     * Get the Glyph object used to create the time signature.  Numeric time signatures
     * such as 3/8 have a composite Glyph stored as a single Glyph object.
     */
    getGlyph(): Glyph;
    /**
     * Set the Glyph object used to draw the time signature, and update the width of the
     * TimeSignature to match.  The Glyph must define width in its metrics.
     */
    setGlyph(glyph: Glyph): void;
    /**
     * Return a boolean on whether this TimeSignature is drawn with one or more numbers
     * (such as 4/4) or not (as in cut time).
     */
    getIsNumeric(): boolean;
    /**
     * Set whether this TimeSignature is drawn with one or more numbers.
     */
    setIsNumeric(isNumeric: boolean): void;
    /**
     * Draw the time signature on a Stave using its RenderContext.  Both setStave
     * and setContext must already be run.
     */
    draw(): void;
}
