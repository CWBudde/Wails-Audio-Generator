import { useState } from 'react';
import {
  SetFrequency,
  SetVolume,
  SetWaveform,
  SetOsc2Frequency,
  SetOsc2Volume,
  SetOsc2Waveform,
} from '../../wailsjs/go/main/App';
import { sliderToFrequency, frequencyToSlider, sliderToDB, dbToSlider, dbToLinear } from '../utils';
import { AUDIO_CONFIG, WaveformType } from '../types';
import { ControlMode, DEFAULT_CONTROL_MODE } from '../types/controlModes';

/** State interface for oscillator parameters */
export interface OscillatorState {
  /** Frequency slider position (0-1000) */
  sliderFreq: number;
  /** Volume slider position (0-1000) */
  sliderVolume: number;
  /** Selected waveform type */
  selectedWaveform: WaveformType;
  /** Current control mode */
  controlMode: ControlMode;
}

/** Control interface for oscillator interactions */
export interface OscillatorControls {
  /** Current oscillator state */
  state: OscillatorState;
  /** Handler for frequency slider changes */
  handleFrequencyChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handler for volume slider changes */
  handleVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handler for waveform selection changes */
  handleWaveformChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Copy settings from another oscillator state */
  copyFrom: (other: OscillatorState) => void;
}

/**
 * Custom hook for managing oscillator state and controls.
 *
 * Provides state management and event handlers for oscillator parameters including
 * frequency, volume, and waveform selection. Integrates with Wails backend to
 * synchronize UI changes with audio engine.
 *
 * Features:
 * - Frequency control with logarithmic scaling
 * - Volume control with dB to linear conversion
 * - Waveform selection
 * - Sync support for dual oscillator setups
 * - Settings copy functionality
 *
 * @param isOsc2 - Whether this is the second oscillator
 * @param initialFreq - Initial frequency in Hz (default: 440)
 * @param initialVolume - Initial volume in dB (default: 0)
 * @param initialWaveform - Initial waveform type (default: SINE)
 * @param syncEnabled - Whether oscillator sync is enabled
 * @returns Oscillator controls and state
 */
export const useOscillator = (
  isOsc2: boolean = false,
  initialFreq: number = 440,
  initialVolume: number = 0,
  initialWaveform: WaveformType = WaveformType.SINE,
  syncEnabled: boolean = false
): OscillatorControls => {
  const [state, setState] = useState<OscillatorState>({
    sliderFreq: frequencyToSlider(initialFreq) * AUDIO_CONFIG.slider.max,
    sliderVolume: dbToSlider(initialVolume) * AUDIO_CONFIG.slider.max,
    selectedWaveform: initialWaveform,
    controlMode: DEFAULT_CONTROL_MODE,
  });

  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSliderValue = parseFloat(event.target.value);
    setState(prev => ({ ...prev, sliderFreq: newSliderValue }));

    if (isOsc2) {
      if (!syncEnabled) {
        void SetOsc2Frequency(sliderToFrequency(newSliderValue / AUDIO_CONFIG.slider.max));
      }
    } else {
      void SetFrequency(sliderToFrequency(newSliderValue / AUDIO_CONFIG.slider.max));
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSliderValue = parseFloat(event.target.value);
    setState(prev => ({ ...prev, sliderVolume: newSliderValue }));

    const linearVolume = dbToLinear(sliderToDB(newSliderValue / AUDIO_CONFIG.slider.max));
    if (isOsc2) {
      void SetOsc2Volume(linearVolume);
    } else {
      void SetVolume(linearVolume);
    }
  };

  const handleWaveformChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newWaveform = parseInt(event.target.value);
    setState(prev => ({ ...prev, selectedWaveform: newWaveform }));

    if (isOsc2) {
      void SetOsc2Waveform(newWaveform);
    } else {
      void SetWaveform(newWaveform);
    }
  };

  const copyFrom = (other: OscillatorState) => {
    setState(other);

    if (isOsc2) {
      if (!syncEnabled) {
        void SetOsc2Frequency(sliderToFrequency(other.sliderFreq / AUDIO_CONFIG.slider.max));
      }
      void SetOsc2Volume(dbToLinear(sliderToDB(other.sliderVolume / AUDIO_CONFIG.slider.max)));
      void SetOsc2Waveform(other.selectedWaveform);
    } else {
      void SetFrequency(sliderToFrequency(other.sliderFreq / AUDIO_CONFIG.slider.max));
      void SetVolume(dbToLinear(sliderToDB(other.sliderVolume / AUDIO_CONFIG.slider.max)));
      void SetWaveform(other.selectedWaveform);
    }
  };

  return {
    state,
    handleFrequencyChange,
    handleVolumeChange,
    handleWaveformChange,
    copyFrom,
  };
};
