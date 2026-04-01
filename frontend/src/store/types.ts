/**
 * Global state management types for the Audio Frequency Generator
 *
 * This file defines the TypeScript interfaces for our Zustand-based
 * state management system, providing type safety and clear contracts
 * for all state operations.
 */

import { WaveformType, MixMode } from '../types';
import { ControlMode } from '../types/controlModes';

/**
 * Audio playback state interface
 */
export interface AudioPlaybackState {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Audio system initialization status */
  isInitialized: boolean;
  /** Current error message, if any */
  error: string | null;
}

/**
 * Individual oscillator state interface
 */
export interface OscillatorState {
  /** Frequency slider position (0-1000) */
  sliderFreq: number;
  /** Volume slider position (0-1000) */
  sliderVolume: number;
  /** Selected waveform type */
  selectedWaveform: WaveformType;
  /** Current control mode (Fixed Frequency or Sweep) */
  controlMode: ControlMode;
}

/**
 * Sweep configuration state interface
 */
export interface SweepState {
  /** Start frequency for sweep (Hz) */
  startFreq: number;
  /** End frequency for sweep (Hz) */
  endFreq: number;
  /** Sweep duration (seconds) */
  duration: number;
  /** Whether sweep is currently active */
  isActive: boolean;
  /** Sweep progress (0-1) */
  progress: number;
}

/**
 * Mixer controls state interface
 */
export interface MixerState {
  /** Mix balance between oscillators (0-1) */
  mixBalance: number;
  /** Current mixing mode */
  mixMode: MixMode;
  /** Detune amount in cents */
  detune: number;
  /** Whether oscillator sync is enabled */
  syncEnabled: boolean;
}

/**
 * Complete application state interface
 */
export interface AppState {
  /** Audio playback controls and status */
  audio: AudioPlaybackState;
  /** First oscillator state */
  oscillator1: OscillatorState;
  /** Second oscillator state */
  oscillator2: OscillatorState;
  /** First oscillator sweep configuration */
  sweep1: SweepState;
  /** Second oscillator sweep configuration */
  sweep2: SweepState;
  /** Mixer controls and configuration */
  mixer: MixerState;
}

/**
 * Audio playback actions interface
 */
export interface AudioPlaybackActions {
  /** Start audio playback */
  startAudio: () => Promise<void>;
  /** Stop audio playback */
  stopAudio: () => Promise<void>;
  /** Set audio error state */
  setError: (error: string | null) => void;
  /** Initialize audio system */
  initializeAudio: () => Promise<void>;
}

/**
 * Oscillator actions interface
 */
export interface OscillatorActions {
  /** Update oscillator frequency */
  setFrequency: (oscillator: 1 | 2, sliderValue: number) => Promise<void>;
  /** Update oscillator volume */
  setVolume: (oscillator: 1 | 2, sliderValue: number) => Promise<void>;
  /** Update oscillator waveform */
  setWaveform: (oscillator: 1 | 2, waveform: WaveformType) => Promise<void>;
  /** Set oscillator control mode */
  setControlMode: (oscillator: 1 | 2, mode: ControlMode) => void;
  /** Copy oscillator 1 settings to oscillator 2 */
  copyOsc1ToOsc2: () => Promise<void>;
}

/**
 * Sweep actions interface
 */
export interface SweepActions {
  /** Start frequency sweep */
  startSweep: (
    oscillator: 1 | 2,
    startFreq: number,
    endFreq: number,
    duration: number
  ) => Promise<void>;
  /** Stop frequency sweep */
  stopSweep: (oscillator: 1 | 2) => Promise<void>;
  /** Update sweep configuration */
  updateSweepConfig: (
    oscillator: 1 | 2,
    startFreq: number,
    endFreq: number,
    duration: number
  ) => void;
  /** Update sweep progress */
  updateSweepProgress: (oscillator: 1 | 2, progress: number) => void;
}

/**
 * Mixer actions interface
 */
export interface MixerActions {
  /** Set mix balance between oscillators */
  setMixBalance: (balance: number) => Promise<void>;
  /** Set mixing mode */
  setMixMode: (mode: MixMode) => Promise<void>;
  /** Set detune amount */
  setDetune: (detune: number) => Promise<void>;
  /** Toggle oscillator sync */
  toggleSync: () => Promise<void>;
}

/**
 * Complete store interface combining state and actions
 */
export interface AppStore extends AppState {
  // Action groups
  audioActions: AudioPlaybackActions;
  oscillatorActions: OscillatorActions;
  sweepActions: SweepActions;
  mixerActions: MixerActions;
}

/**
 * Store selectors for optimized component subscriptions
 */
export interface AppSelectors {
  /** Select only audio playback state */
  selectAudio: (state: AppStore) => AudioPlaybackState;
  /** Select only oscillator 1 state */
  selectOscillator1: (state: AppStore) => OscillatorState;
  /** Select only oscillator 2 state */
  selectOscillator2: (state: AppStore) => OscillatorState;
  /** Select only mixer state */
  selectMixer: (state: AppStore) => MixerState;
  /** Select both oscillator states */
  selectOscillators: (state: AppStore) => [OscillatorState, OscillatorState];
  /** Select current playback status */
  selectIsPlaying: (state: AppStore) => boolean;
  /** Select whether any sweeps are active */
  selectAnySweepActive: (state: AppStore) => boolean;
}
