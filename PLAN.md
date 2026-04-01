# AudioFreqGenerator Enhancement Plan

Based on analysis of the current codebase, here's a comprehensive plan to enhance the audio frequency generator:

## 🎯 Progress Status

- **Phase 1 - Core Audio Features**: ✅ **COMPLETED** with architecture refactoring + sweep functionality  
- **Phase 2 - Frontend Technical Modernization**: ✅ **COMPLETED** Stage 1-3 (modern React, TypeScript, tooling + Zustand state management + Headless UI component system)
- **Phase 3 - UX Redesign**: 🚧 **IMMEDIATE PRIORITY** (addresses critical frequency control conflicts)
- **Overall Progress**: 2/3 core phases complete (backend + frontend modernization complete)
- **Next Priority**: Complete UX overhaul BEFORE any performance optimizations or advanced features
- **Test Coverage**: 90 tests (31 Go + 59 TypeScript) - All passing ✅
- **Performance**: Optimized for real-time audio (3-54ns per sample)
- **Architecture**: Clean separation with SignalGenerator interface + Zustand state management architecture
- **Frontend**: Professional development environment with strict TypeScript, testing, tooling, centralized state management, and modern Headless UI + Tailwind component system
- **UX Priority**: Critical UX issues identified - frequency control mode conflicts need immediate attention before any other enhancements

## Phase 1: Core Audio Features 🎵

### Multiple Waveforms ✅ COMPLETED

- [x] Add square wave generator to oscillator.go
- [x] Add triangle wave generator to oscillator.go
- [x] Add sawtooth wave generator to oscillator.go
- [x] Add white noise generator (uniform random distribution)
- [x] Add pink noise generator (1/f spectrum using Voss-McCartney algorithm)
- [x] Add brown noise generator (1/f² spectrum using integration)
- [x] Update frontend UI with waveform selector dropdown
- [x] Add SetWaveform() method to app.go
- [x] Add comprehensive test coverage (30 Go tests + 27 frontend tests)
- [x] Performance benchmarks (3-54ns per sample, zero allocations)

### Architecture Refactoring ✅ COMPLETED

- [x] Create SignalGenerator interface for extensible design
- [x] Split oscillator.go into focused modules:
  - [x] generator.go - Interface and factory functions
  - [x] oscillator.go - PhaseOscillator for sine/square/triangle/sawtooth
  - [x] noise.go - NoiseGenerator for white/pink/brown noise
- [x] Update app.go to use factory pattern and interface
- [x] Modernize for loop syntax (fix diagnostic issues)
- [x] Update all tests to work with new architecture
- [x] Verify functionality with full test suite

### Dual Oscillators ✅ COMPLETED

- [x] Create second SignalGenerator instance in app.go
- [x] Add mixing logic for dual generators
- [x] Add frequency controls for generator 2 in frontend
- [x] Add generator balance/mix slider
- [x] Implement generator sync and detune features

### Frequency Sweeps ✅ COMPLETED

- [x] Add sweep functionality with SweepManager struct
- [x] Implement linear frequency sweep with configurable parameters
- [x] Add sweep controls (start/end freq, duration) in frontend
- [x] Integrate sweep managers for both oscillators
- [x] Add thread-safe sweep execution with context cancellation
- [x] Add comprehensive test coverage for sweep functionality

## Phase 2: Frontend Technical Modernization 🏗️

### Current Technical Debt Identified
- **Outdated Patterns**: Using older React patterns, inconsistent TypeScript usage
- **Architecture**: No proper state management, monolithic component structure
- **Performance**: Unoptimized re-renders, bundle size concerns, no code splitting
- **Tooling**: Missing modern development tools, linting, formatting standards
- **Testing**: Limited component testing infrastructure
- **Accessibility**: Basic accessibility compliance missing

### Stage 1: Development Foundation ✅ COMPLETED

**Core Technical Principle**: Establish professional development environment and tooling

- [x] **Modern React Patterns**: Refactored to custom hooks architecture with functional components
- [x] **TypeScript Overhaul**: Strict TypeScript configuration with comprehensive type coverage
- [x] **Development Tooling**: ESLint 8 + Prettier + VSCode integration configured
- [x] **Build Optimization**: Vite optimized with code splitting (components/hooks/vendor chunks)
- [x] **Performance Monitoring**: Bundle analyzer integration for build optimization
- [x] **Testing Infrastructure**: React Testing Library + Vitest with 32 component/hook tests
- [x] **Documentation**: JSDoc comments, DEVELOPMENT.md guide, comprehensive README

