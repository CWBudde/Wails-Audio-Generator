import { useState, useCallback } from 'react';
import { StartSweep1, StopSweep1, StartSweep2, StopSweep2 } from '../../wailsjs/go/main/App';

export interface SweepState {
  startFreq: number;
  endFreq: number;
  duration: number;
  isSweeping: boolean;
}

export interface SweepControls {
  state: SweepState;
  setStartFreq: (freq: number) => void;
  setEndFreq: (freq: number) => void;
  setDuration: (duration: number) => void;
  startSweep: () => void;
  stopSweep: () => void;
}

export const useSweepControls = (
  isOsc2: boolean = false,
  initialStartFreq: number = 100,
  initialEndFreq: number = 1000,
  initialDuration: number = 5
): SweepControls => {
  const [state, setState] = useState<SweepState>({
    startFreq: initialStartFreq,
    endFreq: initialEndFreq,
    duration: initialDuration,
    isSweeping: false,
  });

  const setStartFreq = useCallback((freq: number) => {
    setState(prev => ({ ...prev, startFreq: freq }));
  }, []);

  const setEndFreq = useCallback((freq: number) => {
    setState(prev => ({ ...prev, endFreq: freq }));
  }, []);

  const setDuration = useCallback((duration: number) => {
    setState(prev => ({ ...prev, duration }));
  }, []);

  const startSweep = useCallback(() => {
    if (isOsc2) {
      void StartSweep2(state.startFreq, state.endFreq, state.duration);
    } else {
      void StartSweep1(state.startFreq, state.endFreq, state.duration);
    }
    setState(prev => ({ ...prev, isSweeping: true }));
  }, [state.startFreq, state.endFreq, state.duration, isOsc2]);

  const stopSweep = useCallback(() => {
    if (isOsc2) {
      void StopSweep2();
    } else {
      void StopSweep1();
    }
    setState(prev => ({ ...prev, isSweeping: false }));
  }, [isOsc2]);

  return {
    state,
    setStartFreq,
    setEndFreq,
    setDuration,
    startSweep,
    stopSweep,
  };
};
