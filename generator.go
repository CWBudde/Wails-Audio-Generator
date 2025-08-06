package main

// SignalGenerator interface for all types of signal generators
type SignalGenerator interface {
	Process() float64
	SetFrequency(freq float64)
	SetVolume(vol float64)
	SetWaveform(waveform WaveformType)
}

// NewSignalGenerator creates a new signal generator based on waveform type
func NewSignalGenerator(freq float64, volume float64, waveform WaveformType) SignalGenerator {
	switch waveform {
	case WaveformSine, WaveformSquare, WaveformTriangle, WaveformSawtooth:
		return NewPhaseOscillator(freq, volume, waveform)
	case WaveformWhiteNoise, WaveformPinkNoise, WaveformBrownNoise:
		return NewNoiseGenerator(volume, waveform)
	default:
		return NewPhaseOscillator(freq, volume, WaveformSine)
	}
}