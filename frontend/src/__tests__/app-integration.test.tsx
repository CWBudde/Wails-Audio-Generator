/**
 * Integration tests for the App component with Zustand store
 *
 * Tests the integration between the App component and the Zustand store,
 * ensuring that the state management system works correctly with the UI.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the Wails bindings
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
}));

describe('App Integration with Zustand Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render the application title', () => {
    render(<App />);
    expect(screen.getByText('Dual Oscillator Audio Generator 🎶')).toBeInTheDocument();
  });

  it('should render both oscillator panels', () => {
    render(<App />);
    expect(screen.getByText('Oscillator 1')).toBeInTheDocument();
    expect(screen.getByText('Oscillator 2')).toBeInTheDocument();
  });

  it('should render mixer controls', () => {
    render(<App />);
    // Look for mixer-related controls or text
    const elements = screen.getAllByText(/mix|balance|sync/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should render playback controls', () => {
    render(<App />);
    // Look for play button specifically
    const playButton = screen.getByRole('button', { name: /▶ play/i });
    expect(playButton).toBeInTheDocument();
  });

  it('should not show error messages initially', () => {
    render(<App />);
    const errorElements = screen.queryAllByText(/error/i);
    // Filter out any elements that might contain "Error" in aria-labels or other contexts
    const actualErrors = errorElements.filter(el =>
      el.textContent?.toLowerCase().includes('error:')
    );
    expect(actualErrors.length).toBe(0);
  });

  it('should render frequency controls for both oscillators', () => {
    render(<App />);
    // Look for frequency-related sliders or inputs
    const frequencyControls = screen.getAllByDisplayValue('440'); // Default frequency
    expect(frequencyControls.length).toBeGreaterThanOrEqual(2); // At least for both oscillators
  });

  it('should render volume controls for both oscillators', () => {
    render(<App />);
    // Look for volume-related sliders
    const volumeControls = screen.getAllByDisplayValue('500'); // Default volume slider position
    expect(volumeControls.length).toBeGreaterThanOrEqual(2); // At least for both oscillators
  });

  it('should render waveform selectors', () => {
    render(<App />);
    // Look for waveform dropdowns by role
    const waveformSelectors = screen.getAllByRole('combobox');
    // Should have at least 2 oscillator waveform selectors + 1 mixer mode selector
    expect(waveformSelectors.length).toBeGreaterThanOrEqual(3);
  });

  it('should render sweep controls', () => {
    render(<App />);
    // Look for sweep-related controls
    const startFreqInputs = screen.getAllByDisplayValue('100'); // Default start frequency
    const endFreqInputs = screen.getAllByDisplayValue('1000'); // Default end frequency
    const durationInputs = screen.getAllByDisplayValue('5'); // Default duration

    expect(startFreqInputs.length).toBeGreaterThan(0);
    expect(endFreqInputs.length).toBeGreaterThan(0);
    expect(durationInputs.length).toBeGreaterThan(0);
  });

  it('should have accessible form controls', () => {
    render(<App />);

    // Check that we have input elements
    const inputs = screen.getAllByRole('slider');
    expect(inputs.length).toBeGreaterThan(0);

    // Check that we have select elements
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);

    // Check that we have buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should maintain component structure', () => {
    render(<App />);

    // Check main app container
    const appContainer = document.querySelector('#App');
    expect(appContainer).toBeInTheDocument();

    // Check dual oscillator container
    const dualOscContainer = document.querySelector('.dual-oscillator-container');
    expect(dualOscContainer).toBeInTheDocument();
  });
});

describe('App State Persistence', () => {
  it('should not crash when localStorage is empty', () => {
    localStorage.clear();
    expect(() => render(<App />)).not.toThrow();
  });

  it('should not crash when localStorage contains invalid data', () => {
    localStorage.setItem('audio-generator-store', 'invalid-json');
    expect(() => render(<App />)).not.toThrow();
  });

  it('should render correctly with default state', () => {
    render(<App />);
    expect(screen.getByText('Dual Oscillator Audio Generator 🎶')).toBeInTheDocument();
  });
});
