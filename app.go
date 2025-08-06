package main

import (
	"context"
	"log"
	"sync"

	"github.com/gordonklaus/portaudio"
)

// App struct
type App struct {
	ctx         context.Context
	mixer       *DualOscillatorMixer
	stream      *portaudio.Stream
	mu          sync.Mutex
	isStreaming bool
	sweepManager1 *SweepManager
	sweepManager2 *SweepManager
}

// NewApp initializes the app
func NewApp() *App {
	app := &App{
		mixer: NewDualOscillatorMixer(440.0, 1.0, WaveformSine), // Default 440Hz, 1.0 volume, sine wave
	}
	
	// Initialize sweep managers
	app.sweepManager1 = NewSweepManager(
		func(freq float64) { app.SetFrequency(freq) },
		nil, // No update callback for now
	)
	
	app.sweepManager2 = NewSweepManager(
		func(freq float64) { app.SetOsc2Frequency(freq) },
		nil, // No update callback for now
	)
	
	return app
}

// startup initializes PortAudio
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	portaudio.Initialize()
}

// StartAudio starts the audio stream
func (a *App) StartAudio() {
	a.mu.Lock()
	defer a.mu.Unlock()

	if a.isStreaming {
		return
	}

	buffer := make([]float32, 512)

	stream, err := portaudio.OpenDefaultStream(0, 1, 44100, len(buffer), func(out []float32) {
		a.mu.Lock()
		defer a.mu.Unlock()
		for i := range out {
			out[i] = float32(a.mixer.Process()) // Generate mixed sound
		}
	})
	if err != nil {
		log.Fatalf("Failed to open PortAudio stream: %v", err)
	}

	a.stream = stream
	a.isStreaming = true

	if err := stream.Start(); err != nil {
		log.Fatalf("Failed to start PortAudio stream: %v", err)
	}
}

// StopAudio stops the audio stream
func (a *App) StopAudio() {
	a.mu.Lock()
	defer a.mu.Unlock()

	if !a.isStreaming {
		return
	}

	a.isStreaming = false
	if a.stream != nil {
		a.stream.Stop()
		a.stream.Close()
	}
}

func (a *App) SetFrequency(freq float64) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.mixer.SetFrequency(freq)
}

func (a *App) SetVolume(scale float64) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.mixer.SetVolume(scale)
}

func (a *App) SetWaveform(waveformType int) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.mixer.SetWaveform(WaveformType(waveformType))
}

// New methods for dual oscillator control

func (a *App) SetOsc2Frequency(freq float64) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.mixer.SetOsc2Frequency(freq)
}

func (a *App) SetOsc2Volume(scale float64) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.mixer.SetOsc2Volume(scale)
}

func (a *App) SetOsc2Waveform(waveformType int) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.mixer.SetOsc2Waveform(WaveformType(waveformType))
}

func (a *App) SetMixBalance(balance float64) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.mixer.SetMixBalance(balance)
}

func (a *App) SetMixMode(mode int) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.mixer.SetMixMode(MixMode(mode))
}

func (a *App) SetDetune(cents float64) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.mixer.SetDetune(cents)
}

func (a *App) SetSync(enabled bool) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.mixer.SetSync(enabled)
}

// Getter methods for frontend state synchronization

func (a *App) GetMixBalance() float64 {
	a.mu.Lock()
	defer a.mu.Unlock()
	return a.mixer.GetMixBalance()
}

func (a *App) GetMixMode() int {
	a.mu.Lock()
	defer a.mu.Unlock()
	return int(a.mixer.GetMixMode())
}

func (a *App) GetDetune() float64 {
	a.mu.Lock()
	defer a.mu.Unlock()
	return a.mixer.GetDetune()
}

func (a *App) GetSync() bool {
	a.mu.Lock()
	defer a.mu.Unlock()
	return a.mixer.GetSync()
}

// Sweep methods for Oscillator 1
func (a *App) StartSweep1(startFreq, endFreq, duration float64) {
	a.sweepManager1.StartSweep(startFreq, endFreq, duration)
}

func (a *App) StopSweep1() {
	a.sweepManager1.StopSweep()
}

func (a *App) IsSweeping1() bool {
	return a.sweepManager1.IsSweeping()
}

// Sweep methods for Oscillator 2
func (a *App) StartSweep2(startFreq, endFreq, duration float64) {
	a.sweepManager2.StartSweep(startFreq, endFreq, duration)
}

func (a *App) StopSweep2() {
	a.sweepManager2.StopSweep()
}

func (a *App) IsSweeping2() bool {
	return a.sweepManager2.IsSweeping()
}
