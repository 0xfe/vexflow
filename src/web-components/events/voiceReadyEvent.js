// ## Description
// 
// This file implements `VoiceReadyEvent`, the event that vf-voice dispatches 
// to its parent (vf-stave) when it has finished creating its notes & beams and 
// is ready to be added to the stave.

export default class VoiceReadyEvent extends Event {
  static eventName = 'vf-voice-ready';

  constructor() {
    super(VoiceReadyEvent.eventName, { bubbles: true });
  }
}