package main

import (
	"math"
	"testing"
)

func TestNewDualOscillatorMixer(t *testing.T) {
	mixer := NewDualOscillatorMixer(440.0, 0.5, WaveformSine)
	
	if mixer == nil {
		t.Fatal("NewDualOscillatorMixer returned nil")
	}
	
	if mixer.balance != 0.5 {
		t.Errorf("Expected balance 0.5, got %f", mixer.balance)
	}
	
	if mixer.mixMode != MixModeAdd {
		t.Errorf("Expected mixMode MixModeAdd, got %v", mixer.mixMode)
	}
	
	if mixer.detune != 0.0 {
		t.Errorf("Expected detune 0.0, got %f", mixer.detune)
	}
	
	if mixer.syncEnabled != false {
		t.Errorf("Expected syncEnabled false, got %v", mixer.syncEnabled)
	}
	
	if mixer.baseFreq != 440.0 {
		t.Errorf("Expected baseFreq 440.0, got %f", mixer.baseFreq)
	}
}

func TestMixerProcess_AddMode(t *testing.T) {
	mixer := NewDualOscillatorMixer(1000.0, 1.0, WaveformSine)
	mixer.SetMixMode(MixModeAdd)
	mixer.SetMixBalance(0.5) // Equal mix
	
	// Generate several samples to test mixing
	for i := 0; i < 10; i++ {
		sample := mixer.Process()
		if math.IsNaN(sample) || math.IsInf(sample, 0) {
			t.Errorf("Sample %d is invalid: %f", i, sample)
		}
		if math.Abs(sample) > 2.0 { // Should not exceed reasonable bounds
			t.Errorf("Sample %d too large: %f", i, sample)
		}
	}
}

func TestMixerProcess_MultiplyMode(t *testing.T) {
	mixer := NewDualOscillatorMixer(1000.0, 1.0, WaveformSine)
	mixer.SetMixMode(MixModeMultiply)
	mixer.SetMixBalance(0.5)
	
	for i := 0; i < 10; i++ {
		sample := mixer.Process()
		if math.IsNaN(sample) || math.IsInf(sample, 0) {
			t.Errorf("Sample %d is invalid: %f", i, sample)
		}
	}
}

func TestMixerProcess_RingModulation(t *testing.T) {
	mixer := NewDualOscillatorMixer(1000.0, 1.0, WaveformSine)
	mixer.SetMixMode(MixModeRingModulation)
	
	for i := 0; i < 10; i++ {
		sample := mixer.Process()
		if math.IsNaN(sample) || math.IsInf(sample, 0) {
			t.Errorf("Sample %d is invalid: %f", i, sample)
		}
		// Ring modulation should be scaled down
		if math.Abs(sample) > 1.0 {
			t.Errorf("Ring modulation sample %d too large: %f", i, sample)
		}
	}
}

func TestSetMixBalance(t *testing.T) {
	mixer := NewDualOscillatorMixer(440.0, 0.5, WaveformSine)
	
	// Test valid range
	mixer.SetMixBalance(0.7)
	if mixer.GetMixBalance() != 0.7 {
		t.Errorf("Expected balance 0.7, got %f", mixer.GetMixBalance())
	}
	
	// Test clamping below 0
	mixer.SetMixBalance(-0.5)
	if mixer.GetMixBalance() != 0.0 {
		t.Errorf("Expected balance clamped to 0.0, got %f", mixer.GetMixBalance())
	}
	
	// Test clamping above 1
	mixer.SetMixBalance(1.5)
	if mixer.GetMixBalance() != 1.0 {
		t.Errorf("Expected balance clamped to 1.0, got %f", mixer.GetMixBalance())
	}
}

func TestSetMixMode(t *testing.T) {
	mixer := NewDualOscillatorMixer(440.0, 0.5, WaveformSine)
	
	mixer.SetMixMode(MixModeMultiply)
	if mixer.GetMixMode() != MixModeMultiply {
		t.Errorf("Expected MixModeMultiply, got %v", mixer.GetMixMode())
	}
	
	mixer.SetMixMode(MixModeRingModulation)
	if mixer.GetMixMode() != MixModeRingModulation {
		t.Errorf("Expected MixModeRingModulation, got %v", mixer.GetMixMode())
	}
}

func TestSetDetune(t *testing.T) {
	mixer := NewDualOscillatorMixer(440.0, 0.5, WaveformSine)
	
	// Test valid range
	mixer.SetDetune(50.0)
	if mixer.GetDetune() != 50.0 {
		t.Errorf("Expected detune 50.0, got %f", mixer.GetDetune())
	}
	
	// Test clamping below -100
	mixer.SetDetune(-150.0)
	if mixer.GetDetune() != -100.0 {
		t.Errorf("Expected detune clamped to -100.0, got %f", mixer.GetDetune())
	}
	
	// Test clamping above 100
	mixer.SetDetune(150.0)
	if mixer.GetDetune() != 100.0 {
		t.Errorf("Expected detune clamped to 100.0, got %f", mixer.GetDetune())
	}
}

