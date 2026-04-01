import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock Wails functions
vi.mock('../../wailsjs/go/main/App', () => ({
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
  IsSweeping1: vi.fn().mockResolvedValue(false),
  IsSweeping2: vi.fn().mockResolvedValue(false),
}));

// Clean up after each test
afterEach(() => {
  cleanup();
});
