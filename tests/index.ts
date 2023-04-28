// vexflow-debug-with-tests.ts includes this module via:
//   export * from '../../tests';
//
// To add a new test module, add a new line:
//   `export * from './xxxx_tests';`
// to this file that points to the new file `xxxx_tests.ts`.
//
// The test module needs to call VexFlowTests.register(...).
// For example, in annotation_tests.ts, the last two lines are:
//   VexFlowTests.register(AnnotationTests);
//   export { AnnotationTests };
//
// In vexflow_test_helpers.ts: VexFlowTests.run() will run all registered tests.
//
// To iterate faster during development, you can comment out most of this file
// and focus on just testing the module(s) you are currently working on.

export * from './accidental_tests';
export * from './annotation_tests';
export * from './articulation_tests';
export * from './auto_beam_formatting_tests';
export * from './bach_tests';
export * from './barline_tests';
export * from './beam_tests';
export * from './bend_tests';
export * from './boundingbox_tests';
export * from './chordsymbol_tests';
export * from './clef_tests';
export * from './crossbeam_tests';
export * from './curve_tests';
export * from './dot_tests';
export * from './easyscore_tests';
export * from './factory_tests';
export * from './font_tests';
export * from './formatter_tests';
export * from './fraction_tests';
export * from './ghostnote_tests';
export * from './glyphnote_tests';
export * from './gracenote_tests';
export * from './gracetabnote_tests';
export * from './key_clef_tests';
export * from './keymanager_tests';
export * from './keysignature_tests';
export * from './modifier_tests';
export * from './multimeasurerest_tests';
export * from './music_tests';
export * from './notehead_tests';
export * from './notesubgroup_tests';
export * from './offscreencanvas_tests';
export * from './ornament_tests';
export * from './parser_tests';
export * from './pedalmarking_tests';
export * from './percussion_tests';
export * from './registry_tests';
export * from './renderer_tests';
export * from './rests_tests';
export * from './rhythm_tests';
export * from './stave_tests';
export * from './staveconnector_tests';
export * from './stavehairpin_tests';
export * from './staveline_tests';
export * from './stavemodifier_tests';
export * from './stavenote_tests';
export * from './stavetie_tests';
export * from './stringnumber_tests';
export * from './strokes_tests';
export * from './style_tests';
export * from './tabnote_tests';
export * from './tabslide_tests';
export * from './tabstave_tests';
export * from './tabtie_tests';
export * from './textbracket_tests';
export * from './textformatter_tests';
export * from './textnote_tests';
export * from './threevoice_tests';
export * from './tickcontext_tests';
export * from './timesignature_tests';
export * from './tremolo_tests';
export * from './tuning_tests';
export * from './tuplet_tests';
export * from './typeguard_tests';
export * from './unison_tests';
export * from './vf_prefix_tests';
export * from './vibrato_tests';
export * from './vibratobracket_tests';
export * from './voice_tests';
