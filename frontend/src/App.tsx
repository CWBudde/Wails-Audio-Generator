import { useState } from "react";
import "./App.css";
import {
  SetFrequency,
  SetVolume,
  SetWaveform,
  StartAudio,
  StopAudio,
  SetOsc2Frequency,
  SetOsc2Volume,
  SetOsc2Waveform,
  SetMixBalance,
  SetMixMode,
  SetDetune,
  SetSync,
  StartSweep1,
  StopSweep1,
  IsSweeping1,
  StartSweep2,
  StopSweep2,
  IsSweeping2,
} from "../wailsjs/go/main/App"; // Import Wails functions
import {
  sliderToFrequency,
  frequencyToSlider,
  sliderToDB,
  dbToSlider,
  dbToLinear,
  formatFrequency,
  MIN_DB,
} from "./utils"; // Import utilities

const SLIDER_MIN = 0;
const SLIDER_MAX = 1000;

const WAVEFORMS = [
  { value: 0, label: "Sine", symbol: "~" },
  { value: 1, label: "Square", symbol: "⊓" },
  { value: 2, label: "Triangle", symbol: "△" },
  { value: 3, label: "Sawtooth", symbol: "⟋" },
  { value: 4, label: "White Noise", symbol: "◇" },
  { value: 5, label: "Pink Noise", symbol: "◈" },
  { value: 6, label: "Brown Noise", symbol: "◆" },
];

const MIX_MODES = [
  { value: 0, label: "Add", description: "Linear mix" },
  { value: 1, label: "Multiply", description: "Ring modulation with balance" },
  { value: 2, label: "Ring Mod", description: "Pure ring modulation" },
];

