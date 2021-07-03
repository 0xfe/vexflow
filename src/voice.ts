// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
import { RuntimeError, check } from './util';
import { Element } from './element';
import { Flow } from './flow';
import { Fraction } from './fraction';
import { Stave } from './stave';
import { Note } from './note';
import { BoundingBox } from './boundingbox';
import { Tickable } from './tickable';
import { RenderContext } from './types/common';

export interface VoiceTime {
  num_beats: number;
  beat_value: number;
  resolution: number;
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
  protected resolutionMultiplier: number;
  protected smallestTickCount: Fraction;
  protected stave?: Stave;
  protected mode: VoiceMode;
  protected expTicksUsed?: number;
  protected preFormatted?: boolean;
  protected options: { softmaxFactor: number };

  protected readonly totalTicks: Fraction;
  protected readonly ticksUsed: Fraction;
  protected readonly largestTickWidth: number;
  protected readonly tickables: Note[];
  protected readonly time: VoiceTime;

  /**
   * Modes allow the addition of ticks in three different ways:
   * - STRICT: This is the default. Ticks must fill the voice.
   * - SOFT: Ticks can be added without restrictions.
   * - FULL: Ticks do not need to fill the voice, but can't exceed the maximum tick length.
   */
  static get Mode(): typeof VoiceMode {
    return VoiceMode;
  }

  constructor(time: VoiceTime | string, options?: { softmaxFactor: number }) {
    super();
    this.setAttribute('type', 'Voice');

    this.options = {
      softmaxFactor: 100,
      ...options,
    };

    // Time signature shortcut: "4/4", "3/8", etc.
    if (typeof time === 'string') {
      const match = time.match(/(\d+)\/(\d+)/);
      if (match) {
        time = {
          num_beats: parseInt(match[1]),
          beat_value: parseInt(match[2]),
          resolution: Flow.RESOLUTION,
        };
      }
    }

    // Default time sig is 4/4
    this.time = {
      ...{
        num_beats: 4,
        beat_value: 4,
        resolution: Flow.RESOLUTION,
      },
      ...(time as VoiceTime),
    };

    // Recalculate total ticks.
    this.totalTicks = new Fraction(this.time.num_beats * (this.time.resolution / this.time.beat_value), 1);

    this.resolutionMultiplier = 1;

    // Set defaults
    this.tickables = [];
    this.ticksUsed = new Fraction(0, 1);
    this.smallestTickCount = this.totalTicks.clone();
    this.largestTickWidth = 0;
    // Do we care about strictly timed notes
    this.mode = Voice.Mode.STRICT;
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
  getTickables(): Note[] {
    return this.tickables;
  }

  /** Get the voice mode. */
  getMode(): number {
    return this.mode;
  }

  /**
   * Set the voice mode.
   * @param mode value from `Voice.Mode`
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
    this.boundingBox = undefined; // Reset bounding box so we can reformat
    return this;
  }

  /** Get the bounding box for the voice. */
  getBoundingBox(): BoundingBox | undefined {
    let boundingBox;
    let bb;
    let i;

    if (!this.boundingBox) {
      boundingBox = undefined;

      for (i = 0; i < this.tickables.length; ++i) {
        this.tickables[i].setStave(check<Stave>(this.stave));

        bb = this.tickables[i].getBoundingBox();
        if (!bb) continue;

        boundingBox = boundingBox ? boundingBox.mergeWith(bb) : bb;
      }

      this.boundingBox = boundingBox;
    }
    return this.boundingBox;
  }

  /** Set the voice mode to strict or soft. */
  setStrict(strict: boolean): this {
    this.mode = strict ? Voice.Mode.STRICT : Voice.Mode.SOFT;
    return this;
  }

  /** Determine if the voice is complete according to the voice mode. */
  isComplete(): boolean {
    if (this.mode === Voice.Mode.STRICT || this.mode === Voice.Mode.FULL) {
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
    return this;
  }

  /**
   * Calculate the sum of the exponents of all the ticks in this voice to use
   * as the denominator of softmax.
   */
  protected reCalculateExpTicksUsed(): number {
    const totalTicks = this.ticksUsed.value();
    const exp = (tickable: Tickable) => Math.pow(this.options.softmaxFactor, tickable.getTicks().value() / totalTicks);
    this.expTicksUsed = this.tickables.map(exp).reduce((a, b) => a + b);
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
  addTickable(tickable: Note): this {
    if (!tickable.shouldIgnoreTicks()) {
      const ticks = tickable.getTicks();

      // Update the total ticks for this line.
      this.ticksUsed.add(ticks);
      this.expTicksUsed = 0; // reset

      if (
        (this.mode === Voice.Mode.STRICT || this.mode === Voice.Mode.FULL) &&
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
  addTickables(tickables: Note[]): this {
    for (let i = 0; i < tickables.length; ++i) {
      this.addTickable(tickables[i]);
    }

    return this;
  }

  /** Preformat the voice by applying the voice's stave to each note. */
  preFormat(): this {
    if (this.preFormatted) return this;
    const stave = check<Stave>(this.stave);
    this.tickables.forEach((tickable) => {
      if (!tickable.getStave()) {
        tickable.setStave(stave);
      }
    });

    this.preFormatted = true;
    return this;
  }

  /**
   * Render the voice onto the canvas `context` and an optional `stave`.
   * If `stave` is omitted, it is expected that the notes have staves
   * already set.
   */
  draw(context: RenderContext = this.checkContext(), stave: Stave | undefined = this.stave): void {
    this.setRendered();
    let boundingBox = undefined;
    for (let i = 0; i < this.tickables.length; ++i) {
      const tickable = this.tickables[i];

      // Set the stave if provided
      if (stave) tickable.setStave(stave);

      if (!tickable.getStave()) {
        throw new RuntimeError('MissingStave', 'The voice cannot draw tickables without staves.');
      }

      if (i === 0) boundingBox = tickable.getBoundingBox();

      if (i > 0 && boundingBox) {
        const tickable_bb = tickable.getBoundingBox();
        if (tickable_bb) boundingBox.mergeWith(tickable_bb);
      }

      tickable.setContext(context);
      tickable.drawWithStyle();
    }

    this.boundingBox = boundingBox;
  }
}
