// ## Description
// 
// This file implements `vf-system`, the web component that resembles 
// the `System` element. One `vf-system` can have multiple `vf-stave` children. 
// `vf-system` is responsible for keeping track of its children and creating 
// the child staves once they finish generating their components. 
// Once the child staves are added, `vf-system` dispatches an event to its
// parent `vf-score` to signal that it's ready to be drawn. 

import './vf-score';
import ElementAddedEvent from './events/elementAddedEvent';
import StaveReadyEvent from './events/staveReadyEvent';
import SystemReadyEvent from './events/systemReadyEvent';

export class VFSystem extends HTMLElement {

  /**
   * Counter that keeps track of how many staves are expected versus how many 
   * have dispatched events. Aside from its initial value of 0, when 
   * `this.numStaves` = 0, the number of staves expected matches the number of 
   * staves that have dispatched events, which indicates that this vf-system can 
   * begin creating and adding the staves to its System. 
   * @private
   */
  _numStaves = 0;

  /**
   * Map of the child vf-stave elements to their voices.
   * @private
   */
  _staveToVoicesMap = new Map();

  constructor() {
    super();

    this.attachShadow({ mode:'open' });
    this.shadowRoot.innerHTML = `<slot></slot>`;

    // The 'staveCreated' event is dispatched by a vf-stave when it has finished 
    // generating its voices. vf-system listens to this event so that it can add 
    // that vf-staves information to the staveToVoiceMap and update the 
    // numStaves counter. 
    this.addEventListener(StaveReadyEvent.eventName, this._staveCreated);
  }

  connectedCallback() {
    this.dispatchEvent(new ElementAddedEvent());
  }

  /**
   * Setter to detect when the Factory instance is set. Once the Factory is set,
   * vf-system can start creating components. 
   * 
   * @param {Vex.Flow.Factory} value - The Factory instance that the overall 
   *                                   component is using, set by the parent 
   *                                   vf-score.
   */
  set vf(value) {
    this._vf = value;
    this._registerStaves();
  }

  /** 
   * Sets up the Vex.Flow.System instance that this vf-system represents. 
   * 
   * @param {int} x - The x position for the system.
   * @param {int} y - The y position for the system. 
   * @param {int} width - The width for the system. 
   */
  setupSystem(x, y, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.system = this._vf.System({ 
      x: x,
      y: y, 
      width: width,
      factory: this._vf 
    });

    // Call createSystem at the end of the system setup to catch the case in 
    // which all of the vf-stave children dispatch events before setUpSystem 
    // completes. 
    this._createSystem();
  }

  /**
   * This function looks at the number of vf-staves that this vf-system has as 
   * children. We "register" them by incrementing the counter to signal how many 
   * vf-staves we expect to get events from, as well as get their order 
   * according to the HTML markup. Because the vf-stave components are not 
   * guaranteed to dispatch their events in the order that they appear in the 
   * markup, we need this order so that they can be added to the system in the 
   * correct order. 
   * 
   * @private
   */
  _registerStaves = () => {
    const staves = this.shadowRoot.querySelector('slot').assignedElements().filter(e => e.nodeName === 'VF-STAVE');
    this._numStaves += staves.length;
    this.staveOrder = staves;
    this._createSystem();
  }

  /**
   * Event listener for a vf-stave finished creating voices event.
   * 
   * @private
   */
  _staveCreated = (event) => {
    this._staveToVoicesMap.set(event.target, event.target.voices);
    // Decrement numStaves to signal that a stave has finished creating its components
    this._numStaves--;

    // Call createSystem to check whether this vf-system is ready to add its staves. 
    this._createSystem();
  }

  /**
   * Checks whether the vf-system has set up its System instance and all the 
   * vf-stave children have dispatched events. If both of these conditions are 
   * true, the staves are created and added to the system.
   *  
   * @private
   */
  _createSystem() {
    // Only add the staves once they've all finished creating their components
    if (this.system && this._numStaves === 0) {
      // Add staves to system according to their slot order
      this.staveOrder.forEach(element => {
        const stave = this._vf.Stave({ 
          x: this.x, 
          y: this.y, 
          width: this.width,
          options: { 
            // Don't draw left and right bar lines because vf-system will add connectors
            left_bar: false,
            right_bar: false
          },
        });

        if (element.hasAttribute('clef')) {
          stave.addClef(element.clef);
        }

        if (element.hasAttribute('timeSig')) {
          stave.addTimeSignature(element.timeSig);
        }
        
        if (element.hasAttribute('keySig')) {
          stave.addKeySignature(element.keySig);
        }

        stave.clef = element.clef;

        const voices = this._staveToVoicesMap.get(element);
        this.system.addStave({ stave: stave, voices: voices });
      })

      // Add connectors (if specified) once all staves are added
      if (this.hasAttribute('connected')) {
        this.system.addConnector('brace');
      }

      // Tells parent (vf-score) that this system has finished adding its staves
      // const systemCreatedEvent = new CustomEvent('systemCreated', { bubbles: true });
      // this.dispatchEvent(systemCreatedEvent);

      this.dispatchEvent(new SystemReadyEvent());
    }
  }
}

window.customElements.define('vf-system', VFSystem);
