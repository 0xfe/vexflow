import { Element } from './element';
import { Note } from './note';
/** `VibratoBracket` renders vibrato effect between two notes. */
export declare class VibratoBracket extends Element {
    /** To enable logging for this class. Set `Vex.Flow.VibratoBracket.DEBUG` to `true`. */
    static DEBUG: boolean;
    static get CATEGORY(): string;
    protected line: number;
    protected start?: Note;
    protected stop?: Note;
    render_options: {
        vibrato_width: number;
        wave_height: number;
        wave_girth: number;
        harsh: boolean;
        wave_width: number;
    };
    /**
     * Either the stop or start note must be set, or both of them.
     * An undefined value for the start or stop note indicates that the vibrato
     * is drawn from the beginning or until the end of the stave accordingly.
     */
    constructor(bracket_data: {
        stop?: Note | null;
        start?: Note | null;
    });
    /** Set line position of the vibrato bracket. */
    setLine(line: number): this;
    /** Set harsh vibrato bracket. */
    setHarsh(harsh: boolean): this;
    /** Draw the vibrato bracket on the rendering context. */
    draw(): void;
}
