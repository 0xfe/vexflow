// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Beam } from './beam';
import { BoundingBox } from './boundingbox';
import { Font } from './font';
import { Fraction } from './fraction';
import { ModifierContext } from './modifiercontext';
import { RenderContext } from './rendercontext';
import { Stave } from './stave';
import { StaveConnector } from './staveconnector';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { TabNote } from './tabnote';
import { TabStave } from './tabstave';
import { Tickable } from './tickable';
import { TickContext } from './tickcontext';
import { isNote, isStaveNote } from './typeguard';
import { log, midLine, RuntimeError } from './util';
import { Voice } from './voice';

export interface FormatterOptions {
  /** Defaults to 200. */
  softmaxFactor?: number;

  /** Defaults to `false`. */
  globalSoftmax?: boolean;

  /** Defaults to 5. */
  maxIterations?: number;
}

export interface FormatParams {
  align_rests?: boolean;
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

type addToContextFn<T> = (tickable: Tickable, context: T, voiceIndex: number) => void;
type makeContextFn<T> = (tick?: { tickID: number }) => T;

// Helper function
const sumArray = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

/**
 * Create `Alignment`s for each tick in `voices`. Also calculate the
 * total number of ticks in voices.
 */
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

// eslint-disable-next-line
function L(...args: any[]) {
  if (Formatter.DEBUG) log('Vex.Flow.Formatter', args);
}

/**
 * Get the rest line number of the next non-rest note(s).
 * @param notes array of Notes
 * @param currRestLine
 * @param currNoteIndex current note index
 * @param compare if true, return the midpoint between the current rest line and the next rest line
 * @returns a line number, which determines the vertical position of a rest.
 */
function getRestLineForNextNoteGroup(
  notes: Tickable[],
  currRestLine: number,
  currNoteIndex: number,
  compare: boolean
): number {
  // If no valid next note group, nextRestLine is same as current.
  let nextRestLine = currRestLine;

  // Start with the next note and keep going until we find a valid non-rest note group.
  for (let noteIndex = currNoteIndex + 1; noteIndex < notes.length; noteIndex++) {
    const note = notes[noteIndex];
    if (isNote(note) && !note.isRest() && !note.shouldIgnoreTicks()) {
      nextRestLine = note.getLineForRest();
      break;
    }
  }

  // Locate the mid point between two lines.
  if (compare && currRestLine !== nextRestLine) {
    const top = Math.max(currRestLine, nextRestLine);
    const bot = Math.min(currRestLine, nextRestLine);
    nextRestLine = midLine(top, bot);
  }
  return nextRestLine;
}

/**
 * Format implements the formatting and layout algorithms that are used
 * to position notes in a voice. The algorithm can align multiple voices both
 * within a stave, and across multiple staves.
 *
 * To do this, the formatter breaks up voices into a grid of rational-valued
 * `ticks`, to which each note is assigned. Then, minimum widths are assigned
 * to each tick based on the widths of the notes and modifiers in that tick. This
 * establishes the smallest amount of space required for each tick.
 *
 * Finally, the formatter distributes the left over space proportionally to
 * all the ticks, setting the `x` values of the notes in each tick.
 *
 * See `tests/formatter_tests.ts` for usage examples. The helper functions included
 * here (`FormatAndDraw`, `FormatAndDrawTab`) also serve as useful usage examples.
 */
export class Formatter {
  // To enable logging for this class. Set `Vex.Flow.Formatter.DEBUG` to `true`.
  static DEBUG: boolean = false;
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
  protected formatterOptions: Required<FormatterOptions>;
  protected modifierContexts?: AlignmentContexts<ModifierContext>;
  protected voices: Voice[];
  protected lossHistory: number[];
  protected durationStats: Record<string, { mean: number; count: number }>;

  /**
   * Helper function to layout "notes" one after the other without
   * regard for proportions. Useful for tests and debugging.
   */
  static SimpleFormat(notes: Tickable[], x = 0, { paddingBetween = 10 } = {}): void {
    notes.reduce((accumulator, note) => {
      note.addToModifierContext(new ModifierContext());
      const tick = new TickContext().addTickable(note).preFormat();
      const metrics = tick.getMetrics();
      tick.setX(accumulator + metrics.totalLeftPx);

      return accumulator + tick.getWidth() + metrics.totalRightPx + paddingBetween;
    }, x);
  }

