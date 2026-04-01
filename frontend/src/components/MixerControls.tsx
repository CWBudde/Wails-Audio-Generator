import React from 'react';
import { MixerControls as MixerControlsType } from '../hooks';
import { MIX_MODES } from '../types';
import { AUDIO_CONFIG } from '../types';

interface MixerControlsProps {
  mixerControls: MixerControlsType;
}

export const MixerControls: React.FC<MixerControlsProps> = ({ mixerControls }) => {
  const { state } = mixerControls;

  return (
    <div className="mixer-section">
      <h3>⚡ Mixer & Modulation</h3>
      <div className="mixer-controls">
        <div className="control-group">
          <label>Mix Balance</label>
          <input
            type="range"
            min={AUDIO_CONFIG.slider.min}
            max={AUDIO_CONFIG.slider.max}
            value={state.mixBalance * AUDIO_CONFIG.slider.max}
            onChange={mixerControls.handleMixBalanceChange}
            step="1"
            className="slider"
          />
          <span className="balance-display">
            {state.mixBalance === 0
              ? 'OSC1 Only'
              : state.mixBalance === 1
                ? 'OSC2 Only'
                : `${(state.mixBalance * 100).toFixed(0)}% OSC2`}
          </span>
        </div>

        <div className="control-group">
          <label>Mix Mode</label>
          <select
            value={state.mixMode}
            onChange={mixerControls.handleMixModeChange}
            className="mix-mode-selector"
          >
            {MIX_MODES.map(mode => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400">{MIX_MODES[state.mixMode]?.description}</span>
        </div>

        <div className="control-group">
          <label>Sync</label>
          <button
            className={`sync-button ${state.syncEnabled ? 'active' : ''}`}
            onClick={mixerControls.handleSyncToggle}
          >
            {state.syncEnabled ? '🔗 Synced' : '🔓 Free'}
          </button>
          <span className="text-xs text-gray-400">
            {state.syncEnabled ? 'OSC2 follows OSC1' : 'Independent control'}
          </span>
        </div>

        <div className="control-group">
          <label>Detune (cents)</label>
          <input
            type="range"
            min={-100}
            max={100}
            value={state.detune}
            onChange={mixerControls.handleDetuneChange}
            step="1"
            className="slider"
            disabled={!state.syncEnabled}
          />
          <span className="detune-display">
            {state.detune === 0
              ? '±0¢'
              : state.detune > 0
                ? `+${state.detune}¢`
                : `${state.detune}¢`}
          </span>
        </div>
      </div>
    </div>
  );
};
