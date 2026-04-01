import { useState } from 'react';
import { StartAudio, StopAudio } from '../../wailsjs/go/main/App';

export interface AudioState {
  isPlaying: boolean;
}

export interface AudioControls {
  state: AudioState;
  handlePlay: () => void;
  handleStop: () => void;
}

export const useAudioState = (initialState: boolean = false): AudioControls => {
  const [state, setState] = useState<AudioState>({
    isPlaying: initialState,
  });

  const handlePlay = () => {
    void StartAudio();
    setState(prev => ({ ...prev, isPlaying: true }));
  };

  const handleStop = () => {
    void StopAudio();
    setState(prev => ({ ...prev, isPlaying: false }));
  };

  return {
    state,
    handlePlay,
    handleStop,
  };
};
