import { useState } from 'react';
import { SetMixBalance, SetMixMode, SetDetune, SetSync } from '../../wailsjs/go/main/App';
import { AUDIO_CONFIG, MixMode } from '../types';

export interface MixerState {
  mixBalance: number;
  mixMode: MixMode;
  detune: number;
  syncEnabled: boolean;
}

export interface MixerControls {
  state: MixerState;
  handleMixBalanceChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleMixModeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDetuneChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSyncToggle: () => void;
}

export const useMixerControls = (
  initialBalance: number = 0.5,
  initialMode: MixMode = MixMode.ADD,
  initialDetune: number = 0,
  initialSync: boolean = false
): MixerControls => {
  const [state, setState] = useState<MixerState>({
    mixBalance: initialBalance,
    mixMode: initialMode,
    detune: initialDetune,
    syncEnabled: initialSync,
  });

  const handleMixBalanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBalance = parseFloat(event.target.value) / AUDIO_CONFIG.slider.max;
    setState(prev => ({ ...prev, mixBalance: newBalance }));
    void SetMixBalance(newBalance);
  };

  const handleMixModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = parseInt(event.target.value);
    setState(prev => ({ ...prev, mixMode: newMode }));
    void SetMixMode(newMode);
  };

  const handleDetuneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDetune = parseFloat(event.target.value);
    setState(prev => ({ ...prev, detune: newDetune }));
    void SetDetune(newDetune);
  };

  const handleSyncToggle = () => {
    const newSyncEnabled = !state.syncEnabled;
    setState(prev => ({ ...prev, syncEnabled: newSyncEnabled }));
    void SetSync(newSyncEnabled);
  };

  return {
    state,
    handleMixBalanceChange,
    handleMixModeChange,
    handleDetuneChange,
    handleSyncToggle,
  };
};
