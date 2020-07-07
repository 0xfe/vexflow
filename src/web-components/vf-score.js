// ## Description
// 
// This file implements `vf-score`, the web component that acts as the 
// container for the entire component. `vf-score`'s shadow root holds
// the HTML element that the renderer renders too.
// 
// All actual drawing is called from `vf-score`. 

import Vex from '../index';

export class VFScore extends HTMLElement {
  constructor() {
    super();

    // Defaults
    this.x = 10; // The starting x position of a system within the score.
    this.y = 0; // The starting y position of system within the score. 
    this.width = 500; // The entire width of the element holding the music notation. 
    this.height = 150; // The entire height of the element holding the music notation.
    this.stavesPerLine = 1; 

    this.systemsAdded = 0; // Counter that keeps track of how many systems have dispatched 
                           // events signalling that they are ready to be drawn. When the
                           // number of children matches this counter, the entire score
                           // is ready to be drawn.
                           // FOR THIS PR: a vf-score can only have one vf-system. 

    this.attachShadow({ mode:'open' });

    // The 'systemCreated' event is dispatched by a vf-systen when it has finished creating 
    // and adding its staves. vf-score listens to this event so that it can add that it can 
    // detect when the vf-system is ready to be drawn.
    this.addEventListener('systemCreated', this.systemCreated);

    // These events are dispatched by the corresponding elements (ex: vfVoiceReady is dispatched
    // by a vf-voice) when they are added to the DOM. vf-score listens to these events so that it 
    // can set the elements' Factory and/or Registry instances, since these are shared by a 
    // vf-score and all its children to maintain the same render queue. 
    this.addEventListener('vfVoiceReady', this.setFactory);
    this.addEventListener('vfStaveReady', this.setFactory);
    this.addEventListener('vfStaveReady', this.setRegistry);
    this.addEventListener('vfSystemReady', this.setFactory);
  }

  connectedCallback() {
    this.x = parseInt(this.getAttribute('x')) || this.x;
    this.y = parseInt(this.getAttribute('y')) || this.y;
    this.width = parseInt(this.getAttribute('width')) || this.width;
    this.height = parseInt(this.getAttribute('height')) || this.height;

    this.rendererType = this.getAttribute('renderer'); 

    this.setupVexflow();
    this.setupFactory();

    // vf-score listens to the slotchange event so that it can detect its system and set it up accordingly
    this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.registerSystem);
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('slot').removeEventListener('slotchange', this.registerSystem);
  }

  /**
   * Sets up the renderer, context, and registry for this component.
   */
  setupVexflow() {
    // Default to svg renderer if not specified
    const element = (this.rendererType === 'canvas') ? document.createElement('canvas') : document.createElement('div');
    element.id = 'vf-score';
    element.appendChild(document.createElement('slot'));
    this.shadowRoot.appendChild(element);

    if (this.rendererType === 'canvas') {
      this.renderer = new Vex.Flow.Renderer(element, Vex.Flow.Renderer.Backends.CANVAS);
    } else { 
      this.renderer = new Vex.Flow.Renderer(element, Vex.Flow.Renderer.Backends.SVG);
    }

    this.renderer.resize(this.width, this.height);
    this.context = this.renderer.getContext();
    this.registry = new Vex.Flow.Registry();
  }

  setupFactory() {
    // Factory is constructed with a null elementId because the underlying code uses document.querySelector(elementId) 
    // to find the element to attach the renderer to, but the web component puts the element in the shadow DOM. As such, 
    // the element would not be found due to DOM encapsulation. However, in order to use the simplified EasyScore API 
    // constructors, a Factory instance is still needed. 
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
    // TODO: Figure out how to account for any added connectors (e.g. brace) that get drawn in front of the x position
    system.setupSystem(this.x, this.y, this.width - this.x - 1); // Minus 1 to account for the overflow of the right bar line 
  }

  /**
   * Once all systems have dispatched events signalling that they've added their staves, the entire score is drawn.
   */
  systemCreated = () => {
    this.addSystemConnectors();
    this.vf.draw();
  }

  addSystemConnectors() {
    const system = this.vf.systems[0]; // "Hack" for this PR, which assumes that there's only one system per score. 
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
