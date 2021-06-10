// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements the formatting and layout algorithms that are used
// to position notes in a voice. The algorithm can align multiple voices both
// within a stave, and across multiple staves.
//
// To do this, the formatter breaks up voices into a grid of rational-valued
// `ticks`, to which each note is assigned. Then, minimum widths are assigned
// to each tick based on the widths of the notes and modifiers in that tick. This
// establishes the smallest amount of space required for each tick.
//
// Finally, the formatter distributes the left over space proportionally to
// all the ticks, setting the `x` values of the notes in each tick.
//
// See `tests/formatter_tests.js` for usage examples. The helper functions included
// here (`FormatAndDraw`, `FormatAndDrawTab`) also serve as useful usage examples.

import { Vex } from './vex';
import { RuntimeError, log } from './util';
import { Beam } from './beam';
import { Flow } from './tables';
import { Fraction } from './fraction';
import { Voice } from './voice';
import { StaveConnector } from './staveconnector';
import { Note } from './note';
import { ModifierContext } from './modifiercontext';
import { TickContext } from './tickcontext';
import { RenderContext } from './types/common';
import { Stave } from './stave';
import { StemmableNote } from './stemmablenote';
import { Tickable } from './tickable';
import { TabStave } from './tabstave';
import { TabNote } from './tabnote';
import { BoundingBox } from './boundingbox';
import { StaveNote } from './stavenote';
import { check } from './common';

interface Distance {
  maxNegativeShiftPx: number;
  expectedDistance: number;
  fromTickable?: Tickable;
  errorPx?: number;
  fromTickablePx?: number;
}

export interface FormatterOptions {
  softmaxFactor?: number;
  globalSoftmax?: boolean;
  maxIterations: number;
}

export interface FormatOptions {
  align_rests?: boolean;
  padding?: number;
  stave?: Stave;
  context?: RenderContext;
  auto_beam?: boolean;
}

export interface AlignmentContexts<T> {
  list: number[];
  map: Record<number, T>;
  array: T[];
  resolutionMultiplier: number;
}

type addToContextFn<T> = (tickable: Note, context: T, voiceIndex: number) => void;
type makeContextFn<T> = (tick?: { tickID: number }) => T;

// Create `Alignment`s for each tick in `voices`. Also calculate the
// total number of ticks in voices.
function createContexts<T>(
  voices: Voice[],
  makeContext: makeContextFn<T>,
  addToContext: addToContextFn<T>
): AlignmentContexts<T> {
  const resolutionMultiplier = Formatter.getResolutionMultiplier(voices);

  // Initialize tick maps.
  const tickToContextMap: Record<number, T> = {};
  const tickList: number[] = [];
  const contexts: T[] = [];

  // For each voice, extract notes and create a context for every
  // new tick that hasn't been seen before.
  voices.forEach((voice, voiceIndex) => {
    // Use resolution multiplier as denominator so that no additional expansion
    // of fractional tick values is needed.
    const ticksUsed = new Fraction(0, resolutionMultiplier);

    voice.getTickables().forEach((tickable) => {
      const integerTicks = ticksUsed.numerator;

      // If we have no tick context for this tick, create one.
      if (!tickToContextMap[integerTicks]) {
        const newContext = makeContext({ tickID: integerTicks });
        contexts.push(newContext);
        tickToContextMap[integerTicks] = newContext;
        // Maintain a list of unique integerTicks.
        tickList.push(integerTicks);
      }

      // Add this tickable to the TickContext.
      addToContext(tickable, tickToContextMap[integerTicks], voiceIndex);
      ticksUsed.add(tickable.getTicks());
    });
  });

  return {
    map: tickToContextMap,
    array: contexts,
    list: tickList.sort((a, b) => a - b),
    resolutionMultiplier,
  };
}

// To enable logging for this class. Set `Vex.Flow.Formatter.DEBUG` to `true`.
function L(
  // eslint-disable-next-line
  ...args: any[]
) {
  if (Formatter.DEBUG) log('Vex.Flow.Formatter', args);
}

// Helper function to locate the next non-rest note(s).
function lookAhead(notes: Note[], restLine: number, i: number, compare: boolean) {
  // If no valid next note group, nextRestLine is same as current.
  let nextRestLine = restLine;

  // Get the rest line for next valid non-rest note group.
  for (i += 1; i < notes.length; i += 1) {
    const note = notes[i];
    if (!note.isRest() && !note.shouldIgnoreTicks()) {
      nextRestLine = note.getLineForRest();
      break;
    }
  }

  // Locate the mid point between two lines.
  if (compare && restLine !== nextRestLine) {
    const top = Math.max(restLine, nextRestLine);
    const bot = Math.min(restLine, nextRestLine);
    nextRestLine = Vex.MidLine(top, bot);
  }
  return nextRestLine;
}

