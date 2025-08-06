package main

import (
	"testing"
	"time"
)

func TestSweepManager(t *testing.T) {
	// Create a test oscillator
	oscillator := NewPhaseOscillator(440.0, 0.5, WaveformSine)
	
	// Track frequency changes
	var updatedFrequency float64
	updateCallback := func(freq float64) {
		updatedFrequency = freq
	}
	
	// Create sweep manager
	sweepManager := NewSweepManager(
		func(freq float64) { oscillator.SetFrequency(freq) },
		updateCallback,
	)
	
	// Test initial state
	if sweepManager.IsSweeping() {
		t.Error("SweepManager should not be sweeping initially")
	}
	
	// Start a short sweep
	startFreq := 100.0
	endFreq := 200.0
	duration := 0.1 // 100ms
	
	sweepManager.StartSweep(startFreq, endFreq, duration)
	
	// Check that sweep is active
	if !sweepManager.IsSweeping() {
		t.Error("SweepManager should be sweeping after StartSweep")
	}
	
	// Wait a bit and check frequency has changed
	time.Sleep(50 * time.Millisecond)
	
	if updatedFrequency < startFreq || updatedFrequency > endFreq {
		t.Errorf("Frequency should be between %f and %f, got %f", startFreq, endFreq, updatedFrequency)
	}
	
	// Wait for sweep to complete
	time.Sleep(200 * time.Millisecond)
	
	// Check that sweep has stopped
	if sweepManager.IsSweeping() {
		t.Error("SweepManager should not be sweeping after completion")
	}
	
	// Test manual stop
	sweepManager.StartSweep(startFreq, endFreq, 1.0) // 1 second sweep
	
	if !sweepManager.IsSweeping() {
		t.Error("SweepManager should be sweeping after second StartSweep")
	}
	
	sweepManager.StopSweep()
	
	// Give it a moment to stop
	time.Sleep(10 * time.Millisecond)
	
	if sweepManager.IsSweeping() {
		t.Error("SweepManager should not be sweeping after StopSweep")
	}
}