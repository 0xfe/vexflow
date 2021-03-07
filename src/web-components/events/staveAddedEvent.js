// ## Description
// 
// This file implements `StaveAddedEvent`, the event that vf-stave elements 
// dispatch in order to get the Registry instance shared by all elements of the 
// overall component. vf-score listens to this event and sets the registry 
// property of the vf-stave that dispatched the event.  

export default class StaveAddedEvent extends Event {
  static eventName = 'vf-stave-added';

  constructor() {
    super(StaveAddedEvent.eventName, { bubbles: true });
  }
}