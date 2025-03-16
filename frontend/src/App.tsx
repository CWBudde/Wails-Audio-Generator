import { useState } from "react";
import "./App.css";
import {
  SetFrequency,
  SetVolume,
  StartAudio,
  StopAudio,
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

function App() {
  const [sliderFreq, setSliderFreq] = useState(
    frequencyToSlider(440) * SLIDER_MAX
  );
  const [sliderVolume, setSliderVolume] = useState(dbToSlider(0) * SLIDER_MAX);
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle frequency change
  const handleFrequencyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSliderValue = parseFloat(event.target.value);
    setSliderFreq(newSliderValue);
    SetFrequency(sliderToFrequency(newSliderValue / SLIDER_MAX));
  };

  // Handle volume change
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSliderValue = parseFloat(event.target.value);
    setSliderVolume(newSliderValue);
    SetVolume(dbToLinear(sliderToDB(newSliderValue / SLIDER_MAX)));
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

  return (
    <div id="App">
      <h1>Audio Frequency Generator 🎶</h1>

      <p>Adjust the frequency below:</p>
      <div className="slider-container">
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          value={sliderFreq}
          onChange={handleFrequencyChange}
          step="1"
          className="slider"
        />
        <span className="frequency-display">
          {formatFrequency(sliderToFrequency(sliderFreq / SLIDER_MAX))}
        </span>
      </div>

      <p>Adjust the volume below:</p>
      <div className="slider-container">
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          value={sliderVolume}
          onChange={handleVolumeChange}
          step="1"
          className="slider"
        />
        <span className="volume-display">
          {sliderToDB(sliderVolume) === MIN_DB
            ? "−∞"
            : `${sliderToDB(sliderVolume / SLIDER_MAX).toFixed(1)} dB`}
        </span>
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
