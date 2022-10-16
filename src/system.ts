// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { BoundingBox } from './boundingbox';
import { Element } from './element';
import { Factory } from './factory';
import { FormatParams, Formatter, FormatterOptions } from './formatter';
import { Note } from './note';
import { RenderContext } from './rendercontext';
import { Stave, StaveOptions } from './stave';
import { StaveConnector, StaveConnectorType } from './staveconnector';
import { Category } from './typeguard';
import { RuntimeError } from './util';
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
export class System extends Element {
  static get CATEGORY(): string {
    return Category.System;
  }

  protected options!: Required<SystemOptions>;
  protected factory!: Factory;
  protected formatter?: Formatter;
  protected startX?: number;
  protected lastY?: number;
  protected partStaves: Stave[];
  protected partStaveInfos: StaveInfo[];
  protected partVoices: Voice[];
  protected connector?: StaveConnector;
  protected debugNoteMetricsYs?: { y: number; stave: Stave }[];

  constructor(params: SystemOptions = {}) {
    super();
    this.setOptions(params);
    this.partStaves = [];
    this.partStaveInfos = [];
    this.partVoices = [];
  }

  /** Set formatting options. */
  setOptions(options: SystemOptions = {}): void {
    if (!options.factory) {
      throw new RuntimeError('NoFactory', 'System.setOptions(options) requires a factory.');
    }
    this.factory = options.factory;
    this.options = {
      factory: this.factory,
      x: 10,
      y: 10,
      width: 500,
      spaceBetweenStaves: 12, // stave spaces
      autoWidth: false,
      noJustification: false,
      debugFormatter: false,
      formatIterations: 0, // number of formatter tuning steps
      noPadding: false,
      ...options,
      details: {
        alpha: 0.5, // formatter tuner learning/shifting rate
        ...options.details,
      },
      formatOptions: {
        ...options.formatOptions,
      },
    };

    if (this.options.noJustification === false && typeof options.width === 'undefined') {
      this.options.autoWidth = true;
    }
  }

  /** Get origin X. */
  getX(): number {
    return this.options.x;
  }

  /** Set origin X. */
  setX(x: number) {
    this.options.x = x;
    this.partStaves.forEach((s) => {
      s.setX(x);
    });
  }

  /** Get origin y. */
  getY(): number {
    return this.options.y;
  }

  /** Set origin y. */
  setY(y: number) {
    this.options.y = y;
    this.partStaves.forEach((s) => {
      s.setY(y);
    });
  }

  /** Get associated staves. */
  getStaves(): Stave[] {
    return this.partStaves;
  }

  /** Get associated voices. */
  getVoices(): Voice[] {
    return this.partVoices;
  }

  /** Set associated context. */
  setContext(context: RenderContext): this {
    super.setContext(context);
    this.factory.setContext(context);
    return this;
  }

  /**
   * Add connector between staves.
   * @param type see {@link StaveConnector.typeString}
   */
  addConnector(type: StaveConnectorType = 'double'): StaveConnector {
    this.connector = this.factory.StaveConnector({
      top_stave: this.partStaves[0],
      bottom_stave: this.partStaves[this.partStaves.length - 1],
      type,
    });
    return this.connector;
  }

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
  addStave(params: SystemStave): Stave {
    const staveOptions: StaveOptions = { left_bar: false, ...params.options };

    const stave =
      params.stave ??
      this.factory.Stave({ x: this.options.x, y: this.options.y, width: this.options.width, options: staveOptions });

    const p = {
      spaceAbove: 0, // stave spaces
      spaceBelow: 0, // stave spaces
      debugNoteMetrics: false,
      noJustification: false,
      ...params,
      options: staveOptions, // this needs to go after ...params, so we can override the options field.
    };

    const ctx = this.getContext();
    p.voices.forEach((voice) => {
      voice
        .setContext(ctx)
        .setStave(stave)
        .getTickables()
        .forEach((tickable) => tickable.setStave(stave));
      this.partVoices.push(voice);
    });

    this.partStaves.push(stave);
    this.partStaveInfos.push(p);
    return stave;
  }

  /**
   * Add voices to the system with stave already assigned.
   */
  addVoices(voices: Voice[]) {
    const ctx = this.getContext();
    voices.forEach((voice) => {
      voice.setContext(ctx);
      this.partVoices.push(voice);
    });
  }

  /** Format the system. */
  format(): void {
    const options_details = this.options.details;
    let justifyWidth = 0;
    const formatter = new Formatter(options_details);
    this.formatter = formatter;

    let y = this.options.y;
    let startX = 0;
    const debugNoteMetricsYs: { y: number; stave: Stave }[] = [];

    this.partStaves.forEach((part, index) => {
      y = y + part.space(this.partStaveInfos[index].spaceAbove);
      part.setY(y);
      y = y + part.space(this.partStaveInfos[index].spaceBelow);
      y = y + part.space(this.options.spaceBetweenStaves);
      if (this.partStaveInfos[index].debugNoteMetrics) {
        debugNoteMetricsYs.push({ y, stave: part });
        y += 15;
      }
      startX = Math.max(startX, part.getNoteStartX());
    });

    // Re-assign Stave to update y position
    this.partVoices.forEach((voice) => {
      voice.getTickables().forEach((tickable) => {
        const stave = tickable.getStave();
        if (stave) tickable.setStave(stave);
      });
    });

    // Join the voices
    formatter.joinVoices(this.partVoices);

    // Update the start position of all staves.
    this.partStaves.forEach((part) => part.setNoteStartX(startX));
    if (this.options.autoWidth && this.partVoices.length > 0) {
      justifyWidth = formatter.preCalculateMinTotalWidth(this.partVoices);
      this.options.width = justifyWidth + Stave.rightPadding + (startX - this.options.x);
      this.partStaves.forEach((part) => {
        part.setWidth(this.options.width);
      });
    } else {
      justifyWidth = this.options.noPadding
        ? this.options.width - (startX - this.options.x)
        : this.options.width - (startX - this.options.x) - Stave.defaultPadding;
    }
    if (this.partVoices.length > 0) {
      formatter.format(this.partVoices, this.options.noJustification ? 0 : justifyWidth, this.options.formatOptions);
    }
    formatter.postFormat();

    for (let i = 0; i < this.options.formatIterations; i++) {
      formatter.tune(options_details);
    }

    this.startX = startX;
    this.debugNoteMetricsYs = debugNoteMetricsYs;
    this.lastY = y;
    this.boundingBox = new BoundingBox(this.options.x, this.options.y, this.options.width, this.lastY - this.options.y);
    Stave.formatBegModifiers(this.partStaves);
  }

  /** Render the system. */
  draw(): void {
    // Render debugging information, if requested.
    const ctx = this.checkContext();
    if (!this.formatter || !this.startX || !this.lastY || !this.debugNoteMetricsYs) {
      throw new RuntimeError('NoFormatter', 'format() must be called before draw()');
    }
    this.setRendered();

    if (this.options.debugFormatter) {
      Formatter.plotDebugging(ctx, this.formatter, this.startX, this.options.y, this.lastY);
    }

    this.debugNoteMetricsYs.forEach((d) => {
      this.partVoices.forEach((voice) => {
        voice.getTickables().forEach((tickable) => {
          if (tickable.getStave() === d.stave) Note.plotMetrics(ctx, tickable, d.y);
        });
      });
    });
  }
}
