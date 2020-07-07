// ## Description
// 
// This file implements `vf-stave`, the web component that resembles 
// the `Stave` element. One `vf-stave` can have multiple `vf-voice` children. 
// `vf-stave` is responsible for keeping track of its children and creating 
// the voices once they finish generating their notes. 
// Once the voices are created, `vf-stave` dispatches an event to its parent
// `vf-system` to signal that it's ready to be created and added to the system. 

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

    // The 'notesCreated' event is dispatched by a vf-voice when it has finished generating 
    // its notes. vf-stave listens to this event so that it can get that vf-voice's notes 
    // and generate a Voice from it. 
    this.addEventListener('notesCreated', this.addVoice);

    // The 'vfVoiceReady' event is dispatched by a vf-voice when it's added to the DOM. 
    // vf-stave listens to this event so that it can set the vf-voice's EasyScore instance,
    // since a single EasyScore instance is shared by a vf-stave and all its children. 
    this.addEventListener('vfVoiceReady', this.setScore);
  }

  connectedCallback() {
    this.clef = this.getAttribute('clef');
    this.timeSig = this.getAttribute('timeSig');
    this.keySig = this.getAttribute('keySig');

    const vfStaveReadyEvent = new CustomEvent('vfStaveReady', { bubbles: true });
    this.dispatchEvent(vfStaveReadyEvent);

    // vf-stave listens to the slotchange event so that it can detect its voices and establish
    // how many voices it expects to receive events from. 
    this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.registerVoices);
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('slot').removeEventListener('slotchange', this.registerVoices);
  }

  /**
   * Setter to detect when the Factory instance is set. Once the Factory is set,
   * vf-stave can start creating components. 
   * 
   * @param {Vex.Flow.Factory} value - The Factory instance that the overall 
   *                                   component is using, set by the parent vf-score.
   */
  set vf(value) {
    this._vf = value;
    this.setupScore();
  }

  /**
   * Setter to detect when the Registry instance is set.
   * 
   * @param {Vex.Flow.Factory} value - The Registry instance that the overall 
   *                                   component is using, set by the parent vf-score.
   */
  set registry(value) {
    this._registry = value;
  }

  /** 
   * Sets up the EasyScore instance to be used by the overall component. One EasyScore instance
   * is used for vf-stave and its children so that the clef and time can be set by the stave and 
   * don't have to be provided as attributes on the children or set on the childrne. 
   */
  setupScore() {
    this.score = this._vf.EasyScore();
    // Defaults to treble clef, 4/4 time if not specified
    this.score.set({
      clef: this.clef || 'treble',
      time: this.timeSig || '4/4'
    });
  }
  
  /** 
   * The slotchange event listener. This event listener sets the number of vf-voices that this 
   * vf-stave expects to receive dispatched event from.
   */
  registerVoices = () => {
    const voiceSlots = this.shadowRoot.querySelector('slot').assignedElements().filter(e => e.nodeName === 'VF-VOICE');
    this.numVoices = voiceSlots.length;

    // Perform this check at the end of slotchange listener to catch the case in which all of 
    // the vf-voice children dispatch events before the slot change completes. 
    if (this.voices.length === this.numVoices) {
      this.staveCreated();
    }
  }

  /** 
   * This is the event listener for when a vf-voice has finished creating its notes.
   * Creates a Vex.Flow.Voice from the vf-voice's notes and adds the resulting voice
   * and the vf-voice's beams to the corresponding arrays maintained by the vf-stave.
   * 
   * @param {Event} e - The event, where e.target is a vf-voice.
   * @param {[Vex.Flow.StaveNote]} e.detail.notes - The notes that belong to e.target.
   * @param {[Vex.Flow.Beam]} e.detail.beams - The beams that belong to e.target.
   */
  addVoice = (e) => {
    const notes = e.detail.notes;
    this.registerNotes(notes);
    const beams = e.detail.beams; 
    const voice = this.createVoiceFromNotes(notes);

    this.voices.push(voice);
    this.beams = this.beams.concat(beams);

    // Check to ensure that all voices have been created before telling the parent vf-system
    // that it's ready to be created and added to the system. 
    if (this.voices.length === this.numVoices) {
      this.staveCreated();
    }
  }

  /** 
   * Register notes that have non-auto-generated IDs to the score's registry 
   * 
   * @param {[Vex.Flow.StaveNote]} staveNotes - The notes to register. 
   */
  registerNotes(staveNotes) {
    staveNotes.forEach( note => {
      const id = note.attrs.id;
      // Only register the notes that have a non-auto-generated ID. 
      if (!id.includes('auto')) { 
        this._registry.register(note, id); 
      }
    })
  }

  /**
   * Creates a Voice from the provided notes.
   * 
   * @param {[Vex.Flow.StaveNote]} staveNotes - The notes to create the voice from. 
   * @return {Vex.Flow.Voice} The Voice generated from the provided notes.
   */
  createVoiceFromNotes(staveNotes) {
    return this.score.voice(staveNotes);
  }

  /** 
   * Tells the parent vf-system that this vf-stave has finished creating its voices 
   * and is ready to be added to the system.  
   */
  staveCreated() {
    const staveCreatedEvent = new CustomEvent('staveCreated', { bubbles: true });
    this.dispatchEvent(staveCreatedEvent);
  }

  /** 
   * Sets the score instance of the component that dispatched the event. 
   */
  setScore = (event) => {
    event.target.score = this.score;
  }

}

window.customElements.define('vf-stave', VFStave);