export class Formatter {
  static DEBUG: boolean;
  protected hasMinTotalWidth: boolean;
  protected minTotalWidth: number;
  protected contextGaps: {
    total: number;
    gaps: { x1: number; x2: number }[];
  };
  protected justifyWidth: number;
  protected totalCost: number;
  protected totalShift: number;
  protected tickContexts?: AlignmentContexts<TickContext>;
  protected formatterOptions: FormatterOptions;
  protected modifierContexts?: AlignmentContexts<ModifierContext>;
  protected voices: Voice[];
  protected lossHistory: number[];
  protected durationStats: Record<string, { mean: number; count: number }>;

  // Helper function to layout "notes" one after the other without
  // regard for proportions. Useful for tests and debugging.
  static SimpleFormat(notes: Note[], x = 0, { paddingBetween = 10 } = {}): void {
    notes.reduce((accumulator, note) => {
      note.addToModifierContext(new ModifierContext());
      const tick = new TickContext().addTickable(note).preFormat();
      const metrics = tick.getMetrics();
      tick.setX(accumulator + metrics.totalLeftPx);

      return accumulator + tick.getWidth() + metrics.totalRightPx + paddingBetween;
    }, x);
  }

  // Helper function to plot formatter debug info.
  static plotDebugging(
    ctx: RenderContext,
    formatter: Formatter,
    xPos: number,
    y1: number,
    y2: number,
    options?: { stavePadding: number }
  ): void {
    options = {
      stavePadding: Flow.DEFAULT_FONT_STACK[0].lookupMetric('stave.padding'),
      ...options,
    };

    const x = xPos + options.stavePadding;
    const contextGaps = formatter.contextGaps;

    function stroke(x1: number, x2: number, color: string) {
      ctx.beginPath();
      ctx.setStrokeStyle(color);
      ctx.setFillStyle(color);
      ctx.setLineWidth(1);
      ctx.fillRect(x1, y1, Math.max(x2 - x1, 0), y2 - y1);
    }

    ctx.save();
    ctx.setFont('Arial', 8, '');

    contextGaps.gaps.forEach((gap) => {
      stroke(x + gap.x1, x + gap.x2, 'rgba(100,200,100,0.4)');
      ctx.setFillStyle('green');
      ctx.fillText(Math.round(gap.x2 - gap.x1).toString(), x + gap.x1, y2 + 12);
    });

    ctx.setFillStyle('red');
    ctx.fillText(
      `Loss: ${(formatter.totalCost || 0).toFixed(2)} Shift: ${(formatter.totalShift || 0).toFixed(
        2
      )} Gap: ${contextGaps.total.toFixed(2)}`,
      x - 20,
      y2 + 27
    );
    ctx.restore();
  }

  // Helper function to format and draw a single voice. Returns a bounding
  // box for the notation.
  //
  // Parameters:
  // * `ctx` - The rendering context
  // * `stave` - The stave to which to draw (`Stave` or `TabStave`)
  // * `notes` - Array of `Note` instances (`Note`, `TextNote`, `TabNote`, etc.)
  // * `params` - One of below:
  //    * Setting `autobeam` only `(context, stave, notes, true)` or
  //      `(ctx, stave, notes, {autobeam: true})`
  //    * Setting `align_rests` a struct is needed `(context, stave, notes, {align_rests: true})`
  //    * Setting both a struct is needed `(context, stave, notes, {
  //      autobeam: true, align_rests: true})`
  //
  // `autobeam` automatically generates beams for the notes.
  // `align_rests` aligns rests with nearby notes.
  static FormatAndDraw(
    ctx: RenderContext,
    stave: Stave,
    notes: StemmableNote[],
    params?: FormatOptions | boolean
  ): BoundingBox | undefined {
    let options = {
      auto_beam: false,
      align_rests: false,
    };

    if (typeof params === 'object') {
      options = { ...options, ...params };
    } else if (typeof params === 'boolean') {
      options.auto_beam = params;
    }

    // Start by creating a voice and adding all the notes to it.
    const voice = new Voice(Flow.TIME4_4).setMode(Voice.Mode.SOFT).addTickables(notes);

    // Then create beams, if requested.
    const beams = options.auto_beam ? Beam.applyAndGetBeams(voice) : [];

    // Instantiate a `Formatter` and format the notes.
    new Formatter()
      .joinVoices([voice]) // , { align_rests: options.align_rests })
      .formatToStave([voice], stave, { align_rests: options.align_rests, stave });

    // Render the voice and beams to the stave.
    voice.setStave(stave).draw(ctx, stave);
    beams.forEach((beam) => beam.setContext(ctx).draw());

    // Return the bounding box of the voice.
    return voice.getBoundingBox();
  }

