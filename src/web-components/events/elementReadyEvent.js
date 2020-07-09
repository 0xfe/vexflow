export default class ElementReadyEvent extends Event {
  static eventName = 'vf-element-ready';

  constructor() {
    super(ElementReadyEvent.eventName, { bubbles: true });
  }
}