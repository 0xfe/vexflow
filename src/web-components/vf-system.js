import './vf-score';

const template = document.createElement('template');
template.innerHTML = `
  <slot></slot>
`;


export class VFSystem extends HTMLElement {
  constructor() {
    super();

    this.staves = [];
    this.staveOrder = new Set();
    this.staveMap = new Map(); // Map of vf-stave elements to their voices

    this.attachShadow({ mode:'open' });
    this.shadowRoot.appendChild(document.importNode(template.content, true));

    this.addEventListener('staveCreated', this.staveCreated);
  }

  connectedCallback() {
    const vfSystemReadyEvent = new CustomEvent('vfSystemReady', { bubbles: true });
    this.dispatchEvent(vfSystemReadyEvent);
  }

  set vf(value) {
    this._vf = value;
    this.registerStaves();
  }

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

    this.createSystem();
  }

  /** slotchange event listener */
  registerStaves = () => {
    const staves = this.shadowRoot.querySelector('slot').assignedElements().filter(e => e.nodeName === 'VF-STAVE');
    this.numStaves = staves.length;
    staves.forEach(stave => { 
      this.staveOrder.add(stave);
    });
    this.createSystem();
  }

  /** Event listener for a vf-stave finished creating voices event */
  staveCreated = (event) => {
    this.staveMap.set(event.target, event.target.voices);
    // Decrement numStaves to signal that a stave has finished creating its components
    this.numStaves--;
    this.createSystem();
  }

  createSystem() {
    // Only add the staves once they've all finished creating their components
    if (this.system && this.numStaves === 0) {
      // Add staves to system according to their slot order
      this.staveOrder.forEach( element => {
        const stave = this._vf.Stave({ 
          x: this.x, 
          y: this.y, 
          width: this.width,
          options: { // Don't draw left and right bar lines because vf-system will add connectors
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

        const voices = this.staveMap.get(element);
        this.system.addStave({ stave: stave, voices: voices });
      })

      // Add connectors once all staves are added
      if (this.hasAttribute('connected')) {
        this.system.addConnector('brace');
      }

      /** Tells parent (vf-score) that this system has finished creating its components */
      const systemCreatedEvent = new CustomEvent('systemCreated', { bubbles: true });
      this.dispatchEvent(systemCreatedEvent);
    }
  }
}

window.customElements.define('vf-system', VFSystem);
