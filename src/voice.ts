// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements the main Voice class. It's mainly a container
// object to group `Tickables` for formatting.
import {Element} from './element';
import {Fraction} from './fraction';
import {Stave} from "./stave";
import {Note} from "./note";
import {DrawContext} from "./types/common";
import {Tickable} from "./tickable";
import {VoiceGroup} from "./voicegroup";
import {BoundingBox} from "./boundingbox";
import {IVoiceTime} from "./types/voice";
import {IStaveOptions} from "./types/stave";
import {RuntimeError} from "./runtimeerror";
import {Merge, RESOLUTION} from "./flow";

export enum Mode {
  STRICT = 1,
  SOFT = 2,
  FULL = 3
}

export class Voice extends Element {
  private resolutionMultiplier: number;
  private smallestTickCount: Fraction;
  private stave: Stave;
  private mode: Mode;
  private voiceGroup: VoiceGroup;
  private expTicksUsed: number;
  private preFormatted: boolean;
  private options: IStaveOptions;

  private readonly totalTicks: Fraction;
  private readonly ticksUsed: Fraction;
  private readonly largestTickWidth: number;
  private readonly tickables: Note[];
  private readonly time: IVoiceTime|string;

  // Modes allow the addition of ticks in three different ways:
  //
  // STRICT: This is the default. Ticks must fill the voice.
  // SOFT:   Ticks can be added without restrictions.
  // FULL:   Ticks do not need to fill the voice, but can't exceed the maximum
  //         tick length.
  static get Mode(): typeof Mode {
    return Mode;
  }

  constructor(time: IVoiceTime|string, options?: IStaveOptions) {
    super();
    this.setAttribute('type', 'Voice');

    this.options = {
      softmaxFactor: 100,
      ...options,
    };

    // Time signature shortcut: "4/4", "3/8", etc.
    if (typeof (time) === 'string') {
      const match = time.match(/(\d+)\/(\d+)/);
      if (match) {
        time = {
          num_beats: +match[1],
          beat_value: +match[2],
          resolution: RESOLUTION,
        };
      }
    }

    // Default time sig is 4/4
    this.time = Merge({
      num_beats: 4,
      beat_value: 4,
      resolution: RESOLUTION,
    }, time);

    // Recalculate total ticks.
    this.totalTicks = typeof (this.time) !== 'string' && new Fraction(
      this.time.num_beats * (this.time.resolution / this.time.beat_value), 1
    );

    this.resolutionMultiplier = 1;

    // Set defaults
    this.tickables = [];
    this.ticksUsed = new Fraction(0, 1);
    this.smallestTickCount = this.totalTicks.clone();
    this.largestTickWidth = 0;
    this.stave = null;
    // Do we care about strictly timed notes
    this.mode = Voice.Mode.STRICT;

    // This must belong to a VoiceGroup
    this.voiceGroup = null;
  }

  // Get the total ticks in the voice
  getTotalTicks(): Fraction {
    return this.totalTicks;
  }

  // Get the total ticks used in the voice by all the tickables
  getTicksUsed(): Fraction {
    return this.ticksUsed;
  }

  // Get the largest width of all the tickables
  getLargestTickWidth(): number {
    return this.largestTickWidth;
  }

  // Get the tick count for the shortest tickable
  getSmallestTickCount(): Fraction {
    return this.smallestTickCount;
  }

  // Get the tickables in the voice
  getTickables(): Note[] {
    return this.tickables;
  }

  // Get/set the voice mode, use a value from `Voice.Mode`
  getMode(): number {
    return this.mode;
  }

  setMode(mode: number): this {
    this.mode = mode;
    return this;
  }

  // Get the resolution multiplier for the voice
  getResolutionMultiplier(): number {
    return this.resolutionMultiplier;
  }

  // Get the actual tick resolution for the voice
  getActualResolution(): number {
    if (typeof (this.time) === 'string') {
      throw new RuntimeError('VoiceError', 'Time is of type string');
    }
    return this.resolutionMultiplier * this.time.resolution;
  }

  // Set the voice's stave
  setStave(stave: Stave): this {
    this.stave = stave;
    this.boundingBox = null; // Reset bounding box so we can reformat
    return this;
  }

