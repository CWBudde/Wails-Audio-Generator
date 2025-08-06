package main

import (
	"math"
	"testing"
)

const (
	testFreq     = 440.0  // A4 note
	testVolume   = 0.5    // 50% volume
	sampleRate   = 44100  // Standard sample rate
	tolerance    = 1e-10  // Floating point comparison tolerance
)

// TestNewPhaseOscillator tests oscillator initialization
func TestNewPhaseOscillator(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	
	if osc.frequency != testFreq {
		t.Errorf("Expected frequency %f, got %f", testFreq, osc.frequency)
	}
	
	if osc.volume != testVolume {
		t.Errorf("Expected volume %f, got %f", testVolume, osc.volume)
	}
	
	if osc.waveformType != WaveformSine {
		t.Errorf("Expected default waveform %d, got %d", WaveformSine, osc.waveformType)
	}
	
	if osc.phase != 0.0 {
		t.Errorf("Expected initial phase 0.0, got %f", osc.phase)
	}
}

// TestSineWave tests sine wave generation
func TestSineWave(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	osc.SetWaveform(WaveformSine)
	
	// Generate a few samples and check they're reasonable
	samples := make([]float64, 100)
	for i := range samples {
		samples[i] = osc.Process()
	}
	
	// Check that samples are within expected range
	for i, sample := range samples {
		if math.Abs(sample) > testVolume+tolerance {
			t.Errorf("Sample %d (%f) exceeds volume limit %f", i, sample, testVolume)
		}
	}
	
	// Check that we get a sine-like pattern (should have values near zero)
	// Since we're using complex numbers, we might not hit exactly zero, so check for very small values
	nearZero := false
	for _, sample := range samples {
		if math.Abs(sample) < testVolume*0.1 { // Within 10% of zero relative to volume
			nearZero = true
			break
		}
	}
	if !nearZero {
		t.Error("Sine wave should have values near zero within 100 samples")
	}
}

// TestSquareWave tests square wave generation
func TestSquareWave(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	osc.SetWaveform(WaveformSquare)
	
	samples := make([]float64, 1000)
	for i := range samples {
		samples[i] = osc.Process()
	}
	
	// Square wave should only produce +volume or -volume values
	tolerance := 1e-10
	for i, sample := range samples {
		if math.Abs(math.Abs(sample)-testVolume) > tolerance {
			t.Errorf("Square wave sample %d (%f) should be ±%f", i, sample, testVolume)
		}
	}
	
	// Should have both positive and negative values
	hasPositive, hasNegative := false, false
	for _, sample := range samples {
		if sample > 0 {
			hasPositive = true
		}
		if sample < 0 {
			hasNegative = true
		}
	}
	if !hasPositive || !hasNegative {
		t.Error("Square wave should have both positive and negative values")
	}
}

// TestTriangleWave tests triangle wave generation
func TestTriangleWave(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	osc.SetWaveform(WaveformTriangle)
	
	samples := make([]float64, 1000)
	for i := range samples {
		samples[i] = osc.Process()
	}
	
	// Triangle wave should be within volume bounds
	for i, sample := range samples {
		if math.Abs(sample) > testVolume+tolerance {
			t.Errorf("Triangle wave sample %d (%f) exceeds volume limit %f", i, sample, testVolume)
		}
	}
	
	// Should reach both positive and negative peaks
	maxSample := -math.Inf(1)
	minSample := math.Inf(1)
	for _, sample := range samples {
		if sample > maxSample {
			maxSample = sample
		}
		if sample < minSample {
			minSample = sample
		}
	}
	
	if math.Abs(maxSample-testVolume) > 0.1 {
		t.Errorf("Triangle wave should reach positive peak %f, got %f", testVolume, maxSample)
	}
	if math.Abs(minSample+testVolume) > 0.1 {
		t.Errorf("Triangle wave should reach negative peak %f, got %f", -testVolume, minSample)
	}
}

