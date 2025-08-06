package main

import (
	"math"
	"math/cmplx"
)

// WaveformType represents different waveform types
type WaveformType int

const (
	WaveformSine WaveformType = iota
	WaveformSquare
	WaveformTriangle
	WaveformSawtooth
	WaveformWhiteNoise
	WaveformPinkNoise
	WaveformBrownNoise
)

// PhaseOscillator generates phase-based waveforms using complex numbers
type PhaseOscillator struct {
	state          complex128
	phaseIncrement complex128
	volume         float64
	waveformType   WaveformType
	phase          float64 // Track phase for non-sine waveforms
	frequency      float64 // Store frequency for calculations
}

// NewPhaseOscillator initializes an oscillator with volume scaling
func NewPhaseOscillator(freq float64, volume float64, waveform WaveformType) *PhaseOscillator {
	phaseIncrement := cmplx.Exp(complex(0, 2*math.Pi*freq/44100))
	return &PhaseOscillator{
		state:          complex(volume, 0),
		phaseIncrement: phaseIncrement,
		volume:         volume,
		waveformType:   waveform,
		phase:          0.0,
		frequency:      freq,
	}
}

// Process generates the next sample
func (o *PhaseOscillator) Process() float64 {
	switch o.waveformType {
	case WaveformSine:
		o.state *= o.phaseIncrement
		return real(o.state) // Volume is already built into the state magnitude
	case WaveformSquare:
		o.phase += 2 * math.Pi * o.frequency / 44100
		if o.phase >= 2*math.Pi {
			o.phase -= 2 * math.Pi
		}
		if math.Sin(o.phase) >= 0 {
			return o.volume
		}
		return -o.volume
	case WaveformTriangle:
		o.phase += 2 * math.Pi * o.frequency / 44100
		if o.phase >= 2*math.Pi {
			o.phase -= 2 * math.Pi
		}
		// Triangle wave: -1 to 1 based on phase
		normalizedPhase := o.phase / (2 * math.Pi)
		if normalizedPhase < 0.5 {
			return (4*normalizedPhase - 1) * o.volume
		}
		return (3 - 4*normalizedPhase) * o.volume
	case WaveformSawtooth:
		o.phase += 2 * math.Pi * o.frequency / 44100
		if o.phase >= 2*math.Pi {
			o.phase -= 2 * math.Pi
		}
		// Sawtooth wave: linear ramp from -1 to 1
		normalizedPhase := o.phase / (2 * math.Pi)
		return (2*normalizedPhase - 1) * o.volume
	default:
		o.state *= o.phaseIncrement
		return real(o.state) // Volume is already built into the state magnitude
	}
}

// SetFrequency updates the oscillator frequency
func (o *PhaseOscillator) SetFrequency(freq float64) {
	o.frequency = freq
	o.phaseIncrement = cmplx.Exp(complex(0, 2*math.Pi*freq/44100))
}

// SetVolume updates the oscillator's amplitude while keeping the phase
func (o *PhaseOscillator) SetVolume(vol float64) {
	// Extract the current phase angle
	phaseAngle := cmplx.Phase(o.state)

	// Set the new amplitude while preserving phase
	o.state = cmplx.Rect(vol, phaseAngle)
	o.volume = vol
}

// SetWaveform changes the waveform type
func (o *PhaseOscillator) SetWaveform(waveform WaveformType) {
	o.waveformType = waveform
	// Reset phase for clean waveform switching
	o.phase = 0.0
	o.state = complex(o.volume, 0)
}
