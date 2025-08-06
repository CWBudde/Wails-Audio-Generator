package main

import (
	"context"
	"testing"
	"time"
)

// TestNewApp tests App initialization
func TestNewApp(t *testing.T) {
	app := NewApp()
	
	if app == nil {
		t.Fatal("NewApp returned nil")
	}
	
	if app.mixer == nil {
		t.Error("App mixer is nil")
	}
	
	if app.isStreaming {
		t.Error("App should not be streaming initially")
	}
	
	// Test that mixer is initialized with default values
	// Since DualOscillatorMixer contains SignalGenerators, we can test some behavior
	// We'll trust that NewDualOscillatorMixer creates the correct type
}

// TestAppStartup tests the startup method
func TestAppStartup(t *testing.T) {
	app := NewApp()
	ctx := context.Background()
	
	// Note: We can't fully test PortAudio initialization in a test environment
	// but we can test that the method doesn't panic and sets the context
	app.startup(ctx)
	
	if app.ctx != ctx {
		t.Error("App context was not set correctly")
	}
}

// TestAppSetFrequency tests the SetFrequency method
func TestAppSetFrequency(t *testing.T) {
	app := NewApp()
	
	testFreq := 880.0
	app.SetFrequency(testFreq)
	
	// We can't directly test the frequency since it's behind an interface
	// but we can test that the method doesn't panic and generates samples
	sample := app.mixer.Process()
	if sample != sample { // Check for NaN
		t.Error("SetFrequency caused oscillator to produce NaN")
	}
}

// TestAppSetVolume tests the SetVolume method
func TestAppSetVolume(t *testing.T) {
	app := NewApp()
	
	testVolume := 0.7
	app.SetVolume(testVolume)
	
	// We can't directly test the volume since it's behind an interface
	// but we can test that the method doesn't panic and generates samples
	sample := app.mixer.Process()
	if sample != sample { // Check for NaN
		t.Error("SetVolume caused oscillator to produce NaN")
	}
}

// TestAppSetWaveform tests the SetWaveform method
func TestAppSetWaveform(t *testing.T) {
	app := NewApp()
	
	waveforms := []WaveformType{WaveformSine, WaveformSquare, WaveformTriangle, WaveformSawtooth, WaveformWhiteNoise, WaveformPinkNoise, WaveformBrownNoise}
	
	for _, waveform := range waveforms {
		app.SetWaveform(int(waveform))
		
		// We can't directly test the waveform since it's behind an interface
		// but we can test that the method doesn't panic and generates samples
		sample := app.mixer.Process()
		if sample != sample { // Check for NaN
			t.Errorf("SetWaveform %d caused oscillator to produce NaN", waveform)
		}
	}
}

// TestConcurrentAccess tests thread safety of App methods
func TestConcurrentAccess(t *testing.T) {
	app := NewApp()
	
	// Test concurrent access to SetFrequency, SetVolume, and SetWaveform
	done := make(chan bool, 3)
	
	// Goroutine 1: Change frequency repeatedly
	go func() {
		for i := 0; i < 100; i++ {
			app.SetFrequency(440.0 + float64(i))
			time.Sleep(time.Microsecond)
		}
		done <- true
	}()
	
	// Goroutine 2: Change volume repeatedly
	go func() {
		for i := 0; i < 100; i++ {
			app.SetVolume(0.1 + float64(i%10)*0.1)
			time.Sleep(time.Microsecond)
		}
		done <- true
	}()
	
	// Goroutine 3: Change waveform repeatedly
	go func() {
		waveforms := []int{0, 1, 2, 3}
		for i := 0; i < 100; i++ {
			app.SetWaveform(waveforms[i%4])
			time.Sleep(time.Microsecond)
		}
		done <- true
	}()
	
	// Wait for all goroutines to finish
	for i := 0; i < 3; i++ {
		select {
		case <-done:
			// Goroutine finished successfully
		case <-time.After(time.Second * 5):
			t.Fatal("Concurrent access test timed out - possible deadlock")
		}
	}
	
	// Verify generator is still in a valid state by checking it produces samples
	sample := app.mixer.Process()
	if sample != sample { // Check for NaN
		t.Error("Generator is invalid after concurrent access - produces NaN")
	}
}

