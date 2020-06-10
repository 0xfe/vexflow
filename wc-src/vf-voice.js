import Vex from '../src/index.js';
import './vf-tuplet';

const template = document.createElement('template');
template.innerHTML = `
`;

export class VFVoice extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode:'open' });
    this.shadowRoot.appendChild(document.importNode(template.content, true));

    // Defaults
    this.clef = 'treble';
    this.stem = 'up';
    this.generateBeams = false;

    // Other properties
    // notesText: String respresentation of notes

    // this.shadowRoot.querySelector('slot').addEventListener('slotChange');
    console.log('vf-voice constructor')
  }

  connectedCallback() {
    this.clef = this.getAttribute('clef') || this.clef;
    this.stem = this.getAttribute('stem') || this.stem;
    this.generateBeams = this.hasAttribute('generateBeams');
    this.notesText = this.textContent;
    // this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.notesRegistered); -- if not parsing

    console.log('vf-voice connectedCallback')
  }

  // notesRegistered = () => {
  //   this.notes = this.shadowRoot.querySelector('slot').assignedElements();
  // }

}

window.customElements.define('vf-voice', VFVoice);