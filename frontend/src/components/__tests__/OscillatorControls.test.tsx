import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { OscillatorControls } from '../OscillatorControls';
import { WaveformType } from '../../types';

// Mock the oscillator controls interface
const mockOscillatorControls = {
  state: {
    sliderFreq: 500,
    sliderVolume: 750,
    selectedWaveform: WaveformType.SINE,
  },
  handleFrequencyChange: vi.fn(),
  handleVolumeChange: vi.fn(),
  handleWaveformChange: vi.fn(),
  copyFrom: vi.fn(),
};

describe('OscillatorControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders waveform selector', () => {
    render(<OscillatorControls oscillator={mockOscillatorControls} />);

    const waveformSelector = screen.getByDisplayValue(/Sine/);
    expect(waveformSelector).toBeInTheDocument();
  });

  it('shows frequency controls for tonal waveforms', () => {
    render(<OscillatorControls oscillator={mockOscillatorControls} />);

    expect(screen.getByText('Frequency:')).toBeInTheDocument();
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2); // frequency and volume sliders
  });

  it('hides frequency controls for noise waveforms', () => {
    const noiseControls = {
      ...mockOscillatorControls,
      state: {
        ...mockOscillatorControls.state,
        selectedWaveform: WaveformType.WHITE_NOISE,
      },
    };

    render(<OscillatorControls oscillator={noiseControls} />);

    expect(screen.queryByText('Frequency:')).not.toBeInTheDocument();
    expect(screen.getByText('Random signal across all frequencies')).toBeInTheDocument();
  });

  it('always shows volume controls', () => {
    render(<OscillatorControls oscillator={mockOscillatorControls} />);

    expect(screen.getByText('Volume:')).toBeInTheDocument();
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThanOrEqual(1); // at least volume slider
  });

  it('disables frequency slider when synced for OSC2', () => {
    render(
      <OscillatorControls oscillator={mockOscillatorControls} syncEnabled={true} isOsc2={true} />
    );

    const sliders = screen.getAllByRole('slider');
    const frequencySlider = sliders[0]; // First slider should be frequency
    if (frequencySlider) {
      expect(frequencySlider).toBeDisabled();
    }
  });

  it('calls handlers when controls are changed', async () => {
    const user = userEvent.setup();
    render(<OscillatorControls oscillator={mockOscillatorControls} />);

    // Test waveform change
    const waveformSelector = screen.getByDisplayValue(/Sine/);
    await user.selectOptions(waveformSelector, WaveformType.SQUARE.toString());
    expect(mockOscillatorControls.handleWaveformChange).toHaveBeenCalled();

    // Test frequency change
    const sliders = screen.getAllByRole('slider');
    const frequencySlider = sliders[0]; // First slider is frequency
    if (frequencySlider) {
      fireEvent.change(frequencySlider, { target: { value: '600' } });
      expect(mockOscillatorControls.handleFrequencyChange).toHaveBeenCalled();
    }

    // Test volume change
    const volumeSlider = sliders[1]; // Second slider is volume
    if (volumeSlider) {
      fireEvent.change(volumeSlider, { target: { value: '800' } });
      expect(mockOscillatorControls.handleVolumeChange).toHaveBeenCalled();
    }
  });

  it('displays correct frequency value', () => {
    render(<OscillatorControls oscillator={mockOscillatorControls} />);

    // The frequency display should show the formatted frequency
    expect(screen.getByText(/Hz|kHz/)).toBeInTheDocument();
  });

  it('displays correct volume value', () => {
    render(<OscillatorControls oscillator={mockOscillatorControls} />);

    // The volume display should show dB value
    expect(screen.getByText(/dB|−∞/)).toBeInTheDocument();
  });
});
