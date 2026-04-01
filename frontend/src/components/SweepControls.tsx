import React from 'react';
import { SweepControls as SweepControlsType } from '../hooks';

interface SweepControlsProps {
  sweepControls: SweepControlsType;
}

export const SweepControls: React.FC<SweepControlsProps> = ({ sweepControls }) => {
  const { state } = sweepControls;

  return (
    <div className="sweep-controls space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">🔀</span>
        <h4 className="text-lg font-medium text-gray-200">Frequency Sweep</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Start Frequency (Hz)</label>
          <input
            type="number"
            min="20"
            max="20000"
            value={state.startFreq}
            onChange={e => sweepControls.setStartFreq(parseFloat(e.target.value))}
            disabled={state.isSweeping}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">End Frequency (Hz)</label>
          <input
            type="number"
            min="20"
            max="20000"
            value={state.endFreq}
            onChange={e => sweepControls.setEndFreq(parseFloat(e.target.value))}
            disabled={state.isSweeping}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Duration (seconds)</label>
          <input
            type="number"
            min="0.1"
            max="60"
            step="0.1"
            value={state.duration}
            onChange={e => sweepControls.setDuration(parseFloat(e.target.value))}
            disabled={state.isSweeping}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={state.isSweeping ? sweepControls.stopSweep : sweepControls.startSweep}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            state.isSweeping
              ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
              : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
          }`}
        >
          {state.isSweeping ? '⏹ Stop Sweep' : '🔀 Start Sweep'}
        </button>
      </div>

      {state.isSweeping && (
        <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-primary-300 text-sm">
            <span className="inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
            <span>Sweep in progress...</span>
          </div>
        </div>
      )}
    </div>
  );
};