  // Helper function to format and draw aligned tab and stave notes in two
  // separate staves.
  //
  // Parameters:
  // * `ctx` - The rendering context
  // * `tabstave` - A `TabStave` instance on which to render `TabNote`s.
  // * `stave` - A `Stave` instance on which to render `Note`s.
  // * `notes` - Array of `Note` instances for the stave (`Note`, `BarNote`, etc.)
  // * `tabnotes` - Array of `Note` instances for the tab stave (`TabNote`, `BarNote`, etc.)
  // * `autobeam` - Automatically generate beams.
  // * `params` - A configuration object:
  //    * `autobeam` automatically generates beams for the notes.
  //    * `align_rests` aligns rests with nearby notes.
  static FormatAndDrawTab(
    ctx: RenderContext,
    tabstave: TabStave,
    stave: Stave,
    tabnotes: TabNote[],
    notes: Note[],
    autobeam: boolean,
    params: FormatOptions
  ): void {
    let opts = {
      auto_beam: autobeam,
      align_rests: false,
    };

    if (typeof params === 'object') {
      opts = { ...opts, ...params };
    } else if (typeof params === 'boolean') {
      opts.auto_beam = params;
    }

    // Create a `4/4` voice for `notes`.
    const notevoice = new Voice(Flow.TIME4_4).setMode(Voice.Mode.SOFT).addTickables(notes);

    // Create a `4/4` voice for `tabnotes`.
    const tabvoice = new Voice(Flow.TIME4_4).setMode(Voice.Mode.SOFT).addTickables(tabnotes);

    // Then create beams, if requested.
    const beams = opts.auto_beam ? Beam.applyAndGetBeams(notevoice) : [];

    // Instantiate a `Formatter` and align tab and stave notes.
    new Formatter()
      .joinVoices([notevoice]) // , { align_rests: opts.align_rests })
      .joinVoices([tabvoice])
      .formatToStave([notevoice, tabvoice], stave, { align_rests: opts.align_rests });

    // Render voices and beams to staves.
    notevoice.draw(ctx, stave);
    tabvoice.draw(ctx, tabstave);
    beams.forEach((beam) => beam.setContext(ctx).draw());

    // Draw a connector between tab and note staves.
    new StaveConnector(stave, tabstave).setContext(ctx).draw();
  }

  // Auto position rests based on previous/next note positions.
  //
  // Params:
  // * `notes`: An array of notes.
  // * `alignAllNotes`: If set to false, only aligns non-beamed notes.
  // * `alignTuplets`: If set to false, ignores tuplets.
  static AlignRestsToNotes(notes: Note[], alignAllNotes: boolean, alignTuplets?: boolean): void {
    notes.forEach((note, index) => {
      if (note instanceof StaveNote && note.isRest()) {
        if (note.getTuplet() && !alignTuplets) return;

        // If activated rests not on default can be rendered as specified.
        const position = note.getGlyph().position.toUpperCase();
        if (position !== 'R/4' && position !== 'B/4') return;

        if (alignAllNotes || note.getBeam()) {
          // Align rests with previous/next notes.
          const props = note.getKeyProps()[0];
          if (index === 0) {
            props.line = lookAhead(notes, props.line, index, false);
            note.setKeyLine(0, props.line);
          } else if (index > 0 && index < notes.length) {
            // If previous note is a rest, use its line number.
            let restLine;
            const prevNote = notes[index - 1];
            if (prevNote && prevNote.isRest()) {
              restLine = prevNote.keyProps[0].line;
              props.line = restLine;
            } else {
              restLine = prevNote.getLineForRest();
              // Get the rest line for next valid non-rest note group.
              props.line = lookAhead(notes, restLine, index, true);
            }
            note.setKeyLine(0, props.line);
          }
        }
      }
    });
  }

  static estimateJustifiedMinWidth(voices: Voice[], formatterOptions?: FormatterOptions): number {
    const formatter = new Formatter(formatterOptions);
    voices.forEach((voice) => {
      formatter.joinVoices([voice]);
    });
    return formatter.preCalculateMinTotalWidth(voices);
  }

