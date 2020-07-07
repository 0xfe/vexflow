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
    this._registry = undefined;

    this.attachShadow({ mode:'open' });
    this.shadowRoot.appendChild(document.importNode(template.content, true));

    this.addEventListener('notesCreated', this.addVoice);
    this.addEventListener('vfVoiceReady', this.setScore);
  }

  connectedCallback() {
    this.clef = this.getAttribute('clef');
    this.timeSig = this.getAttribute('timeSig');
    this.keySig = this.getAttribute('keySig');

    const vfStaveReadyEvent = new CustomEvent('vfStaveReady', { bubbles: true });
    this.dispatchEvent(vfStaveReadyEvent);

    this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.registerVoices);
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('slot').removeEventListener('slotchange', this.registerVoices);
  }

  set vf(value) {
    this._vf = value;
    this.setupStave();
  }

  set registry(value) {
    this._registry = value;
  }

  setupStave() {
    this.score = this._vf.EasyScore();
    // Defaults to treble clef, 4/4 time if not specified
    this.score.set({
      clef: this.clef || 'treble',
      time: this.timeSig || '4/4'
    });
  }
  
  /** slotchange event listener */
  registerVoices = () => {
    const voiceSlots = this.shadowRoot.querySelector('slot').assignedElements().filter(e => e.nodeName === 'VF-VOICE');
    this.numVoices = voiceSlots.length;

    if (this.voices.length === this.numVoices) {
      this.staveCreated();
    }
  }

  /** Event listener for a vf-voice finished creating notes event */
  addVoice = (e) => {
    const notes = e.detail.notes;
    this.registerNotes(notes);
    const beams = e.detail.beams; 
    const voice = this.createVoiceFromNotes(notes);

    this.voices.push(voice);
    this.beams = this.beams.concat(beams);

    // Make sure all voices are created first, then dispatch to vf-system
    if (this.voices.length === this.numVoices) {
      this.staveCreated();
    }
  }

  /** Register notes that have non-auto-generated IDs to the score's registry */
  registerNotes(staveNotes) {
    staveNotes.forEach( note => {
      const id = note.attrs.id;
      if (!id.includes('auto')) { 
        this._registry.register(note, id); 
      }
    })
  }

  createVoiceFromNotes(staveNotes) {
    return this.score.voice(staveNotes);
  }

  /** Tells parent (vf-system) that this stave has finished creating its components */
  staveCreated() {
    const staveCreatedEvent = new CustomEvent('staveCreated', { bubbles: true });
    this.dispatchEvent(staveCreatedEvent);
  }

  /** Sets the score instance of the component that dispatched the event */
  setScore = (event) => {
    event.target.score = this.score;
  }

}

window.customElements.define('vf-stave', VFStave);
