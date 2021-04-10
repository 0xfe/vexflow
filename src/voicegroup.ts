// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Vex } from './vex';

/** @constructor */
export class VoiceGroup {
  constructor() {
    this.voices = [];
    this.modifierContexts = [];
  }

  // Every tickable must be associated with a voiceGroup. This allows formatters
  // and preformatters to associate them with the right modifierContexts.
  getVoices() {
    return this.voices;
  }
  getModifierContexts() {
    return this.modifierContexts;
  }

  addVoice(voice) {
    if (!voice) throw new Vex.RERR('BadArguments', 'Voice cannot be null.');
    this.voices.push(voice);
    voice.setVoiceGroup(this);
  }
}
