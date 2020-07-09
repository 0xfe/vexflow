// ## Description
// 
// This file implements `StaveReadyEvent`, the event that vf-stave dispatches 
// to its parent (vf-system) when it has finished creating its voices and 
// is ready to be added to the system.

export default class StaveReadyEvent extends Event {
  static eventName = 'vf-stave-ready';

  constructor() {
    super(StaveReadyEvent.eventName, { bubbles: true });
  }
}