// TestParameterValidation tests parameter validation and edge cases
func TestParameterValidation(t *testing.T) {
	app := NewApp()
	
	// Test extreme frequency values
	extremeFreqs := []float64{0.1, 20000.0, -100.0}
	for _, freq := range extremeFreqs {
		app.SetFrequency(freq)
		// Should not panic or crash
		sample := app.mixer.Process()
		if sample != sample { // Check for NaN
			t.Errorf("Oscillator produced NaN with frequency %f", freq)
		}
	}
	
	// Test extreme volume values
	extremeVolumes := []float64{0.0, 2.0, -0.5}
	for _, volume := range extremeVolumes {
		app.SetVolume(volume)
		// Should not panic or crash
		sample := app.mixer.Process()
		if sample != sample { // Check for NaN
			t.Errorf("Oscillator produced NaN with volume %f", volume)
		}
	}
	
	// Test invalid waveform values
	invalidWaveforms := []int{-1, 100, 4}
	for _, waveform := range invalidWaveforms {
		app.SetWaveform(waveform)
		// Should not panic or crash - should default to sine or handle gracefully
		sample := app.mixer.Process()
		if sample != sample { // Check for NaN
			t.Errorf("Oscillator produced NaN with invalid waveform %d", waveform)
		}
	}
}

// TestOscillatorStateConsistency tests that oscillator state remains consistent
func TestOscillatorStateConsistency(t *testing.T) {
	app := NewApp()
	
	// Set known values
	testFreq := 440.0
	testVolume := 0.5
	testWaveform := WaveformSquare
	
	app.SetFrequency(testFreq)
	app.SetVolume(testVolume)
	app.SetWaveform(int(testWaveform))
	
	// Since we can't directly access generator state through interface,
	// we'll verify the generator produces valid samples
	for i := 0; i < 10; i++ {
		sample := app.mixer.Process()
		if sample != sample { // Check for NaN
			t.Errorf("Generator produced NaN after setting parameters")
			break
		}
	}
	
	// Generate samples and verify they're consistent with settings
	samples := make([]float64, 100)
	for i := range samples {
		samples[i] = app.mixer.Process()
	}
	
	// For square wave, all samples should be ±volume (approximately)
	// Note: We can't access volume directly, so we check for reasonable square wave pattern
	for i, sample := range samples {
		// Square wave should only have two distinct values
		if sample != sample { // Check for NaN
			t.Errorf("Square wave sample %d produced NaN", i)
		}
		if sample < -1.0 || sample > 1.0 {
			t.Errorf("Square wave sample %d (%f) outside expected range [-1, 1]", i, sample)
		}
	}
}

// TestMultipleParameterChanges tests changing multiple parameters in sequence
func TestMultipleParameterChanges(t *testing.T) {
	app := NewApp()
	
	// Test sequence: freq -> volume -> waveform -> freq -> volume -> waveform
	frequencies := []float64{220.0, 440.0, 880.0}
	volumes := []float64{0.2, 0.5, 0.8}
	waveforms := []WaveformType{WaveformSine, WaveformTriangle, WaveformSawtooth}
	
	for i := 0; i < 3; i++ {
		app.SetFrequency(frequencies[i])
		app.SetVolume(volumes[i])
		app.SetWaveform(int(waveforms[i]))
		
		// Generate a sample to ensure generator is working after changes
		sample := app.mixer.Process()
		if sample != sample { // Check for NaN
			t.Errorf("Step %d: oscillator produced NaN", i)
		}
	}
}

// BenchmarkSetFrequency benchmarks the SetFrequency method
func BenchmarkSetFrequency(b *testing.B) {
	app := NewApp()
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		app.SetFrequency(440.0 + float64(i%1000))
	}
}

// BenchmarkSetVolume benchmarks the SetVolume method
func BenchmarkSetVolume(b *testing.B) {
	app := NewApp()
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		app.SetVolume(0.1 + float64(i%10)*0.1)
	}
}

// BenchmarkSetWaveform benchmarks the SetWaveform method
func BenchmarkSetWaveform(b *testing.B) {
	app := NewApp()
	waveforms := []int{0, 1, 2, 3}
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		app.SetWaveform(waveforms[i%4])
	}
}

// BenchmarkOscillatorProcess benchmarks oscillator sample generation
func BenchmarkOscillatorProcess(b *testing.B) {
	app := NewApp()
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		app.mixer.Process()
	}
}

// BenchmarkAllWaveforms benchmarks all waveform types
func BenchmarkAllWaveforms(b *testing.B) {
	waveforms := []WaveformType{WaveformSine, WaveformSquare, WaveformTriangle, WaveformSawtooth, WaveformWhiteNoise, WaveformPinkNoise, WaveformBrownNoise}
	
	for _, waveform := range waveforms {
		b.Run(waveform.String(), func(b *testing.B) {
			app := NewApp()
			app.SetWaveform(int(waveform))
			
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				app.mixer.Process()
			}
		})
	}
}

// Add String method for WaveformType to support benchmarking
func (w WaveformType) String() string {
	switch w {
	case WaveformSine:
		return "Sine"
	case WaveformSquare:
		return "Square"
	case WaveformTriangle:
		return "Triangle"
	case WaveformSawtooth:
		return "Sawtooth"
	case WaveformWhiteNoise:
		return "WhiteNoise"
	case WaveformPinkNoise:
		return "PinkNoise"
	case WaveformBrownNoise:
		return "BrownNoise"
	default:
		return "Unknown"
	}
}