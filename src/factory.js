// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a high level API around VexFlow. It will eventually
// become the canonical way to use VexFlow.
//
// *This API is currently DRAFT*

import { Vex } from './vex';
import { Accidental } from './accidental';
import { Articulation } from './articulation';
import { Annotation } from './annotation';
import { Formatter } from './formatter';
import { FretHandFinger } from './frethandfinger';
import { StringNumber } from './stringnumber';
import { TextDynamics } from './textdynamics';
import { ModifierContext } from './modifiercontext';
import { MultiMeasureRest } from './multimeasurerest';
import { Renderer } from './renderer';
import { Stave } from './stave';
import { StaveTie } from './stavetie';
import { StaveLine } from './staveline';
import { StaveNote } from './stavenote';
import { StaveConnector } from './staveconnector';
import { System } from './system';
import { TickContext } from './tickcontext';
import { Tuplet } from './tuplet';
import { Voice } from './voice';
import { Beam } from './beam';
import { Curve } from './curve';
import { GraceNote } from './gracenote';
import { GraceNoteGroup } from './gracenotegroup';
import { NoteSubGroup } from './notesubgroup';
import { EasyScore } from './easyscore';
import { TimeSigNote } from './timesignote';
import { KeySigNote } from './keysignote';
import { ClefNote } from './clefnote';
import { PedalMarking } from './pedalmarking';
import { TextBracket } from './textbracket';
import { VibratoBracket } from './vibratobracket';
import { GhostNote } from './ghostnote';
import { BarNote } from './barnote';
import { TabNote } from './tabnote';
import { TabStave } from './tabstave';
import { TextNote } from './textnote';

// To enable logging for this class. Set `Vex.Flow.Factory.DEBUG` to `true`.
function L(...args) { if (Factory.DEBUG) Vex.L('Vex.Flow.Factory', args); }

export const X = Vex.MakeException('FactoryError');

function setDefaults(params = {}, defaults) {
  const default_options = defaults.options;
  params = Object.assign(defaults, params);
  params.options = Object.assign(default_options, params.options);
  return params;
}

export class Factory {
  constructor(options) {
    L('New factory: ', options);
    const defaults = {
      stave: {
        space: 10,
      },
      renderer: {
        context: null,
        elementId: '',
        backend: Renderer.Backends.SVG,
        width: 500,
        height: 200,
        background: '#FFF',
      },
      font: {
        face: 'Arial',
        point: 10,
        style: '',
      },
    };

    this.options = defaults;
    this.setOptions(options);
  }

  static newFromElementId(elementId, width = 500, height = 200) {
    return new Factory({ renderer: { elementId, width, height } });
  }

  reset() {
    this.renderQ = [];
    this.systems = [];
    this.staves = [];
    this.voices = [];
    this.stave = null; // current stave
  }

  getOptions() { return this.options; }
  setOptions(options) {
    for (const key of ['stave', 'renderer', 'font']) {
      Object.assign(this.options[key], options[key]);
    }
    if (this.options.renderer.elementId !== null || this.options.renderer.context) {
      this.initRenderer();
    }

    this.reset();
  }

  initRenderer() {
    const { elementId, backend, width, height, background } = this.options.renderer;
    if (elementId === '') {
      throw new X('HTML DOM element not set in Factory');
    }

    this.context = Renderer.buildContext(elementId, backend, width, height, background);
  }

  getContext() { return this.context; }
  setContext(context) { this.context = context; return this; }
  getStave() { return this.stave; }
  getVoices() { return this.voices; }

  // Returns pixels from current stave spacing.
  space(spacing) { return this.options.stave.space * spacing; }

  Stave(params) {
    params = setDefaults(params, {
      x: 0,
      y: 0,
      width: this.options.renderer.width - this.space(1),
      options: {
        spacing_between_lines_px: this.options.stave.space,
      },
    });

    const stave = new Stave(params.x, params.y, params.width, params.options);
    this.staves.push(stave);
    stave.setContext(this.context);
    this.stave = stave;
    return stave;
  }

  TabStave(params) {
    params = setDefaults(params, {
      x: 0,
      y: 0,
      width: this.options.renderer.width - this.space(1),
      options: {
        spacing_between_lines_px: this.options.stave.space * 1.3,
      },
    });

    const stave = new TabStave(params.x, params.y, params.width, params.options);
    this.staves.push(stave);
    stave.setContext(this.context);
    this.stave = stave;
    return stave;
  }

