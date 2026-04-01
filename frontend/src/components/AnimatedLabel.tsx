import React, { useState, useEffect } from 'react';

interface AnimatedLabelProps {
  value: number | string;
  label: string;
  unit?: string;
  color?: 'cyan' | 'green' | 'orange' | 'pink' | 'blue' | 'white';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  precision?: number;
}

export const AnimatedLabel: React.FC<AnimatedLabelProps> = ({
  value,
  label,
  unit = '',
  color = 'cyan',
  size = 'md',
  animate = true,
  precision = 1,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (value !== displayValue && animate) {
      setIsChanging(true);
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setIsChanging(false);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setDisplayValue(value);
    }
    return undefined;
  }, [value, displayValue, animate]);

  const colorClasses = {
    cyan: 'text-neon-cyan',
    green: 'text-neon-green',
    orange: 'text-neon-orange',
    pink: 'text-neon-pink',
    blue: 'text-neon-blue',
    white: 'text-studio-white',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      if (val >= 1000 && unit === 'Hz') {
        return `${(val / 1000).toFixed(precision)}k`;
      }
      return val.toFixed(precision);
    }
    return String(val);
  };

  return (
    <div className="animated-label flex flex-col items-center gap-1 transition-all duration-300">
      {/* Label */}
      <div className="text-xs font-audio text-studio-dark-300 uppercase tracking-wider">
        {label}
      </div>

      {/* Value Display */}
      <div
        className={`
          font-bold font-audio transition-all duration-300 select-none
          ${colorClasses[color]} ${sizeClasses[size]}
          ${isChanging ? 'animate-neon-pulse scale-110' : ''}
          ${animate ? 'text-glow' : ''}
        `}
        style={{
          textShadow: animate
            ? `0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor`
            : 'none',
        }}
      >
        <span className={isChanging ? 'animate-pulse' : ''}>
          {formatValue(displayValue)}
          {unit}
        </span>
      </div>
    </div>
  );
};