  constructor(formatterOptions?: FormatterOptions) {
    this.formatterOptions = {
      globalSoftmax: false,
      maxIterations: 5,
      ...formatterOptions,
    };
    this.justifyWidth = 0;
    this.totalCost = 0;
    this.totalShift = 0;
    this.durationStats = {};

    // Minimum width required to render all the notes in the voices.
    this.minTotalWidth = 0;

    // This is set to `true` after `minTotalWidth` is calculated.
    this.hasMinTotalWidth = false;

    // Arrays of tick and modifier contexts.
    this.tickContexts = undefined;
    this.modifierContexts = undefined;

    // Gaps between contexts, for free movement of notes post
    // formatting.
    this.contextGaps = {
      total: 0,
      gaps: [],
    };

    this.voices = [];
    this.lossHistory = [];
  }

  // Find all the rests in each of the `voices` and align them
  // to neighboring notes. If `alignAllNotes` is `false`, then only
  // align non-beamed notes.
  alignRests(voices: Voice[], alignAllNotes: boolean): void {
    if (!voices || !voices.length) {
      throw new RuntimeError('BadArgument', 'No voices to format rests');
    }

    voices.forEach((voice) => Formatter.AlignRestsToNotes(voice.getTickables(), alignAllNotes));
  }

  // Calculate the minimum width required to align and format `voices`.
  preCalculateMinTotalWidth(voices: Voice[]): number {
    const unalignedPadding = Flow.DEFAULT_FONT_STACK[0].lookupMetric('stave.unalignedNotePadding');
    // Calculate additional padding based on 3 methods:
    // 1) unaligned beats in voices, 2) variance of width, 3) variance of durations
    let unalignedCtxCount = 0;
    let wsum = 0;
    let dsum = 0;
    const widths: number[] = [];
    const durations: number[] = [];

    // Cache results.
    if (this.hasMinTotalWidth) return this.minTotalWidth;

    // Create tick contexts if not already created.
    if (!this.tickContexts) {
      if (!voices) {
        throw new RuntimeError('BadArgument', "'voices' required to run preCalculateMinTotalWidth");
      }

      this.createTickContexts(voices);
    }

    // eslint-disable-next-line
    const { list: contextList, map: contextMap } = this.tickContexts!;

    // Go through each tick context and calculate total width.
    this.minTotalWidth = contextList
      .map((tick) => {
        const context = contextMap[tick];
        context.preFormat();
        if (context.getTickables().length < voices.length) {
          unalignedCtxCount += 1;
        }
        const width = context.getWidth();
        const duration = context.getMaxTicks().value();
        wsum += width;
        dsum += duration;
        widths.push(width);
        durations.push(duration);
        return width;
      })
      .reduce((a: number, b: number) => a + b, 0);

    this.hasMinTotalWidth = true;
    // normalized STDDEV of widths/durations gives us padding hints.
    const wavg = wsum / contextList.length;
    const wvar = widths.map((ll) => Math.pow(ll - wavg, 2)).reduce((a, b) => a + b);
    const wpads = Math.pow(wvar / contextList.length, 0.5) / wavg;

    const davg = dsum / contextList.length;
    const dvar = durations.map((ll) => Math.pow(ll - davg, 2)).reduce((a, b) => a + b);
    const dpads = Math.pow(dvar / contextList.length, 0.5) / davg;

    // Find max of 3 methods and use that
    const padmax = Math.max(dpads, wpads) * contextList.length * unalignedPadding;
    const unalignedPad = unalignedPadding * unalignedCtxCount;

    return this.minTotalWidth + Math.max(unalignedPad, padmax);
  }

  // Get minimum width required to render all voices. Either `format` or
  // `preCalculateMinTotalWidth` must be called before this method.
  getMinTotalWidth(): number {
    if (!this.hasMinTotalWidth) {
      throw new RuntimeError(
        'NoMinTotalWidth',
        "Call 'preCalculateMinTotalWidth' or 'preFormat' before calling 'getMinTotalWidth'"
      );
    }

    return this.minTotalWidth;
  }