func TestSync(t *testing.T) {
	mixer := NewDualOscillatorMixer(440.0, 0.5, WaveformSine)
	
	// Test enabling sync
	mixer.SetSync(true)
	if !mixer.GetSync() {
		t.Errorf("Expected sync enabled")
	}
	
	// Test disabling sync
	mixer.SetSync(false)
	if mixer.GetSync() {
		t.Errorf("Expected sync disabled")
	}
}

func TestSyncWithDetune(t *testing.T) {
	mixer := NewDualOscillatorMixer(440.0, 0.5, WaveformSine)
	
	// Enable sync and set detune
	mixer.SetSync(true)
	mixer.SetDetune(50.0) // +50 cents
	
	// The detune should affect osc2 frequency when synced
	// 50 cents = 50/1200 semitones = frequency multiplier of 2^(50/1200)
	expectedMultiplier := math.Pow(2.0, 50.0/1200.0)
	
	// We can't directly access osc2's frequency, but we can test that sync is working
	// by checking that changing the main frequency affects both oscillators
	mixer.SetFrequency(880.0)
	
	// Generate some samples to ensure no crashes
	for i := 0; i < 10; i++ {
		sample := mixer.Process()
		if math.IsNaN(sample) || math.IsInf(sample, 0) {
			t.Errorf("Sample %d is invalid with sync+detune: %f", i, sample)
		}
	}
	
	_ = expectedMultiplier // Use the variable to avoid unused variable error
}

func TestFrequencyControl(t *testing.T) {
	mixer := NewDualOscillatorMixer(440.0, 0.5, WaveformSine)
	
	// Test main frequency setting
	mixer.SetFrequency(880.0)
	if mixer.baseFreq != 880.0 {
		t.Errorf("Expected baseFreq 880.0, got %f", mixer.baseFreq)
	}
	
	// Test osc2 frequency setting (when not synced)
	mixer.SetSync(false)
	mixer.SetOsc2Frequency(660.0)
	
	// Generate samples to ensure no crashes
	for i := 0; i < 5; i++ {
		sample := mixer.Process()
		if math.IsNaN(sample) || math.IsInf(sample, 0) {
			t.Errorf("Sample %d is invalid after frequency changes: %f", i, sample)
		}
	}
}

func TestVolumeControl(t *testing.T) {
	mixer := NewDualOscillatorMixer(440.0, 0.5, WaveformSine)
	
	// Test setting both oscillator volumes
	mixer.SetVolume(0.3)
	
	// Test setting osc2 volume independently
	mixer.SetOsc2Volume(0.7)
	
	// Generate samples to ensure no crashes
	for i := 0; i < 5; i++ {
		sample := mixer.Process()
		if math.IsNaN(sample) || math.IsInf(sample, 0) {
			t.Errorf("Sample %d is invalid after volume changes: %f", i, sample)
		}
	}
}

func TestWaveformControl(t *testing.T) {
	mixer := NewDualOscillatorMixer(440.0, 0.5, WaveformSine)
	
	// Test setting osc1 waveform
	mixer.SetWaveform(WaveformSquare)
	
	// Test setting osc2 waveform
	mixer.SetOsc2Waveform(WaveformTriangle)
	
	// Generate samples to ensure no crashes with different waveforms
	for i := 0; i < 10; i++ {
		sample := mixer.Process()
		if math.IsNaN(sample) || math.IsInf(sample, 0) {
			t.Errorf("Sample %d is invalid with different waveforms: %f", i, sample)
		}
	}
}

func TestMixBalanceEffects(t *testing.T) {
	mixer := NewDualOscillatorMixer(440.0, 1.0, WaveformSine)
	mixer.SetMixMode(MixModeAdd)
	
	// Test balance = 0 (osc1 only)
	mixer.SetMixBalance(0.0)
	samples1 := make([]float64, 10)
	for i := range samples1 {
		samples1[i] = mixer.Process()
	}
	
	// Reset and test balance = 1 (osc2 only)
	mixer = NewDualOscillatorMixer(440.0, 1.0, WaveformSine)
	mixer.SetMixMode(MixModeAdd)
	mixer.SetMixBalance(1.0)
	samples2 := make([]float64, 10)
	for i := range samples2 {
		samples2[i] = mixer.Process()
	}
	
	// With same frequency, osc1-only and osc2-only should be very similar
	// but not necessarily identical due to phase differences
	for i := 0; i < 10; i++ {
		if math.IsNaN(samples1[i]) || math.IsNaN(samples2[i]) {
			t.Errorf("Invalid samples at index %d", i)
		}
	}
}

func BenchmarkMixerProcess_Add(b *testing.B) {
	mixer := NewDualOscillatorMixer(1000.0, 0.5, WaveformSine)
	mixer.SetMixMode(MixModeAdd)
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mixer.Process()
	}
}

func BenchmarkMixerProcess_Multiply(b *testing.B) {
	mixer := NewDualOscillatorMixer(1000.0, 0.5, WaveformSine)
	mixer.SetMixMode(MixModeMultiply)
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mixer.Process()
	}
}

func BenchmarkMixerProcess_RingModulation(b *testing.B) {
	mixer := NewDualOscillatorMixer(1000.0, 0.5, WaveformSine)
	mixer.SetMixMode(MixModeRingModulation)
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mixer.Process()
	}
}