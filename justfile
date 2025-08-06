# Audio Frequency Generator - Just Commands

# Default recipe - show available commands
default:
    @just --list

# Development commands
dev:
    wails dev

# Build production executable
build:
    wails build

# Check development environment
doctor:
    wails doctor

# Frontend commands (run from project root)
install:
    cd frontend && npm install

fe-dev:
    cd frontend && npm run dev

fe-build:
    cd frontend && npm run build

fe-preview:
    cd frontend && npm run preview

# Testing
test:
    go test ./...

# Clean build artifacts
clean:
    rm -rf build/
    cd frontend && rm -rf dist/

# Full setup - install deps and build
setup:
    just install
    just build