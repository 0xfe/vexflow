// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { BoundingBox } from './boundingbox';
import { Element } from './element';
import { Fraction } from './fraction';
import { RenderContext } from './rendercontext';
import { Stave } from './stave';
import { Tables } from './tables';
import { Tickable } from './tickable';
import { Category } from './typeguard';
import { defined, RuntimeError, sumArray } from './util';

export interface VoiceTime {
  num_beats: number;
  beat_value: number;
  /** Defaults to `Flow.RESOLUTION` if not provided. */
  resolution?: number;
}

export enum VoiceMode {
  STRICT = 1,
  SOFT = 2,
  FULL = 3,
}

/**
 * `Voice` is mainly a container object to group `Tickables` for formatting.
 */
export class Voice extends Element {
  static get CATEGORY(): string {
    return Category.Voice;
  }

  /**
   * Modes allow the addition of ticks in three different ways:
   * - STRICT: This is the default. Ticks must fill the voice.
   * - SOFT: Ticks can be added without restrictions.
   * - FULL: Ticks do not need to fill the voice, but can't exceed the maximum tick length.
   */
  static get Mode(): typeof VoiceMode {
    return VoiceMode;
  }

  protected resolutionMultiplier: number = 1;
  protected smallestTickCount: Fraction;
  protected stave?: Stave;
  protected mode: VoiceMode = VoiceMode.STRICT;
  protected expTicksUsed?: number;
  protected preFormatted: boolean = false;
  protected options: { softmaxFactor: number };

  protected readonly totalTicks: Fraction;
  protected readonly ticksUsed: Fraction = new Fraction(0, 1);
  protected readonly largestTickWidth: number = 0;
  protected readonly tickables: Tickable[] = [];
  protected readonly time: Required<VoiceTime>;

  constructor(time?: VoiceTime | string) {
    super();

    this.options = {
      softmaxFactor: Tables.SOFTMAX_FACTOR,
    };

    // Convert the `time` string into a VoiceTime object if necessary.
    let voiceTime: VoiceTime | undefined;
    if (typeof time === 'string') {
      // Time signature shortcut: "4/4", "3/8", etc.
      const match = time.match(/(\d+)\/(\d+)/);
      if (match) {
        voiceTime = {
          num_beats: parseInt(match[1]),
          beat_value: parseInt(match[2]),
        };
      }
    } else {
      voiceTime = time;
    }

    // Default time signature is 4/4.
    this.time = {
      num_beats: 4,
      beat_value: 4,
      resolution: Tables.RESOLUTION,
      ...voiceTime,
    };

    // Recalculate total ticks.
    this.totalTicks = new Fraction(this.time.num_beats * (this.time.resolution / this.time.beat_value), 1);
    // until tickables are added, the smallestTickCount is the same as the stated totalTicks duration.
    this.smallestTickCount = this.totalTicks.clone();
  }

  /** Get the total ticks in the voice. */
  getTotalTicks(): Fraction {
    return this.totalTicks;
  }

  /** Get the total ticks used in the voice by all the tickables. */
  getTicksUsed(): Fraction {
    return this.ticksUsed;
  }

  /** Get the largest width of all the tickables. */
  getLargestTickWidth(): number {
    return this.largestTickWidth;
  }

  /** Get the tick count for the shortest tickable */
  getSmallestTickCount(): Fraction {
    return this.smallestTickCount;
  }

  /** Get the tickables in the voice. */
  getTickables(): Tickable[] {
    return this.tickables;
  }

  /** Get the voice mode (Voice.Mode.SOFT, STRICT, or FULL) */
  getMode(): number {
    return this.mode;
  }

  /**
   * Set the voice mode.
   * @param mode value from `VoiceMode` or Voice.Mode
   */
  setMode(mode: number): this {
    this.mode = mode;
    return this;
  }

  /** Get the resolution multiplier for the voice. */
  getResolutionMultiplier(): number {
    return this.resolutionMultiplier;
  }

  /** Get the actual tick resolution for the voice. */
  getActualResolution(): number {
    return this.resolutionMultiplier * this.time.resolution;
  }

  /** Set the voice's stave. */
  setStave(stave: Stave): this {
    this.stave = stave;
    // Reset the bounding box so we can reformat.
    this.boundingBox = undefined;
    return this;
  }

  getStave(): Stave | undefined {
    return this.stave;
  }

  /** Get the bounding box for the voice. */
  getBoundingBox(): BoundingBox | undefined {
    if (!this.boundingBox) {
      const stave = this.checkStave();
      let boundingBox = undefined;
      for (let i = 0; i < this.tickables.length; ++i) {
        const tickable = this.tickables[i];
        if (!tickable.getStave()) tickable.setStave(stave);
        const bb = tickable.getBoundingBox();
        if (bb) {
          boundingBox = boundingBox ? boundingBox.mergeWith(bb) : bb;
        }
      }
      this.boundingBox = boundingBox;
    }
    return this.boundingBox;
  }

