import Vex from '../index';
import './vf-stave';

const template = document.createElement('template');
template.innerHTML = `
`;

export class VFVoice extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(document.importNode(template.content, true));

    // Defaults
    this.stem = 'up';
    this.autoBeam = false;

    this.notes = [];
    this.beams = [];

    this._vf = undefined;
    this._score = undefined;
  }

  connectedCallback() {
    this.stem = this.getAttribute('stem') || this.stem;
    this.autoBeam = this.hasAttribute('autoBeam');
    this.notesText = this.textContent.trim();

    const vfVoiceReadyEvent = new CustomEvent('vfVoiceReady', { bubbles: true });
    this.dispatchEvent(vfVoiceReadyEvent);
  }

  set vf(value) {
    this._vf = value;
    this.createNotes();
  }

  set score(value) {
    this._score = value;
    this.createNotes();
  }

  createNotes = () => {
    if (this._vf && this._score) {
      const notes = this.createNotesFromText();
      // Maintaining notes in an array to set-up for future child components that will return their own notes
      this.notes.push(...notes);
      if (this.autoBeam) {
        this.beams.push(...this.autoGenerateBeams(notes));
      }

      const notesAndBeamsCreatedEvent = new CustomEvent('notesCreated', { bubbles: true, detail: { notes: this.notes, beams: this.beams } });
      this.dispatchEvent(notesAndBeamsCreatedEvent);
    }
  }

  /** Returns StaveNotes, generated from a string. Leverages the EasyScore Parser */
  createNotesFromText() {
    this._score.set({ stem: this.stem });
    const staveNotes = this._score.notes(this.notesText);
    return staveNotes;
  }

  autoGenerateBeams(notes) {
    // TODO: use default groups? 
    // const groups = Vex.Flow.Beam.getDefaultBeamGroups(this._score.defaults.time);
    // const beams = Vex.Flow.Beam.generateBeams(notes, {
    //   groups: groups
    // });
    const beams = Vex.Flow.Beam.generateBeams(notes);
    beams.forEach( beam => {
      this._vf.renderQ.push(beam);
    })
    return beams;
  }
}

window.customElements.define('vf-voice', VFVoice);
