# AudioFreqGenerator Frontend

Modern React frontend for the AudioFreqGenerator application, built with TypeScript, Vite, and comprehensive testing infrastructure.

## Features

- **Dual Oscillator Control**: Independent control of two audio oscillators
- **Multiple Waveforms**: Sine, square, triangle, sawtooth, and noise generation
- **Frequency Sweeps**: Linear frequency sweeps with configurable parameters
- **Mixer Controls**: Balance, mixing modes, sync, and detune functionality
- **Real-time Audio**: Direct integration with Go backend via Wails
- **Type-Safe**: Full TypeScript coverage with strict configuration
- **Well-Tested**: Comprehensive test suite with React Testing Library

## Technology Stack

### Core Technologies
- **React 18**: Modern functional components with hooks
- **TypeScript**: Strict type checking for better code quality
- **Zustand**: Lightweight state management with performance optimizations
- **Vite**: Fast development server and optimized builds
- **CSS**: Custom styling with responsive design

### Development Tools
- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **Vitest**: Fast unit testing framework
- **React Testing Library**: Component testing utilities
- **jsdom**: DOM environment for testing

### Build Optimization
- **Code Splitting**: Automatic chunking for optimal loading
- **Bundle Analysis**: Visual bundle composition analysis
- **Minification**: Terser for production optimization
- **Source Maps**: Debug support in production

## Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── __tests__/       # Component tests
│   │   ├── OscillatorControls.tsx
│   │   ├── SweepControls.tsx
│   │   ├── MixerControls.tsx
│   │   ├── OscillatorPanel.tsx
│   │   ├── PlaybackControls.tsx
│   │   └── index.ts
│   ├── store/               # Zustand state management
│   │   ├── __tests__/       # Store tests
│   │   ├── useAppStore.ts   # Main store implementation
│   │   ├── types.ts         # Store type definitions
│   │   └── index.ts         # Store exports
│   ├── hooks/               # Custom React hooks (legacy)
│   │   ├── __tests__/       # Hook tests
│   │   ├── useOscillator.ts
│   │   ├── useSweepControls.ts
│   │   ├── useMixerControls.ts
│   │   ├── useAudioState.ts
│   │   └── index.ts
│   ├── types/               # TypeScript definitions
│   │   ├── audio.ts
│   │   ├── mixer.ts
│   │   ├── waveforms.ts
│   │   └── index.ts
│   ├── test/                # Test configuration
│   │   └── setup.ts
│   ├── __tests__/           # Integration tests
│   ├── App.tsx              # Main application component
│   ├── App.css              # Application styles
│   ├── main.tsx             # Application entry point
│   ├── utils.ts             # Utility functions
│   └── vite-env.d.ts        # Vite type definitions
├── wailsjs/                 # Auto-generated Wails bindings
├── .vscode/                 # VS Code configuration
├── .eslintrc.cjs            # ESLint configuration
├── .prettierrc              # Prettier configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── vite.config.test.ts      # Test-specific Vite config
├── DEVELOPMENT.md           # Development guidelines
└── README.md                # This file
```

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Go backend must be running (via Wails)

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev          # Start development server
npm run test         # Run tests in watch mode
npm run lint         # Check code quality
```

### Building
```bash
npm run build        # Production build
npm run preview      # Preview production build
```

## Available Scripts

### Development
- `npm run dev` - Start Vite development server with HMR
- `npm run build` - Build optimized production bundle
- `npm run build:analyze` - Build with bundle size visualization
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted
- `npm run typecheck` - Run TypeScript compiler check

### Testing
- `npm run test` - Run tests in interactive watch mode
- `npm run test:run` - Run tests once and exit
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## State Management Architecture

### Zustand Store Pattern
The application uses Zustand for centralized state management with the following benefits:

- **Performance**: Selective subscriptions prevent unnecessary re-renders
- **Type Safety**: Comprehensive TypeScript integration
- **Persistence**: Automatic localStorage integration for user preferences
- **Developer Experience**: Redux DevTools integration for debugging

### Store Structure
The global store is organized into logical state slices:

- **audio** - Playback control and error state
- **oscillator1/oscillator2** - Individual oscillator parameters
- **sweep1/sweep2** - Frequency sweep configurations
- **mixer** - Balance, sync, and mixing settings

### Component Integration
Components use selective subscriptions for optimal performance:

```tsx
const App: React.FC = () => {
  // Subscribe to specific state slices
  const isPlaying = useAppStore((state) => state.audio.isPlaying);
  const audioActions = useAppStore((state) => state.audioActions);
  
  return (
    <div>
      <PlaybackControls 
        isPlaying={isPlaying} 
        onPlay={audioActions.startAudio} 
      />
    </div>
  );
};
```

For detailed information about the state management system, see [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md).

## Type System

### Strict TypeScript Configuration
- All `noImplicit*` flags enabled
- Strict null checks enforced
- Exact optional property types
- Comprehensive type coverage

### Type Organization
- `types/audio.ts` - Audio configuration and ranges
- `types/waveforms.ts` - Waveform definitions and utilities
- `types/mixer.ts` - Mixer mode definitions
- Component props fully typed with JSDoc documentation

## Testing Strategy

### Component Testing
Components are tested for:
- Correct rendering with various props
- User interaction handling
- Conditional UI based on state
- Integration with custom hooks

### Hook Testing
Custom hooks are tested for:
- State initialization and updates
- Event handler behavior
- Integration with Wails backend (mocked)
- Error handling and edge cases

### Test Setup
- Automatic Wails function mocking
- jsdom environment for DOM testing
- React Testing Library for user-centric testing
- Vitest for fast test execution

## Performance Optimizations

### Build Optimizations
- Code splitting by component type (components, hooks, vendor)
- Minification with Terser
- Tree shaking for unused code elimination
- Optimized chunk sizes for efficient loading

### Runtime Optimizations
- React.memo for expensive component re-renders
- useCallback/useMemo for stable references
- Efficient state updates with functional updates
- Minimal re-renders through proper dependency arrays

## Integration with Backend

### Wails Integration
The frontend communicates with the Go backend through auto-generated Wails bindings:

```tsx
// All Wails functions return promises
void StartAudio();  // Fire-and-forget
void SetFrequency(440);  // Parameter passing
```

### Error Handling
- Wails functions are wrapped with void for fire-and-forget calls
- Promise rejections are handled gracefully
- UI remains responsive during backend communication

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern ES2020+ features used

## Development Guidelines

See [DEVELOPMENT.md](./DEVELOPMENT.md) for comprehensive development guidelines including:
- Component patterns and best practices
- Testing strategies and examples
- TypeScript usage guidelines
- Performance optimization techniques
- Code style and formatting rules

## Contributing

1. Follow the established patterns in existing components
2. Add tests for new functionality
3. Update documentation for public APIs
4. Run linting and type checking before commits
5. Use semantic commit messages

## Performance Metrics

- Bundle size: ~150KB gzipped (including React)
- Initial load: <500ms on modern connections
- Test execution: <3 seconds for full suite
- Build time: <10 seconds for production