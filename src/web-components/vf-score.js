// ## Description
// 
// This file implements `vf-score`, the web component that acts as the 
// container for the entire component. `vf-score`'s shadow root holds
// the HTML element that the renderer renders too.
// 
// All actual drawing is called from `vf-score`. 

import Vex from '../index';

export class VFScore extends HTMLElement {

  /**
   * The starting x position of a system within the score.
   * @private
   */
  _x = 10;

  /**
   * The starting y position of system within the score. 
   * @private
   */
  _y = 0;

  /**
   * The entire width of the element holding the music notation.
   * @private  
   */
  _width = 500;

  /**
   * The entire height of the element holding the music notation.
   * @private
   */
  _height = 150; 

  /**
   * The number of systems per line.  
   * @private
   */
  _systemsPerLine = 1;

  /**
   * Counter that keeps track of how many systems have dispatched events 
   * signalling that they are ready to be drawn. When the number of children 
   * matches this counter, the entire score is ready to be drawn.
   * FOR THIS PR: a vf-score can only have one vf-system. 
   * @private
   */
  _systemsAdded = 0;   

  /** 
   * The type of renderer to use for this vf-score component.
   * @private
   */
  _rendererType = 'svg';

  constructor() {
    super();

    this.attachShadow({ mode:'open' });

    // The 'systemCreated' event is dispatched by a vf-systen when it has 
    // finished creating and adding its staves. vf-score listens to this event 
    // so that it can add that it can detect when the vf-system is ready to 
    // be drawn.
    this.addEventListener('systemCreated', this.systemCreated);

    // These events are dispatched by the corresponding elements 
    // (ex: vfVoiceReady is dispatched by a vf-voice) when they are added to the 
    // DOM. vf-score listens to these events so that it can set the elements' 
    // Factory and/or Registry instances, since these are shared by a vf-score 
    // and all its children to maintain the same render queue. 
    this.addEventListener('vfVoiceReady', this.setFactory);
    this.addEventListener('vfStaveReady', this.setFactory);
    this.addEventListener('vfStaveReady', this.setRegistry);
    this.addEventListener('vfSystemReady', this.setFactory);

    this._setupVexflow();
    this._setupFactory();
  }

  connectedCallback() {
    // vf-score listens to the slotchange event so that it can detect its system 
    // and set it up accordingly
    this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.registerSystem);
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('slot').removeEventListener('slotchange', this.registerSystem);
  }

  static get observedAttributes() { return ['x', 'y', 'width', 'height', 'renderer'] }

  attributeChangedCallback(name, oldValue, newValue) {
    switch(name) {
      case 'x':
      case 'y':
        // TODO (ywsang): Implement code to update the position of the vf-system
        // children. 
        break;
      case 'width':
        this._width = parseInt(newValue);
        this.resizeRenderer();
        break;
      case 'height':
        this._height = parseInt(newValue);
        this.resizeRenderer();
        break;
      case 'renderer':
        this._rendererType = newValue;
        break;
    }
  }

  resizeRenderer() {
    this.renderer.resize(this._width, this._height);
  }

  /**
   * Sets up the renderer, context, and registry for this component.
   * @private
   */
  _setupVexflow() {
    // Default to the SVG renderer if not specified.
    this.shadowRoot.innerHTML = this.rendererType === 'canvas'
      ? `<canvas id='vf-score'><slot></slot></canvas>`
      : `<div id='vf-score'><slot></slot></div>`
    const element = this.shadowRoot.querySelector('#vf-score')

    if (this._rendererType === 'canvas') {
      this.renderer = new Vex.Flow.Renderer(element, Vex.Flow.Renderer.Backends.CANVAS);
    } else { 
      this.renderer = new Vex.Flow.Renderer(element, Vex.Flow.Renderer.Backends.SVG);
    }

    this.renderer.resize(this._width, this._height);
    this.context = this.renderer.getContext();
    this.registry = new Vex.Flow.Registry();
  }

  /**
   * @private
   */
  _setupFactory() {
    // Factory is constructed with a null elementId because the underlying code 
    // uses document.querySelector(elementId) to find the element to attach the 
    // renderer to, but the web component puts the element in the shadow DOM. As 
    // such, the element would not be found due to DOM encapsulation. However, 
    // in order to use the simplified EasyScore API constructors, a Factory 
    // instance is still needed. 
    this.vf = new Vex.Flow.Factory({ renderer: { elementId: null } });
    this.vf.setContext(this.context);
  }

  getNoteFromId(id) {
    return this.registry.getElementById(id);
  }

  /** 
   * "Registers" the vf-system child. 
   * This PR only supports/assumes one vf-system per vf-score. 
   */
  registerSystem = () => {
    const system = this.shadowRoot.querySelector('slot').assignedElements()[0];
    // TODO (ywsang): Figure out how to account for any added connectors that 
    // get drawn in front of the x position (e.g. brace, bracket)
    system.setupSystem(this._x, this._y, this._width - this._x - 1); // Minus 1 to account for the overflow of the right bar line 
  }

  /**
   * Once all systems have dispatched events signalling that they've added their 
   * staves, the entire score is drawn.
   */
  systemCreated = () => {
    this.addSystemConnectors();
    this.vf.draw();
  }

  addSystemConnectors() {
    const system = this.vf.systems[0]; // TODO (ywsang): Replace with better 
                                       // logic once more than one system per
                                       // score is allowed. 
    system.addConnector('singleRight');
    system.addConnector('singleLeft');
  }

  /** 
   * Sets the factory instance of the component that dispatched the event. 
   */
  setFactory = (event) => {
    event.target.vf = this.vf;
  }

  /** 
   * Sets the registry instance of the component that dispatched the event.
   */
  setRegistry = (event) => {
    event.target.registry = this.registry;
  }
}

window.customElements.define('vf-score', VFScore);