  /** Set the voice mode to strict or soft. */
  setStrict(strict: boolean): this {
    this.mode = strict ? VoiceMode.STRICT : VoiceMode.SOFT;
    return this;
  }

  /** Determine if the voice is complete according to the voice mode. */
  isComplete(): boolean {
    if (this.mode === VoiceMode.STRICT || this.mode === VoiceMode.FULL) {
      return this.ticksUsed.equals(this.totalTicks);
    } else {
      return true;
    }
  }

  /**
   * We use softmax to layout the tickables proportional to the exponent of
   * their duration. The softmax factor is used to determine the 'linearness' of
   * the layout.
   *
   * The softmax of all the tickables in this voice should sum to 1.
   */
  setSoftmaxFactor(factor: number): this {
    this.options.softmaxFactor = factor;
    this.expTicksUsed = 0; // reset
    return this;
  }

  /**
   * Calculate the sum of the exponents of all the ticks in this voice to use
   * as the denominator of softmax.  (It is not the sum of the softmax(t) over all tickables)
   *
   * Note that the "exp" of "expTicksUsed" stands for "expontential" ticks used,
   * not "expected" ticks used.
   */
  protected reCalculateExpTicksUsed(): number {
    const totalTicks = this.ticksUsed.value();
    const exp = (tickable: Tickable) => Math.pow(this.options.softmaxFactor, tickable.getTicks().value() / totalTicks);
    this.expTicksUsed = sumArray(this.tickables.map(exp));
    return this.expTicksUsed;
  }

  /** Get the softmax-scaled value of a tick duration. 'tickValue' is a number. */
  softmax(tickValue: number): number {
    if (!this.expTicksUsed) {
      this.expTicksUsed = this.reCalculateExpTicksUsed();
    }

    const totalTicks = this.ticksUsed.value();
    const exp = (v: number) => Math.pow(this.options.softmaxFactor, v / totalTicks);
    const sm = exp(tickValue) / this.expTicksUsed;
    return sm;
  }

  /** Add a tickable to the voice. */
  addTickable(tickable: Tickable): this {
    if (!tickable.shouldIgnoreTicks()) {
      const ticks = tickable.getTicks();

      // Update the total ticks for this line.
      this.ticksUsed.add(ticks);
      this.expTicksUsed = 0; // reset

      if (
        (this.mode === VoiceMode.STRICT || this.mode === VoiceMode.FULL) &&
        this.ticksUsed.greaterThan(this.totalTicks)
      ) {
        this.ticksUsed.subtract(ticks);
        throw new RuntimeError('BadArgument', 'Too many ticks.');
      }

      // Track the smallest tickable for formatting.
      if (ticks.lessThan(this.smallestTickCount)) {
        this.smallestTickCount = ticks.clone();
      }

      this.resolutionMultiplier = this.ticksUsed.denominator;

      // Expand total ticks using denominator from ticks used.
      this.totalTicks.add(0, this.ticksUsed.denominator);
    }

    // Add the tickable to the line.
    this.tickables.push(tickable);
    tickable.setVoice(this);
    return this;
  }

  /** Add an array of tickables to the voice. */
  addTickables(tickables: Tickable[]): this {
    for (let i = 0; i < tickables.length; ++i) {
      this.addTickable(tickables[i]);
    }
    return this;
  }

  /** Preformat the voice by applying the voice's stave to each note. */
  preFormat(): this {
    if (this.preFormatted) return this;
    const stave = this.checkStave();
    this.tickables.forEach((tickable) => {
      if (!tickable.getStave()) {
        tickable.setStave(stave);
      }
    });
    this.preFormatted = true;
    return this;
  }

  checkStave(): Stave {
    return defined(this.stave, 'NoStave', 'No stave attached to instance.');
  }

  /**
   * Render the voice onto the canvas `context` and an optional `stave`.
   * If `stave` is omitted, it is expected that the notes have staves
   * already set.
   *
   * This method also calculates the voice's boundingBox while drawing
   * the notes. Note the similarities with this.getBoundingBox().
   */
  draw(context: RenderContext = this.checkContext(), stave?: Stave): void {
    stave = stave ?? this.stave;
    this.setRendered();
    let boundingBox = undefined;
    for (let i = 0; i < this.tickables.length; ++i) {
      const tickable = this.tickables[i];
      // Set the stave if provided.
      if (stave) {
        tickable.setStave(stave);
      }
      defined(tickable.getStave(), 'MissingStave', 'The voice cannot draw tickables without staves.');
      const bb = tickable.getBoundingBox();
      if (bb) {
        boundingBox = boundingBox ? boundingBox.mergeWith(bb) : bb;
      }

      tickable.setContext(context);
      tickable.drawWithStyle();
    }

    this.boundingBox = boundingBox;
  }
}
