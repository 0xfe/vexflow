import Vex from '../src/index.js';
import './vf-score';

const template = document.createElement('template');
template.innerHTML = `
  <slot></slot>
`;

export class VFStave extends HTMLElement {
  constructor() {
    super();
    
    // Defaults
    this.voices = [];
    this.beams = [];
    this._vf = undefined;

    this.attachShadow({ mode:'open' });
    this.shadowRoot.appendChild(document.importNode(template.content, true));

    this.addEventListener('getScore', this.getScore);
    this.addEventListener('voiceAdded', this.voiceAdded);
    this.addEventListener('notesCreated', this.addVoice);
  }

  connectedCallback() {
    this.clef = this.getAttribute('clef');
    this.timeSig = this.getAttribute('timeSig');
    this.keySig = this.getAttribute('keySig');

    const getFactoryEvent = new CustomEvent('getFactory', { bubbles: true });
    this.dispatchEvent(getFactoryEvent);

    this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.registerVoices);
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('slot').removeEventListener('slotchange', this.registerVoices);
  }

  set vf(value) {
    this._vf = value;
    this.setupStave();
  }

  setupStave() {
    this.score = this._vf.EasyScore();
    this.score.set({
      clef: this.clef || 'treble',
      time: this.timeSig || '4/4'
    });

    this.stave = this._vf.Stave( { x: 10, y: 40, width: 400 });

    if (this.clef) {
      this.stave.addClef(this.clef);
    }

    if (this.timeSig) {
      this.stave.addTimeSignature(this.timeSig);
    }
    
    if (this.keySig) {
      this.stave.addKeySignature(this.keySig);
    }
    
    this.stave.draw();
  }

  /** slotchange event listener */
  registerVoices = () => {
    const voiceSlots = this.shadowRoot.querySelector('slot').assignedElements().filter( e => e.nodeName === 'VF-VOICE');
    this.numVoices = voiceSlots.length;

    if (this.voices.length === this.numVoices) {
      this.formatAndDrawVoices();
    }
  }

  /** Event listener when vf-voice returns notes */
  addVoice = (e) => {
    const notes = e.detail.notes;
    const beams = e.detail.beams; 
    const voice = this.createVoiceFromNotes(notes);

    this.voices.push(voice);
    this.beams = this.beams.concat(beams);

    // Make sure all voices are created first, then format & draw to make sure alignment is correct
    if (this.voices.length === this.numVoices) {
      this.formatAndDrawVoices();
    }
  }

  createVoiceFromNotes(staveNotes) {
    return this.score.voice(staveNotes);
  }

  formatAndDrawVoices() {
    var formatter = new Vex.Flow.Formatter()
    formatter.joinVoices(this.voices);
    formatter.formatToStave(this.voices, this.stave);
    this._vf.draw();
  }

   /** Returns the EasyScore instance */
  getScore = () => {
    event.target.score = this.score;
  }

}

window.customElements.define('vf-stave', VFStave);