  StaveNote(noteStruct) {
    const note = new StaveNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GhostNote(noteStruct) {
    const ghostNote = new GhostNote(noteStruct);
    if (this.stave) ghostNote.setStave(this.stave);
    ghostNote.setContext(this.context);
    this.renderQ.push(ghostNote);
    return ghostNote;
  }

  TextNote(textNoteStruct) {
    const textNote = new TextNote(textNoteStruct);
    if (this.stave) textNote.setStave(this.stave);
    textNote.setContext(this.context);
    this.renderQ.push(textNote);
    return textNote;
  }

  BarNote(params) {
    params = setDefaults(params, {
      type: 'single',
      options: {},
    });

    const barNote = new BarNote(params.type);
    if (this.stave) barNote.setStave(this.stave);
    barNote.setContext(this.context);
    this.renderQ.push(barNote);
    return barNote;
  }

  ClefNote(params) {
    params = setDefaults(params, {
      type: 'treble',
      options: {
        size: 'default',
      },
    });

    const clefNote = new ClefNote(params.type, params.options.size, params.options.annotation);
    if (this.stave) clefNote.setStave(this.stave);
    clefNote.setContext(this.context);
    this.renderQ.push(clefNote);
    return clefNote;
  }

  TimeSigNote(params) {
    params = setDefaults(params, {
      time: '4/4',
      options: {},
    });

    const timeSigNote = new TimeSigNote(params.time);
    if (this.stave) timeSigNote.setStave(this.stave);
    timeSigNote.setContext(this.context);
    this.renderQ.push(timeSigNote);
    return timeSigNote;
  }

  KeySigNote(params) {
    const keySigNote = new KeySigNote(params.key, params.cancelKey, params.alterKey);
    if (this.stave) keySigNote.setStave(this.stave);
    keySigNote.setContext(this.context);
    this.renderQ.push(keySigNote);
    return keySigNote;
  }

  TabNote(noteStruct) {
    const note = new TabNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GraceNote(noteStruct) {
    const note = new GraceNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    return note;
  }

  GraceNoteGroup(params) {
    const group = new GraceNoteGroup(params.notes, params.slur);
    group.setContext(this.context);
    return group;
  }

  Accidental(params) {
    params = setDefaults(params, {
      type: null,
      options: {},
    });

    const accid = new Accidental(params.type);
    accid.setContext(this.context);
    return accid;
  }

  Annotation(params) {
    params = setDefaults(params, {
      text: 'p',
      vJustify: 'below',
      hJustify: 'center',
      fontFamily: 'Times',
      fontSize: 14,
      fontWeight: 'bold italic',
      options: {},
    });

    const annotation = new Annotation(params.text);
    annotation.setJustification(params.hJustify);
    annotation.setVerticalJustification(params.vJustify);
    annotation.setFont(params.fontFamily, params.fontSize, params.fontWeight);
    annotation.setContext(this.context);
    return annotation;
  }

  Articulation(params) {
    params = setDefaults(params, {
      type: 'a.',
      position: 'above',
      options: {},
    });

    const articulation = new Articulation(params.type);
    articulation.setPosition(params.position);
    articulation.setContext(this.context);
    return articulation;
  }

  TextDynamics(params) {
    params = setDefaults(params, {
      text: 'p',
      duration: 'q',
      dots: 0,
      line: 0,
      options: {},
    });

    const text = new TextDynamics({
      text: params.text,
      line: params.line,
      duration: params.duration,
      dots: params.dots,
    });

    if (this.stave) text.setStave(this.stave);
    text.setContext(this.context);
    this.renderQ.push(text);
    return text;
  }

  Fingering(params) {
    params = setDefaults(params, {
      number: '0',
      position: 'left',
      options: {},
    });

    const fingering = new FretHandFinger(params.number);
    fingering.setPosition(params.position);
    fingering.setContext(this.context);
    return fingering;
  }

  StringNumber(params) {
    params = setDefaults(params, {
      number: '0',
      position: 'left',
      options: {},
    });

    const stringNumber = new StringNumber(params.number);
    stringNumber.setPosition(params.position);
    stringNumber.setContext(this.context);
    return stringNumber;
  }

  TickContext() {
    return new TickContext().setContext(this.context);
  }

  ModifierContext() {
    return new ModifierContext();
  }

  MultiMeasureRest(params) {
    const multimeasurerest = new MultiMeasureRest(params.number_of_measures, params);
    multimeasurerest.setContext(this.context);
    this.renderQ.push(multimeasurerest);
    return multimeasurerest;
  }

  Voice(params) {
    params = setDefaults(params, {
      time: '4/4',
      options: {},
    });
    const voice = new Voice(params.time);
    this.voices.push(voice);
    return voice;
  }

  StaveConnector(params) {
    params = setDefaults(params, {
      top_stave: null,
      bottom_stave: null,
      type: 'double',
      options: {},
    });
    const connector = new StaveConnector(params.top_stave, params.bottom_stave);
    connector.setType(params.type).setContext(this.context);
    this.renderQ.push(connector);
    return connector;
  }

  Formatter() {
    return new Formatter();
  }

  Tuplet(params) {
    params = setDefaults(params, {
      notes: [],
      options: {},
    });

    const tuplet = new Tuplet(params.notes, params.options).setContext(this.context);
    this.renderQ.push(tuplet);
    return tuplet;
  }

  Beam(params) {
    params = setDefaults(params, {
      notes: [],
      options: {
        autoStem: false,
        secondaryBeamBreaks: [],
      },
    });

    const beam = new Beam(params.notes, params.options.autoStem).setContext(this.context);
    beam.breakSecondaryAt(params.options.secondaryBeamBreaks);
    this.renderQ.push(beam);
    return beam;
  }

  Curve(params) {
    params = setDefaults(params, {
      from: null,
      to: null,
      options: {},
    });

    const curve = new Curve(params.from, params.to, params.options).setContext(this.context);
    this.renderQ.push(curve);
    return curve;
  }

  StaveTie(params) {
    params = setDefaults(params, {
      from: null,
      to: null,
      first_indices: [0],
      last_indices: [0],
      text: null,
      options: {
        direction: undefined,
      },
    });

    const tie = new StaveTie({
      first_note: params.from,
      last_note: params.to,
      first_indices: params.first_indices,
      last_indices: params.last_indices,
    }, params.text);

    if (params.options.direction) tie.setDirection(params.options.direction);
    tie.setContext(this.context);
    this.renderQ.push(tie);
    return tie;
  }

  StaveLine(params) {
    params = setDefaults(params, {
      from: null,
      to: null,
      first_indices: [0],
      last_indices: [0],
      options: {},
    });

    const line = new StaveLine({
      first_note: params.from,
      last_note: params.to,
      first_indices: params.first_indices,
      last_indices: params.last_indices,
    });

    if (params.options.text) line.setText(params.options.text);
    if (params.options.font) line.setFont(params.options.font);

    line.setContext(this.context);
    this.renderQ.push(line);
    return line;
  }

  VibratoBracket(params) {
    params = setDefaults(params, {
      from: null,
      to: null,
      options: {
        harsh: false,
      },
    });

    const vibratoBracket = new VibratoBracket({
      start: params.from,
      stop: params.to,
    });

    if (params.options.line) vibratoBracket.setLine(params.options.line);
    if (params.options.harsh) vibratoBracket.setHarsh(params.options.harsh);

    vibratoBracket.setContext(this.context);
    this.renderQ.push(vibratoBracket);

    return vibratoBracket;
  }

  TextBracket(params) {
    params = setDefaults(params, {
      from: null,
      to: null,
      text: '',
      options: {
        superscript: '',
        position: 1,
      },
    });

    const textBracket = new TextBracket({
      start: params.from,
      stop: params.to,
      text: params.text,
      superscript: params.options.superscript,
      position: params.options.position,
    });

    if (params.options.line) textBracket.setLine(params.options.line);
    if (params.options.font) textBracket.setFont(params.options.font);

    textBracket.setContext(this.context);
    this.renderQ.push(textBracket);
    return textBracket;
  }

  System(params = {}) {
    params.factory = this;
    const system = new System(params).setContext(this.context);
    this.systems.push(system);
    return system;
  }

  EasyScore(params = {}) {
    params.factory = this;
    return new EasyScore(params);
  }

  PedalMarking(params = {}) {
    params = setDefaults(params, {
      notes: [],
      options: {
        style: 'mixed',
      },
    });

    const pedal = new PedalMarking(params.notes);
    pedal.setStyle(PedalMarking.StylesString[params.options.style]);
    pedal.setContext(this.context);
    this.renderQ.push(pedal);
    return pedal;
  }

  NoteSubGroup(params = {}) {
    params = setDefaults(params, {
      notes: [],
      options: {},
    });

    const group = new NoteSubGroup(params.notes);
    group.setContext(this.context);
    return group;
  }

  draw() {
    this.systems.forEach(i => i.setContext(this.context).format());
    this.staves.forEach(i => i.setContext(this.context).draw());
    this.voices.forEach(i => i.setContext(this.context).draw());
    this.renderQ.forEach(i => {
      if (!i.isRendered()) i.setContext(this.context).draw();
    });
    this.systems.forEach(i => i.setContext(this.context).draw());
    this.reset();
  }
}