  /** Helper function to plot formatter debug info. */
  static plotDebugging(
    ctx: RenderContext,
    formatter: Formatter,
    xPos: number,
    y1: number,
    y2: number,
    options?: { stavePadding: number }
  ): void {
    options = {
      stavePadding: Tables.currentMusicFont().lookupMetric('stave.padding'),
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
    ctx.setFont(Font.SANS_SERIF, 8);

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

  /**
   * Helper function to format and draw a single voice. Returns a bounding
   * box for the notation.
   * @param ctx  the rendering context
   * @param stave the stave to which to draw (`Stave` or `TabStave`)
   * @param notes array of `Note` instances (`Note`, `TextNote`, `TabNote`, etc.)
   * @param params one of below:
   *    * Setting `autobeam` only `(context, stave, notes, true)` or
   *      `(ctx, stave, notes, {autobeam: true})`
   *    * Setting `align_rests` a struct is needed `(context, stave, notes, {align_rests: true})`
   *    * Setting both a struct is needed `(context, stave, notes, {
   *      autobeam: true, align_rests: true})`
   *    * `autobeam` automatically generates beams for the notes.
   *    * `align_rests` aligns rests with nearby notes.
   */
  static FormatAndDraw(
    ctx: RenderContext,
    stave: Stave,
    notes: StemmableNote[],
    params?: FormatParams | boolean
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
    const voice = new Voice(Tables.TIME4_4).setMode(Voice.Mode.SOFT).addTickables(notes);

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

  /**
   * Helper function to format and draw aligned tab and stave notes in two
   * separate staves.
   * @param ctx the rendering context
   * @param tabstave a `TabStave` instance on which to render `TabNote`s.
   * @param stave a `Stave` instance on which to render `Note`s.
   * @param notes array of `Note` instances for the stave (`Note`, `BarNote`, etc.)
   * @param tabnotes array of `Note` instances for the tab stave (`TabNote`, `BarNote`, etc.)
   * @param autobeam automatically generate beams.
   * @param params a configuration object:
   *    * `autobeam` automatically generates beams for the notes.
   *    * `align_rests` aligns rests with nearby notes.
   */
  static FormatAndDrawTab(
    ctx: RenderContext,
    tabstave: TabStave,
    stave: Stave,
    tabnotes: TabNote[],
    notes: Tickable[],
    autobeam: boolean,
    params: FormatParams
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
    const notevoice = new Voice(Tables.TIME4_4).setMode(Voice.Mode.SOFT).addTickables(notes);

    // Create a `4/4` voice for `tabnotes`.
    const tabvoice = new Voice(Tables.TIME4_4).setMode(Voice.Mode.SOFT).addTickables(tabnotes);

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

  /**
   * Automatically set the vertical position of rests based on previous/next note positions.
   * @param tickables an array of Tickables.
   * @param alignAllNotes If `false`, only align rests that are within a group of beamed notes.
   * @param alignTuplets If `false`, ignores tuplets.
   */
  static AlignRestsToNotes(tickables: Tickable[], alignAllNotes: boolean, alignTuplets?: boolean): void {
    tickables.forEach((currTickable: Tickable, index: number) => {
      if (isStaveNote(currTickable) && currTickable.isRest()) {
        if (currTickable.getTuplet() && !alignTuplets) {
          return;
        }

        // If activated rests not on default can be rendered as specified.
        const position = currTickable.getGlyph().position.toUpperCase();
        if (position !== 'R/4' && position !== 'B/4') {
          return;
        }

        if (alignAllNotes || currTickable.getBeam()) {
          // Align rests with previous/next notes.
          const props = currTickable.getKeyProps()[0];
          if (index === 0) {
            props.line = getRestLineForNextNoteGroup(tickables, props.line, index, false);
          } else if (index > 0 && index < tickables.length) {
            // If previous tickable is a rest, use its line number.
            const prevTickable = tickables[index - 1];
            if (isStaveNote(prevTickable)) {
              if (prevTickable.isRest()) {
                props.line = prevTickable.getKeyProps()[0].line;
              } else {
                const restLine = prevTickable.getLineForRest();
                // Get the rest line for next valid non-rest note group.
                props.line = getRestLineForNextNoteGroup(tickables, restLine, index, true);
              }
            }
          }
          currTickable.setKeyLine(0, props.line);
        }
      }
    });
  }

  constructor(options?: FormatterOptions) {
    this.formatterOptions = {
      globalSoftmax: false,
      softmaxFactor: 200,
      maxIterations: 5,
      ...options,
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

  /**
   * Find all the rests in each of the `voices` and align them to neighboring notes.
   *
   * @param voices
   * @param alignAllNotes If `false`, only align rests within beamed groups of notes. If `true`, align all rests.
   */
  alignRests(voices: Voice[], alignAllNotes: boolean): void {
    if (!voices || !voices.length) {
      throw new RuntimeError('BadArgument', 'No voices to format rests');
    }

    voices.forEach((voice) => Formatter.AlignRestsToNotes(voice.getTickables(), alignAllNotes));
  }

  /**
   * Estimate the width required to render 'voices'.  This is done by:
   * 1. Sum the widths of all the tick contexts
   * 2. Estimate the padding.
   * The latter is done by calculating the padding 3 different ways, and taking the
   * greatest value:
   * 1. the padding required for unaligned notes in different voices
   * 2. the padding based on the stddev of the tickable widths
   * 3. the padding based on the stddev of the tickable durations.
   *
   * The last 2 quantities estimate a 'width entropy', where notes might need more
   * room than the proportional formatting gives them.  A measure of all same duration
   * and width will need no extra padding, and all these quantities will be
   * zero in that case.
   *
   * @param voices the voices that contain the notes
   * @returns the estimated width in pixels
   */
  preCalculateMinTotalWidth(voices: Voice[]): number {
    const unalignedPadding = Tables.currentMusicFont().lookupMetric('stave.unalignedNotePadding');
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
    this.minTotalWidth = 0;

    // Go through each tick context and calculate total width,
    // and also accumulate values used in padding hints
    contextList.forEach((tick) => {
      const context = contextMap[tick];
      context.preFormat();
      // If this TC doesn't have all the voices on it, it's unaligned.
      // so increment the unaligned padding accumulator
      if (context.getTickables().length < voices.length) {
        unalignedCtxCount += 1;
      }
      // Calculate the 'width entropy' over all the Tickables.
      context.getTickables().forEach((t: Tickable) => {
        wsum += t.getMetrics().width;
        dsum += t.getTicks().value();
        widths.push(t.getMetrics().width);
        durations.push(t.getTicks().value());
      });
      const width = context.getWidth();
      this.minTotalWidth += width;
    });

    this.hasMinTotalWidth = true;
    // normalized (0-1) STDDEV of widths/durations gives us padding hints.
    const wavg = wsum > 0 ? wsum / widths.length : 1 / widths.length;
    const wvar = sumArray(widths.map((ll) => Math.pow(ll - wavg, 2)));
    const wpads = Math.pow(wvar / widths.length, 0.5) / wavg;

    const davg = dsum / durations.length;
    const dvar = sumArray(durations.map((ll) => Math.pow(ll - davg, 2)));
    const dpads = Math.pow(dvar / durations.length, 0.5) / davg;

    // Find max of 3 methods pad the width with that
    const padmax = Math.max(dpads, wpads) * contextList.length * unalignedPadding;
    const unalignedPad = unalignedPadding * unalignedCtxCount;

    return this.minTotalWidth + Math.max(unalignedPad, padmax);
  }

  /**
   * Get minimum width required to render all voices. Either `format` or
   * `preCalculateMinTotalWidth` must be called before this method.
   */
  getMinTotalWidth(): number {
    if (!this.hasMinTotalWidth) {
      throw new RuntimeError(
        'NoMinTotalWidth',
        "Call 'preCalculateMinTotalWidth' or 'preFormat' before calling 'getMinTotalWidth'"
      );
    }

    return this.minTotalWidth;
  }

  /** Calculate the resolution multiplier for `voices`. */
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

  /** Create a `ModifierContext` for each tick in `voices`. */
  createModifierContexts(voices: Voice[]): AlignmentContexts<ModifierContext> {
    const fn: addToContextFn<ModifierContext> = (tickable: Tickable, context: ModifierContext) =>
      tickable.addToModifierContext(context);
    const contexts = createContexts(voices, () => new ModifierContext(), fn);
    this.modifierContexts = contexts;
    return contexts;
  }

  /**
   * Create a `TickContext` for each tick in `voices`. Also calculate the
   * total number of ticks in voices.
   */
  createTickContexts(voices: Voice[]): AlignmentContexts<TickContext> {
    const fn: addToContextFn<TickContext> = (tickable: Tickable, context: TickContext, voiceIndex: number) =>
      context.addTickable(tickable, voiceIndex);
    const contexts = createContexts(voices, (tick?: { tickID: number }) => new TickContext(tick), fn);
    this.tickContexts = contexts;
    const contextArray = this.tickContexts.array;

    contextArray.forEach((context) => {
      context.tContexts = contextArray;
    });
    return contexts;
  }

  /**
   * This is the core formatter logic. Format voices and justify them
   * to `justifyWidth` pixels. `renderingContext` is required to justify elements
   * that can't retreive widths without a canvas. This method sets the `x` positions
   * of all the tickables/notes in the formatter.
   */
  preFormat(justifyWidth = 0, renderingContext?: RenderContext, voicesParam?: Voice[], stave?: Stave): number {
    // Initialize context maps.
    const contexts = this.tickContexts;
    if (!contexts) {
      throw new RuntimeError('NoTickContexts', 'preFormat requires TickContexts');
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
    let factor = 1;
    let prevFactor = 1;
    let slack = 0;
    let iteration = 0;

    do {
      x = 0;
      shift = 0;
      slack = 0;
      // Pass 1: Give each note maximum width requested by context.
      contextList.forEach((tick) => {
        const context = contextMap[tick];

        // Make sure that all tickables in this context have calculated their
        // space requirements.
        context.preFormat();

        const metrics = context.getMetrics();
        x = x + shift + (metrics.totalLeftPx > slack ? metrics.totalLeftPx - slack : 0);
        context.setX(x);

        // Calculate shift for the next tick.
        const minTicks = context.getMinTicks()?.value() ?? context.getMaxTicks().value();
        shift = Math.max(
          metrics.width - metrics.totalLeftPx,
          (factor * minTicks) / this.formatterOptions.softmaxFactor
        );
        slack = shift - metrics.width + metrics.totalLeftPx;
      });
      prevFactor = factor;
      factor *= justifyWidth / (x + shift);
      iteration++;
    } while (
      iteration < this.formatterOptions.maxIterations &&
      justifyWidth >= 0 &&
      Math.abs(factor - prevFactor) > 0.1
    );

    this.minTotalWidth = x + shift;
    this.hasMinTotalWidth = true;
    this.justifyWidth = justifyWidth;
    return this.evaluate();
  }

  /** Calculate the total cost of this formatting decision. */
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

  /**
   * This is the top-level call for all formatting logic completed
   * after `x` *and* `y` values have been computed for the notes
   * in the voices.
   */
  postFormat(): this {
    const postFormatContexts = (contexts: AlignmentContexts<ModifierContext> | AlignmentContexts<TickContext>) =>
      contexts.list.forEach((tick) => contexts.map[tick].postFormat());

    if (this.modifierContexts) postFormatContexts(this.modifierContexts);
    if (this.tickContexts) postFormatContexts(this.tickContexts);

    return this;
  }

  /**
   * Take all `voices` and create `ModifierContext`s out of them. This tells
   * the formatters that the voices belong on a single stave.
   */
  joinVoices(voices: Voice[]): this {
    this.createModifierContexts(voices);
    this.hasMinTotalWidth = false;
    return this;
  }

  /**
   * Align rests in voices, justify the contexts, and position the notes
   * so voices are aligned and ready to render onto the stave. This method
   * mutates the `x` positions of all tickables in `voices`.
   *
   * Voices are full justified to fit in `justifyWidth` pixels.
   *
   * Set `options.context` to the rendering context. Set `options.align_rests`
   * to true to enable rest alignment.
   */
  format(voices: Voice[], justifyWidth?: number, options?: FormatParams): this {
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

  // This method is just like `format` except that the `justifyWidth` is inferred from the `stave`.
  formatToStave(voices: Voice[], stave: Stave, optionsParam?: FormatParams): this {
    const options: FormatParams = { context: stave.getContext(), ...optionsParam };

    // eslint-disable-next-line
    const justifyWidth = stave.getNoteEndX() - stave.getNoteStartX() - Stave.defaultPadding;
    L('Formatting voices to width: ', justifyWidth);
    return this.format(voices, justifyWidth, options);
  }

  getTickContext(tick: number): TickContext | undefined {
    return this.tickContexts?.map[tick];
  }
}
