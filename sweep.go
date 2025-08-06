package main

import (
	"context"
	"sync"
	"time"
)

type SweepManager struct {
	mu           sync.RWMutex
	active       bool
	cancel       context.CancelFunc
	startFreq    float64
	endFreq      float64
	duration     float64
	setFrequency func(float64)
	onUpdate     func(float64)
}

func NewSweepManager(setFrequency func(float64), onUpdate func(float64)) *SweepManager {
	return &SweepManager{
		setFrequency: setFrequency,
		onUpdate:     onUpdate,
	}
}

func (s *SweepManager) StartSweep(startFreq, endFreq, duration float64) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.active {
		s.cancel()
	}

	s.startFreq = startFreq
	s.endFreq = endFreq
	s.duration = duration

	ctx, cancel := context.WithCancel(context.Background())
	s.cancel = cancel
	s.active = true

	go s.runSweep(ctx)
}

func (s *SweepManager) StopSweep() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.active && s.cancel != nil {
		s.cancel()
		s.active = false
	}
}

func (s *SweepManager) IsSweeping() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.active
}

func (s *SweepManager) runSweep(ctx context.Context) {
	defer func() {
		s.mu.Lock()
		s.active = false
		s.mu.Unlock()
	}()

	ticker := time.NewTicker(20 * time.Millisecond)
	defer ticker.Stop()

	startTime := time.Now()
	duration := time.Duration(s.duration * float64(time.Second))

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			elapsed := time.Since(startTime)
			
			if elapsed >= duration {
				return
			}

			progress := float64(elapsed) / float64(duration)
			
			currentFreq := s.startFreq + (s.endFreq-s.startFreq)*progress
			
			s.setFrequency(currentFreq)
			
			if s.onUpdate != nil {
				s.onUpdate(currentFreq)
			}
		}
	}
}