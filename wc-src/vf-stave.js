import Vex from '../src/index.js';
import './vf-score';
import './vf-voice';

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
    // this.notes = [];
    // this.timeSig = '4/4';
    // this.clef = 'treble';
    // this.keySig = 'C';

    this.attachShadow({ mode:'open' });
    this.shadowRoot.appendChild(document.importNode(template.content, true));

    this.addEventListener('voiceAdded', this.voiceAdded);

    console.log('vf-stave constructor')
  }

  connectedCallback() {
    this.clef = this.getAttribute('clef');
    this.timeSig = this.getAttribute('timeSig');
    this.keySig = this.getAttribute('keySig');

    this.setupStave();
    this.setupFactoryScore();

    this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.onSlotChange);
    console.log('vf-stave connectedCallback')
  }

  setupStave() { // add attributes for size? 
    this.stave = new Vex.Flow.Stave(10, 40, 400);
    const getContextEvent = new CustomEvent('getContext', { bubbles: true, detail: {context: null } });
    this.dispatchEvent(getContextEvent);
    this.context = getContextEvent.detail.context;
    this.stave.setContext(this.context);

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

  setupFactoryScore() {
    var vf = new Vex.Flow.Factory({renderer: {elementId: null}});
    vf.stave = this.stave
    this.score = vf.EasyScore();
    this.score.set({
      clef: this.clef,
      time: this.timeSig
    });
  }

  onSlotChange = () => {
    const slotElements = this.shadowRoot.querySelector('slot').assignedElements();
    // Generate all voices first, then draw to make sure alignment is correct
    slotElements.forEach( element => {
      if (element.nodeName === 'VF-VOICE') {
        this.addVoice(element);
      }
    });
    this.formatAndDrawVoices();
  }

  addVoice(vfVoice) {
    this.clef = vfVoice.clef;

    // With parser
    const results = this.createNotesAndVoice(vfVoice.notesText, vfVoice.stem);
    const staveNotes = results[0];
    const voice = results[1];
    console.log('parsed voice (hopefully)');
    console.log(voice);
    this.voices.push(voice);
    
    if (vfVoice.generateBeams) {
      this.beams = this.beams.concat(this.createBeams(staveNotes)); 
      console.log(this.beams);
    }
  }

  createNotesAndVoice(line, stemDirection) {
    this.score.set({ stem: stemDirection });

    const staveNotes = this.score.notes(line);
    const voice = this.score.voice(staveNotes);
    return [staveNotes, voice];
  }

  createBeams(notes) {
    console.log(notes);
    const beams = Vex.Flow.Beam.generateBeams(notes);
    console.log(beams);
    return beams;
  }

  formatAndDrawVoices() {
    var formatter = new Vex.Flow.Formatter()
    formatter.joinVoices(this.voices);
    formatter.formatToStave(this.voices, this.stave);
    this.voices.forEach(voice => voice.draw(this.context, this.stave));

    this.beams.forEach(beam => beam.setContext(this.context).draw());
  }

}

window.customElements.define('vf-stave', VFStave);