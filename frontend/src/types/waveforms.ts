export interface WaveformOption {
  value: number;
  label: string;
  symbol: string;
}

export enum WaveformType {
  SINE = 0,
  SQUARE = 1,
  TRIANGLE = 2,
  SAWTOOTH = 3,
  WHITE_NOISE = 4,
  PINK_NOISE = 5,
  BROWN_NOISE = 6,
}

export const WAVEFORMS: readonly WaveformOption[] = [
  { value: WaveformType.SINE, label: 'Sine', symbol: '~' },
  { value: WaveformType.SQUARE, label: 'Square', symbol: '⊓' },
  { value: WaveformType.TRIANGLE, label: 'Triangle', symbol: '△' },
  { value: WaveformType.SAWTOOTH, label: 'Sawtooth', symbol: '⟋' },
  { value: WaveformType.WHITE_NOISE, label: 'White Noise', symbol: '◇' },
  { value: WaveformType.PINK_NOISE, label: 'Pink Noise', symbol: '◈' },
  { value: WaveformType.BROWN_NOISE, label: 'Brown Noise', symbol: '◆' },
] as const;

export const isTonalWaveform = (waveform: WaveformType): boolean => {
  return waveform < WaveformType.WHITE_NOISE;
};

export const isNoiseWaveform = (waveform: WaveformType): boolean => {
  return waveform >= WaveformType.WHITE_NOISE;
};
