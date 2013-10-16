// Vex Music Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010

/** @constructor */
Vex.Flow.VoiceGroup = (function() {
  function VoiceGroup() {
    this.init();
  }

  VoiceGroup.prototype = {
    init: function() {
      this.voices = [];
      this.modifierContexts = [];
    },

    // Every tickable must be associated with a voiceGroup. This allows formatters
    // and preformatters to associate them with the right modifierContexts.
    getVoices: function() { return this.voices; },
    getModifierContexts: function() { return this.modifierContexts; },

    addVoice: function(voice) {
      if (!voice) throw new Vex.RERR("BadArguments", "Voice cannot be null.");
      this.voices.push(voice);
      voice.setVoiceGroup(this);
    }
  };

  return VoiceGroup;
}());