import React from 'react';
import { AudioControls } from '../hooks';

interface PlaybackControlsProps {
  /** Audio controls from useAudioState hook */
  audioControls: AudioControls;
}

/**
 * PlaybackControls component provides play/stop functionality for the audio generator.
 *
 * Shows a play button when audio is stopped and a stop button when audio is playing.
 * Integrates with the Wails backend to control audio playback state.
 *
 * @param props - Component properties
 * @returns JSX element containing play/stop button
 */
export const PlaybackControls: React.FC<PlaybackControlsProps> = ({ audioControls }) => {
  const { state } = audioControls;

  return (
    <div className="flex justify-center mt-12 mb-8">
      <div className="glass-strong rounded-2xl p-8 border border-studio-dark-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/5 to-transparent animate-pulse-slow pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <h3 className="text-lg font-bold font-futura text-studio-white uppercase tracking-widest mb-2">
            Transport Controls
          </h3>

          <div className="flex items-center gap-6">
            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  state.isPlaying
                    ? 'bg-neon-green animate-pulse shadow-neon-sm'
                    : 'bg-studio-dark-500'
                }`}
              ></div>
              <span className="text-sm font-audio text-studio-dark-200 uppercase">
                {state.isPlaying ? 'Live' : 'Ready'}
              </span>
            </div>

            {/* Main Control Button */}
            {!state.isPlaying ? (
              <button
                className="btn btn-primary px-12 py-4 text-xl font-bold flex items-center gap-3 relative overflow-hidden group"
                onClick={audioControls.handlePlay}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10 text-2xl">▶</span>
                <span className="relative z-10 font-futura tracking-wider">START</span>
              </button>
            ) : (
              <button
                className="btn px-12 py-4 text-xl font-bold flex items-center gap-3 relative overflow-hidden group
                          bg-red-600 border-red-500 text-white hover:bg-red-700 hover:border-red-400
                          focus:ring-4 focus:ring-red-300/40 focus:outline-none"
                onClick={audioControls.handleStop}
                style={{
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10 text-2xl">⏹</span>
                <span className="relative z-10 font-futura tracking-wider">STOP</span>
              </button>
            )}

            {/* Audio Level Indicator */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs font-audio text-studio-dark-300 uppercase">Level</div>
              <div className="flex gap-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-6 rounded-full transition-all duration-200 ${
                      state.isPlaying && i < 6
                        ? i < 4
                          ? 'bg-neon-green animate-pulse'
                          : i < 6
                            ? 'bg-neon-orange animate-pulse'
                            : 'bg-red-500 animate-pulse'
                        : 'bg-studio-dark-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