**Key Achievements:**
- **Architecture Modernization**: Extracted business logic into reusable custom hooks
- **Component Composition**: Clean separation of concerns with hook-based state management
- **Type Safety**: All components and hooks fully typed with strict TypeScript
- **Test Coverage**: 63 total tests (31 Go + 32 TypeScript) - all passing
- **Developer Experience**: Professional tooling with linting, formatting, and type checking
- **Build Optimization**: Automatic code splitting reduces initial bundle size
- **Documentation**: Complete development guidelines and API documentation

### Stage 2: State Management & Architecture ✅ COMPLETED

**Core Technical Principle**: Predictable, maintainable state management architecture

- [x] **State Management Research**: Evaluate Zustand vs Redux Toolkit vs React Context patterns
- [x] **State Architecture**: Design global vs local state separation
- [x] **Component Architecture**: Create reusable, composable component hierarchy
- [x] **Custom Hooks**: Extract business logic into reusable hooks
- [x] **Type Safety**: Comprehensive TypeScript interfaces for all state
- [x] **State Persistence**: Local storage integration, session management
- [x] **Performance**: Minimize re-renders, implement proper memoization
- [x] **Error Boundaries**: Proper error handling and recovery

### Stage 3: Modern Component System ✅ COMPLETED

**Core Technical Principle**: Consistent, accessible, maintainable UI component library

- [x] **Component Library Research**: Evaluated and selected Headless UI + Tailwind CSS for optimal accessibility and maintainability
- [x] **Design System Implementation**: Complete Tailwind-based design system with typography, spacing, color palette (primary/gray/accent), and component variants
- [x] **Component Migration**: Systematically replaced existing custom components with Headless UI components
  - [x] Migrated waveform selectors to Headless UI Listbox with animations
  - [x] Enhanced all form controls with consistent Tailwind styling
  - [x] Modernized button system with .btn, .btn-primary, .btn-secondary classes
  - [x] Updated layout components with responsive containers and flexible grids
- [x] **Theme Architecture**: Dark theme implemented with Tailwind CSS variables and consistent color system
- [x] **Responsive Design**: Mobile-first approach with breakpoint system and flexible layouts implemented
- [x] **Accessibility Foundation**: ARIA labels, keyboard navigation, and screen reader support via Headless UI
- [x] **Icon System**: Heroicons integrated for consistent iconography (@heroicons/react)
- [x] **Animation Framework**: Smooth transitions and micro-interactions implemented with Tailwind transitions and Headless UI animations

**Key Achievements:**
- **Modern UI Components**: All form controls upgraded to accessible Headless UI components
- **Professional Design System**: Consistent Tailwind-based styling with dark theme support
- **Enhanced UX**: Smooth animations, hover effects, and visual feedback throughout
- **Accessibility Compliance**: Full keyboard navigation and screen reader support
- **Responsive Layout**: Mobile-optimized design with flexible container system
- **Developer Experience**: Maintainable component system ready for future enhancements

## Phase 3: UX Redesign & User Experience 🎨

### Current UX Issues Identified

- **Modal Conflicts**: Frequency control vs sweep functionality creates confusion
- **Context Mismatch**: Sweep controls shown for noise generators where irrelevant
- **State Clarity**: No clear distinction between manual and automated control modes
- **User Mental Model**: Users expect either fixed frequency OR sweep, not both simultaneously
- **Feedback**: Limited visual feedback about current state and available actions

### Stage 1: Frequency Control Mode System 🎛️

**Core UX Principle**: Each oscillator operates in one of two exclusive modes: Fixed Frequency or Sweep Mode

- [ ] **Mode Toggle Design**: Prominent toggle switches for each oscillator (Fixed/Sweep)
- [ ] **Conditional UI Rendering**: Show only relevant controls based on current mode
  - Fixed Mode: Show frequency slider, hide sweep controls
  - Sweep Mode: Show sweep controls, hide/disable frequency slider
- [ ] **Mode Indicators**: Clear visual feedback showing current mode state
- [ ] **Smooth Transitions**: Animated transitions between mode states
- [ ] **Context-Aware Controls**: Sweep mode only available for tonal waveforms
- [ ] **Noise Generator Logic**: Auto-lock noise generators to Fixed Mode

### Stage 2: Waveform-Aware Interface 🌊

**Core UX Principle**: Interface adapts intelligently to selected waveform type

- [ ] **Waveform Categories**: Group into Tonal (sine, square, triangle, sawtooth) and Noise (white, pink, brown)
- [ ] **Conditional Feature Availability**: 
  - Tonal waveforms: Both Fixed and Sweep modes available
  - Noise waveforms: Only Fixed mode, sweep controls hidden
