export class VFClef extends HTMLElement {
  constructor() {
    super();

    // Defaults
    this.type = 'treble';
    this.timeSig = '4/4'

    console.log('vf-clef constructor');
  }

  connectedCallback() {
    this.type = this.getAttribute('type') || this.clef;
    this.timeSig = this.getAttribute('timeSig') || this.timeSig;
    console.log('vf-clef connectedCallback')
  }
}

window.customElements.define('vf-clef', VFClef);