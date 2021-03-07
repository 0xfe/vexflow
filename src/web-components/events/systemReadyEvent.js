// ## Description
// 
// This file implements `SystemReadyEvent`, the event that vf-system dispatches 
// to its parent (vf-score) when it has finished added its staves and 
// is ready to be drawn.

export default class SystemReadyEvent extends Event {
  static eventName = 'vf-system-ready';

  constructor() {
    super(SystemReadyEvent.eventName, { bubbles: true });
  }
}