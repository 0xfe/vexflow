// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import {Vex} from './vex';
import {Voice} from "./voice";
import {ModifierContext} from "./modifiercontext";

/** @constructor */
export class VoiceGroup {
  private voices: Voice[];
  private modifierContexts: ModifierContext[];

  constructor() {
    this.voices = [];
    this.modifierContexts = [];
  }

  // Every tickable must be associated with a voiceGroup. This allows formatters
  // and preformatters to associate them with the right modifierContexts.
  getVoices(): Voice[] {
    return this.voices;
  }

  getModifierContexts(): ModifierContext[] {
    return this.modifierContexts;
  }

  addVoice(voice: Voice): void {
    if (!voice) throw new Vex.RERR('BadArguments', 'Voice cannot be null.');
    this.voices.push(voice);
    voice.setVoiceGroup(this);
  }
}