  // Get the bounding box for the voice
  getBoundingBox(): BoundingBox {
    let stave;
    let boundingBox;
    let bb;
    let i;

    if (!this.boundingBox) {
      if (!this.stave) throw new RuntimeError('NoStave', "Can't get bounding box without stave.");
      stave = this.stave;
      boundingBox = null;

      for (i = 0; i < this.tickables.length; ++i) {
        (this.tickables[i] as Note).setStave(stave);

        bb = this.tickables[i].getBoundingBox();
        if (!bb) continue;

        boundingBox = boundingBox ? boundingBox.mergeWith(bb) : bb;
      }

      this.boundingBox = boundingBox;
    }
    return this.boundingBox;
  }

  // Every tickable must be associated with a voiceGroup. This allows formatters
  // and preformatters to associate them with the right modifierContexts.
  getVoiceGroup(): VoiceGroup {
    if (!this.voiceGroup) {
      throw new RuntimeError('NoVoiceGroup', 'No voice group for voice.');
    }

    return this.voiceGroup;
  }

  // Set the voice group
  setVoiceGroup(g: VoiceGroup): this {
    this.voiceGroup = g;
    return this;
  }

  // Set the voice mode to strict or soft
  setStrict(strict: boolean): this {
    this.mode = strict ? Voice.Mode.STRICT : Voice.Mode.SOFT;
    return this;
  }

  // Determine if the voice is complete according to the voice mode
  isComplete(): boolean {
    if (this.mode === Voice.Mode.STRICT || this.mode === Voice.Mode.FULL) {
      return this.ticksUsed.equals(this.totalTicks);
    } else {
      return true;
    }
  }

  // We use softmax to layout the tickables proportional to the exponent of
  // their duration. The softmax factor is used to determine the 'linearness' of
  // the layout.
  //
  // The softmax of all the tickables in this voice should sum to 1.
  setSoftmaxFactor(factor: number): this {
    this.options.softmaxFactor = factor;
    return this;
  }

  // Calculate the sum of the exponents of all the ticks in this voice to use as the denominator
  // of softmax.
  reCalculateExpTicksUsed(): number {
    const totalTicks = this.ticksUsed.value();
    const exp = (tickable: Tickable) => Math.pow(this.options.softmaxFactor, tickable.getTicks().value() / totalTicks);
    this.expTicksUsed = this.tickables.map(exp).reduce((a, b) => a + b);
    return this.expTicksUsed;
  }

  // Get the softmax-scaled value of a tick duration. 'tickValue' is a number.
  softmax(tickValue: number): number {
    if (!this.expTicksUsed) {
      this.reCalculateExpTicksUsed();
    }

    const totalTicks = this.ticksUsed.value();
    const exp = (v: number) => Math.pow(this.options.softmaxFactor, v / totalTicks);
    return exp(tickValue) / this.expTicksUsed;
  }

  // Add a tickable to the voice
  addTickable(tickable: Note): this {
    if (!tickable.shouldIgnoreTicks()) {
      const ticks = tickable.getTicks();

      // Update the total ticks for this line.
      this.ticksUsed.add(ticks);

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

  // Add an array of tickables to the voice.
  addTickables(tickables: Note[]): this {
    for (let i = 0; i < tickables.length; ++i) {
      this.addTickable(tickables[i]);
    }

    return this;
  }

  // Preformats the voice by applying the voice's stave to each note.
  preFormat(): this {
    if (this.preFormatted) return this;

    this.tickables.forEach((tickable) => {
      if (!(tickable as Note).getStave()) {
        (tickable as Note).setStave(this.stave);
      }
    });

    this.preFormatted = true;
    return this;
  }

  // Render the voice onto the canvas `context` and an optional `stave`.
  // If `stave` is omitted, it is expected that the notes have staves
  // already set.
  draw(context: DrawContext = this.context, stave: Stave = this.stave): void {
    this.setRendered();
    let boundingBox = null;
    for (let i = 0; i < this.tickables.length; ++i) {
      const tickable = this.tickables[i];

      // Set the stave if provided
      if (stave) (tickable as Note).setStave(stave);

      if (!(tickable as Note).getStave()) {
        throw new RuntimeError(
          'MissingStave', 'The voice cannot draw tickables without staves.'
        );
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
