import {StaveNote} from "../stavenote";
import {Fraction} from "../fraction";

export interface IBeam {
  start: number,
  end: number
}

export interface IBeamRenderOptions {
  flat_beam_offset: number;
  flat_beams: boolean;
  secondary_break_ticks: number;
  show_stemlets: boolean;
  beam_width: number;
  max_slope: number;
  min_slope: number;
  slope_iterations: number;
  slope_cost: number;
  stemlet_extension: number;
  partial_beam_length: number;
  min_flat_beam_offset: number;
}

export interface IGenerateBeamConfig {
  flat_beam_offset: number;
  flat_beams: boolean;
  secondary_breaks: string;
  show_stemlets: boolean;
  maintain_stem_directions: StaveNote;
  beam_middle_only: boolean;
  beam_rests: boolean;
  groups: Fraction[];
  stem_direction: number;
}