  // calculates the resolution multiplier for `voices`.
  static getResolutionMultiplier(voices: Voice[]): number {
    if (!voices || !voices.length) {
      throw new RuntimeError('BadArgument', 'No voices to format');
    }
    const totalTicks = voices[0].getTotalTicks();
    const resolutionMultiplier = voices.reduce((accumulator, voice) => {
      if (!voice.getTotalTicks().equals(totalTicks)) {
        throw new RuntimeError('TickMismatch', 'Voices should have same total note duration in ticks.');
      }

      if (voice.getMode() === Voice.Mode.STRICT && !voice.isComplete()) {
        throw new RuntimeError('IncompleteVoice', 'Voice does not have enough notes.');
      }

      return Math.max(accumulator, Fraction.LCM(accumulator, voice.getResolutionMultiplier()));
    }, 1);
    return resolutionMultiplier;
  }

  // Create `ModifierContext`s for each tick in `voices`.
  createModifierContexts(voices: Voice[]): AlignmentContexts<ModifierContext> {
    const fn: addToContextFn<ModifierContext> = (tickable: Note, context: ModifierContext) =>
      tickable.addToModifierContext(context);
    const contexts = createContexts(voices, () => new ModifierContext(), fn);
    this.modifierContexts = contexts;
    return contexts;
  }

  // Create `TickContext`s for each tick in `voices`. Also calculate the
  // total number of ticks in voices.
  createTickContexts(voices: Voice[]): AlignmentContexts<TickContext> {
    const fn: addToContextFn<TickContext> = (tickable: Note, context: TickContext, voiceIndex: number) =>
      context.addTickable(tickable, voiceIndex);
    const contexts = createContexts(voices, (tick?: { tickID: number }) => new TickContext(tick), fn);
    this.tickContexts = contexts;
    const contextArray = this.tickContexts.array;

    contextArray.forEach((context) => {
      context.tContexts = contextArray;
    });
    return contexts;
  }

