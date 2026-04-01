import React from 'react';
import {
  OscillatorControls as OscillatorControlsType,
  SweepControls as SweepControlsType,
} from '../hooks';
import { OscillatorControls } from './OscillatorControls';
import { SweepControls } from './SweepControls';
import { isTonalWaveform, isNoiseWaveform } from '../types';
import { ControlMode } from '../types/controlModes';

interface OscillatorPanelProps {
  title: string;
  oscillator: OscillatorControlsType;
  sweepControls: SweepControlsType;
  syncEnabled?: boolean;
  isOsc2?: boolean;
  onCopyFromOsc1?: () => void;
  className?: string;
  /** Current control mode */
  controlMode: ControlMode;
  /** Callback to change control mode */
  onControlModeChange: (mode: ControlMode) => void;
  /** Whether sweep is currently active (disables mode switching) */
  isSweepActive: boolean;
}

export const OscillatorPanel: React.FC<OscillatorPanelProps> = ({
  title,
  oscillator,
  sweepControls,
  syncEnabled = false,
  isOsc2 = false,
  onCopyFromOsc1,
  className = '',
  controlMode,
  onControlModeChange,
  isSweepActive,
}) => {
  const { state } = oscillator;
  const isTonal = isTonalWaveform(state.selectedWaveform);
  const isNoise = isNoiseWaveform(state.selectedWaveform);

  // Business rules for control mode
  const shouldShowModeToggle = isTonal; // Only show toggle for tonal waveforms
  const currentMode = isNoise ? ControlMode.FIXED_FREQUENCY : controlMode; // Force Fixed mode for noise

  // Conditional rendering logic based on control mode
  const shouldShowFrequencyControls = currentMode === ControlMode.FIXED_FREQUENCY;
  const shouldShowSweepControls =
    currentMode === ControlMode.SWEEP && isTonal && (!isOsc2 || !syncEnabled);

  const modeClass =
    currentMode === ControlMode.FIXED_FREQUENCY ? 'mode-active-fixed' : 'mode-active-sweep';
  const panelClasses = `oscillator-panel ${className} ${shouldShowModeToggle ? modeClass : ''}`;

  return (
    <div className={panelClasses}>
      <h3>{title}</h3>

      {/* Main Control Rendering with integrated mode toggle */}
      <div className="frequency-controls-section">
        <OscillatorControls
          oscillator={oscillator}
          syncEnabled={syncEnabled}
          isOsc2={isOsc2}
          showFrequencyControls={shouldShowFrequencyControls}
          controlMode={currentMode}
          onControlModeChange={onControlModeChange}
          isSweepActive={isSweepActive}
          oscillatorLabel={title}
        />
      </div>

      {shouldShowSweepControls && (
        <div className="sweep-section control-slide-in">
          <SweepControls sweepControls={sweepControls} />
        </div>
      )}

      {/* Copy Button - Moved to bottom for OSC2 */}
      {isOsc2 && onCopyFromOsc1 && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <button className="btn btn-secondary w-full text-xs" onClick={onCopyFromOsc1}>
            📋 Copy OSC1 Settings
          </button>
        </div>
      )}
    </div>
  );
};