- [ ] **Visual Grouping**: Different styling for tonal vs noise waveform sections
- [ ] **Intelligent Defaults**: Smart mode selection when switching waveforms
- [ ] **Contextual Help**: Tooltips explaining feature availability per waveform type

### Stage 3: Enhanced Control Layout & Information Architecture 📋

**Core UX Principle**: Clear visual hierarchy and logical grouping of related controls

- [ ] **Information Architecture**: Restructure control grouping and hierarchy
- [ ] **Progressive Disclosure**: Show basic controls first, advanced on expand
- [ ] **Visual Hierarchy**: Typography, spacing, color to guide attention
- [ ] **Control Grouping**: Logically group related controls together
- [ ] **Keyboard Navigation**: Full keyboard accessibility, shortcuts, focus management
- [ ] **Touch Optimization**: Mobile gesture support, touch-friendly sizing
- [ ] **Screen Reader Support**: Semantic HTML, comprehensive ARIA implementation

### Stage 4: State Persistence & User Intent 💾

**Core UX Principle**: Preserve user intent and provide predictable, learnable behavior

- [ ] **Mode Memory**: Remember last used mode for each waveform type
- [ ] **State Validation**: Prevent impossible state combinations
- [ ] **Session Persistence**: Save current settings between app sessions
- [ ] **Reset Functions**: Easy way to return to sensible default states
- [ ] **Undo/Redo**: Allow users to revert recent changes
- [ ] **Preset Integration**: Save/load both frequency and sweep settings in presets

### Stage 5: User Feedback & Guidance 🎯

**Core UX Principle**: Users always understand current state and available actions

- [ ] **Status Indicators**: Clear visual feedback about current mode and activity
- [ ] **Progress Visualization**: Show sweep progress with visual indicators
- [ ] **Error Prevention**: Disable invalid actions rather than showing errors
- [ ] **Contextual Guidance**: Helpful hints about how to use different modes
- [ ] **Onboarding**: Brief interactive tour for new users
- [ ] **Help System**: Contextual help, keyboard shortcut reference

## Phase 4: Post-UX User Features 🎵

> **Note**: These features should only be implemented AFTER Phase 3 (UX Redesign) is complete

### Preset System

- [ ] Create preset data structure
- [ ] Implement save preset functionality
- [ ] Implement load preset functionality
- [ ] Add preset management UI
- [ ] Store presets in local file system
- [ ] Add factory presets for common tones

### Enhanced UI Controls

- [ ] Add detented positions for musical notes
- [ ] Implement fine/coarse adjustment modes
- [ ] Add numeric input alongside sliders
- [ ] Add slider value tooltips
- [ ] Implement keyboard shortcuts for common frequencies

### Audio Recording

- [ ] Add WAV file export capability
- [ ] Implement real-time recording buffer
- [ ] Add record/stop controls to UI
- [ ] Add recording duration limits
- [ ] Add file save dialog integration

## Phase 5: Post-UX Performance & Technical Optimizations ⚡

> **Note**: These optimizations should only be implemented AFTER Phase 3 (UX Redesign) is complete to avoid premature optimization

### Performance Monitoring

- [ ] Add CPU usage monitoring
- [ ] Implement audio dropout detection
- [ ] Add performance metrics display
- [ ] Create performance logging
- [ ] Add performance warnings/alerts

### Layout & Performance Optimization

**Core Technical Principle**: Scalable, performant layout system for future growth

- [ ] **Layout System**: Modern CSS Grid/Flexbox patterns, container queries
- [ ] **Panel Architecture**: Collapsible/expandable sections, resizable panels
- [ ] **Viewport Management**: Proper responsive breakpoints, mobile optimization
- [ ] **Code Splitting**: Route-based and component-based code splitting
- [ ] **Bundle Optimization**: Tree shaking, dynamic imports, lazy loading
- [ ] **Asset Optimization**: Image optimization, font loading strategies
- [ ] **Performance Metrics**: Core Web Vitals monitoring, render performance
- [ ] **Progressive Enhancement**: Graceful degradation, offline considerations

### Audio Device Optimization

- [ ] Enumerate available audio output devices
- [ ] Add device selection dropdown in UI
- [ ] Implement device switching without restart
- [ ] Add device status monitoring
- [ ] Handle device disconnect/reconnect events

### Buffer Size Configuration

- [ ] Add configurable audio buffer sizes
- [ ] Implement latency measurement
- [ ] Add buffer size selection in settings
- [ ] Display current latency to user
- [ ] Add automatic buffer size optimization

### Error Handling Enhancement

- [ ] Add comprehensive error handling to audio initialization
- [ ] Implement graceful degradation for audio device failures
- [ ] Add user-friendly error messages
- [ ] Implement audio device reconnection logic
- [ ] Add logging system for debugging

