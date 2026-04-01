import { describe, it, expect } from 'vitest';
import {
  MIN_FREQ,
  MAX_FREQ,
  MIN_DB,
  MAX_DB,
  SCALE_FACTOR,
  sliderToFrequency,
  frequencyToSlider,
  sliderToDB,
  dbToSlider,
  dbToLinear,
  linearToDB,
  formatFrequency,
} from '../utils';

describe('Audio Utils', () => {
  describe('Constants', () => {
    it('should have correct frequency range', () => {
      expect(MIN_FREQ).toBe(20);
      expect(MAX_FREQ).toBe(20000);
    });

    it('should have correct dB range', () => {
      expect(MIN_DB).toBe(-80);
      expect(MAX_DB).toBe(0);
    });

    it('should have correct scale factor', () => {
      const expected = 1.0 / Math.log10(MAX_FREQ / MIN_FREQ);
      expect(SCALE_FACTOR).toBeCloseTo(expected, 10);
    });
  });

  describe('Frequency Conversion', () => {
    it('should convert slider position 0 to minimum frequency', () => {
      const freq = sliderToFrequency(0);
      expect(freq).toBeCloseTo(MIN_FREQ, 1);
    });

    it('should convert slider position 1 to maximum frequency', () => {
      const freq = sliderToFrequency(1);
      expect(freq).toBeCloseTo(MAX_FREQ, 1);
    });

    it('should convert 440Hz to correct slider position', () => {
      const sliderPos = frequencyToSlider(440);
      expect(sliderPos).toBeGreaterThan(0);
      expect(sliderPos).toBeLessThan(1);

      // Round trip test
      const backToFreq = sliderToFrequency(sliderPos);
      expect(backToFreq).toBeCloseTo(440, 1);
    });

    it('should handle frequency range extremes', () => {
      // Test minimum
      const minSlider = frequencyToSlider(MIN_FREQ);
      expect(minSlider).toBeCloseTo(0, 5);

      // Test maximum
      const maxSlider = frequencyToSlider(MAX_FREQ);
      expect(maxSlider).toBeCloseTo(1, 5);
    });

    it('should maintain logarithmic relationship', () => {
      const freq1 = sliderToFrequency(0.25);
      const freq2 = sliderToFrequency(0.5);
      const freq3 = sliderToFrequency(0.75);

      // In logarithmic scale, equal increments should multiply by same factor
      const ratio1 = freq2 / freq1;
      const ratio2 = freq3 / freq2;
      expect(ratio1).toBeCloseTo(ratio2, 1);
    });
  });

  describe('Volume/dB Conversion', () => {
    it('should convert slider position 0 to minimum dB', () => {
      const db = sliderToDB(0);
      expect(db).toBe(MIN_DB);
    });

    it('should convert slider position 1 to maximum dB', () => {
      const db = sliderToDB(1);
      expect(db).toBe(MAX_DB);
    });

    it('should convert 0 dB to correct slider position', () => {
      const sliderPos = dbToSlider(0);
      expect(sliderPos).toBe(1);
    });

    it('should convert -40 dB to correct slider position', () => {
      const sliderPos = dbToSlider(-40);
      expect(sliderPos).toBe(0.5); // Halfway between -80 and 0
    });

    it('should handle dB to linear conversion', () => {
      // 0 dB should be 1.0 linear
      expect(dbToLinear(0)).toBeCloseTo(1.0, 5);

      // -20 dB should be 0.1 linear
      expect(dbToLinear(-20)).toBeCloseTo(0.1, 5);

      // -40 dB should be 0.01 linear
      expect(dbToLinear(-40)).toBeCloseTo(0.01, 5);

      // Minimum dB should be 0 linear
      expect(dbToLinear(MIN_DB)).toBe(0);
    });

    it('should handle linear to dB conversion', () => {
      // 1.0 linear should be 0 dB
      expect(linearToDB(1.0)).toBeCloseTo(0, 5);

      // 0.1 linear should be -20 dB
      expect(linearToDB(0.1)).toBeCloseTo(-20, 5);

      // 0.01 linear should be -40 dB
      expect(linearToDB(0.01)).toBeCloseTo(-40, 5);

      // Very small values should return MIN_DB
      expect(linearToDB(0.000001)).toBe(MIN_DB);
      expect(linearToDB(0)).toBe(MIN_DB);
    });

    it('should maintain round-trip accuracy for dB conversions', () => {
      const testValues = [-10, -20, -30, -40, -50, -60];

      testValues.forEach(db => {
        const linear = dbToLinear(db);
        const backToDB = linearToDB(linear);
        expect(backToDB).toBeCloseTo(db, 3);
      });
    });
  });

  describe('Frequency Formatting', () => {
    it('should format frequencies below 10kHz in Hz', () => {
      expect(formatFrequency(100)).toBe('100 Hz');
      expect(formatFrequency(440)).toBe('440 Hz');
      expect(formatFrequency(1000)).toBe('1000 Hz');
      expect(formatFrequency(9999)).toBe('9999 Hz');
    });

    it('should format frequencies at/above 10kHz in kHz', () => {
      expect(formatFrequency(10000)).toBe('10.0 kHz');
      expect(formatFrequency(15000)).toBe('15.0 kHz');
      expect(formatFrequency(20000)).toBe('20.0 kHz');
    });

    it('should handle decimal kHz values correctly', () => {
      expect(formatFrequency(12500)).toBe('12.5 kHz');
      expect(formatFrequency(11111)).toBe('11.1 kHz');
    });

    it('should round Hz values to integers', () => {
      expect(formatFrequency(440.7)).toBe('441 Hz');
      expect(formatFrequency(439.3)).toBe('439 Hz');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete frequency workflow', () => {
      // Start with a frequency
      const originalFreq = 880; // A5

      // Convert to slider position
      const sliderPos = frequencyToSlider(originalFreq);

      // Convert back to frequency
      const convertedFreq = sliderToFrequency(sliderPos);

      // Should be very close to original
      expect(convertedFreq).toBeCloseTo(originalFreq, 1);

      // Format should be correct
      const formatted = formatFrequency(convertedFreq);
      expect(formatted).toBe('880 Hz');
    });

    it('should handle complete volume workflow', () => {
      // Start with a dB value
      const originalDB = -30;

      // Convert to slider position
      const sliderPos = dbToSlider(originalDB);

      // Convert back to dB
      const convertedDB = sliderToDB(sliderPos);

      // Should be exact (linear relationship)
      expect(convertedDB).toBeCloseTo(originalDB, 10);

      // Convert to linear and back
      const linear = dbToLinear(originalDB);
      const backToDB = linearToDB(linear);
      expect(backToDB).toBeCloseTo(originalDB, 3);
    });

    it('should handle edge cases gracefully', () => {
      // Test with extreme values that might occur in UI
      expect(() => sliderToFrequency(-1)).not.toThrow();
      expect(() => sliderToFrequency(2)).not.toThrow();
      expect(() => frequencyToSlider(10)).not.toThrow();
      expect(() => frequencyToSlider(100000)).not.toThrow();

      expect(() => sliderToDB(-1)).not.toThrow();
      expect(() => sliderToDB(2)).not.toThrow();
      expect(() => dbToSlider(-100)).not.toThrow();
      expect(() => dbToSlider(10)).not.toThrow();

      expect(() => dbToLinear(-100)).not.toThrow();
      expect(() => linearToDB(2)).not.toThrow();

      expect(() => formatFrequency(0.1)).not.toThrow();
      expect(() => formatFrequency(1000000)).not.toThrow();
    });
  });

  describe('Musical Frequencies', () => {
    it('should handle common musical frequencies correctly', () => {
      const musicalFreqs = [
        { note: 'C4', freq: 261.63 },
        { note: 'A4', freq: 440 },
        { note: 'A5', freq: 880 },
        { note: 'C8', freq: 4186.01 },
      ];

      musicalFreqs.forEach(({ freq }) => {
        const sliderPos = frequencyToSlider(freq);
        const backToFreq = sliderToFrequency(sliderPos);
        expect(backToFreq).toBeCloseTo(freq, 1);

        const formatted = formatFrequency(freq);
        if (freq < 10000) {
          expect(formatted).toContain('Hz');
        } else {
          expect(formatted).toContain('kHz');
        }
      });
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle very small frequencies', () => {
      const result = frequencyToSlider(1);
      expect(Number.isFinite(result)).toBe(true);
      expect(Number.isNaN(result)).toBe(false);
    });

    it('should handle very large frequencies', () => {
      const result = frequencyToSlider(100000);
      expect(Number.isFinite(result)).toBe(true);
      expect(Number.isNaN(result)).toBe(false);
    });

    it('should handle very small linear values', () => {
      const result = linearToDB(1e-10);
      expect(result).toBe(MIN_DB);
    });

    it('should not produce NaN or infinite values', () => {
      const testSliders = [0, 0.25, 0.5, 0.75, 1.0];

      testSliders.forEach(slider => {
        const freq = sliderToFrequency(slider);
        expect(Number.isFinite(freq)).toBe(true);
        expect(Number.isNaN(freq)).toBe(false);

        const db = sliderToDB(slider);
        expect(Number.isFinite(db)).toBe(true);
        expect(Number.isNaN(db)).toBe(false);

        const linear = dbToLinear(db);
        expect(Number.isFinite(linear)).toBe(true);
        expect(Number.isNaN(linear)).toBe(false);
      });
    });
  });
});
