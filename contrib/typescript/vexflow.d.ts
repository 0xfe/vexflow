
declare module Vex {
    export module Flow {
        class BoundingBox {
            x: number;
            y: number;
            w: number;
            h: number;
        }
        export interface Note {
            clef: string;
            getBoundingBox(): BoundingBox;
            setStave(stave: Stave): Note;
            getAbsoluteX(): number;
            getCategory(): string;
            intrinsicTicks: number;
            addAccidental(index: number, acci: Vex.Flow.Accidental): void;
            addDotToAll(): void;
            ticks: number;
        }
        class StaveNote implements Note {
            clef: string;
            constructor(options: {
                keys?: string[], duration?: string,
                clef?: string, auto_stem?: boolean
            });
            getBoundingBox(): BoundingBox;
            setStave(stave: Stave): StaveNote;
            getAbsoluteX(): number;
            getCategory(): string;
            intrinsicTicks: number;
            addAccidental(index: number, acci: Vex.Flow.Accidental): void;
            addDotToAll(): void;
            ys: number[];
            stem_direction: number;
            getKeyProps(): { line: number }[];
            ticks: number;
            glyph: Glyph;
            glyph_font_scale: number;
            getYs(): number[];
            render_options: {glyph_font_scale: number}
        }
        class ClefNote implements Note {
            clef: string;
            constructor(clef: string, size: string);
            getBoundingBox(): BoundingBox;
            setStave(stave: Stave): ClefNote;
            getAbsoluteX(): number;
            getCategory(): string;
            intrinsicTicks: number;
            addAccidental(index: number, acci: Vex.Flow.Accidental): void;
            addDotToAll(): void;
            ticks: number;
        }
        function renderGlyph(ctx: CanvasRenderingContext2D,
            x: number, y: number, scale: number, code: string): void;
        class Glyph {
            head_width: number;
            code_head: string;
        }
        class Modifier {
            x: number;
        }
        class Barline {
            static type: {
                END: number;
                NONE: number;
            };
        }
        class Stave {
            constructor(a: number, b: number, c: number);
            addClef(clef: string): void;
            addTimeSignature(ts: string): void;
            setWidth(width: number): Stave;
            getModifierXShift(): number;
            getNoteStartX(): number;
            setEndBarLine();
            setEndBarType(bar_type: number);
            getWidth(): number;
            setX(x: number): Stave;
            setContext(ctx: CanvasRenderingContext2D);
            draw();
        }
        class StaveTie {
            constructor(options: {
                first_note: Note, last_note: Note,
                first_indices: number[], last_indices: number[]
            });
            setContext(ctx: CanvasRenderingContext2D): StaveTie;
            draw();
        }
        class Tuplet {
            constructor(notes: Vex.Flow.StaveNote[], frac: any);
            setBracketed(bracket: boolean): Tuplet;
            setContext(ctx: CanvasRenderingContext2D): Tuplet;
            draw();
        }
        class Beam {
            static generateBeams(notes: Note[], options: any);
            static getDefaultBeamGroups(frac: string);
            setContext(ctx: CanvasRenderingContext2D): Beam;
            draw();
        }
        class Accidental {
            constructor(acc: string);
        }
        class Voice {
            constructor(options: {
                num_beats: number, beat_value: number,resolution: any
            });
            time: { num_beats: number, beat_value: number };
            static Mode: {
                STRICT: number;
                SOFT: number;
                FULL: number;
            }
            setMode(mode: number);
            addTickables(notes: Note[]);
            draw(ctx: CanvasRenderingContext2D, stave: Stave);
        }
        var RESOLUTION;
        class Formatter {
            constructor();
            joinVoices(voices: Voice[]);
            preCalculateMinTotalWidth(voices: Voice[]);
            getMinTotalWidth(): number;
            format(voices: Voice[], min_width: number);
        }
        class Renderer {
            static Backends: {
                CANVAS: number;
            }
            constructor(cnv: HTMLCanvasElement, render_type: number);
            getContext(): CanvasRenderingContext2D;
        }
        var TIME4_4: {
            resolution: number;
        }
    }
}