// TestSawtoothWave tests sawtooth wave generation
func TestSawtoothWave(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	osc.SetWaveform(WaveformSawtooth)
	
	samples := make([]float64, 1000)
	for i := range samples {
		samples[i] = osc.Process()
	}
	
	// Sawtooth wave should be within volume bounds
	for i, sample := range samples {
		if math.Abs(sample) > testVolume+tolerance {
			t.Errorf("Sawtooth wave sample %d (%f) exceeds volume limit %f", i, sample, testVolume)
		}
	}
	
	// Should reach both positive and negative peaks
	maxSample := -math.Inf(1)
	minSample := math.Inf(1)
	for _, sample := range samples {
		if sample > maxSample {
			maxSample = sample
		}
		if sample < minSample {
			minSample = sample
		}
	}
	
	if math.Abs(maxSample-testVolume) > 0.1 {
		t.Errorf("Sawtooth wave should reach positive peak %f, got %f", testVolume, maxSample)
	}
	if math.Abs(minSample+testVolume) > 0.1 {
		t.Errorf("Sawtooth wave should reach negative peak %f, got %f", -testVolume, minSample)
	}
}

// TestSetFrequency tests frequency changes
func TestSetFrequency(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	
	newFreq := 880.0 // A5 note
	osc.SetFrequency(newFreq)
	
	if osc.frequency != newFreq {
		t.Errorf("Expected frequency %f, got %f", newFreq, osc.frequency)
	}
	
	// Test that oscillator still produces samples after frequency change
	sample := osc.Process()
	if math.IsNaN(sample) || math.IsInf(sample, 0) {
		t.Errorf("Oscillator produced invalid sample after frequency change: %f", sample)
	}
}

// TestSetVolume tests volume changes
func TestSetVolume(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	
	newVolume := 0.8
	osc.SetVolume(newVolume)
	
	if osc.volume != newVolume {
		t.Errorf("Expected volume %f, got %f", newVolume, osc.volume)
	}
	
	// Test that volume change affects output for different waveforms
	waveforms := []WaveformType{WaveformSine, WaveformSquare, WaveformTriangle, WaveformSawtooth}
	
	for _, waveform := range waveforms {
		osc.SetWaveform(waveform)
		osc.SetVolume(newVolume)
		
		// Generate samples and check they respect new volume
		for i := 0; i < 100; i++ {
			sample := osc.Process()
			if math.Abs(sample) > newVolume+tolerance {
				t.Errorf("Sample %f exceeds new volume %f for waveform %d", sample, newVolume, waveform)
			}
		}
	}
}

// TestSetWaveform tests waveform switching
func TestSetWaveform(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	
	waveforms := []WaveformType{WaveformSine, WaveformSquare, WaveformTriangle, WaveformSawtooth, WaveformWhiteNoise, WaveformPinkNoise, WaveformBrownNoise}
	
	for _, waveform := range waveforms {
		osc.SetWaveform(waveform)
		
		if osc.waveformType != waveform {
			t.Errorf("Expected waveform %d, got %d", waveform, osc.waveformType)
		}
		
		// Test that phase is reset on waveform change
		if osc.phase != 0.0 {
			t.Errorf("Expected phase reset to 0.0 after waveform change, got %f", osc.phase)
		}
		
		// Test that oscillator produces valid samples
		sample := osc.Process()
		if math.IsNaN(sample) || math.IsInf(sample, 0) {
			t.Errorf("Oscillator produced invalid sample for waveform %d: %f", waveform, sample)
		}
	}
}

// TestWaveformContinuity tests that waveforms maintain reasonable behavior over time
func TestWaveformContinuity(t *testing.T) {
	waveforms := []WaveformType{WaveformSine, WaveformSquare, WaveformTriangle, WaveformSawtooth, WaveformWhiteNoise, WaveformPinkNoise, WaveformBrownNoise}
	
	for _, waveform := range waveforms {
		osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
		osc.SetWaveform(waveform)
		
		// Generate many samples to test continuity
		samples := make([]float64, 10000)
		for i := range samples {
			samples[i] = osc.Process()
		}
		
		// Check that no samples are NaN or infinite
		for i, sample := range samples {
			if math.IsNaN(sample) || math.IsInf(sample, 0) {
				t.Errorf("Waveform %d produced invalid sample at position %d: %f", waveform, i, sample)
			}
		}
		
		// Check that samples are within reasonable bounds
		for i, sample := range samples {
			if math.Abs(sample) > testVolume*1.1 { // Allow small tolerance for rounding
				t.Errorf("Waveform %d sample %d (%f) exceeds volume bounds", waveform, i, sample)
			}
		}
	}
}