  // This is the core formatter logic. Format voices and justify them
  // to `justifyWidth` pixels. `renderingContext` is required to justify elements
  // that can't retreive widths without a canvas. This method sets the `x` positions
  // of all the tickables/notes in the formatter.
  preFormat(justifyWidth = 0, renderingContext?: RenderContext, voicesParam?: Voice[], stave?: Stave): number {
    // Initialize context maps.
    const contexts = this.tickContexts;
    if (!contexts) {
      throw new RuntimeError('NoTickContexts', 'preFormat requires TickContexs');
    }

    const { list: contextList, map: contextMap } = contexts;

    // Reset loss history for evaluator.
    this.lossHistory = [];

    // If voices and a stave were provided, set the Stave for each voice
    // and preFormat to apply Y values to the notes;
    if (voicesParam && stave) {
      voicesParam.forEach((voice) => voice.setStave(stave).preFormat());
    }

    // Now distribute the ticks to each tick context, and assign them their
    // own X positions.
    let x = 0;
    let shift = 0;
    this.minTotalWidth = 0;
    let totalTicks = 0;

    // Pass 1: Give each note maximum width requested by context.
    contextList.forEach((tick) => {
      const context = contextMap[tick];
      if (renderingContext) context.setContext(renderingContext);

      // Make sure that all tickables in this context have calculated their
      // space requirements.
      context.preFormat();

      const width = context.getWidth();
      this.minTotalWidth += width;

      const maxTicks = context.getMaxTicks().value();
      totalTicks += maxTicks;

      const metrics = context.getMetrics();
      x = x + shift + metrics.totalLeftPx;
      context.setX(x);

      // Calculate shift for the next tick.
      shift = width - metrics.totalLeftPx;
    });

    // Use softmax based on all notes across all staves. (options.globalSoftmax)
    const formatterOptions = this.formatterOptions;
    const softmaxFactor = formatterOptions.softmaxFactor || 100;
    const exp = (tick: number) => softmaxFactor ** (contextMap[tick].getMaxTicks().value() / totalTicks);
    const expTicksUsed = contextList.map(exp).reduce((a: number, b: number) => a + b);

    this.minTotalWidth = x + shift;
    this.hasMinTotalWidth = true;

    // No justification needed. End formatting.
    if (justifyWidth <= 0) return this.evaluate();

    // Start justification. Subtract the right extra pixels of the final context because the formatter
    // justifies based on the context's X position, which is the left-most part of the note head.
    const firstContext = contextMap[contextList[0]];
    const lastContext = contextMap[contextList[contextList.length - 1]];

    // Calculate the "distance error" between the tick contexts. The expected distance is the spacing proportional to
    // the softmax of the ticks.
    function calculateIdealDistances(adjustedJustifyWidth: number): Distance[] {
      const distances: Distance[] = contextList.map((tick: number, i: number) => {
        const context: TickContext = contextMap[tick];
        const voices = context.getTickablesByVoice();
        let backTickable: Note | undefined;
        if (i > 0) {
          const prevContext: TickContext = contextMap[contextList[i - 1]];
          // Go through each tickable and search backwards for another tickable
          // in the same voice. If found, use that duration (ticks) to calculate
          // the expected distance.
          for (let j = i - 1; j >= 0; j--) {
            const backTick: TickContext = contextMap[contextList[j]];
            const backVoices = backTick.getTickablesByVoice();

            // Look for matching voices between tick contexts.
            const matchingVoices: string[] = [];
            Object.keys(voices).forEach((v) => {
              if (backVoices[v]) {
                matchingVoices.push(v);
              }
            });

            if (matchingVoices.length > 0) {
              // Found matching voices, get largest duration
              let maxTicks = 0;
              let maxNegativeShiftPx = Infinity;
              let expectedDistance = 0;

              matchingVoices.forEach((v) => {
                const ticks = backVoices[v].getTicks().value();
                if (ticks > maxTicks) {
                  backTickable = backVoices[v];
                  maxTicks = ticks;
                }

                // Calculate the limits of the shift based on modifiers, etc.
                const thisTickable = voices[v];
                const insideLeftEdge =
                  thisTickable.getX() -
                  (thisTickable.getMetrics().modLeftPx + thisTickable.getMetrics().leftDisplacedHeadPx);

                const backMetrics = backVoices[v].getMetrics();
                const insideRightEdge =
                  backVoices[v].getX() + backMetrics.notePx + backMetrics.modRightPx + backMetrics.rightDisplacedHeadPx;

                // Don't allow shifting if notes in the same voice can collide
                maxNegativeShiftPx = Math.min(maxNegativeShiftPx, insideLeftEdge - insideRightEdge);
              });

              // Don't shift further left than the notehead of the last context. Actually, stay at most 5% to the right
              // so that two different tick contexts don't align across staves.
              maxNegativeShiftPx = Math.min(
                maxNegativeShiftPx,
                context.getX() - (prevContext.getX() + adjustedJustifyWidth * 0.05)
              );

              // Calculate the expected distance of the current context from the last matching tickable. The
              // distance is scaled down by the softmax for the voice.
              if (formatterOptions.globalSoftmax) {
                const t = totalTicks;
                expectedDistance = (softmaxFactor ** (maxTicks / t) / expTicksUsed) * adjustedJustifyWidth;
              } else if (backTickable) {
                expectedDistance = backTickable.getVoice().softmax(maxTicks) * adjustedJustifyWidth;
              }

              return {
                expectedDistance,
                maxNegativeShiftPx,
                fromTickable: backTickable,
              };
            }
          }
        }

        return { expectedDistance: 0, fromTickablePx: 0, maxNegativeShiftPx: 0 };
      });
      return distances;
    }

    function shiftToIdealDistances(idealDistances: Distance[]): number {
      // Distribute ticks to the contexts based on the calculated distance error.
      const centerX = adjustedJustifyWidth / 2;
      let spaceAccum = 0;

      contextList.forEach((tick, index) => {
        const context = contextMap[tick];
        if (index > 0) {
          const contextX = context.getX();
          const ideal = idealDistances[index];
          const errorPx = check<Tickable>(ideal.fromTickable).getX() + ideal.expectedDistance - (contextX + spaceAccum);

          let negativeShiftPx = 0;
          if (errorPx > 0) {
            spaceAccum += errorPx;
          } else if (errorPx < 0) {
            negativeShiftPx = Math.min(ideal.maxNegativeShiftPx, Math.abs(errorPx));
            spaceAccum += -negativeShiftPx;
          }

          context.setX(contextX + spaceAccum);
        }

        // Move center aligned tickables to middle
        context.getCenterAlignedTickables().forEach((tickable: Note) => {
          tickable.setCenterXShift(centerX - context.getX());
        });
      });

      return lastContext.getX() - firstContext.getX();
    }

    const adjustedJustifyWidth =
      justifyWidth -
      lastContext.getMetrics().notePx -
      lastContext.getMetrics().totalRightPx -
      firstContext.getMetrics().totalLeftPx;
    let targetWidth = adjustedJustifyWidth;
    let actualWidth = shiftToIdealDistances(calculateIdealDistances(targetWidth));
    const musicFont = Flow.DEFAULT_FONT_STACK[0];
    // The min padding we allow to the left of the right bar, before moving things left
    const paddingMin = musicFont.lookupMetric('stave.endPaddingMin');
    // the max padding we allow to the left of the right bar, before moving things back right.
    const paddingMax = musicFont.lookupMetric('stave.endPaddingMax');
    const maxX = adjustedJustifyWidth + lastContext.getMetrics().notePx - paddingMin;

    let iterations = this.formatterOptions.maxIterations;
    while ((actualWidth > maxX && iterations > 0) || (actualWidth + paddingMax < maxX && iterations > 1)) {
      // If we couldn't fit all the notes into the jusification width, recalculate softmax over a smaller width
      if (actualWidth > maxX) {
        targetWidth -= actualWidth - maxX;
      } else {
        // If we overshoot and add too much right padding, split the difference and move right again
        targetWidth += (maxX - actualWidth) / 2;
      }
      actualWidth = shiftToIdealDistances(calculateIdealDistances(targetWidth));
      iterations--;
    }

    // Just one context. Done formatting.
    if (contextList.length === 1) return 0;

    this.justifyWidth = justifyWidth;
    return this.evaluate();
  }

