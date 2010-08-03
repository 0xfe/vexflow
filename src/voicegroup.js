// Vex Music Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010

/** @constructor */
Vex.Flow.VoiceGroup = function() {
  this.init();
}

Vex.Flow.VoiceGroup.prototype.init = function(time, voiceGroup) {
  this.voices = [];
  this.modifierContexts = [];
}

// Every tickable must be associated with a voiceGroup. This allows formatters
// and preformatters to associate them with the right modifierContexts.
Vex.Flow.VoiceGroup.prototype.getVoices = function() {
  return this.voices;
}

Vex.Flow.VoiceGroup.prototype.addVoice = function(voice) {
  if (!voice) throw new Vex.RERR("BadArguments", "Voice cannot be null.");
  this.voices.push(voice);
  voice.setVoiceGroup(this);
}

Vex.Flow.VoiceGroup.prototype.getModifierContexts = function() {
  return this.modifierContexts;
}
