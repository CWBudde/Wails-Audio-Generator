# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an audio frequency generator built with Go backend and React TypeScript frontend using the Wails framework. The application generates sine wave audio signals with adjustable frequency (20Hz-20kHz) and volume (-80dB to 0dB) using complex number oscillators and PortAudio for real-time audio output.

## Development Commands

### Build and Run
- `wails dev` - Start development mode with hot reload
- `wails build` - Build production executable
- `wails doctor` - Diagnose development environment

### Frontend Development
Navigate to `frontend/` directory:
- `npm install` - Install dependencies
- `npm run dev` - Start Vite dev server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

## Architecture Overview

### Backend (Go)
- **main.go**: Wails app initialization and configuration
- **app.go**: Main application struct with PortAudio integration
  - Manages audio stream lifecycle (start/stop)
  - Thread-safe oscillator control with mutex
  - Exposes `StartAudio()`, `StopAudio()`, `SetFrequency()`, `SetVolume()` to frontend
- **oscillator.go**: Complex number-based sine wave generator
  - Uses complex exponentials for efficient phase accumulation
  - Maintains phase continuity during frequency/volume changes
  - Sample rate: 44.1kHz, buffer size: 512 samples

### Frontend (React TypeScript)
- **App.tsx**: Main UI component with frequency/volume sliders
- **utils.ts**: Audio utility functions
  - Logarithmic frequency mapping (20Hz-20kHz)
  - dB to linear volume conversion
  - Slider position calculations
- **wailsjs/**: Auto-generated Wails bindings for Go backend functions

### Key Technical Details
- Audio uses complex oscillator: `state *= phaseIncrement` for phase accumulation
- Frequency range: 20Hz to 20kHz (logarithmic slider mapping)
- Volume range: -80dB to 0dB (linear to dB conversion)
- Thread-safe audio control with mutex locking
- Real-time parameter updates without audio artifacts