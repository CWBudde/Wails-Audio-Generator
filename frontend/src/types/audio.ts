export interface FrequencyRange {
  readonly min: number;
  readonly max: number;
}

export interface VolumeRange {
  readonly minDb: number;
  readonly maxDb: number;
}

export interface SliderConfig {
  readonly min: number;
  readonly max: number;
}

export interface AudioConfig {
  readonly frequency: FrequencyRange;
  readonly volume: VolumeRange;
  readonly slider: SliderConfig;
}

export const AUDIO_CONFIG: AudioConfig = {
  frequency: {
    min: 20, // 20 Hz
    max: 20000, // 20 kHz
  },
  volume: {
    minDb: -80,
    maxDb: 0,
  },
  slider: {
    min: 0,
    max: 1000,
  },
} as const;
