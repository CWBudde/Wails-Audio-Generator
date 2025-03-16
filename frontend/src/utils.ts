// Frequency range (logarithmic mapping)
export const MIN_FREQ = 20; // 20 Hz
export const MAX_FREQ = 20000; // 20 kHz

// Compute scale factor dynamically
export const SCALE_FACTOR = 1.0 / Math.log10(MAX_FREQ / MIN_FREQ);

// Volume range (dB)
export const MIN_DB = -80;
export const MAX_DB = 0;

/**
 * Convert a linear slider value (0-1000) to a logarithmic frequency (20-20000 Hz)
 */
export const sliderToFrequency = (sliderValue: number): number => {
  return MIN_FREQ * Math.pow(10, sliderValue / SCALE_FACTOR);
};

/**
 * Convert a frequency (20-20000 Hz) to a linear slider position (0-1000)
 */
export const frequencyToSlider = (freq: number): number => {
  return SCALE_FACTOR * Math.log10(freq / MIN_FREQ);
};

/**
 * Convert slider position (0-1000) to dB scale (-80 to 0 dB)
 */
export const sliderToDB = (sliderValue: number): number => {
  return MIN_DB + sliderValue * (MAX_DB - MIN_DB);
};

/**
 * Convert dB (-80 to 0) to slider position (0-1000)
 */
export const dbToSlider = (db: number): number => {
  return (db - MIN_DB) / (MAX_DB - MIN_DB);
};

/**
 * Convert dB to a linear amplitude scale (0-1)
 */
export const dbToLinear = (db: number): number => {
  if (db <= MIN_DB) return 0;
  return Math.pow(10, db / 20);
};

/**
 * Convert linear amplitude (0-1) to dB
 */
export const linearToDB = (linear: number): number => {
  if (linear <= 0.000001) return MIN_DB;
  return 20 * Math.log10(linear);
};

/**
 * Format frequency for display
 * - Uses Hz below 10,000 Hz
 * - Uses kHz above 10,000 Hz
 */
export const formatFrequency = (freq: number): string => {
  return freq >= 10000
    ? `${(freq / 1000).toFixed(1)} kHz`
    : `${Math.round(freq)} Hz`;
};
