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
  protected parts: Required<SystemStave>[];
  protected connector?: StaveConnector;
  protected debugNoteMetricsYs?: { y: number; voice: Voice }[];

  constructor(params: SystemOptions = {}) {
    super();
    this.setOptions(params);
    this.parts = [];
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
      top_stave: this.parts[0].stave,
      bottom_stave: this.parts[this.parts.length - 1].stave,
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
      stave,
      /* voices: [], */
      spaceAbove: 0, // stave spaces
      spaceBelow: 0, // stave spaces
      debugNoteMetrics: false,
      noJustification: false,
      ...params,
      options: staveOptions, // this needs to go after ...params, so we can override the options field.
    };

    const ctx = this.getContext();
    p.voices.forEach((voice) =>
      voice
        .setContext(ctx)
        .setStave(stave)
        .getTickables()
        .forEach((tickable) => tickable.setStave(stave))
    );

    this.parts.push(p);
    return stave;
  }

  /** Format the system. */
  format(): void {
    const options_details = this.options.details;
    let justifyWidth = 0;
    const formatter = new Formatter(options_details);
    this.formatter = formatter;

    let y = this.options.y;
    let startX = 0;
    let allVoices: Voice[] = [];
    let allStaves: Stave[] = [];
    const debugNoteMetricsYs: { y: number; voice: Voice }[] = [];

    // Join the voices for each stave.
    this.parts.forEach((part) => {
      y = y + part.stave.space(part.spaceAbove);
      part.stave.setY(y);
      formatter.joinVoices(part.voices);
      y = y + part.stave.space(part.spaceBelow);
      y = y + part.stave.space(this.options.spaceBetweenStaves);
      if (part.debugNoteMetrics) {
        debugNoteMetricsYs.push({ y, voice: part.voices[0] });
        y += 15;
      }
      allVoices = allVoices.concat(part.voices);
      allStaves = allStaves.concat(part.stave);

      startX = Math.max(startX, part.stave.getNoteStartX());
    });

    // Update the start position of all staves.
    this.parts.forEach((part) => part.stave.setNoteStartX(startX));
    if (this.options.autoWidth) {
      justifyWidth = formatter.preCalculateMinTotalWidth(allVoices);
      this.parts.forEach((part) => {
        part.stave.setWidth(justifyWidth + Stave.rightPadding + (startX - this.options.x));
      });
    } else {
      justifyWidth = this.options.noPadding
        ? this.options.width - (startX - this.options.x)
        : this.options.width - (startX - this.options.x) - Stave.defaultPadding;
    }
    formatter.format(allVoices, this.options.noJustification ? 0 : justifyWidth, this.options.formatOptions);
    formatter.postFormat();

    for (let i = 0; i < this.options.formatIterations; i++) {
      formatter.tune(options_details);
    }

    this.startX = startX;
    this.debugNoteMetricsYs = debugNoteMetricsYs;
    this.lastY = y;
    this.boundingBox = new BoundingBox(this.options.x, this.options.y, this.options.width, this.lastY - this.options.y);
    Stave.formatBegModifiers(allStaves);
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
      d.voice.getTickables().forEach((tickable) => Note.plotMetrics(ctx, tickable, d.y));
    });
  }
}
