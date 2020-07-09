// ## Description
// 
// This file implements `VoiceReadyEvent`, the event that vf-voice dispatches 
// to its parent (vf-stave) when it has finished creating its notes & beams and 
// is ready to be added to the stave.

export default class VoiceReadyEvent extends CustomEvent {
  static eventName = 'vf-voice-ready';

  /**
   * Creates a VoiceReadyEvent.
   * @constructor
   * @param {[vex.Flow.StaveNote]} notes - The notes that make up the voice that 
   *                                       dispatches the event.
   * @param {[Vex.Flow.Beam]} beams - The beams that make up the voice that 
   *                                  dispatches the event.
   */
  constructor(notes, beams) {
    super(VoiceReadyEvent.eventName, 
      { bubbles: true,
        detail: { notes: notes, beams: beams } 
      });
  }
}