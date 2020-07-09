// ## Description
// 
// This file implements `ElementAddedEvent`, the event that child elements 
// dispatch in order to get the Factory instance used by all elements of the 
// overall components. vf-score listens to this event and sets the vf property
// of the event target.  

export default class ElementAddedEvent extends Event {
  static eventName = 'vf-element-added';

  constructor() {
    super(ElementAddedEvent.eventName, { bubbles: true });
  }
}