function App() {
  // Oscillator 1 state
  const [sliderFreq, setSliderFreq] = useState(
    frequencyToSlider(440) * SLIDER_MAX
  );
  const [sliderVolume, setSliderVolume] = useState(dbToSlider(0) * SLIDER_MAX);
  const [selectedWaveform, setSelectedWaveform] = useState(0);

  // Oscillator 2 state
  const [osc2SliderFreq, setOsc2SliderFreq] = useState(
    frequencyToSlider(440) * SLIDER_MAX
  );
  const [osc2SliderVolume, setOsc2SliderVolume] = useState(dbToSlider(0) * SLIDER_MAX);
  const [osc2SelectedWaveform, setOsc2SelectedWaveform] = useState(0);

  // Mixer state
  const [mixBalance, setMixBalance] = useState(0.5); // 0.0 = osc1 only, 1.0 = osc2 only
  const [mixMode, setMixMode] = useState(0);
  const [detune, setDetune] = useState(0); // -100 to +100 cents
  const [syncEnabled, setSyncEnabled] = useState(false);

  // App state
  const [isPlaying, setIsPlaying] = useState(false);

  // Sweep state for Oscillator 1
  const [sweep1StartFreq, setSweep1StartFreq] = useState(100); // 100Hz
  const [sweep1EndFreq, setSweep1EndFreq] = useState(1000); // 1kHz
  const [sweep1Duration, setSweep1Duration] = useState(5); // 5 seconds
  const [isSweeping1, setIsSweeping1] = useState(false);

  // Sweep state for Oscillator 2
  const [sweep2StartFreq, setSweep2StartFreq] = useState(100); // 100Hz
  const [sweep2EndFreq, setSweep2EndFreq] = useState(1000); // 1kHz
  const [sweep2Duration, setSweep2Duration] = useState(5); // 5 seconds
  const [isSweeping2, setIsSweeping2] = useState(false);

  // Oscillator 1 handlers
  const handleFrequencyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSliderValue = parseFloat(event.target.value);
    setSliderFreq(newSliderValue);
    SetFrequency(sliderToFrequency(newSliderValue / SLIDER_MAX));
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSliderValue = parseFloat(event.target.value);
    setSliderVolume(newSliderValue);
    SetVolume(dbToLinear(sliderToDB(newSliderValue / SLIDER_MAX)));
  };

  const handleWaveformChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newWaveform = parseInt(event.target.value);
    setSelectedWaveform(newWaveform);
    SetWaveform(newWaveform);
  };

  // Oscillator 2 handlers
  const handleOsc2FrequencyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSliderValue = parseFloat(event.target.value);
    setOsc2SliderFreq(newSliderValue);
    if (!syncEnabled) {
      SetOsc2Frequency(sliderToFrequency(newSliderValue / SLIDER_MAX));
    }
  };

  const handleOsc2VolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSliderValue = parseFloat(event.target.value);
    setOsc2SliderVolume(newSliderValue);
    SetOsc2Volume(dbToLinear(sliderToDB(newSliderValue / SLIDER_MAX)));
  };

  const handleOsc2WaveformChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newWaveform = parseInt(event.target.value);
    setOsc2SelectedWaveform(newWaveform);
    SetOsc2Waveform(newWaveform);
  };

  // Mixer handlers
  const handleMixBalanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBalance = parseFloat(event.target.value) / SLIDER_MAX;
    setMixBalance(newBalance);
    SetMixBalance(newBalance);
  };

  const handleMixModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = parseInt(event.target.value);
    setMixMode(newMode);
    SetMixMode(newMode);
  };

  const handleDetuneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDetune = parseFloat(event.target.value);
    setDetune(newDetune);
    SetDetune(newDetune);
  };

  const handleSyncToggle = () => {
    const newSyncEnabled = !syncEnabled;
    setSyncEnabled(newSyncEnabled);
    SetSync(newSyncEnabled);
  };

  // Copy OSC1 settings to OSC2
  const handleCopyOsc1ToOsc2 = () => {
    setOsc2SliderFreq(sliderFreq);
    setOsc2SliderVolume(sliderVolume);
    setOsc2SelectedWaveform(selectedWaveform);
    
    if (!syncEnabled) {
      SetOsc2Frequency(sliderToFrequency(sliderFreq / SLIDER_MAX));
    }
    SetOsc2Volume(dbToLinear(sliderToDB(sliderVolume / SLIDER_MAX)));
    SetOsc2Waveform(selectedWaveform);
  };

  // Handle Play button
  const handlePlay = () => {
    StartAudio();
    setIsPlaying(true);
  };

  // Handle Stop button
  const handleStop = () => {
    StopAudio();
    setIsPlaying(false);
  };

  // Sweep 1 handlers
  const handleStartSweep1 = () => {
    StartSweep1(sweep1StartFreq, sweep1EndFreq, sweep1Duration);
    setIsSweeping1(true);
  };

  const handleStopSweep1 = () => {
    StopSweep1();
    setIsSweeping1(false);
  };

  // Sweep 2 handlers
  const handleStartSweep2 = () => {
    StartSweep2(sweep2StartFreq, sweep2EndFreq, sweep2Duration);
    setIsSweeping2(true);
  };

  const handleStopSweep2 = () => {
    StopSweep2();
    setIsSweeping2(false);
  };

  const renderSweepControls = (
    isOsc1: boolean,
    startFreq: number,
    endFreq: number,
    duration: number,
    isSweeping: boolean,
    onStartFreqChange: (freq: number) => void,
    onEndFreqChange: (freq: number) => void,
    onDurationChange: (dur: number) => void,
    onStartSweep: () => void,
    onStopSweep: () => void
  ) => (
    <div className="sweep-controls">
      <h4>🔀 Frequency Sweep</h4>
      <div className="sweep-settings">
        <div className="sweep-input-group">
          <label>Start Freq (Hz)</label>
          <input
            type="number"
            min="20"
            max="20000"
            value={startFreq}
            onChange={(e) => onStartFreqChange(parseFloat(e.target.value))}
            disabled={isSweeping}
          />
        </div>
        <div className="sweep-input-group">
          <label>End Freq (Hz)</label>
          <input
            type="number"
            min="20"
            max="20000"
            value={endFreq}
            onChange={(e) => onEndFreqChange(parseFloat(e.target.value))}
            disabled={isSweeping}
          />
        </div>
        <div className="sweep-input-group">
          <label>Duration (s)</label>
          <input
            type="number"
            min="0.1"
            max="60"
            step="0.1"
            value={duration}
            onChange={(e) => onDurationChange(parseFloat(e.target.value))}
            disabled={isSweeping}
          />
        </div>
      </div>
      <button
        className={`btn ${isSweeping ? 'stop-btn' : 'sweep-btn'}`}
        onClick={isSweeping ? onStopSweep : onStartSweep}
        style={{ marginTop: '10px' }}
      >
        {isSweeping ? '⏹ Stop Sweep' : '🔀 Start Sweep'}
      </button>
    </div>
  );

  const renderOscillatorControls = (
    isOsc1: boolean,
    waveform: number,
    sliderFreqValue: number,
    sliderVolumeValue: number,
    onWaveformChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
    onFrequencyChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <>
      <div className="waveform-container">
        <select
          value={waveform}
          onChange={onWaveformChange}
          className="waveform-selector"
        >
          {WAVEFORMS.map((waveformOption) => (
            <option key={waveformOption.value} value={waveformOption.value}>
              {waveformOption.symbol} {waveformOption.label}
            </option>
          ))}
        </select>
      </div>

      {waveform < 4 && (
        <>
          <p>Frequency:</p>
          <div className="slider-container">
            <input
              type="range"
              min={SLIDER_MIN}
              max={SLIDER_MAX}
              value={sliderFreqValue}
              onChange={onFrequencyChange}
              step="1"
              className="slider"
              disabled={!isOsc1 && syncEnabled}
            />
            <span className="frequency-display">
              {formatFrequency(sliderToFrequency(sliderFreqValue / SLIDER_MAX))}
            </span>
          </div>
        </>
      )}
      
      {waveform >= 4 && (
        <p className="noise-info">
          Random signal across all frequencies
        </p>
      )}

      <p>Volume:</p>
      <div className="slider-container">
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          value={sliderVolumeValue}
          onChange={onVolumeChange}
          step="1"
          className="slider"
        />
        <span className="volume-display">
          {sliderToDB(sliderVolumeValue / SLIDER_MAX) === MIN_DB
            ? "−∞"
            : `${sliderToDB(sliderVolumeValue / SLIDER_MAX).toFixed(1)} dB`}
        </span>
      </div>
    </>
  );

  return (
    <div id="App">
      <h1>Dual Oscillator Audio Generator 🎶</h1>

      <div className="dual-oscillator-container">
        <div className="oscillator-panel osc1">
          <h3>Oscillator 1</h3>
          {renderOscillatorControls(
            true,
            selectedWaveform,
            sliderFreq,
            sliderVolume,
            handleWaveformChange,
            handleFrequencyChange,
            handleVolumeChange
          )}
          {selectedWaveform < 4 && renderSweepControls(
            true,
            sweep1StartFreq,
            sweep1EndFreq,
            sweep1Duration,
            isSweeping1,
            setSweep1StartFreq,
            setSweep1EndFreq,
            setSweep1Duration,
            handleStartSweep1,
            handleStopSweep1
          )}
        </div>

        <div className="oscillator-panel osc2">
          <h3>Oscillator 2</h3>
          <button 
            className="btn" 
            onClick={handleCopyOsc1ToOsc2}
            style={{ marginBottom: '10px', fontSize: '12px' }}
          >
            📋 Copy OSC1
          </button>
          {renderOscillatorControls(
            false,
            osc2SelectedWaveform,
            osc2SliderFreq,
            osc2SliderVolume,
            handleOsc2WaveformChange,
            handleOsc2FrequencyChange,
            handleOsc2VolumeChange
          )}
          {osc2SelectedWaveform < 4 && !syncEnabled && renderSweepControls(
            false,
            sweep2StartFreq,
            sweep2EndFreq,
            sweep2Duration,
            isSweeping2,
            setSweep2StartFreq,
            setSweep2EndFreq,
            setSweep2Duration,
            handleStartSweep2,
            handleStopSweep2
          )}
        </div>
      </div>

      <div className="mixer-section">
        <h3>⚡ Mixer & Modulation</h3>
        <div className="mixer-controls">
          <div className="control-group">
            <label>Mix Balance</label>
            <input
              type="range"
              min={SLIDER_MIN}
              max={SLIDER_MAX}
              value={mixBalance * SLIDER_MAX}
              onChange={handleMixBalanceChange}
              step="1"
              className="slider"
            />
            <span className="balance-display">
              {mixBalance === 0 ? "OSC1 Only" : 
               mixBalance === 1 ? "OSC2 Only" : 
               `${(mixBalance * 100).toFixed(0)}% OSC2`}
            </span>
          </div>

          <div className="control-group">
            <label>Mix Mode</label>
            <select
              value={mixMode}
              onChange={handleMixModeChange}
              className="mix-mode-selector"
            >
              {MIX_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {MIX_MODES[mixMode].description}
            </span>
          </div>

          <div className="control-group">
            <label>Sync</label>
            <button
              className={`sync-button ${syncEnabled ? 'active' : ''}`}
              onClick={handleSyncToggle}
            >
              {syncEnabled ? '🔗 Synced' : '🔓 Free'}
            </button>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {syncEnabled ? 'OSC2 follows OSC1' : 'Independent control'}
            </span>
          </div>

          <div className="control-group">
            <label>Detune (cents)</label>
            <input
              type="range"
              min={-100}
              max={100}
              value={detune}
              onChange={handleDetuneChange}
              step="1"
              className="slider"
              disabled={!syncEnabled}
            />
            <span className="detune-display">
              {detune === 0 ? "±0¢" : 
               detune > 0 ? `+${detune}¢` : `${detune}¢`}
            </span>
          </div>
        </div>
      </div>

      <div className="button-container">
        {!isPlaying ? (
          <button className="btn play-btn" onClick={handlePlay}>
            ▶ Play
          </button>
        ) : (
          <button className="btn stop-btn" onClick={handleStop}>
            ⏹ Stop
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
