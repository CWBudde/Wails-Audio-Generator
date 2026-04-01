/**
 * ControlModeToggle Component
 *
 * Provides a compact, accessible button for switching between
 * Fixed Frequency and Sweep control modes. Features tooltip with
 * detailed information and seamless integration into control flow.
 */

import React, { useState } from 'react';
import { ControlMode, CONTROL_MODE_LABELS } from '../types/controlModes';

export interface ControlModeToggleProps {
  /** Current control mode */
  currentMode: ControlMode;
  /** Callback when mode changes */
  onModeChange: (mode: ControlMode) => void;
  /** Whether the toggle is disabled (e.g., during active sweep) */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Oscillator identifier for accessibility labels */
  oscillatorLabel?: string;
  /** Compact mode - shows as small integrated button */
  compact?: boolean;
}

/**
 * ControlModeToggle - Compact button for Fixed Frequency vs Sweep modes
 */
export const ControlModeToggle: React.FC<ControlModeToggleProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
  className = '',
  oscillatorLabel = 'Oscillator',
  compact = true,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isFixedMode = currentMode === ControlMode.FIXED_FREQUENCY;
  const isSweepMode = currentMode === ControlMode.SWEEP;

  const handleClick = () => {
    if (disabled) return;

    const newMode = isFixedMode ? ControlMode.SWEEP : ControlMode.FIXED_FREQUENCY;
    onModeChange(newMode);
  };

  const currentLabel = CONTROL_MODE_LABELS[currentMode];
  const nextMode = isFixedMode ? ControlMode.SWEEP : ControlMode.FIXED_FREQUENCY;
  const nextLabel = CONTROL_MODE_LABELS[nextMode];

  if (compact) {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          onClick={handleClick}
          disabled={disabled}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-md border-2 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
            ${
              isFixedMode
                ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 hover:border-blue-400'
                : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:border-green-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label={`${oscillatorLabel} control mode: ${currentLabel}. Click to switch to ${nextLabel} mode.`}
          title={
            disabled ? 'Mode switching disabled during active sweep' : `Switch to ${nextLabel} mode`
          }
        >
          {isFixedMode ? '🎵 Fixed' : '🔀 Sweep'}
        </button>

        {/* Rich Tooltip */}
        {showTooltip && !disabled && (
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
            <div className="bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg border border-gray-600">
              <div className="font-semibold mb-2 text-primary-300">Control Modes</div>
              <div className="space-y-2">
                <div className={`${isFixedMode ? 'text-blue-300 font-medium' : 'text-gray-300'}`}>
                  <span className="inline-block w-4">🎵</span>
                  <strong>Fixed:</strong> Manual frequency control via slider
                </div>
                <div className={`${isSweepMode ? 'text-green-300 font-medium' : 'text-gray-300'}`}>
                  <span className="inline-block w-4">🔀</span>
                  <strong>Sweep:</strong> Automated frequency sweeps over time
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400">
                Currently: <span className="text-white font-medium">{currentLabel}</span>
                <br />
                Click to switch to <span className="text-white font-medium">{nextLabel}</span>
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 border-r border-b border-gray-600"></div>
            </div>
          </div>
        )}

        {/* Disabled state tooltip */}
        {showTooltip && disabled && (
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48">
            <div className="bg-yellow-800 text-yellow-100 text-xs rounded-lg p-3 shadow-lg border border-yellow-600">
              <span className="inline-block mr-1">⚠️</span>
              Mode switching disabled during active sweep
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-800 rotate-45 border-r border-b border-yellow-600"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // This should not happen with compact=true default, but kept for safety
  return null;
};

export default ControlModeToggle;
