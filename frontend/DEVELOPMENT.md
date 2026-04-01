# Frontend Development Guide

This guide covers development practices and guidelines for the AudioFreqGenerator frontend application.

## Architecture Overview

The frontend is built with modern React patterns using:

- **React 18** with functional components and hooks
- **TypeScript** with strict configuration for type safety
- **Vite** for fast development and optimized builds
- **Vitest + React Testing Library** for testing
- **ESLint + Prettier** for code quality and formatting

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── __tests__/       # Component tests
│   └── index.ts         # Component exports
├── hooks/               # Custom React hooks
│   ├── __tests__/       # Hook tests
│   └── index.ts         # Hook exports
├── types/               # TypeScript type definitions
│   ├── audio.ts         # Audio-related types
│   ├── mixer.ts         # Mixer types
│   ├── waveforms.ts     # Waveform types
│   └── index.ts         # Type exports
├── test/               # Test setup and utilities
│   └── setup.ts        # Global test configuration
└── utils.ts            # Utility functions
```

## Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run build:analyze   # Build with bundle analyzer
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
npm run typecheck       # Run TypeScript type checking

# Testing
npm run test            # Run tests in watch mode
npm run test:run        # Run tests once
npm run test:coverage   # Run tests with coverage
```

## Component Guidelines

### Component Structure

```tsx
import React from 'react';
import { ComponentProps } from './types'; // Local types if needed
import { GlobalType } from '@/types';     // Global types

interface ExampleComponentProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * ExampleComponent provides [brief description]
 * 
 * @param props - Component properties
 * @returns JSX element
 */
export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  onClick,
  disabled = false,
}) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {title}
    </button>
  );
};
```

### Testing Components

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ExampleComponent } from '../ExampleComponent';

const mockProps = {
  title: 'Test Button',
  onClick: vi.fn(),
};

describe('ExampleComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ExampleComponent {...mockProps} />);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    render(<ExampleComponent {...mockProps} />);
    
    await user.click(screen.getByText('Test Button'));
    expect(mockProps.onClick).toHaveBeenCalledOnce();
  });
});
```

## Custom Hook Guidelines

### Hook Structure

```tsx
import { useState, useCallback } from 'react';
import { WailsFunction } from '../../wailsjs/go/main/App';

export interface HookState {
  value: number;
  isActive: boolean;
}

export interface HookControls {
  state: HookState;
  setValue: (value: number) => void;
  toggle: () => void;
}

/**
 * Custom hook for [description]
 * 
 * @param initialValue - Initial value
 * @returns Hook controls and state
 */
export const useExample = (initialValue: number = 0): HookControls => {
  const [state, setState] = useState<HookState>({
    value: initialValue,
    isActive: false,
  });

  const setValue = useCallback((value: number) => {
    setState(prev => ({ ...prev, value }));
    void WailsFunction(value); // Use void for fire-and-forget promises
  }, []);

  const toggle = useCallback(() => {
    setState(prev => ({ ...prev, isActive: !prev.isActive }));
  }, []);

  return { state, setValue, toggle };
};
```

### Testing Hooks

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExample } from '../useExample';

describe('useExample', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct state', () => {
    const { result } = renderHook(() => useExample(5));
    
    expect(result.current.state.value).toBe(5);
    expect(result.current.state.isActive).toBe(false);
  });

  it('updates value correctly', () => {
    const { result } = renderHook(() => useExample());
    
    act(() => {
      result.current.setValue(10);
    });
    
    expect(result.current.state.value).toBe(10);
  });
});
```

## Type Definitions

### Creating Types

- Use descriptive interface names with proper prefixes
- Keep types close to their usage when possible
- Use enums for fixed sets of values
- Mark readonly properties where appropriate

```tsx
// Good
export interface OscillatorState {
  readonly sliderFreq: number;
  readonly sliderVolume: number;
  readonly selectedWaveform: WaveformType;
}

export enum WaveformType {
  SINE = 0,
  SQUARE = 1,
  TRIANGLE = 2,
}

// Export type utilities
export const isTonalWaveform = (waveform: WaveformType): boolean => {
  return waveform < WaveformType.WHITE_NOISE;
};
```

## Code Style

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over type aliases for object shapes
- Use `void` for fire-and-forget promises to Wails functions
- Always type function parameters and return values

### React

- Use functional components with hooks
- Prefer named exports over default exports
- Use React.FC for component type annotation
- Extract complex logic into custom hooks

### Imports

- Use path aliases: `@/components`, `@/hooks`, `@/types`, `@/utils`
- Group imports: external dependencies, internal modules, relative imports
- Use named imports consistently

## Performance Guidelines

### Component Optimization

- Use `React.memo()` for expensive components
- Use `useCallback()` and `useMemo()` judiciously
- Avoid creating objects/functions in render

### Bundle Optimization

- The build is configured with automatic code splitting
- Components, hooks, and vendor code are split into separate chunks
- Use `npm run build:analyze` to inspect bundle composition

## Testing Guidelines

### Test Organization

- Place component tests in `__tests__` folders next to components
- Use descriptive test names that explain the behavior
- Group related tests with `describe` blocks
- Use `beforeEach` for test setup

### Test Patterns

- Test user interactions, not implementation details
- Mock Wails functions in test setup
- Use React Testing Library's user-event for interactions
- Test both success and error scenarios

### Mocking

```tsx
// Wails functions are auto-mocked in src/test/setup.ts
import * as WailsApp from '../../../wailsjs/go/main/App';

// Access mocked functions in tests
vi.mocked(WailsApp.StartAudio).mockResolvedValue(undefined);
expect(WailsApp.StartAudio).toHaveBeenCalledOnce();
```

## Debugging

### Development Tools

- React DevTools for component inspection
- Browser DevTools for debugging
- TypeScript errors in IDE provide real-time feedback
- Vite provides fast HMR for quick iteration

### Common Issues

1. **Wails function calls failing**: Ensure functions are properly mocked in tests
2. **Type errors**: Check that all props and state are properly typed
3. **Render issues**: Use React DevTools to inspect component state and props

## Best Practices

1. **Separation of Concerns**: Keep components focused on UI, move logic to hooks
2. **Type Safety**: Leverage TypeScript's strict mode for better code quality
3. **Testing**: Write tests for user-facing behavior, not implementation
4. **Performance**: Profile before optimizing, use React DevTools Profiler
5. **Accessibility**: Use semantic HTML and proper ARIA attributes
6. **Code Review**: Run linting and type checking before committing

## Getting Help

- Check existing components and hooks for patterns
- Review test files for testing approaches
- Use TypeScript compiler messages for type issues
- Refer to React and Testing Library documentation