// TestFrequencyAccuracy tests that the actual frequency matches the set frequency
func TestFrequencyAccuracy(t *testing.T) {
	testFreqs := []float64{100.0, 440.0, 1000.0, 2000.0}
	
	for _, freq := range testFreqs {
		osc := NewPhaseOscillator(freq, testVolume, WaveformSine)
		osc.SetWaveform(WaveformSine) // Use sine wave for frequency accuracy test
		
		// Generate one second of samples
		samples := make([]float64, sampleRate)
		for i := range samples {
			samples[i] = osc.Process()
		}
		
		// Count zero crossings to estimate frequency
		zeroCrossings := 0
		for i := 1; i < len(samples); i++ {
			if (samples[i-1] >= 0 && samples[i] < 0) || (samples[i-1] < 0 && samples[i] >= 0) {
				zeroCrossings++
			}
		}
		
		// Frequency should be approximately zeroCrossings/2 (two crossings per cycle)
		measuredFreq := float64(zeroCrossings) / 2.0
		tolerance := freq * 0.05 // 5% tolerance
		
		if math.Abs(measuredFreq-freq) > tolerance {
			t.Errorf("Frequency accuracy test failed for %f Hz: measured %f Hz (tolerance: %f Hz)", 
				freq, measuredFreq, tolerance)
		}
	}
}

// TestVolumeRange tests various volume levels
func TestVolumeRange(t *testing.T) {
	volumes := []float64{0.0, 0.1, 0.5, 0.8, 1.0}
	
	for _, volume := range volumes {
		osc := NewPhaseOscillator(testFreq, volume, WaveformSine)
		
		// Test all waveforms at this volume
		waveforms := []WaveformType{WaveformSine, WaveformSquare, WaveformTriangle, WaveformSawtooth, WaveformWhiteNoise, WaveformPinkNoise, WaveformBrownNoise}
		
		for _, waveform := range waveforms {
			osc.SetWaveform(waveform)
			osc.SetVolume(volume)
			
			// Generate samples and verify they don't exceed volume
			for i := 0; i < 100; i++ {
				sample := osc.Process()
				if math.Abs(sample) > volume+tolerance {
					t.Errorf("Volume %f, waveform %d: sample %f exceeds volume limit", 
						volume, waveform, sample)
				}
			}
		}
	}
}

// TestWhiteNoise tests white noise generation
func TestWhiteNoise(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	osc.SetWaveform(WaveformWhiteNoise)
	
	samples := make([]float64, 1000)
	for i := range samples {
		samples[i] = osc.Process()
	}
	
	// White noise should be within volume bounds
	for i, sample := range samples {
		if math.Abs(sample) > testVolume+tolerance {
			t.Errorf("White noise sample %d (%f) exceeds volume limit %f", i, sample, testVolume)
		}
	}
	
	// Check for randomness - samples should not all be the same
	allSame := true
	firstSample := samples[0]
	for _, sample := range samples[1:] {
		if math.Abs(sample-firstSample) > tolerance {
			allSame = false
			break
		}
	}
	if allSame {
		t.Error("White noise should produce varying samples")
	}
	
	// Check statistical properties - mean should be close to zero
	var sum float64
	for _, sample := range samples {
		sum += sample
	}
	mean := sum / float64(len(samples))
	if math.Abs(mean) > 0.1 {
		t.Errorf("White noise mean %f should be close to zero", mean)
	}
}

