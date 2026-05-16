import { describe, expect, it } from 'vitest';

import { displayToKm, formatDistance, formatPace, kmToDisplay } from '@/utils/distance';

describe('kmToDisplay', () => {
  it('returns km unchanged when unit is km', () => {
    expect(kmToDisplay(5, 'km')).toBe(5);
  });

  it('converts km to miles', () => {
    expect(kmToDisplay(1.60934, 'mi')).toBeCloseTo(1, 4);
  });

  it('converts 5km to miles', () => {
    expect(kmToDisplay(5, 'mi')).toBeCloseTo(3.10686, 3);
  });
});

describe('displayToKm', () => {
  it('returns value unchanged when unit is km', () => {
    expect(displayToKm(5, 'km')).toBe(5);
  });

  it('converts miles to km', () => {
    expect(displayToKm(1, 'mi')).toBeCloseTo(1.60934, 4);
  });

  it('round-trips with kmToDisplay', () => {
    const original = 7.5;
    expect(displayToKm(kmToDisplay(original, 'mi'), 'mi')).toBeCloseTo(original, 5);
  });
});

describe('formatDistance', () => {
  it('returns km as-is when unit is km', () => {
    expect(formatDistance(5, 'km')).toBe('5');
  });

  it('converts and rounds to 2 decimal places', () => {
    expect(formatDistance(1, 'mi')).toBe('0.62');
  });

  it('strips trailing zeros', () => {
    expect(formatDistance(1.60934, 'mi')).toBe('1');
  });

  it('rounds 5km to miles correctly', () => {
    expect(formatDistance(5, 'mi')).toBe('3.11');
  });
});

describe('formatPace', () => {
  it('formats exact 4-minute km pace', () => {
    expect(formatPace(4 * 60 * 1000, 1, 'km')).toBe('4:00/km');
  });

  it('formats pace with seconds', () => {
    // 4 min 30 sec per km over 1 km
    expect(formatPace(4 * 60 * 1000 + 30 * 1000, 1, 'km')).toBe('4:30/km');
  });

  it('uses mi unit label when unit is mi', () => {
    expect(formatPace(4 * 60 * 1000, 1.60934, 'mi')).toBe('4:00/mi');
  });

  it('scales correctly with distance greater than 1', () => {
    // 4 min/km pace over 5 km = 20 min total
    expect(formatPace(20 * 60 * 1000, 5, 'km')).toBe('4:00/km');
  });

  it('pads seconds with leading zero', () => {
    // 4 min 5 sec per km
    expect(formatPace(4 * 60 * 1000 + 5 * 1000, 1, 'km')).toBe('4:05/km');
  });
});
