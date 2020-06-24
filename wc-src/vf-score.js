import Vex from '../src/index.js';

const template = document.createElement('template');
template.innerHTML = `
  <div id='vf-score'>
    <slot></slot>
  </div>
`

export class VFScore extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode:'open' });
    this.shadowRoot.appendChild(document.importNode(template.content, true));

    // this.addEventListener('getContext', this.getContext);
    this.addEventListener('getFactory', this.getFactory);
  }

  connectedCallback() {
    this.setupVexflow(this.getAttribute('width') || 500, this.getAttribute('height') || 200);
    this.setupFactory();
  }

  setupVexflow(width, height) {
    const div = this.shadowRoot.getElementById('vf-score');
    const renderer = new Vex.Flow.Renderer(div, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(width, height);
    this.context = renderer.getContext();
  }

  setupFactory() {
    this.vf = new Vex.Flow.Factory({renderer: {elementId: null}});
    this.vf.setContext(this.context);
  }

  /** Returns the VF.Factory for this vf-score component */
  getFactory = () => {
    event.target.vf = this.vf;
  }
}

window.customElements.define('vf-score', VFScore);