// TestPinkNoise tests pink noise generation
func TestPinkNoise(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	osc.SetWaveform(WaveformPinkNoise)
	
	samples := make([]float64, 1000)
	for i := range samples {
		samples[i] = osc.Process()
	}
	
	// Pink noise should be within volume bounds
	for i, sample := range samples {
		if math.Abs(sample) > testVolume+tolerance {
			t.Errorf("Pink noise sample %d (%f) exceeds volume limit %f", i, sample, testVolume)
		}
	}
	
	// Check for randomness - samples should not all be the same
	allSame := true
	firstSample := samples[0]
	for _, sample := range samples[1:] {
		if math.Abs(sample-firstSample) > tolerance {
			allSame = false
			break
		}
	}
	if allSame {
		t.Error("Pink noise should produce varying samples")
	}
	
	// Pink noise should have lower variance than white noise due to 1/f filtering
	var variance float64
	var sum float64
	for _, sample := range samples {
		sum += sample
	}
	mean := sum / float64(len(samples))
	for _, sample := range samples {
		variance += (sample - mean) * (sample - mean)
	}
	variance /= float64(len(samples))
	
	// Variance should be reasonable (not zero, not too large)
	if variance < 1e-6 {
		t.Error("Pink noise variance is too small")
	}
	if variance > testVolume*testVolume {
		t.Error("Pink noise variance is too large")
	}
}

// TestBrownNoise tests brown noise generation
func TestBrownNoise(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	osc.SetWaveform(WaveformBrownNoise)
	
	samples := make([]float64, 1000)
	for i := range samples {
		samples[i] = osc.Process()
	}
	
	// Brown noise should be within volume bounds
	for i, sample := range samples {
		if math.Abs(sample) > testVolume+tolerance {
			t.Errorf("Brown noise sample %d (%f) exceeds volume limit %f", i, sample, testVolume)
		}
	}
	
	// Check for randomness - samples should not all be the same
	allSame := true
	firstSample := samples[0]
	for _, sample := range samples[1:] {
		if math.Abs(sample-firstSample) > tolerance {
			allSame = false
			break
		}
	}
	if allSame {
		t.Error("Brown noise should produce varying samples")
	}
	
	// Brown noise should show correlation between adjacent samples (smoother than white noise)
	correlationSum := 0.0
	for i := 1; i < len(samples); i++ {
		correlationSum += samples[i] * samples[i-1]
	}
	avgCorrelation := correlationSum / float64(len(samples)-1)
	
	// Adjacent samples should have some positive correlation due to integration
	if avgCorrelation < -0.1 {
		t.Errorf("Brown noise should show positive correlation between adjacent samples, got %f", avgCorrelation)
	}
}

// TestNoiseStateReset tests that noise states are reset when switching waveforms
func TestNoiseStateReset(t *testing.T) {
	osc := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	
	// Generate some pink noise to populate the state
	osc.SetWaveform(WaveformPinkNoise)
	for i := 0; i < 100; i++ {
		osc.Process()
	}
	
	// Switch to brown noise and generate samples
	osc.SetWaveform(WaveformBrownNoise)
	for i := 0; i < 100; i++ {
		osc.Process()
	}
	
	// Switch back to pink noise - state should be reset
	osc.SetWaveform(WaveformPinkNoise)
	
	// Generate samples - should work without issues
	for i := 0; i < 100; i++ {
		sample := osc.Process()
		if math.IsNaN(sample) || math.IsInf(sample, 0) {
			t.Errorf("Noise state reset failed - got invalid sample: %f", sample)
		}
	}
}

// TestNoiseReproducibility tests that noise is reproducible with fixed seed
func TestNoiseReproducibility(t *testing.T) {
	// Create two oscillators with same parameters
	osc1 := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	osc2 := NewPhaseOscillator(testFreq, testVolume, WaveformSine)
	
	waveforms := []WaveformType{WaveformWhiteNoise, WaveformPinkNoise, WaveformBrownNoise}
	
	for _, waveform := range waveforms {
		osc1.SetWaveform(waveform)
		osc2.SetWaveform(waveform)
		
		// Generate samples from both oscillators
		for i := 0; i < 100; i++ {
			sample1 := osc1.Process()
			sample2 := osc2.Process()
			
			if math.Abs(sample1-sample2) > tolerance {
				t.Errorf("Waveform %d: samples should be identical with fixed seed, got %f vs %f", 
					waveform, sample1, sample2)
			}
		}
	}
}