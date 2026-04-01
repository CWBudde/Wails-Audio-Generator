/**
 * Main Zustand store for the Audio Frequency Generator
 *
 * This store manages all global application state including audio playback,
 * oscillator controls, sweep functionality, and mixer settings. It provides
 * a centralized, type-safe state management solution with performance
 * optimizations and integration with the Wails backend.
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import {
  AppStore,
  AppState,
  AudioPlaybackActions,
  OscillatorActions,
  SweepActions,
  MixerActions,
} from './types';
import { WaveformType, MixMode, AUDIO_CONFIG } from '../types';
import { ControlMode, DEFAULT_CONTROL_MODE } from '../types/controlModes';
import { isTonalWaveform, isNoiseWaveform } from '../types/waveforms';
import { sliderToFrequency, sliderToDB, dbToLinear } from '../utils';
import {
  StartAudio,
  StopAudio,
  SetFrequency,
  SetVolume,
  SetWaveform,
  SetOsc2Frequency,
  SetOsc2Volume,
  SetOsc2Waveform,
  SetMixBalance,
  SetMixMode,
  SetDetune,
  SetSync,
  StartSweep1,
  StopSweep1,
  StartSweep2,
  StopSweep2,
} from '../../wailsjs/go/main/App';

/**
 * Initial state for the application
 */
const initialState: AppState = {
  audio: {
    isPlaying: false,
    isInitialized: false,
    error: null,
  },
  oscillator1: {
    sliderFreq: 440, // A4 note
    sliderVolume: 500, // -40dB (middle of range)
    selectedWaveform: WaveformType.SINE,
    controlMode: DEFAULT_CONTROL_MODE,
  },
  oscillator2: {
    sliderFreq: 440,
    sliderVolume: 500,
    selectedWaveform: WaveformType.SINE,
    controlMode: DEFAULT_CONTROL_MODE,
  },
  sweep1: {
    startFreq: 100,
    endFreq: 1000,
    duration: 5,
    isActive: false,
    progress: 0,
  },
  sweep2: {
    startFreq: 100,
    endFreq: 1000,
    duration: 5,
    isActive: false,
    progress: 0,
  },
  mixer: {
    mixBalance: 0.5,
    mixMode: MixMode.ADD,
    detune: 0,
    syncEnabled: false,
  },
};

