# State Management Architecture

This document describes the Zustand-based state management system implemented for the Audio Frequency Generator.

## Overview

The application uses **Zustand** as its state management solution, providing a lightweight, performant, and TypeScript-first approach to managing global application state. This replaces the previous custom hooks pattern with a more scalable and maintainable architecture.

## Key Benefits

- **Performance**: Optimized re-renders with fine-grained subscriptions
- **TypeScript First**: Comprehensive type safety throughout the state management layer
- **State Persistence**: Automatic localStorage integration with smart partitioning
- **Developer Experience**: Redux DevTools integration for debugging
- **Maintainability**: Clean separation of concerns and predictable state updates

## Architecture

### Core Components

1. **Store Definition** (`src/store/useAppStore.ts`)
   - Main Zustand store with all state and actions
   - Middleware integration (persistence, devtools)
   - Type-safe action implementations

2. **Type Definitions** (`src/store/types.ts`)
   - Comprehensive TypeScript interfaces
   - State and action type definitions
   - Selector type definitions

3. **Store Index** (`src/store/index.ts`)
   - Clean export interface
   - Re-exports commonly used types

### State Structure

```typescript
interface AppState {
  // Audio system state
  audio: {
    isPlaying: boolean;
    isInitialized: boolean;
    error: string | null;
  };

  // Oscillator states
  oscillator1: OscillatorState;
  oscillator2: OscillatorState;

  // Sweep states
  sweep1: SweepState;
  sweep2: SweepState;

  // Mixer state
  mixer: MixerState;
}
```

### Action Groups

The store organizes actions into logical groups:

- **audioActions**: Audio playback control (start/stop/error handling)
- **oscillatorActions**: Oscillator parameter control (frequency/volume/waveform)
- **sweepActions**: Frequency sweep management (start/stop/progress)
- **mixerActions**: Mixer control (balance/mode/sync/detune)

## Usage Examples

### Basic Store Usage

```typescript
import { useAppStore } from './store';

function MyComponent() {
  // Select specific state slices for optimal performance
  const isPlaying = useAppStore((state) => state.audio.isPlaying);
  const audioActions = useAppStore((state) => state.audioActions);

  const handlePlay = () => {
    void audioActions.startAudio();
  };

  return (
    <button onClick={handlePlay}>
      {isPlaying ? 'Stop' : 'Play'}
    </button>
  );
}
```

### Using Optimized Selectors

```typescript
import { useAppSelectors } from './store';

function FrequencyDisplay() {
  // Use optimized selectors to prevent unnecessary re-renders
  const oscillator1 = useAppSelectors.selectOscillator1();
  const frequency = sliderToFrequency(oscillator1.sliderFreq / 1000);

  return <span>{frequency.toFixed(1)} Hz</span>;
}
```

### Action Usage

```typescript
function OscillatorControls() {
  const oscillatorActions = useAppStore((state) => state.oscillatorActions);

  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    void oscillatorActions.setFrequency(1, value);
  };

  return (
    <input
      type="range"
      onChange={handleFrequencyChange}
      // ... other props
    />
  );
}
```

## State Persistence

The store automatically persists user preferences to localStorage:

### Persisted State
- Oscillator settings (frequency, volume, waveform)
- Mixer configuration (balance, mode, sync, detune)
- Sweep configuration (start/end frequencies, duration)

### Non-Persisted State
- Audio playback status
- Error messages
- Sweep active status and progress

### Configuration

```typescript
{
  name: 'audio-generator-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    // Only persist configuration, not runtime state
    oscillator1: state.oscillator1,
    oscillator2: state.oscillator2,
    // ... other persisted state
  }),
  version: 1,
}
```

## Performance Optimizations

### Selective Subscriptions

Components can subscribe to specific state slices:

```typescript
// ✅ Good - only re-renders when frequency changes
const frequency = useAppStore((state) => state.oscillator1.sliderFreq);

// ❌ Avoid - re-renders on any state change
const store = useAppStore();
```

### Optimized Selectors

Pre-built selectors prevent selector recreation:

```typescript
// ✅ Use provided selectors
const audioActions = useAppSelectors.selectAudioActions();

// ❌ Avoid creating selectors inline
const audioActions = useAppStore((state) => state.audioActions);
```

### Computed Values

Complex calculations are memoized in selectors:

```typescript
const selectDisplayFrequency = () => useAppStore((state) => {
  const freq = sliderToFrequency(state.oscillator1.sliderFreq / 1000);
  return freq.toFixed(1) + ' Hz';
});
```

## Error Handling

The store provides centralized error handling:

```typescript
// All actions handle errors consistently
try {
  await StartAudio();
  set((state) => ({
    ...state,
    audio: { ...state.audio, isPlaying: true, error: null }
  }));
} catch (error) {
  set((state) => ({
    ...state,
    audio: {
      ...state.audio,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }));
}
```

Errors are displayed in the UI and can be dismissed:

```typescript
const error = useAppStore((state) => state.audio.error);
const setError = useAppStore((state) => state.audioActions.setError);

if (error) {
  return (
    <div className="error-message">
      Error: {error}
      <button onClick={() => setError(null)}>×</button>
    </div>
  );
}
```

## Integration with Wails

All actions seamlessly integrate with the Wails backend:

```typescript
setFrequency: async (oscillator: 1 | 2, sliderValue: number) => {
  const frequency = sliderToFrequency(sliderValue / AUDIO_CONFIG.slider.max);
  
  try {
    if (oscillator === 1) {
      await SetFrequency(frequency);  // Wails binding
    } else {
      await SetOsc2Frequency(frequency);
    }
    // Update state on success
    set((state) => ({
      ...state,
      [`oscillator${oscillator}`]: {
        ...state[`oscillator${oscillator}`],
        sliderFreq: sliderValue,
      },
    }));
  } catch (error) {
    // Handle error in centralized way
    set((state) => ({ 
      ...state, 
      audio: { ...state.audio, error: error.message } 
    }));
  }
},
```

## Testing

The state management layer includes comprehensive testing:

### Unit Tests
- State transitions
- Action behavior
- Error handling
- Type safety

### Integration Tests
- Component integration
- Store persistence
- Performance characteristics

### Test Structure
```
src/store/__tests__/
├── store-basic.test.ts      # Core functionality tests
└── ...

src/__tests__/
├── app-integration.test.tsx # Integration tests
└── ...
```

## Migration Notes

### From Custom Hooks
The migration from individual custom hooks to Zustand provides:

- **Better Performance**: Reduced re-renders through selective subscriptions
- **Improved DX**: Redux DevTools integration, better debugging
- **Type Safety**: Comprehensive TypeScript coverage
- **Maintainability**: Centralized state management logic

### Component Updates
Components were updated to use adapter patterns for backward compatibility:

```typescript
// Old hook usage
const audioControls = useAudioState();

// New adapter pattern
const audioControls = {
  state: useAppStore((state) => state.audio),
  handlePlay: useAppStore((state) => state.audioActions.startAudio),
  handleStop: useAppStore((state) => state.audioActions.stopAudio),
};
```

## Future Considerations

### Scaling
The current architecture supports additional features:

- Multiple oscillator banks
- Complex routing configurations
- Plugin system integration
- Automation and sequencing

### Performance
For large-scale applications, consider:

- Store splitting for large feature sets
- Computed selectors for expensive calculations
- Middleware optimization for specific use cases

## Troubleshooting

### Common Issues

1. **Re-render loops**: Check selector functions for stability
2. **State not persisting**: Verify partialize configuration
3. **Type errors**: Ensure proper action parameter types
4. **Performance issues**: Use selective subscriptions

### Debugging

Use Redux DevTools to inspect:
- State changes over time
- Action dispatching
- State tree structure
- Performance metrics

## Conclusion

The Zustand-based state management system provides a solid foundation for the Audio Frequency Generator, offering excellent performance, developer experience, and maintainability. The architecture is designed to scale with future feature additions while maintaining type safety and predictable behavior.