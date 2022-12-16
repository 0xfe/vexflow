import { Element } from './element';
import { Factory } from './factory';
import { FormatParams, Formatter, FormatterOptions } from './formatter';
import { RenderContext } from './rendercontext';
import { Stave, StaveOptions } from './stave';
import { StaveConnector, StaveConnectorType } from './staveconnector';
import { Voice } from './voice';
export interface SystemFormatterOptions extends FormatterOptions {
    alpha?: number;
}
export interface SystemStave {
    voices: Voice[];
    stave?: Stave;
    noJustification?: boolean;
    options?: StaveOptions;
    spaceAbove?: number;
    spaceBelow?: number;
    debugNoteMetrics?: boolean;
}
interface StaveInfo {
    noJustification: boolean;
    options: StaveOptions;
    spaceAbove: number;
    spaceBelow: number;
    debugNoteMetrics: boolean;
}
/**
 * Formatting for systems created/drawn from factory:
 *
 * If width is provided, the system will use the specified width.
 *
 * If noJustification flag is 'true', there is no justification between voices
 * Otherwise, autoWidth defaults to true.
 *
 * If autowidth is true, the system uses format.preCalculateMinWidth
 * for the width of all voices, and default stave padding
 */
export interface SystemOptions {
    factory?: Factory;
    noPadding?: boolean;
    debugFormatter?: boolean;
    spaceBetweenStaves?: number;
    formatIterations?: number;
    autoWidth?: boolean;
    x?: number;
    width?: number;
    y?: number;
    details?: SystemFormatterOptions;
    formatOptions?: FormatParams;
    noJustification?: boolean;
}
/**
 * System implements a musical system, which is a collection of staves,
 * each which can have one or more voices. All voices across all staves in
 * the system are formatted together.
 */
export declare class System extends Element {
    static get CATEGORY(): string;
    protected options: Required<SystemOptions>;
    protected factory: Factory;
    protected formatter?: Formatter;
    protected startX?: number;
    protected lastY?: number;
    protected partStaves: Stave[];
    protected partStaveInfos: StaveInfo[];
    protected partVoices: Voice[];
    protected connector?: StaveConnector;
    protected debugNoteMetricsYs?: {
        y: number;
        stave: Stave;
    }[];
    constructor(params?: SystemOptions);
    /** Set formatting options. */
    setOptions(options?: SystemOptions): void;
    /** Get origin X. */
    getX(): number;
    /** Set origin X. */
    setX(x: number): void;
    /** Get origin y. */
    getY(): number;
    /** Set origin y. */
    setY(y: number): void;
    /** Get associated staves. */
    getStaves(): Stave[];
    /** Get associated voices. */
    getVoices(): Voice[];
    /** Set associated context. */
    setContext(context: RenderContext): this;
    /**
     * Add connector between staves.
     * @param type see {@link StaveConnector.typeString}
     */
    addConnector(type?: StaveConnectorType): StaveConnector;
    /**
     * Add a stave to the system.
     *
     * Example (one voice):
     *
     * `system.addStave({voices: [score.voice(score.notes('C#5/q, B4, A4, G#4'))]});`
     *
     * Example (two voices):
     *
     * `system.addStave({voices: [`
     *   `score.voice(score.notes('C#5/q, B4, A4, G#4', {stem: 'up'})),`
     *   `score.voice(score.notes('C#4/h, C#4', {stem: 'down'}))`
     * `]});`
     */
    addStave(params: SystemStave): Stave;
    /**
     * Add voices to the system with stave already assigned.
     */
    addVoices(voices: Voice[]): void;
    /** Format the system. */
    format(): void;
    /** Render the system. */
    draw(): void;
}
export {};