/**
 * Create the main Zustand store with middleware
 */
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,

        // Audio playback actions
        audioActions: {
          startAudio: async () => {
            try {
              await StartAudio();
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  isPlaying: true,
                  error: null,
                },
              }));
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error: error instanceof Error ? error.message : 'Failed to start audio',
                  isPlaying: false,
                },
              }));
            }
          },

          stopAudio: async () => {
            try {
              await StopAudio();
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  isPlaying: false,
                  error: null,
                },
              }));
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error: error instanceof Error ? error.message : 'Failed to stop audio',
                },
              }));
            }
          },

          setError: (error: string | null) => {
            set(state => ({
              ...state,
              audio: {
                ...state.audio,
                error,
              },
            }));
          },

          initializeAudio: async () => {
            set(state => ({
              ...state,
              audio: {
                ...state.audio,
                isInitialized: true,
              },
            }));
          },
        } satisfies AudioPlaybackActions,

        // Oscillator actions
        oscillatorActions: {
          setFrequency: async (oscillator: 1 | 2, sliderValue: number) => {
            const frequency = sliderToFrequency(sliderValue / AUDIO_CONFIG.slider.max);

            try {
              if (oscillator === 1) {
                await SetFrequency(frequency);
                set(state => ({
                  ...state,
                  oscillator1: {
                    ...state.oscillator1,
                    sliderFreq: sliderValue,
                  },
                }));
              } else {
                const { mixer } = get();
                if (!mixer.syncEnabled) {
                  await SetOsc2Frequency(frequency);
                }
                set(state => ({
                  ...state,
                  oscillator2: {
                    ...state.oscillator2,
                    sliderFreq: sliderValue,
                  },
                }));
              }
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error: error instanceof Error ? error.message : 'Failed to set frequency',
                },
              }));
            }
          },

          setVolume: async (oscillator: 1 | 2, sliderValue: number) => {
            const linearVolume = dbToLinear(sliderToDB(sliderValue / AUDIO_CONFIG.slider.max));

            try {
              if (oscillator === 1) {
                await SetVolume(linearVolume);
                set(state => ({
                  ...state,
                  oscillator1: {
                    ...state.oscillator1,
                    sliderVolume: sliderValue,
                  },
                }));
              } else {
                await SetOsc2Volume(linearVolume);
                set(state => ({
                  ...state,
                  oscillator2: {
                    ...state.oscillator2,
                    sliderVolume: sliderValue,
                  },
                }));
              }
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error: error instanceof Error ? error.message : 'Failed to set volume',
                },
              }));
            }
          },

          setWaveform: async (oscillator: 1 | 2, waveform: WaveformType) => {
            const { oscillator1, oscillator2, sweep1, sweep2 } = get();
            const currentOscillator = oscillator === 1 ? oscillator1 : oscillator2;
            const currentSweep = oscillator === 1 ? sweep1 : sweep2;

            // Determine smart control mode based on waveform type and current state
            let newControlMode = currentOscillator.controlMode;

            if (isNoiseWaveform(waveform)) {
              // Noise waveforms are always locked to FIXED mode
              newControlMode = ControlMode.FIXED_FREQUENCY;
            } else if (isTonalWaveform(waveform)) {
              // For tonal waveforms:
              if (isNoiseWaveform(currentOscillator.selectedWaveform)) {
                // Switching from noise to tonal: default to FIXED mode
                newControlMode = ControlMode.FIXED_FREQUENCY;
              } else {
                // Switching between tonal waveforms: preserve current control mode
                newControlMode = currentOscillator.controlMode;
              }
            }

            try {
              if (oscillator === 1) {
                await SetWaveform(waveform);
                set(state => ({
                  ...state,
                  oscillator1: {
                    ...state.oscillator1,
                    selectedWaveform: waveform,
                    controlMode: newControlMode,
                  },
                }));
              } else {
                await SetOsc2Waveform(waveform);
                set(state => ({
                  ...state,
                  oscillator2: {
                    ...state.oscillator2,
                    selectedWaveform: waveform,
                    controlMode: newControlMode,
                  },
                }));
              }

              // If switching to noise while in sweep mode, stop the sweep
              if (isNoiseWaveform(waveform) && currentSweep.isActive) {
                if (oscillator === 1) {
                  await StopSweep1();
                  set(state => ({
                    ...state,
                    sweep1: {
                      ...state.sweep1,
                      isActive: false,
                      progress: 0,
                    },
                  }));
                } else {
                  await StopSweep2();
                  set(state => ({
                    ...state,
                    sweep2: {
                      ...state.sweep2,
                      isActive: false,
                      progress: 0,
                    },
                  }));
                }
              }
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error: error instanceof Error ? error.message : 'Failed to set waveform',
                },
              }));
            }
          },

          setControlMode: (oscillator: 1 | 2, mode: ControlMode) => {
            const { oscillator1, oscillator2, sweep1, sweep2 } = get();
            const currentOscillator = oscillator === 1 ? oscillator1 : oscillator2;
            const currentSweep = oscillator === 1 ? sweep1 : sweep2;

            // Validation: Don't allow SWEEP mode for noise waveforms
            if (mode === ControlMode.SWEEP && isNoiseWaveform(currentOscillator.selectedWaveform)) {
              console.warn(
                `Cannot set SWEEP mode for noise waveform ${currentOscillator.selectedWaveform}`
              );
              return;
            }

            // Validation: Don't allow mode switching while sweep is active
            if (currentSweep.isActive && mode !== currentOscillator.controlMode) {
              console.warn(`Cannot change control mode while sweep is active`);
              return;
            }

            if (oscillator === 1) {
              set(state => ({
                ...state,
                oscillator1: {
                  ...state.oscillator1,
                  controlMode: mode,
                },
              }));
            } else {
              set(state => ({
                ...state,
                oscillator2: {
                  ...state.oscillator2,
                  controlMode: mode,
                },
              }));
            }
          },

          copyOsc1ToOsc2: async () => {
            const { oscillator1, mixer } = get();

            try {
              // Copy frequency (if sync is not enabled)
              if (!mixer.syncEnabled) {
                const frequency = sliderToFrequency(
                  oscillator1.sliderFreq / AUDIO_CONFIG.slider.max
                );
                await SetOsc2Frequency(frequency);
              }

              // Copy volume
              const linearVolume = dbToLinear(
                sliderToDB(oscillator1.sliderVolume / AUDIO_CONFIG.slider.max)
              );
              await SetOsc2Volume(linearVolume);

              // Copy waveform
              await SetOsc2Waveform(oscillator1.selectedWaveform);

              set(state => ({
                ...state,
                oscillator2: { ...oscillator1 },
              }));
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error:
                    error instanceof Error ? error.message : 'Failed to copy oscillator settings',
                },
              }));
            }
          },
        } satisfies OscillatorActions,

        // Sweep actions
        sweepActions: {
          startSweep: async (
            oscillator: 1 | 2,
            startFreq: number,
            endFreq: number,
            duration: number
          ) => {
            try {
              if (oscillator === 1) {
                await StartSweep1(startFreq, endFreq, duration);
                set(state => ({
                  ...state,
                  sweep1: {
                    ...state.sweep1,
                    startFreq,
                    endFreq,
                    duration,
                    isActive: true,
                    progress: 0,
                  },
                }));
              } else {
                await StartSweep2(startFreq, endFreq, duration);
                set(state => ({
                  ...state,
                  sweep2: {
                    ...state.sweep2,
                    startFreq,
                    endFreq,
                    duration,
                    isActive: true,
                    progress: 0,
                  },
                }));
              }
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error: error instanceof Error ? error.message : 'Failed to start sweep',
                },
              }));
            }
          },

          stopSweep: async (oscillator: 1 | 2) => {
            try {
              if (oscillator === 1) {
                await StopSweep1();
                set(state => ({
                  ...state,
                  sweep1: {
                    ...state.sweep1,
                    isActive: false,
                    progress: 0,
                  },
                }));
              } else {
                await StopSweep2();
                set(state => ({
                  ...state,
                  sweep2: {
                    ...state.sweep2,
                    isActive: false,
                    progress: 0,
                  },
                }));
              }
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error: error instanceof Error ? error.message : 'Failed to stop sweep',
                },
              }));
            }
          },

          updateSweepConfig: (
            oscillator: 1 | 2,
            startFreq: number,
            endFreq: number,
            duration: number
          ) => {
            if (oscillator === 1) {
              set(state => ({
                ...state,
                sweep1: {
                  ...state.sweep1,
                  startFreq,
                  endFreq,
                  duration,
                },
              }));
            } else {
              set(state => ({
                ...state,
                sweep2: {
                  ...state.sweep2,
                  startFreq,
                  endFreq,
                  duration,
                },
              }));
            }
          },

          updateSweepProgress: (oscillator: 1 | 2, progress: number) => {
            const clampedProgress = Math.max(0, Math.min(1, progress));
            if (oscillator === 1) {
              set(state => ({
                ...state,
                sweep1: {
                  ...state.sweep1,
                  progress: clampedProgress,
                },
              }));
            } else {
              set(state => ({
                ...state,
                sweep2: {
                  ...state.sweep2,
                  progress: clampedProgress,
                },
              }));
            }
          },
        } satisfies SweepActions,

        // Mixer actions
        mixerActions: {
          setMixBalance: async (balance: number) => {
            try {
              await SetMixBalance(balance);
              set(state => ({
                ...state,
                mixer: {
                  ...state.mixer,
                  mixBalance: balance,
                },
              }));
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error: error instanceof Error ? error.message : 'Failed to set mix balance',
                },
              }));
            }
          },

          setMixMode: async (mode: MixMode) => {
            try {
              await SetMixMode(mode);
              set(state => ({
                ...state,
                mixer: {
                  ...state.mixer,
                  mixMode: mode,
                },
              }));
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error: error instanceof Error ? error.message : 'Failed to set mix mode',
                },
              }));
            }
          },

          setDetune: async (detune: number) => {
            try {
              await SetDetune(detune);
              set(state => ({
                ...state,
                mixer: {
                  ...state.mixer,
                  detune,
                },
              }));
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error: error instanceof Error ? error.message : 'Failed to set detune',
                },
              }));
            }
          },

          toggleSync: async () => {
            const { mixer } = get();
            const newSyncEnabled = !mixer.syncEnabled;

            try {
              await SetSync(newSyncEnabled);
              set(state => ({
                ...state,
                mixer: {
                  ...state.mixer,
                  syncEnabled: newSyncEnabled,
                },
              }));
            } catch (error) {
              set(state => ({
                ...state,
                audio: {
                  ...state.audio,
                  error: error instanceof Error ? error.message : 'Failed to toggle sync',
                },
              }));
            }
          },
        } satisfies MixerActions,
      }),
      {
        name: 'audio-generator-store',
        storage: createJSONStorage(() => localStorage),
        // Only persist non-runtime state
        partialize: state => ({
          oscillator1: state.oscillator1,
          oscillator2: state.oscillator2,
          sweep1: {
            startFreq: state.sweep1.startFreq,
            endFreq: state.sweep1.endFreq,
            duration: state.sweep1.duration,
            // Don't persist runtime state
            isActive: false,
            progress: 0,
          },
          sweep2: {
            startFreq: state.sweep2.startFreq,
            endFreq: state.sweep2.endFreq,
            duration: state.sweep2.duration,
            isActive: false,
            progress: 0,
          },
          mixer: state.mixer,
        }),
        version: 1,
      }
    ),
    {
      name: 'AudioGenerator',
    }
  )
);

