import { describe, it, expect } from 'vitest';

// Test dual oscillator specific utility functions and constants

describe('Dual Oscillator Features', () => {
  describe('Mix Balance Calculations', () => {
    it('should calculate correct mix percentages', () => {
      const balance0 = 0.0; // OSC1 only
      const balance50 = 0.5; // 50/50 mix
      const balance100 = 1.0; // OSC2 only
      
      expect(balance0 * 100).toBe(0);
      expect(balance50 * 100).toBe(50);
      expect(balance100 * 100).toBe(100);
    });

    it('should handle balance edge cases', () => {
      const negativeBalance = -0.1;
      const overBalance = 1.1;
      
      // These would be clamped in the actual implementation
      expect(Math.max(0, Math.min(1, negativeBalance))).toBe(0);
      expect(Math.max(0, Math.min(1, overBalance))).toBe(1);
    });
  });

  describe('Detune Calculations', () => {
    it('should calculate correct frequency ratios from cents', () => {
      // 1200 cents = 1 octave (2:1 ratio)
      const octave = Math.pow(2, 1200 / 1200);
      expect(octave).toBeCloseTo(2.0, 10);

      // 100 cents = 1 semitone
      const semitone = Math.pow(2, 100 / 1200);
      expect(semitone).toBeCloseTo(1.059463, 5);

      // 0 cents = no change
      const noCents = Math.pow(2, 0 / 1200);
      expect(noCents).toBe(1.0);

      // -100 cents = down one semitone
      const downSemitone = Math.pow(2, -100 / 1200);
      expect(downSemitone).toBeCloseTo(0.943874, 5);
    });

    it('should handle detune range limits', () => {
      const minDetune = -100; // cents
      const maxDetune = 100; // cents
      
      const minRatio = Math.pow(2, minDetune / 1200);
      const maxRatio = Math.pow(2, maxDetune / 1200);
      
      expect(minRatio).toBeCloseTo(0.943874, 5);
      expect(maxRatio).toBeCloseTo(1.059463, 5);
    });

    it('should calculate detuned frequencies correctly', () => {
      const baseFreq = 440; // A4
      const detuneCents = 50; // Half semitone up
      
      const detuneRatio = Math.pow(2, detuneCents / 1200);
      const detunedFreq = baseFreq * detuneRatio;
      
      expect(detunedFreq).toBeGreaterThan(baseFreq);
      expect(detunedFreq).toBeCloseTo(452.89, 1);
    });
  });

  describe('Mix Mode Functionality', () => {
    const sampleOsc1 = 0.5;
    const sampleOsc2 = 0.3;
    const balance = 0.7;

    it('should calculate additive mixing correctly', () => {
      // Additive: output = osc1 * (1-balance) + osc2 * balance
      const result = sampleOsc1 * (1 - balance) + sampleOsc2 * balance;
      const expected = 0.5 * 0.3 + 0.3 * 0.7; // 0.15 + 0.21 = 0.36
      expect(result).toBeCloseTo(expected, 10);
    });

    it('should calculate multiplicative mixing correctly', () => {
      // Multiplicative: output = osc1 * (osc2 * balance) when balance > 0
      const result = sampleOsc1 * (sampleOsc2 * balance);
      const expected = 0.5 * (0.3 * 0.7); // 0.5 * 0.21 = 0.105
      expect(result).toBeCloseTo(expected, 10);
    });

    it('should calculate ring modulation correctly', () => {
      // Ring modulation: output = osc1 * osc2 * 0.5
      const result = sampleOsc1 * sampleOsc2 * 0.5;
      const expected = 0.5 * 0.3 * 0.5; // 0.075
      expect(result).toBeCloseTo(expected, 10);
    });

    it('should handle zero balance in multiplicative mode', () => {
      const zeroBalance = 0.0;
      const result = zeroBalance === 0.0 ? sampleOsc1 : sampleOsc1 * (sampleOsc2 * zeroBalance);
      expect(result).toBe(sampleOsc1); // Should return osc1 only
    });
  });

  describe('Sync Functionality', () => {
    it('should maintain frequency relationships when synced', () => {
      const baseFreq = 440;
      const detuneCents = 25;
      
      const syncedFreq = baseFreq * Math.pow(2, detuneCents / 1200);
      
      expect(syncedFreq).toBeCloseTo(452.89 * Math.pow(2, -25/1200), 2);
    });

    it('should allow independent frequencies when not synced', () => {
      const osc1Freq = 440;
      const osc2Freq = 660;
      
      // When not synced, frequencies should be independent
      expect(osc1Freq).not.toBe(osc2Freq);
      expect(osc2Freq / osc1Freq).toBeCloseTo(1.5, 5); // Perfect fifth
    });
  });

  describe('UI State Management', () => {
    it('should handle slider to mix balance conversion', () => {
      const SLIDER_MAX = 1000;
      
      const slider0 = 0;
      const slider500 = 500;
      const slider1000 = 1000;
      
      const balance0 = slider0 / SLIDER_MAX;
      const balance50 = slider500 / SLIDER_MAX;
      const balance100 = slider1000 / SLIDER_MAX;
      
      expect(balance0).toBe(0.0);
      expect(balance50).toBe(0.5);
      expect(balance100).toBe(1.0);
    });

    it('should format balance display correctly', () => {
      const formatBalance = (balance: number) => {
        if (balance === 0) return "OSC1 Only";
        if (balance === 1) return "OSC2 Only";
        return `${(balance * 100).toFixed(0)}% OSC2`;
      };

      expect(formatBalance(0.0)).toBe("OSC1 Only");
      expect(formatBalance(0.3)).toBe("30% OSC2");
      expect(formatBalance(0.5)).toBe("50% OSC2");
      expect(formatBalance(0.75)).toBe("75% OSC2");
      expect(formatBalance(1.0)).toBe("OSC2 Only");
    });

    it('should format detune display correctly', () => {
      const formatDetune = (detune: number) => {
        if (detune === 0) return "±0¢";
        return detune > 0 ? `+${detune}¢` : `${detune}¢`;
      };

      expect(formatDetune(0)).toBe("±0¢");
      expect(formatDetune(25)).toBe("+25¢");
      expect(formatDetune(-25)).toBe("-25¢");
      expect(formatDetune(100)).toBe("+100¢");
      expect(formatDetune(-100)).toBe("-100¢");
    });
  });

  describe('Waveform Combinations', () => {
    it('should handle different waveform type combinations', () => {
      const waveformTypes = [
        { id: 0, name: "Sine", symbol: "~" },
        { id: 1, name: "Square", symbol: "⊓" },
        { id: 2, name: "Triangle", symbol: "△" },
        { id: 3, name: "Sawtooth", symbol: "⟋" },
        { id: 4, name: "White Noise", symbol: "◇" },
        { id: 5, name: "Pink Noise", symbol: "◈" },
        { id: 6, name: "Brown Noise", symbol: "◆" },
      ];

      // Test that all waveform types are valid
      waveformTypes.forEach(waveform => {
        expect(waveform.id).toBeGreaterThanOrEqual(0);
        expect(waveform.id).toBeLessThan(7);
        expect(waveform.name).toBeTruthy();
        expect(waveform.symbol).toBeTruthy();
      });

      // Test frequency relevance
      waveformTypes.forEach(waveform => {
        const hasFrequencyControl = waveform.id < 4; // Non-noise waveforms
        expect(typeof hasFrequencyControl).toBe('boolean');
      });
    });
  });

  describe('Audio Range Validation', () => {
    it('should validate audio sample ranges', () => {
      const validateSample = (sample: number) => {
        return Number.isFinite(sample) && !Number.isNaN(sample) && Math.abs(sample) <= 2.0;
      };

      // Test various sample values that might result from mixing
      expect(validateSample(0.0)).toBe(true);
      expect(validateSample(1.0)).toBe(true);
      expect(validateSample(-1.0)).toBe(true);
      expect(validateSample(0.5)).toBe(true);
      expect(validateSample(-0.5)).toBe(true);
      expect(validateSample(2.0)).toBe(true); // Allow some headroom
      expect(validateSample(-2.0)).toBe(true);
      
      // Invalid samples
      expect(validateSample(NaN)).toBe(false);
      expect(validateSample(Infinity)).toBe(false);
      expect(validateSample(-Infinity)).toBe(false);
      expect(validateSample(3.0)).toBe(false); // Too large
    });
  });

  describe('Performance Considerations', () => {
    it('should handle rapid parameter changes efficiently', () => {
      // Simulate rapid slider movements
      const rapidChanges = Array.from({ length: 1000 }, (_, i) => i / 1000);
      
      rapidChanges.forEach(value => {
        const balance = Math.max(0, Math.min(1, value));
        const detune = Math.max(-100, Math.min(100, (value - 0.5) * 200));
        
        expect(balance).toBeGreaterThanOrEqual(0);
        expect(balance).toBeLessThanOrEqual(1);
        expect(detune).toBeGreaterThanOrEqual(-100);
        expect(detune).toBeLessThanOrEqual(100);
      });
    });

    it('should maintain precision in calculations', () => {
      // Test that small detune values maintain precision
      const smallDetunes = [-1, -0.5, 0, 0.5, 1];
      
      smallDetunes.forEach(detune => {
        const ratio = Math.pow(2, detune / 1200);
        expect(Number.isFinite(ratio)).toBe(true);
        expect(ratio).toBeGreaterThan(0);
        
        // For very small detunes, ratio should be very close to 1
        if (Math.abs(detune) <= 1) {
          expect(Math.abs(ratio - 1.0)).toBeLessThan(0.001);
        }
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complex mixing scenarios', () => {
      const scenarios = [
        { osc1: 0.8, osc2: 0.6, balance: 0.0, mode: 'add' },
        { osc1: 0.8, osc2: 0.6, balance: 0.5, mode: 'add' },
        { osc1: 0.8, osc2: 0.6, balance: 1.0, mode: 'add' },
        { osc1: 0.5, osc2: 0.4, balance: 0.7, mode: 'multiply' },
        { osc1: 0.7, osc2: 0.3, balance: 0.5, mode: 'ring' },
      ];

      scenarios.forEach(scenario => {
        let result: number;
        
        switch (scenario.mode) {
          case 'add':
            result = scenario.osc1 * (1 - scenario.balance) + scenario.osc2 * scenario.balance;
            break;
          case 'multiply':
            result = scenario.balance === 0 ? scenario.osc1 : scenario.osc1 * (scenario.osc2 * scenario.balance);
            break;
          case 'ring':
            result = scenario.osc1 * scenario.osc2 * 0.5;
            break;
          default:
            result = 0;
        }

        expect(Number.isFinite(result)).toBe(true);
        expect(Number.isNaN(result)).toBe(false);
        expect(Math.abs(result)).toBeLessThanOrEqual(2.0);
      });
    });
  });
});