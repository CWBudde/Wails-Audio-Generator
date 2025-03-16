package main

import (
	"math"
	"math/cmplx"
)

// ComplexOscillator generates waveforms using complex numbers
type ComplexOscillator struct {
	state          complex128
	phaseIncrement complex128
	volume         float64
}

// NewComplexOscillator initializes an oscillator with volume scaling
func NewComplexOscillator(freq float64, scale float64) *ComplexOscillator {
	phaseIncrement := cmplx.Exp(complex(0, 2*math.Pi*freq/44100))
	return &ComplexOscillator{
		state:          complex(scale, 0),
		phaseIncrement: phaseIncrement,
		volume:         scale,
	}
}

// Process generates the next sample
func (o *ComplexOscillator) Process() float64 {
	o.state *= o.phaseIncrement
	return real(o.state) // Output real part as the audio signal
}

// SetFrequency updates the oscillator frequency
func (o *ComplexOscillator) SetFrequency(freq float64) {
	o.phaseIncrement = cmplx.Exp(complex(0, 2*math.Pi*freq/44100))
}

// SetVolume updates the oscillator's amplitude while keeping the phase
func (o *ComplexOscillator) SetVolume(vol float64) {
	// Extract the current phase angle
	phaseAngle := cmplx.Phase(o.state)

	// Set the new amplitude while preserving phase
	o.state = cmplx.Rect(vol, phaseAngle)
	o.volume = vol
}
