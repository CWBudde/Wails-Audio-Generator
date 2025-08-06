package main

import (
	"math"
	"sync"
)

// MixMode represents different mixing modes for dual oscillators
type MixMode int

const (
	MixModeAdd MixMode = iota
	MixModeMultiply
	MixModeRingModulation
)

// DualOscillatorMixer manages two SignalGenerator instances with mixing capabilities
type DualOscillatorMixer struct {
	osc1        SignalGenerator
	osc2        SignalGenerator
	balance     float64  // 0.0 = osc1 only, 1.0 = osc2 only
	mixMode     MixMode
	detune      float64  // Detune amount in cents (-100 to +100)
	syncEnabled bool     // When true, osc2 frequency follows osc1
	baseFreq    float64  // Base frequency for sync calculations
	mu          sync.Mutex
}

// NewDualOscillatorMixer creates a new dual oscillator mixer
func NewDualOscillatorMixer(freq float64, volume float64, waveform WaveformType) *DualOscillatorMixer {
	return &DualOscillatorMixer{
		osc1:        NewSignalGenerator(freq, volume, waveform),
		osc2:        NewSignalGenerator(freq, volume, waveform),
		balance:     0.5,  // Equal mix by default
		mixMode:     MixModeAdd,
		detune:      0.0,  // No detune by default
		syncEnabled: false,
		baseFreq:    freq,
	}
}

// Process generates the next mixed sample from both oscillators
func (m *DualOscillatorMixer) Process() float64 {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	sample1 := m.osc1.Process()
	sample2 := m.osc2.Process()
	
	switch m.mixMode {
	case MixModeAdd:
		// Linear interpolation between osc1 and osc2
		return sample1*(1.0-m.balance) + sample2*m.balance
	case MixModeMultiply:
		// Multiply with balance controlling osc2's contribution
		if m.balance == 0.0 {
			return sample1
		}
		return sample1 * (sample2 * m.balance)
	case MixModeRingModulation:
		// Ring modulation (multiplication) with equal balance
		return sample1 * sample2 * 0.5  // Scale down to prevent clipping
	default:
		return sample1*(1.0-m.balance) + sample2*m.balance
	}
}

// SetFrequency sets the frequency for oscillator 1 (and osc2 if synced)
func (m *DualOscillatorMixer) SetFrequency(freq float64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.baseFreq = freq
	m.osc1.SetFrequency(freq)
	
	if m.syncEnabled {
		// Apply detune to osc2 when synced
		detuneMultiplier := math.Pow(2.0, m.detune/1200.0) // Convert cents to frequency ratio
		m.osc2.SetFrequency(freq * detuneMultiplier)
	}
}

// SetOsc2Frequency sets the frequency for oscillator 2 (only when not synced)
func (m *DualOscillatorMixer) SetOsc2Frequency(freq float64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if !m.syncEnabled {
		m.osc2.SetFrequency(freq)
	}
}

// SetVolume sets the volume for both oscillators
func (m *DualOscillatorMixer) SetVolume(vol float64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.osc1.SetVolume(vol)
	m.osc2.SetVolume(vol)
}

// SetOsc2Volume sets the volume for oscillator 2 only
func (m *DualOscillatorMixer) SetOsc2Volume(vol float64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.osc2.SetVolume(vol)
}

// SetWaveform sets the waveform for oscillator 1
func (m *DualOscillatorMixer) SetWaveform(waveform WaveformType) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.osc1.SetWaveform(waveform)
}

// SetOsc2Waveform sets the waveform for oscillator 2
func (m *DualOscillatorMixer) SetOsc2Waveform(waveform WaveformType) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.osc2.SetWaveform(waveform)
}

// SetMixBalance sets the balance between oscillators (0.0 = osc1 only, 1.0 = osc2 only)
func (m *DualOscillatorMixer) SetMixBalance(balance float64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if balance < 0.0 {
		balance = 0.0
	} else if balance > 1.0 {
		balance = 1.0
	}
	m.balance = balance
}

// SetMixMode sets the mixing mode (Add, Multiply, Ring Modulation)
func (m *DualOscillatorMixer) SetMixMode(mode MixMode) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.mixMode = mode
}

// SetDetune sets the detune amount for osc2 in cents (-100 to +100)
func (m *DualOscillatorMixer) SetDetune(cents float64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if cents < -100.0 {
		cents = -100.0
	} else if cents > 100.0 {
		cents = 100.0
	}
	
	m.detune = cents
	
	// Update osc2 frequency if synced
	if m.syncEnabled {
		detuneMultiplier := math.Pow(2.0, m.detune/1200.0)
		m.osc2.SetFrequency(m.baseFreq * detuneMultiplier)
	}
}

// SetSync enables or disables frequency sync between oscillators
func (m *DualOscillatorMixer) SetSync(enabled bool) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.syncEnabled = enabled
	
	if enabled {
		// When enabling sync, set osc2 to follow osc1 with detune
		detuneMultiplier := math.Pow(2.0, m.detune/1200.0)
		m.osc2.SetFrequency(m.baseFreq * detuneMultiplier)
	}
}

// GetMixBalance returns the current mix balance
func (m *DualOscillatorMixer) GetMixBalance() float64 {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.balance
}

// GetMixMode returns the current mix mode
func (m *DualOscillatorMixer) GetMixMode() MixMode {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.mixMode
}

// GetDetune returns the current detune amount in cents
func (m *DualOscillatorMixer) GetDetune() float64 {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.detune
}

// GetSync returns whether sync is enabled
func (m *DualOscillatorMixer) GetSync() bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.syncEnabled
}