  // Calculate the total cost of this formatting decision.
  evaluate(): number {
    if (!this.tickContexts) return 0;
    const contexts = this.tickContexts;
    const justifyWidth = this.justifyWidth;
    // Calculate available slack per tick context. This works out how much freedom
    // to move a context has in either direction, without affecting other notes.
    this.contextGaps = { total: 0, gaps: [] };
    contexts.list.forEach((tick, index) => {
      if (index === 0) return;
      const prevTick = contexts.list[index - 1];
      const prevContext = contexts.map[prevTick];
      const context = contexts.map[tick];
      const prevMetrics = prevContext.getMetrics();
      const currMetrics = context.getMetrics();

      // Calculate X position of right edge of previous note
      const insideRightEdge = prevContext.getX() + prevMetrics.notePx + prevMetrics.totalRightPx;
      // Calculate X position of left edge of current note
      const insideLeftEdge = context.getX() - currMetrics.totalLeftPx;
      const gap = insideLeftEdge - insideRightEdge;
      this.contextGaps.total += gap;
      this.contextGaps.gaps.push({ x1: insideRightEdge, x2: insideLeftEdge });

      // Tell the tick contexts how much they can reposition themselves.
      context.getFormatterMetrics().freedom.left = gap;
      prevContext.getFormatterMetrics().freedom.right = gap;
    });

    // Calculate mean distance in each voice for each duration type, then calculate
    // how far each note is from the mean.
    this.durationStats = {};
    const durationStats = this.durationStats;

    function updateStats(duration: string, space: number) {
      const stats = durationStats[duration];
      if (stats === undefined) {
        durationStats[duration] = { mean: space, count: 1 };
      } else {
        stats.count += 1;
        stats.mean = (stats.mean + space) / 2;
      }
    }

    this.voices.forEach((voice) => {
      voice.getTickables().forEach((note, i, notes) => {
        const duration = note.getTicks().clone().simplify().toString();
        const metrics = note.getMetrics();
        const formatterMetrics = note.getFormatterMetrics();
        const leftNoteEdge = note.getX() + metrics.notePx + metrics.modRightPx + metrics.rightDisplacedHeadPx;
        let space = 0;

        if (i < notes.length - 1) {
          const rightNote = notes[i + 1];
          const rightMetrics = rightNote.getMetrics();
          const rightNoteEdge = rightNote.getX() - rightMetrics.modLeftPx - rightMetrics.leftDisplacedHeadPx;

          space = rightNoteEdge - leftNoteEdge;
          formatterMetrics.space.used = rightNote.getX() - note.getX();
          rightNote.getFormatterMetrics().freedom.left = space;
        } else {
          space = justifyWidth - leftNoteEdge;
          formatterMetrics.space.used = justifyWidth - note.getX();
        }

        formatterMetrics.freedom.right = space;
        updateStats(duration, formatterMetrics.space.used);
      });
    });

    // Calculate how much each note deviates from the mean. Loss function is square
    // root of the sum of squared deviations.
    let totalDeviation = 0;
    this.voices.forEach((voice) => {
      voice.getTickables().forEach((note) => {
        const duration = note.getTicks().clone().simplify().toString();
        const metrics = note.getFormatterMetrics();

        metrics.space.mean = durationStats[duration].mean;
        metrics.duration = duration;
        metrics.iterations += 1;
        metrics.space.deviation = metrics.space.used - metrics.space.mean;

        totalDeviation += metrics.space.deviation ** 2;
      });
    });

    this.totalCost = Math.sqrt(totalDeviation);
    this.lossHistory.push(this.totalCost);
    return this.totalCost;
  }

