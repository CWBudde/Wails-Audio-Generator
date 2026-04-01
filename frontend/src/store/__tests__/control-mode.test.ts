/**
 * Control Mode System Tests
 *
 * Tests the control mode functionality including business rules,
 * automatic mode switching, and validation logic.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { WaveformType } from '../../types';
import { ControlMode, DEFAULT_CONTROL_MODE, CONTROL_MODE_LABELS } from '../../types/controlModes';
import { isTonalWaveform, isNoiseWaveform } from '../../types/waveforms';

// Mock the Wails bindings
const mockWailsBindings = {
  StartAudio: vi.fn().mockResolvedValue(undefined),
  StopAudio: vi.fn().mockResolvedValue(undefined),
  SetFrequency: vi.fn().mockResolvedValue(undefined),
  SetVolume: vi.fn().mockResolvedValue(undefined),
  SetWaveform: vi.fn().mockResolvedValue(undefined),
  SetOsc2Frequency: vi.fn().mockResolvedValue(undefined),
  SetOsc2Volume: vi.fn().mockResolvedValue(undefined),
  SetOsc2Waveform: vi.fn().mockResolvedValue(undefined),
  SetMixBalance: vi.fn().mockResolvedValue(undefined),
  SetMixMode: vi.fn().mockResolvedValue(undefined),
  SetDetune: vi.fn().mockResolvedValue(undefined),
  SetSync: vi.fn().mockResolvedValue(undefined),
  StartSweep1: vi.fn().mockResolvedValue(undefined),
  StopSweep1: vi.fn().mockResolvedValue(undefined),
  StartSweep2: vi.fn().mockResolvedValue(undefined),
  StopSweep2: vi.fn().mockResolvedValue(undefined),
};

vi.mock('../../../wailsjs/go/main/App', () => mockWailsBindings);

describe('ControlMode Types and Constants', () => {
  it('should define ControlMode enum correctly', () => {
    expect(ControlMode.FIXED_FREQUENCY).toBe('fixed_frequency');
    expect(ControlMode.SWEEP).toBe('sweep');
  });

  it('should have proper control mode labels', () => {
    expect(CONTROL_MODE_LABELS[ControlMode.FIXED_FREQUENCY]).toBe('Fixed Frequency');
    expect(CONTROL_MODE_LABELS[ControlMode.SWEEP]).toBe('Sweep');
  });

  it('should have correct default control mode', () => {
    expect(DEFAULT_CONTROL_MODE).toBe(ControlMode.FIXED_FREQUENCY);
  });
});

describe('Waveform Type Detection', () => {
  it('should correctly identify tonal waveforms', () => {
    expect(isTonalWaveform(WaveformType.SINE)).toBe(true);
    expect(isTonalWaveform(WaveformType.SQUARE)).toBe(true);
    expect(isTonalWaveform(WaveformType.TRIANGLE)).toBe(true);
    expect(isTonalWaveform(WaveformType.SAWTOOTH)).toBe(true);
  });

  it('should correctly identify noise waveforms', () => {
    expect(isNoiseWaveform(WaveformType.WHITE_NOISE)).toBe(true);
    expect(isNoiseWaveform(WaveformType.PINK_NOISE)).toBe(true);
    expect(isNoiseWaveform(WaveformType.BROWN_NOISE)).toBe(true);
  });

  it('should have mutually exclusive waveform categories', () => {
    // Test that no waveform is both tonal and noise
    const allWaveforms = [
      WaveformType.SINE,
      WaveformType.SQUARE,
      WaveformType.TRIANGLE,
      WaveformType.SAWTOOTH,
      WaveformType.WHITE_NOISE,
      WaveformType.PINK_NOISE,
      WaveformType.BROWN_NOISE,
    ];

    allWaveforms.forEach(waveform => {
      const isTonal = isTonalWaveform(waveform);
      const isNoise = isNoiseWaveform(waveform);
      expect(isTonal !== isNoise).toBe(true); // Exactly one should be true
    });
  });
});

describe('Store Control Mode Integration', () => {
  let store: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset store state before each test
    const { useAppStore } = await import('../useAppStore');
    store = useAppStore.getState();
  });

  it('should initialize with default control mode', async () => {
    const { useAppStore } = await import('../useAppStore');
    const state = useAppStore.getState();

    expect(state.oscillator1.controlMode).toBe(DEFAULT_CONTROL_MODE);
    expect(state.oscillator2.controlMode).toBe(DEFAULT_CONTROL_MODE);
  });

  it('should allow setting control mode for oscillator 1', async () => {
    const { useAppStore } = await import('../useAppStore');
    const store = useAppStore.getState();

    store.oscillatorActions.setControlMode(1, ControlMode.SWEEP);

    const newState = useAppStore.getState();
    expect(newState.oscillator1.controlMode).toBe(ControlMode.SWEEP);
  });

  it('should allow setting control mode for oscillator 2', async () => {
    const { useAppStore } = await import('../useAppStore');
    const store = useAppStore.getState();

    store.oscillatorActions.setControlMode(2, ControlMode.SWEEP);

    const newState = useAppStore.getState();
    expect(newState.oscillator2.controlMode).toBe(ControlMode.SWEEP);
  });
});

describe('Business Rules - Waveform Control Mode Logic', () => {
  let store: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import('../useAppStore');
    store = useAppStore.getState();
  });

  it('should auto-set FIXED mode when switching to noise waveform', async () => {
    const { useAppStore } = await import('../useAppStore');
    const store = useAppStore.getState();

    // Set to sweep mode first
    store.oscillatorActions.setControlMode(1, ControlMode.SWEEP);
    expect(useAppStore.getState().oscillator1.controlMode).toBe(ControlMode.SWEEP);

    // Switch to noise waveform - should auto-set to FIXED mode
    await store.oscillatorActions.setWaveform(1, WaveformType.WHITE_NOISE);

    const newState = useAppStore.getState();
    expect(newState.oscillator1.controlMode).toBe(ControlMode.FIXED_FREQUENCY);
    expect(newState.oscillator1.selectedWaveform).toBe(WaveformType.WHITE_NOISE);
  });

  it('should auto-stop sweep when switching to noise waveform', async () => {
    const { useAppStore } = await import('../useAppStore');
    const store = useAppStore.getState();

    // Set up active sweep
    await store.sweepActions.startSweep(1, 100, 1000, 5);
    expect(useAppStore.getState().sweep1.isActive).toBe(true);

    // Switch to noise waveform - should auto-stop sweep
    await store.oscillatorActions.setWaveform(1, WaveformType.PINK_NOISE);

    const newState = useAppStore.getState();
    expect(newState.sweep1.isActive).toBe(false);
    expect(mockWailsBindings.StopSweep1).toHaveBeenCalled();
  });

  it('should preserve control mode when switching between tonal waveforms', async () => {
    const { useAppStore } = await import('../useAppStore');
    const store = useAppStore.getState();

    // Start with a known tonal waveform and set it to a different tonal waveform
    await store.oscillatorActions.setWaveform(1, WaveformType.SINE);

    // Set to sweep mode for current tonal waveform
    store.oscillatorActions.setControlMode(1, ControlMode.SWEEP);
    expect(useAppStore.getState().oscillator1.controlMode).toBe(ControlMode.SWEEP);

    // Switch to another tonal waveform - should preserve sweep mode
    await store.oscillatorActions.setWaveform(1, WaveformType.SQUARE);

    const newState = useAppStore.getState();
    expect(newState.oscillator1.controlMode).toBe(ControlMode.SWEEP);
    expect(newState.oscillator1.selectedWaveform).toBe(WaveformType.SQUARE);
  });

  it('should default to FIXED when switching from noise to tonal', async () => {
    const { useAppStore } = await import('../useAppStore');
    const store = useAppStore.getState();

    // Start with noise waveform (forced to FIXED mode)
    await store.oscillatorActions.setWaveform(1, WaveformType.BROWN_NOISE);
    expect(useAppStore.getState().oscillator1.controlMode).toBe(ControlMode.FIXED_FREQUENCY);

    // Switch to tonal waveform - should default to FIXED
    await store.oscillatorActions.setWaveform(1, WaveformType.TRIANGLE);

    const newState = useAppStore.getState();
    expect(newState.oscillator1.controlMode).toBe(ControlMode.FIXED_FREQUENCY);
    expect(newState.oscillator1.selectedWaveform).toBe(WaveformType.TRIANGLE);
  });
});

describe('Business Rules - Validation Logic', () => {
  let store: any;
  const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(async () => {
    vi.clearAllMocks();
    consoleSpy.mockClear();
    const { useAppStore } = await import('../useAppStore');
    store = useAppStore.getState();
  });

  it('should prevent setting SWEEP mode for noise waveforms', async () => {
    const { useAppStore } = await import('../useAppStore');
    const store = useAppStore.getState();

    // Set noise waveform
    await store.oscillatorActions.setWaveform(1, WaveformType.WHITE_NOISE);

    // Try to set SWEEP mode - should be prevented
    store.oscillatorActions.setControlMode(1, ControlMode.SWEEP);

    const newState = useAppStore.getState();
    expect(newState.oscillator1.controlMode).toBe(ControlMode.FIXED_FREQUENCY);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cannot set SWEEP mode for noise waveform')
    );
  });

  it('should prevent mode switching while sweep is active', async () => {
    const { useAppStore } = await import('../useAppStore');
    const store = useAppStore.getState();

    // Set tonal waveform and start sweep
    await store.oscillatorActions.setWaveform(1, WaveformType.SINE);
    store.oscillatorActions.setControlMode(1, ControlMode.SWEEP);
    await store.sweepActions.startSweep(1, 100, 1000, 5);

    expect(useAppStore.getState().sweep1.isActive).toBe(true);

    // Try to switch mode while sweep is active - should be prevented
    store.oscillatorActions.setControlMode(1, ControlMode.FIXED_FREQUENCY);

    const newState = useAppStore.getState();
    expect(newState.oscillator1.controlMode).toBe(ControlMode.SWEEP);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cannot change control mode while sweep is active')
    );
  });

  it('should allow mode switching after sweep stops', async () => {
    const { useAppStore } = await import('../useAppStore');
    const store = useAppStore.getState();

    // Set up and start sweep
    await store.oscillatorActions.setWaveform(1, WaveformType.SINE);
    store.oscillatorActions.setControlMode(1, ControlMode.SWEEP);
    await store.sweepActions.startSweep(1, 100, 1000, 5);

    // Stop sweep
    await store.sweepActions.stopSweep(1);
    expect(useAppStore.getState().sweep1.isActive).toBe(false);

    // Now mode switching should work
    store.oscillatorActions.setControlMode(1, ControlMode.FIXED_FREQUENCY);

    const newState = useAppStore.getState();
    expect(newState.oscillator1.controlMode).toBe(ControlMode.FIXED_FREQUENCY);
  });
});

describe('ControlMode Utility Functions', () => {
  it('should correctly identify when manual frequency is allowed', async () => {
    const { allowsManualFrequency } = await import('../../types/controlModes');

    expect(allowsManualFrequency(ControlMode.FIXED_FREQUENCY)).toBe(true);
    expect(allowsManualFrequency(ControlMode.SWEEP)).toBe(false);
  });

  it('should correctly identify when sweep control is allowed', async () => {
    const { allowsSweepControl } = await import('../../types/controlModes');

    expect(allowsSweepControl(ControlMode.FIXED_FREQUENCY)).toBe(false);
    expect(allowsSweepControl(ControlMode.SWEEP)).toBe(true);
  });
});

describe('Edge Cases and Error Handling', () => {
  it('should handle rapid mode switching gracefully', async () => {
    const { useAppStore } = await import('../useAppStore');
    const store = useAppStore.getState();

    // Rapidly switch modes multiple times
    store.oscillatorActions.setControlMode(1, ControlMode.SWEEP);
    store.oscillatorActions.setControlMode(1, ControlMode.FIXED_FREQUENCY);
    store.oscillatorActions.setControlMode(1, ControlMode.SWEEP);
    store.oscillatorActions.setControlMode(1, ControlMode.FIXED_FREQUENCY);

    const finalState = useAppStore.getState();
    expect(finalState.oscillator1.controlMode).toBe(ControlMode.FIXED_FREQUENCY);
  });

  it('should handle concurrent oscillator mode changes', async () => {
    const { useAppStore } = await import('../useAppStore');
    const store = useAppStore.getState();

    // Set different modes for different oscillators
    store.oscillatorActions.setControlMode(1, ControlMode.SWEEP);
    store.oscillatorActions.setControlMode(2, ControlMode.FIXED_FREQUENCY);

    const finalState = useAppStore.getState();
    expect(finalState.oscillator1.controlMode).toBe(ControlMode.SWEEP);
    expect(finalState.oscillator2.controlMode).toBe(ControlMode.FIXED_FREQUENCY);
  });
});
