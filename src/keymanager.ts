// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This class implements diatonic key management.

import { KeyParts, Music } from './music';
import { RuntimeError } from './util';

export class KeyManager {
  protected music: Music;
  // all attributes below are initialised in setKey which calls reset in the constructor
  protected keyParts!: KeyParts;
  protected keyString!: string;
  protected key!: string;
  protected scale!: number[];
  protected scaleMap!: Record<string, string>;
  protected scaleMapByValue!: Record<number, string>;
  protected originalScaleMapByValue!: Record<number, string>;

  constructor(key: string) {
    this.music = new Music();
    this.setKey(key);
  }

  setKey(key: string): this {
    this.key = key;
    this.reset();
    return this;
  }

  getKey(): string {
    return this.key;
  }

  reset(): this {
    this.keyParts = this.music.getKeyParts(this.key);

    this.keyString = this.keyParts.root;
    if (this.keyParts.accidental) this.keyString += this.keyParts.accidental;

    const is_supported_type = Music.scaleTypes[this.keyParts.type];
    if (!is_supported_type) {
      throw new RuntimeError('BadArguments', `Unsupported key type: ${this.key}`);
    }

    this.scale = this.music.getScaleTones(
      this.music.getNoteValue(this.keyString),
      Music.scaleTypes[this.keyParts.type]
    );

    this.scaleMap = {};
    this.scaleMapByValue = {};
    this.originalScaleMapByValue = {};

    const noteLocation = Music.root_indices[this.keyParts.root];

    for (let i = 0; i < Music.roots.length; ++i) {
      const index = (noteLocation + i) % Music.roots.length;
      const rootName = Music.roots[index];

      const noteName = this.music.getRelativeNoteName(rootName, this.scale[i]);
      this.scaleMap[rootName] = noteName;
      this.scaleMapByValue[this.scale[i]] = noteName;
      this.originalScaleMapByValue[this.scale[i]] = noteName;
    }

    return this;
  }

  getAccidental(key: string): {
    note: string;
    accidental?: string;
    change?: boolean;
  } {
    const root = this.music.getKeyParts(key).root;
    const parts = this.music.getNoteParts(this.scaleMap[root]);

    return {
      note: this.scaleMap[root],
      accidental: parts.accidental,
    };
  }

  selectNote(note: string): {
    note: string;
    accidental?: string;
    change: boolean;
  } {
    note = note.toLowerCase();
    const parts = this.music.getNoteParts(note);

    // First look for matching note in our altered scale
    const scaleNote = this.scaleMap[parts.root];
    const modparts = this.music.getNoteParts(scaleNote);

    if (scaleNote === note) {
      return {
        note: scaleNote,
        accidental: parts.accidental,
        change: false,
      };
    }

    // Then search for a note of equivalent value in our altered scale
    const valueNote = this.scaleMapByValue[this.music.getNoteValue(note)];
    if (valueNote != null) {
      return {
        note: valueNote,
        accidental: this.music.getNoteParts(valueNote).accidental,
        change: false,
      };
    }

    // Then search for a note of equivalent value in the original scale
    const originalValueNote = this.originalScaleMapByValue[this.music.getNoteValue(note)];
    if (originalValueNote != null) {
      this.scaleMap[modparts.root] = originalValueNote;
      delete this.scaleMapByValue[this.music.getNoteValue(scaleNote)];
      this.scaleMapByValue[this.music.getNoteValue(note)] = originalValueNote;
      return {
        note: originalValueNote,
        accidental: this.music.getNoteParts(originalValueNote).accidental,
        change: true,
      };
    }

    // Then try to unmodify a currently modified note.
    if (modparts.root === note) {
      delete this.scaleMapByValue[this.music.getNoteValue(this.scaleMap[parts.root])];
      this.scaleMapByValue[this.music.getNoteValue(modparts.root)] = modparts.root;
      this.scaleMap[modparts.root] = modparts.root;
      return {
        note: modparts.root,
        accidental: undefined,
        change: true,
      };
    }

    // Last resort -- shitshoot
    delete this.scaleMapByValue[this.music.getNoteValue(this.scaleMap[parts.root])];
    this.scaleMapByValue[this.music.getNoteValue(note)] = note;

    delete this.scaleMap[modparts.root];
    this.scaleMap[modparts.root] = note;

    return {
      note,
      accidental: parts.accidental,
      change: true,
    };
  }
}