### Advanced Testing

- [ ] Create test suite for audio utility functions
- [ ] Add tests for oscillator behavior
- [ ] Test frequency/volume conversion functions
- [ ] Add integration tests for audio pipeline
- [ ] Implement automated testing in CI

## Phase 6: Post-UX Advanced Features 🚀

> **Note**: These advanced features should only be implemented AFTER Phase 3 (UX Redesign) is complete

### Advanced Audio Features

- [ ] Create LFO struct with various waveforms
- [ ] Add frequency modulation capability
- [ ] Add amplitude modulation capability
- [ ] Add LFO rate and depth controls
- [ ] Implement LFO to oscillator routing

### Audio Effects

- [ ] Create effects interface and base structure
- [ ] Implement basic reverb effect
- [ ] Implement delay effect with feedback
- [ ] Implement basic distortion/overdrive
- [ ] Add effects chain management
- [ ] Add effect parameter controls in UI

### Visualizations

- [ ] Create canvas-based oscilloscope component
- [ ] Implement real-time waveform rendering
- [ ] Add zoom and timebase controls
- [ ] Add trigger functionality
- [ ] Integrate with audio output stream

### Spectrum Analyzer

- [ ] Implement FFT for frequency analysis
- [ ] Create spectrum display component
- [ ] Add frequency axis scaling
- [ ] Add dB scale display
- [ ] Add peak detection and display

### Keyboard Input

- [ ] Create piano keyboard component
- [ ] Map keyboard keys to musical frequencies
- [ ] Add octave selection controls
- [ ] Implement polyphonic capabilities
- [ ] Add velocity sensitivity

### Multi-channel Output

- [ ] Implement stereo panning controls
- [ ] Add support for 5.1/7.1 surround sound
- [ ] Create channel routing matrix
- [ ] Add per-channel volume controls
- [ ] Implement channel delay compensation

### MIDI Integration

- [ ] Add MIDI input device support
- [ ] Implement MIDI note to frequency conversion
- [ ] Add MIDI CC parameter control
- [ ] Create MIDI learn functionality
- [ ] Add MIDI device selection UI

### Plugin Architecture

- [ ] Design plugin interface specification
- [ ] Implement plugin loading system
- [ ] Create sample plugins (chorus, flanger)
- [ ] Add plugin management UI
- [ ] Implement plugin parameter automation

### Automation

- [ ] Create automation timeline system
- [ ] Implement parameter recording
- [ ] Add automation curve editing
- [ ] Create automation playback engine
- [ ] Add automation export/import

### Professional Presets

- [x] Add pink noise generator ✅ COMPLETED (moved to Phase 1)
- [x] Add white noise generator ✅ COMPLETED (moved to Phase 1)
- [x] Add brown noise generator ✅ COMPLETED (moved to Phase 1)
- [ ] Implement sine wave sweeps
- [ ] Add test tone sequences
- [ ] Create calibration tone presets
- [ ] Add broadcast/film industry standard tones

## Implementation Priority

### ⚠️ CRITICAL: UX-First Development Strategy

**IMPORTANT**: All optimizations and advanced features must wait until after Phase 3 (UX Redesign) is complete. This prevents premature optimization and ensures user experience issues are resolved first.

### Immediate Priority (Do Now)

- [x] Multiple waveforms ✅ COMPLETED WITH TESTS
- [x] **Phase 2 - Frontend Technical Modernization**: Modern React, TypeScript, tooling foundation ✅ COMPLETED WITH ZUSTAND STATE MANAGEMENT
- [ ] **Phase 3 - UX Redesign**: Frequency control mode system (CRITICAL UX ISSUE - must complete before anything else)

### Post-UX Priority (Only After Phase 3 Complete)

#### High Impact, Low Effort
- [ ] Preset system
- [ ] Enhanced UI controls (detented positions, numeric inputs)
- [ ] Audio recording functionality
- [ ] Basic error handling improvements

#### Medium Impact, Medium Effort  
- [ ] Performance monitoring and optimization
- [ ] Audio device selection optimization
- [ ] Buffer size configuration
- [ ] Waveform visualization
- [ ] Audio effects

#### High Impact, High Effort
- [ ] MIDI integration
- [ ] Automation system
- [ ] Multi-channel output
- [ ] Plugin architecture
- [ ] Advanced visualizations (spectrum analyzer)

### Infrastructure (Ongoing)

- [x] Unit testing ✅ COMPLETED (90 tests total)
- [ ] Performance monitoring (post-UX)
- [ ] Documentation updates
- [ ] Code refactoring (as needed)
