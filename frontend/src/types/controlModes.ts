/**
 * Control mode definitions for oscillator frequency control
 *
 * This module defines the exclusive control modes that determine how users
 * interact with oscillator frequency settings. Each oscillator operates in
 * exactly one mode at a time to eliminate UX confusion between manual
 * frequency control and automated sweep functionality.
 */

/**
 * Enum defining the exclusive control modes for oscillator frequency
 */
export enum ControlMode {
  /** Manual frequency control via slider */
  FIXED_FREQUENCY = 'fixed_frequency',
  /** Automated frequency control via sweep parameters */
  SWEEP = 'sweep',
}

/**
 * Display labels for control modes (used in UI)
 */
export const CONTROL_MODE_LABELS = {
  [ControlMode.FIXED_FREQUENCY]: 'Fixed Frequency',
  [ControlMode.SWEEP]: 'Sweep',
} as const;

/**
 * Default control mode for new oscillators
 */
export const DEFAULT_CONTROL_MODE = ControlMode.FIXED_FREQUENCY;

/**
 * Checks if the given mode allows manual frequency control
 */
export const allowsManualFrequency = (mode: ControlMode): boolean => {
  return mode === ControlMode.FIXED_FREQUENCY;
};

/**
 * Checks if the given mode allows sweep control
 */
export const allowsSweepControl = (mode: ControlMode): boolean => {
  return mode === ControlMode.SWEEP;
};
