import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { OscillatorControls as OscillatorControlsType } from '../hooks';
import { sliderToFrequency, sliderToDB, formatFrequency, MIN_DB } from '../utils';
import { WAVEFORMS, isTonalWaveform } from '../types';
import { AUDIO_CONFIG } from '../types';

import { ControlModeToggle } from './ControlModeToggle';
import { ControlMode } from '../types/controlModes';

interface OscillatorControlsProps {
  /** Oscillator controls from useOscillator hook */
  oscillator: OscillatorControlsType;
  /** Whether this oscillator is synced to another oscillator */
  syncEnabled?: boolean;
  /** Whether this is the second oscillator (affects frequency control behavior) */
  isOsc2?: boolean;
  /** Whether to show frequency controls (based on control mode) */
  showFrequencyControls?: boolean;
  /** Current control mode */
  controlMode?: ControlMode;
  /** Callback to change control mode */
  onControlModeChange?: (mode: ControlMode) => void;
  /** Whether sweep is currently active (disables mode switching) */
  isSweepActive?: boolean;
  /** Oscillator identifier for mode toggle */
  oscillatorLabel?: string;
}

/**
 * OscillatorControls component provides UI controls for an audio oscillator.
 *
 * Features:
 * - Waveform selection (sine, square, triangle, sawtooth, noise types)
 * - Frequency control (for tonal waveforms only, disabled when synced for OSC2)
 * - Volume control (always available)
 * - Contextual UI based on waveform type and sync state
 *
 * @param props - Component properties
 * @returns JSX element containing oscillator controls
 */
export const OscillatorControls: React.FC<OscillatorControlsProps> = ({
  oscillator,
  syncEnabled = false,
  isOsc2 = false,
  showFrequencyControls = true,
  controlMode,
  onControlModeChange,
  isSweepActive = false,
  oscillatorLabel = 'Oscillator',
}) => {
  const { state } = oscillator;

  const selectedWaveform =
    WAVEFORMS.find(w => w.value === Number(state.selectedWaveform)) ?? WAVEFORMS[0];
  const isTonal = isTonalWaveform(state.selectedWaveform);
  const shouldShowModeToggle = isTonal && controlMode && onControlModeChange;

  return (
    <>
      <div className="waveform-container">
        <Listbox
          value={state.selectedWaveform}
          onChange={value => {
            const event = {
              target: { value: value.toString() },
            } as React.ChangeEvent<HTMLSelectElement>;
            oscillator.handleWaveformChange(event);
          }}
        >
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 border-2 border-gray-300 hover:border-primary-500 transition-all duration-200">
              <span className="block truncate text-gray-900">
                {selectedWaveform?.symbol} {selectedWaveform?.label}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none border border-gray-200">
                {WAVEFORMS.map(waveformOption => (
                  <Listbox.Option
                    key={waveformOption.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                      }`
                    }
                    value={waveformOption.value}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                        >
                          {waveformOption.symbol} {waveformOption.label}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      {/* Control Mode Toggle - Positioned after waveform selector */}
      {shouldShowModeToggle && (
        <div className="mt-3 mb-1 flex justify-center">
          <ControlModeToggle
            currentMode={controlMode!}
            onModeChange={onControlModeChange!}
            disabled={isSweepActive}
            oscillatorLabel={oscillatorLabel}
            compact={true}
          />
        </div>
      )}

      {isTonalWaveform(state.selectedWaveform) && showFrequencyControls && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Frequency</label>
          <div className="space-y-2">
            <input
              type="range"
              min={AUDIO_CONFIG.slider.min}
              max={AUDIO_CONFIG.slider.max}
              value={state.sliderFreq}
              onChange={oscillator.handleFrequencyChange}
              step="1"
              className="slider w-full"
              disabled={isOsc2 && syncEnabled}
            />
            <div className="text-center text-primary-300 font-audio text-sm font-medium">
              {formatFrequency(sliderToFrequency(state.sliderFreq / AUDIO_CONFIG.slider.max))}
            </div>
          </div>
        </div>
      )}

      {!isTonalWaveform(state.selectedWaveform) && (
        <p className="noise-info">Random signal across all frequencies</p>
      )}

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-200 mb-2">Volume</label>
        <div className="space-y-2">
          <input
            type="range"
            min={AUDIO_CONFIG.slider.min}
            max={AUDIO_CONFIG.slider.max}
            value={state.sliderVolume}
            onChange={oscillator.handleVolumeChange}
            step="1"
            className="slider w-full"
          />
          <div className="text-center text-primary-300 font-audio text-sm font-medium">
            {sliderToDB(state.sliderVolume / AUDIO_CONFIG.slider.max) === MIN_DB
              ? '−∞'
              : `${sliderToDB(state.sliderVolume / AUDIO_CONFIG.slider.max).toFixed(1)} dB`}
          </div>
        </div>
      </div>
    </>
  );
};
