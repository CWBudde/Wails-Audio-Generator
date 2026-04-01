import React, { useEffect, useRef, useState } from 'react';

interface WaveformVisualizerProps {
  frequency: number;
  isPlaying: boolean;
  waveformType: number;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  frequency,
  isPlaying,
  waveformType,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const phaseRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 300, height: 120 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
      gradient.addColorStop(0.5, 'rgba(0, 115, 230, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);

      // Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = (dimensions.height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.width, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let i = 0; i <= 8; i++) {
        const x = (dimensions.width / 8) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.height);
        ctx.stroke();
      }

      // Center line
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, dimensions.height / 2);
      ctx.lineTo(dimensions.width, dimensions.height / 2);
      ctx.stroke();

      // Waveform
      if (isPlaying) {
        phaseRef.current += (frequency / 1000) * 0.5;
      }

      const amplitude = dimensions.height * 0.35;
      const centerY = dimensions.height / 2;

      // Create waveform path
      ctx.beginPath();
      ctx.lineWidth = 3;

      // Set colors based on waveform type
      let strokeColor = '#00ffff';
      let glowColor = 'rgba(0, 255, 255, 0.5)';

      switch (waveformType) {
        case 0: // Sine
          strokeColor = '#00ffff';
          glowColor = 'rgba(0, 255, 255, 0.5)';
          break;
        case 1: // Square
          strokeColor = '#39ff14';
          glowColor = 'rgba(57, 255, 20, 0.5)';
          break;
        case 2: // Triangle
          strokeColor = '#ff6600';
          glowColor = 'rgba(255, 102, 0, 0.5)';
          break;
        case 3: // Sawtooth
          strokeColor = '#ff00ff';
          glowColor = 'rgba(255, 0, 255, 0.5)';
          break;
        default:
          strokeColor = '#ffffff';
          glowColor = 'rgba(255, 255, 255, 0.5)';
      }

      // Glow effect
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = strokeColor;

      for (let x = 0; x < dimensions.width; x++) {
        const t = (x / dimensions.width) * 4 * Math.PI + phaseRef.current;
        let y = centerY;

        switch (waveformType) {
          case 0: // Sine wave
            y = centerY + amplitude * Math.sin(t);
            break;
          case 1: // Square wave
            y = centerY + amplitude * (Math.sin(t) > 0 ? 1 : -1);
            break;
          case 2: // Triangle wave
            y = centerY + amplitude * (2 / Math.PI) * Math.asin(Math.sin(t));
            break;
          case 3: // Sawtooth wave
            y = centerY + amplitude * ((t % (2 * Math.PI)) / Math.PI - 1);
            break;
          default: // White noise
            y = centerY + amplitude * (Math.random() * 2 - 1) * 0.3;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Frequency indicator
      ctx.shadowBlur = 0;
      ctx.fillStyle = strokeColor;
      ctx.font = '12px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${frequency.toFixed(1)} Hz`, dimensions.width - 10, 20);

      // Animation loop
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frequency, isPlaying, waveformType, dimensions]);

  return (
    <div className={`waveform-visualizer ${className}`}>
      <div className="relative rounded-xl overflow-hidden glass border border-neon-cyan/30 hover:border-neon-cyan/60 transition-all duration-300">
        <canvas
          ref={canvasRef}
          className="w-full h-32 block"
          style={{
            width: '100%',
            height: '128px',
            background: 'transparent',
          }}
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-neon-cyan/5 to-transparent animate-pulse-slow"></div>
      </div>
      <div className="mt-2 text-center">
        <span className="text-xs font-audio text-studio-dark-200 uppercase tracking-wider">
          Waveform Display
        </span>
      </div>
    </div>
  );
};
