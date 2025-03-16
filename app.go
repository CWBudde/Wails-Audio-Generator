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
	oscillator  *ComplexOscillator
	stream      *portaudio.Stream
	mu          sync.Mutex
	isStreaming bool
}

// NewApp initializes the app
func NewApp() *App {
	return &App{
		oscillator: NewComplexOscillator(440.0, 1.0), // Default 440Hz, 1.0 scale factor (volume)
	}
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
			out[i] = float32(a.oscillator.Process()) // Generate sound
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
	a.oscillator.SetFrequency(freq)
}

func (a *App) SetVolume(scale float64) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.oscillator.SetVolume(scale)
}