/**
 * Pre-defined selector functions for common state access patterns
 * These can be used directly with useAppStore for type-safe state selection
 */
export const selectors = {
  // Audio state selectors
  audio: (state: AppStore) => state.audio,
  isPlaying: (state: AppStore) => state.audio.isPlaying,
  audioError: (state: AppStore) => state.audio.error,

  // Oscillator state selectors
  oscillator1: (state: AppStore) => state.oscillator1,
  oscillator2: (state: AppStore) => state.oscillator2,
  oscillators: (state: AppStore) => [state.oscillator1, state.oscillator2] as const,

  // Sweep state selectors
  sweep1: (state: AppStore) => state.sweep1,
  sweep2: (state: AppStore) => state.sweep2,
  anySweepActive: (state: AppStore) => state.sweep1.isActive || state.sweep2.isActive,

  // Mixer state selectors
  mixer: (state: AppStore) => state.mixer,
  mixBalance: (state: AppStore) => state.mixer.mixBalance,
  syncEnabled: (state: AppStore) => state.mixer.syncEnabled,

  // Action selectors
  audioActions: (state: AppStore) => state.audioActions,
  oscillatorActions: (state: AppStore) => state.oscillatorActions,
  sweepActions: (state: AppStore) => state.sweepActions,
  mixerActions: (state: AppStore) => state.mixerActions,
};