  // Run a single iteration of rejustification. At a high level, this method calculates
  // the overall "loss" (or cost) of this layout, and repositions tickcontexts in an
  // attempt to reduce the cost. You can call this method multiple times until it finds
  // and oscillates around a global minimum.
  //
  // Alpha is the "learning rate" for the formatter. It determines how much of a shift
  // the formatter should make based on its cost function.
  tune(options?: { alpha: number }): number {
    if (!this.tickContexts) return 0;
    const contexts = this.tickContexts;
    options = {
      alpha: 0.5,
      ...options,
    };

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b);

    // Move `current` tickcontext by `shift` pixels, and adjust the freedom
    // on adjacent tickcontexts.
    function move(current: TickContext, shift: number, prev?: TickContext, next?: TickContext) {
      current.setX(current.getX() + shift);
      current.getFormatterMetrics().freedom.left += shift;
      current.getFormatterMetrics().freedom.right -= shift;

      if (prev) prev.getFormatterMetrics().freedom.right += shift;
      if (next) next.getFormatterMetrics().freedom.left -= shift;
    }

    let shift = 0;
    this.totalShift = 0;
    contexts.list.forEach((tick, index, list) => {
      const context = contexts.map[tick];
      const prevContext = index > 0 ? contexts.map[list[index - 1]] : undefined;
      const nextContext = index < list.length - 1 ? contexts.map[list[index + 1]] : undefined;

      move(context, shift, prevContext, nextContext);

      const cost = -sum(context.getTickables().map((t) => t.getFormatterMetrics().space.deviation));

      if (cost > 0) {
        shift = -Math.min(context.getFormatterMetrics().freedom.right, Math.abs(cost));
      } else if (cost < 0) {
        if (nextContext) {
          shift = Math.min(nextContext.getFormatterMetrics().freedom.right, Math.abs(cost));
        } else {
          shift = 0;
        }
      }

      shift *= check<{ alpha: number }>(options).alpha;
      this.totalShift += shift;
    });

    return this.evaluate();
  }

  // This is the top-level call for all formatting logic completed
  // after `x` *and* `y` values have been computed for the notes
  // in the voices.
  postFormat(): this {
    const postFormatContexts = (contexts: AlignmentContexts<ModifierContext> | AlignmentContexts<TickContext>) =>
      contexts.list.forEach((tick) => contexts.map[tick].postFormat());

    if (this.modifierContexts) postFormatContexts(this.modifierContexts);
    if (this.tickContexts) postFormatContexts(this.tickContexts);

    return this;
  }

  // Take all `voices` and create `ModifierContext`s out of them. This tells
  // the formatters that the voices belong on a single stave.
  joinVoices(voices: Voice[]): this {
    this.createModifierContexts(voices);
    this.hasMinTotalWidth = false;
    return this;
  }

  // Align rests in voices, justify the contexts, and position the notes
  // so voices are aligned and ready to render onto the stave. This method
  // mutates the `x` positions of all tickables in `voices`.
  //
  // Voices are full justified to fit in `justifyWidth` pixels.
  //
  // Set `options.context` to the rendering context. Set `options.align_rests`
  // to true to enable rest alignment.
  format(voices: Voice[], justifyWidth?: number, options?: FormatOptions): this {
    const opts = {
      align_rests: false,
      ...options,
    };

    this.voices = voices;
    const softmaxFactor = this.formatterOptions.softmaxFactor;
    if (softmaxFactor) {
      this.voices.forEach((v) => v.setSoftmaxFactor(softmaxFactor));
    }

    this.alignRests(voices, opts.align_rests);
    this.createTickContexts(voices);
    this.preFormat(justifyWidth, opts.context, voices, opts.stave);

    // Only postFormat if a stave was supplied for y value formatting
    if (opts.stave) this.postFormat();

    return this;
  }

  // This method is just like `format` except that the `justifyWidth` is inferred
  // from the `stave`.
  formatToStave(voices: Voice[], stave: Stave, optionsParam?: FormatOptions): this {
    const musicFont = Flow.DEFAULT_FONT_STACK[0];
    const padding = musicFont.lookupMetric('stave.padding') + musicFont.lookupMetric('stave.endPaddingMax');
    const options: FormatOptions = { padding, /*stave,*/ context: stave.getContext(), ...optionsParam };

    // eslint-disable-next-line
    const justifyWidth = stave.getNoteEndX() - stave.getNoteStartX() - options.padding!;
    L('Formatting voices to width: ', justifyWidth);
    return this.format(voices, justifyWidth, options);
  }
}
