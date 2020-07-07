import Vex from '../index';

export class VFScore extends HTMLElement {
  constructor() {
    super();

    // Defaults
    this.x = 10; // starting x position (of system within the score)
    this.y = 0; // starting y position (of system within the score)
    this.width = 500; // ENTIRE "page" width
    this.height = 150;
    this.stavesPerLine = 1;

    this.systemsAdded = 0;

    this.attachShadow({ mode:'open' });

    this.addEventListener('notesRegistered', this.notesRegistered);
    this.addEventListener('systemCreated', this.systemCreated);

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
    this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.registerSystem);
    this.setupFactory();
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('slot').removeEventListener('slotchange', this.registerSystem);
  }

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
    this.vf = new Vex.Flow.Factory({renderer: {elementId: null}});
    this.vf.setContext(this.context);
  }

  getNoteFromId(id) {
    return this.registry.getElementById(id);
  }

  /** "Registers" the vf-system child 
   * This PR only supports/assumes one vf-system per vf-score. 
  */
  registerSystem = () => {
    const system = this.shadowRoot.querySelector('slot').assignedElements()[0];
    // TODO: Figure out how to account for any added connectors (e.g. brace) that get drawn in front of the x position
    system.setupSystem(this.x, this.y, this.width - this.x - 1); // Minus 1 to account for the overflow of the left bar line 
  }

  systemCreated = () => {
    this.addSystemConnectors();
    this.vf.draw();
  }

  addSystemConnectors() {
    const system = this.vf.systems[0];
    system.addConnector('singleRight');
    system.addConnector('singleLeft');
  }

  /** Sets the factory instance of the component that dispatched the event */
  setFactory = (event) => {
    event.target.vf = this.vf;
  }

  /** Sets the registry instance of the component that dispatched the event */
  setRegistry = (event) => {
    event.target.registry = this.registry;
  }
}

window.customElements.define('vf-score', VFScore);
