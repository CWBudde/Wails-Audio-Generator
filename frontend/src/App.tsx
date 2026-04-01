/**
 * Main Application Component with Zustand State Management
 *
 * This is the updated App component that uses our new Zustand-based state
 * management system instead of individual custom hooks. This provides better
 * performance, state persistence, and a more maintainable architecture.
 */

import React from 'react';
import { useAppStore } from './store';
import { OscillatorPanel, MixerControls, PlaybackControls, WaveformVisualizer } from './components';
import { sliderToFrequency } from './utils';

const App: React.FC = () => {
  // Use Zustand store selectors for optimal performance
  const audioState = useAppStore(state => state.audio);
  const oscillator1 = useAppStore(state => state.oscillator1);
  const oscillator2 = useAppStore(state => state.oscillator2);
  const sweep1 = useAppStore(state => state.sweep1);
  const sweep2 = useAppStore(state => state.sweep2);
  const mixer = useAppStore(state => state.mixer);

  // Action selectors
  const audioActions = useAppStore(state => state.audioActions);
  const oscillatorActions = useAppStore(state => state.oscillatorActions);
  const sweepActions = useAppStore(state => state.sweepActions);
  const mixerActions = useAppStore(state => state.mixerActions);

  // Create adapters for component compatibility
  const audioControls = {
    state: audioState,
    handlePlay: audioActions.startAudio,
    handleStop: audioActions.stopAudio,
  };

  const osc1Controls = {
    state: oscillator1,
    handleFrequencyChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      void oscillatorActions.setFrequency(1, value);
    },
    handleVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      void oscillatorActions.setVolume(1, value);
    },
    handleWaveformChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(event.target.value);
      void oscillatorActions.setWaveform(1, value);
    },
    copyFrom: () => {
      // Not used for oscillator 1
    },
  };

  const osc2Controls = {
    state: oscillator2,
    handleFrequencyChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      void oscillatorActions.setFrequency(2, value);
    },
    handleVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      void oscillatorActions.setVolume(2, value);
    },
    handleWaveformChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(event.target.value);
      void oscillatorActions.setWaveform(2, value);
    },
    copyFrom: (_sourceState: typeof oscillator1) => {
      void oscillatorActions.copyOsc1ToOsc2();
    },
  };

  const sweep1Controls = {
    state: {
      startFreq: sweep1.startFreq,
      endFreq: sweep1.endFreq,
      duration: sweep1.duration,
      isSweeping: sweep1.isActive,
    },
    setStartFreq: (freq: number) => {
      sweepActions.updateSweepConfig(1, freq, sweep1.endFreq, sweep1.duration);
    },
    setEndFreq: (freq: number) => {
      sweepActions.updateSweepConfig(1, sweep1.startFreq, freq, sweep1.duration);
    },
    setDuration: (duration: number) => {
      sweepActions.updateSweepConfig(1, sweep1.startFreq, sweep1.endFreq, duration);
    },
    startSweep: () => {
      void sweepActions.startSweep(1, sweep1.startFreq, sweep1.endFreq, sweep1.duration);
    },
    stopSweep: () => {
      void sweepActions.stopSweep(1);
    },
  };

  const sweep2Controls = {
    state: {
      startFreq: sweep2.startFreq,
      endFreq: sweep2.endFreq,
      duration: sweep2.duration,
      isSweeping: sweep2.isActive,
    },
    setStartFreq: (freq: number) => {
      sweepActions.updateSweepConfig(2, freq, sweep2.endFreq, sweep2.duration);
    },
    setEndFreq: (freq: number) => {
      sweepActions.updateSweepConfig(2, sweep2.startFreq, freq, sweep2.duration);
    },
    setDuration: (duration: number) => {
      sweepActions.updateSweepConfig(2, sweep2.startFreq, sweep2.endFreq, duration);
    },
    startSweep: () => {
      void sweepActions.startSweep(2, sweep2.startFreq, sweep2.endFreq, sweep2.duration);
    },
    stopSweep: () => {
      void sweepActions.stopSweep(2);
    },
  };

  const mixerControls = {
    state: mixer,
    handleMixBalanceChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value) / 1000; // Convert from slider range
      void mixerActions.setMixBalance(value);
    },
    handleMixModeChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(event.target.value);
      void mixerActions.setMixMode(value);
    },
    handleDetuneChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      void mixerActions.setDetune(value);
    },
    handleSyncToggle: () => {
      void mixerActions.toggleSync();
    },
  };

  // Handle copying OSC1 settings to OSC2
  const handleCopyOsc1ToOsc2 = () => {
    void oscillatorActions.copyOsc1ToOsc2();
  };

  // Display error messages if any
  const errorDisplay = audioState.error && (
    <div className="bg-red-50 text-red-700 p-2 m-2 rounded border border-red-200 flex items-center justify-between">
      <span>Error: {audioState.error}</span>
      <button
        onClick={() => audioActions.setError(null)}
        className="ml-2 text-xs bg-red-200 hover:bg-red-300 text-red-800 px-2 py-1 rounded transition-colors duration-200"
      >
        ×
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-studio-black text-studio-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-8 sm:mb-12 relative">
          <h1 className="main-title text-3xl sm:text-4xl lg:text-5xl font-bold font-futura mb-4 animate-slide-down">
            <span className="bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-pink bg-clip-text text-transparent animate-neon-pulse">
              AUDIO FREQUENCY
            </span>
          </h1>
          <h2 className="main-subtitle text-lg sm:text-xl lg:text-2xl font-futura text-studio-dark-200 tracking-widest">
            GENERATOR
          </h2>
          <div className="absolute inset-0 -z-10 blur-3xl">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 animate-float"></div>
          </div>
        </div>

        {errorDisplay}

        {/* Waveform Visualizer Section */}
        <div className="mb-8 flex justify-center">
          <WaveformVisualizer
            frequency={sliderToFrequency(oscillator1.sliderFreq)}
            isPlaying={audioState.isPlaying}
            waveformType={oscillator1.selectedWaveform}
            className="w-full max-w-2xl"
          />
        </div>

        <div className="dual-oscillator-container">
          <OscillatorPanel
            title="Oscillator 1"
            oscillator={osc1Controls}
            sweepControls={sweep1Controls}
            syncEnabled={mixer.syncEnabled}
            isOsc2={false}
            className="osc1"
            controlMode={oscillator1.controlMode}
            onControlModeChange={mode => oscillatorActions.setControlMode(1, mode)}
            isSweepActive={sweep1.isActive}
          />

          <OscillatorPanel
            title="Oscillator 2"
            oscillator={osc2Controls}
            sweepControls={sweep2Controls}
            syncEnabled={mixer.syncEnabled}
            isOsc2={true}
            onCopyFromOsc1={handleCopyOsc1ToOsc2}
            className="osc2"
            controlMode={oscillator2.controlMode}
            onControlModeChange={mode => oscillatorActions.setControlMode(2, mode)}
            isSweepActive={sweep2.isActive}
          />
        </div>

        <MixerControls mixerControls={mixerControls} />

        <PlaybackControls audioControls={audioControls} />
      </div>
    </div>
  );
};

export default App;
