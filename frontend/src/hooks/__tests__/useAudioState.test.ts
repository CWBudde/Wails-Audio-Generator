import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioState } from '../useAudioState';
import * as WailsApp from '../../../wailsjs/go/main/App';

// Mock is already set up in setup.ts, but we need to access it
vi.mocked(WailsApp.StartAudio);
vi.mocked(WailsApp.StopAudio);

describe('useAudioState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAudioState());

    expect(result.current.state.isPlaying).toBe(false);
  });

  it('initializes with custom initial state', () => {
    const { result } = renderHook(() => useAudioState(true));

    expect(result.current.state.isPlaying).toBe(true);
  });

  it('handles play action', async () => {
    const { result } = renderHook(() => useAudioState());

    act(() => {
      result.current.handlePlay();
    });

    expect(WailsApp.StartAudio).toHaveBeenCalledOnce();
    expect(result.current.state.isPlaying).toBe(true);
  });

  it('handles stop action', async () => {
    const { result } = renderHook(() => useAudioState(true));

    act(() => {
      result.current.handleStop();
    });

    expect(WailsApp.StopAudio).toHaveBeenCalledOnce();
    expect(result.current.state.isPlaying).toBe(false);
  });

  it('provides consistent interface', () => {
    const { result } = renderHook(() => useAudioState());

    expect(result.current).toHaveProperty('state');
    expect(result.current).toHaveProperty('handlePlay');
    expect(result.current).toHaveProperty('handleStop');
    expect(typeof result.current.handlePlay).toBe('function');
    expect(typeof result.current.handleStop).toBe('function');
  });
});
