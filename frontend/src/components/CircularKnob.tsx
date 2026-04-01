import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CircularKnobProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  precision?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'green' | 'orange' | 'pink' | 'blue';
  disabled?: boolean;
  logarithmic?: boolean;
}

export const CircularKnob: React.FC<CircularKnobProps> = ({
  value,
  min,
  max,
  onChange,
  label,
  unit = '',
  precision = 1,
  size = 'md',
  color = 'cyan',
  disabled = false,
  logarithmic = false,
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startValue, setStartValue] = useState(0);

  // Size configurations
  const sizeConfig = {
    sm: { diameter: 60, strokeWidth: 4, fontSize: 'text-xs' },
    md: { diameter: 80, strokeWidth: 5, fontSize: 'text-sm' },
    lg: { diameter: 100, strokeWidth: 6, fontSize: 'text-base' },
  };

  const config = sizeConfig[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Color configurations
  const colorConfig = {
    cyan: {
      primary: '#00ffff',
      glow: 'rgba(0, 255, 255, 0.4)',
      bg: 'rgba(0, 255, 255, 0.1)',
    },
    green: {
      primary: '#39ff14',
      glow: 'rgba(57, 255, 20, 0.4)',
      bg: 'rgba(57, 255, 20, 0.1)',
    },
    orange: {
      primary: '#ff6600',
      glow: 'rgba(255, 102, 0, 0.4)',
      bg: 'rgba(255, 102, 0, 0.1)',
    },
    pink: {
      primary: '#ff00ff',
      glow: 'rgba(255, 0, 255, 0.4)',
      bg: 'rgba(255, 0, 255, 0.1)',
    },
    blue: {
      primary: '#0080ff',
      glow: 'rgba(0, 128, 255, 0.4)',
      bg: 'rgba(0, 128, 255, 0.1)',
    },
  };

  const colors = colorConfig[color];

  // Convert value to angle (0 to 270 degrees, with 45-degree gap at bottom)
  const valueToAngle = (val: number) => {
    let normalizedValue;
    if (logarithmic) {
      const logMin = Math.log(min);
      const logMax = Math.log(max);
      const logVal = Math.log(val);
      normalizedValue = (logVal - logMin) / (logMax - logMin);
    } else {
      normalizedValue = (val - min) / (max - min);
    }
    return -135 + normalizedValue * 270; // -135° to 135° (270° range)
  };

  // Convert angle to value (keeping for potential future use)
  // const angleToValue = (angle: number) => {
  //   const normalizedAngle = (angle + 135) / 270; // Convert to 0-1 range
  //   const clampedAngle = Math.max(0, Math.min(1, normalizedAngle));
  //
  //   let newValue;
  //   if (logarithmic) {
  //     const logMin = Math.log(min);
  //     const logMax = Math.log(max);
  //     newValue = Math.exp(logMin + clampedAngle * (logMax - logMin));
  //   } else {
  //     newValue = min + clampedAngle * (max - min);
  //   }
  //
  //   return Math.max(min, Math.min(max, newValue));
  // };

  const formatValue = (val: number): string => {
    if (logarithmic && val >= 1000) {
      return `${(val / 1000).toFixed(precision)}k`;
    }
    return val.toFixed(precision);
  };

  const getAngle = (centerX: number, centerY: number, clientX: number, clientY: number) => {
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  };

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;

      event.preventDefault();
      const rect = knobRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = getAngle(centerX, centerY, event.clientX, event.clientY);

      setIsDragging(true);
      setStartAngle(angle);
      setStartValue(value);
    },
    [disabled, value]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || disabled) return;

      const rect = knobRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const currentAngle = getAngle(centerX, centerY, event.clientX, event.clientY);

      const deltaAngle = currentAngle - startAngle;
      const sensitivity = 0.5;
      const valueRange = max - min;
      const angleRange = 270;

      let deltaValue = (deltaAngle * sensitivity * valueRange) / angleRange;

      if (logarithmic) {
        const logRange = Math.log(max) - Math.log(min);
        deltaValue = (deltaAngle * sensitivity * logRange) / angleRange;
        const newLogValue = Math.log(startValue) + deltaValue;
        const newValue = Math.exp(newLogValue);
        onChange(Math.max(min, Math.min(max, newValue)));
      } else {
        const newValue = startValue + deltaValue;
        onChange(Math.max(min, Math.min(max, newValue)));
      }
    },
    [isDragging, disabled, startAngle, startValue, min, max, onChange, logarithmic]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const currentAngle = valueToAngle(value);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - ((currentAngle + 135) / 270) * circumference;

  return (
    <div className="circular-knob flex flex-col items-center gap-2">
      <div
        ref={knobRef}
        className={`relative cursor-pointer transition-transform duration-200 ${
          isDragging ? 'scale-110' : 'hover:scale-105'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          width: config.diameter,
          height: config.diameter,
          filter: `drop-shadow(0 0 10px ${colors.glow})`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Background circle */}
        <svg
          width={config.diameter}
          height={config.diameter}
          className="absolute inset-0 rotate-[-135deg]"
        >
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke="rgba(64, 64, 64, 0.5)"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke={colors.primary}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 8px ${colors.glow})`,
              transition: 'stroke-dashoffset 0.1s ease-out',
            }}
          />
        </svg>

        {/* Knob center */}
        <div
          className="absolute inset-2 rounded-full glass border-2 flex items-center justify-center"
          style={{
            borderColor: colors.primary,
            backgroundColor: colors.bg,
          }}
        >
          {/* Indicator line */}
          <div
            className="absolute w-1 h-4 rounded-full"
            style={{
              backgroundColor: colors.primary,
              top: '8px',
              transformOrigin: `center ${config.diameter / 2 - 16}px`,
              transform: `rotate(${currentAngle}deg)`,
              boxShadow: `0 0 6px ${colors.glow}`,
            }}
          />
        </div>
      </div>

      {/* Value display */}
      <div className="text-center">
        <div
          className={`font-bold font-audio ${config.fontSize}`}
          style={{ color: colors.primary }}
        >
          {formatValue(value)}
          {unit}
        </div>
        {label && (
          <div className="text-xs font-audio text-studio-dark-300 uppercase tracking-wider">
            {label}
          </div>
        )}
      </div>
    </div>
  );
};
