export type EnhancementState = {
    brightness: number;
    contrast: number;
    gamma: number;
    sharpen: number;
    clarity: number;
    denoise: number;
    scale: number;
    rotate: number;
    flipH: boolean;
    flipV: boolean;
    saturation: number;
    temperature: number;
    tint: number;
  };
  
  export const DEFAULT_ENH: EnhancementState = {
    brightness: 0,
    contrast: 0,
    gamma: 1.0,
    sharpen: 0,
    clarity: 0,
    denoise: 0,
    scale: 1.0,
    rotate: 0,
    flipH: false,
    flipV: false,
    saturation: 0,
    temperature: 0,
    tint: 0,
  };