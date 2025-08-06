package main

import (
	"math/rand"
)

// NoiseGenerator generates various types of noise signals
type NoiseGenerator struct {
	volume         float64
	waveformType   WaveformType
	frequency      float64 // Not used for noise, but needed for interface compatibility

	// Noise generation fields
	rng        *rand.Rand
	pinkState  [7]float64 // Pink noise filter state
	brownState float64    // Brown noise integrator state
}

// NewNoiseGenerator creates a new noise generator
func NewNoiseGenerator(volume float64, waveform WaveformType) *NoiseGenerator {
	return &NoiseGenerator{
		volume:       volume,
		waveformType: waveform,
		frequency:    0.0, // Not applicable for noise
		rng:          rand.New(rand.NewSource(42)), // Fixed seed for reproducible noise
		pinkState:    [7]float64{},
		brownState:   0.0,
	}
}

// Process generates the next noise sample
func (n *NoiseGenerator) Process() float64 {
	switch n.waveformType {
	case WaveformWhiteNoise:
		// White noise: uniform random distribution
		return (n.rng.Float64()*2 - 1) * n.volume
	case WaveformPinkNoise:
		// Pink noise: 1/f noise using Voss-McCartney algorithm
		return n.generatePinkNoise() * n.volume
	case WaveformBrownNoise:
		// Brown noise: integrated white noise (1/f² spectrum)
		return n.generateBrownNoise() * n.volume
	default:
		// Default to white noise
		return (n.rng.Float64()*2 - 1) * n.volume
	}
}

// SetFrequency is a no-op for noise generators (needed for interface compatibility)
func (n *NoiseGenerator) SetFrequency(freq float64) {
	n.frequency = freq // Store but don't use
}

// SetVolume updates the noise generator's amplitude
func (n *NoiseGenerator) SetVolume(vol float64) {
	n.volume = vol
}

// SetWaveform changes the noise type
func (n *NoiseGenerator) SetWaveform(waveform WaveformType) {
	n.waveformType = waveform
	// Reset noise states when switching waveforms
	n.pinkState = [7]float64{}
	n.brownState = 0.0
}

// generatePinkNoise implements pink noise (1/f) using Voss-McCartney algorithm
func (n *NoiseGenerator) generatePinkNoise() float64 {
	var output float64

	// Generate white noise for each octave band - using modern range syntax
	for i := range 7 {
		if n.rng.Intn(1<<uint(i+1)) == 0 {
			n.pinkState[i] = n.rng.Float64()*2 - 1
		}
		output += n.pinkState[i]
	}

	// Scale and normalize the output
	return output / 7.0
}

// generateBrownNoise implements brown noise (1/f²) using integration
func (n *NoiseGenerator) generateBrownNoise() float64 {
	// Generate white noise and integrate it
	white := n.rng.Float64()*2 - 1
	n.brownState += (white - n.brownState) * 0.02

	// Clamp to prevent drift
	if n.brownState > 1.0 {
		n.brownState = 1.0
	} else if n.brownState < -1.0 {
		n.brownState = -1.0
	}

	return n.brownState
}