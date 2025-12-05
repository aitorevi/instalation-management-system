import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatDateTime } from './dates';

describe('formatDate', () => {
  it('should format date correctly in Spanish locale', () => {
    const result = formatDate('2025-12-05T10:30:00Z');
    expect(result).toMatch(/5.*dic.*2025/i);
  });

  it('should return "Sin fecha" for null', () => {
    expect(formatDate(null)).toBe('Sin fecha');
  });

  it('should return "Sin fecha" for empty string', () => {
    expect(formatDate('')).toBe('Sin fecha');
  });

  it('should handle different date formats', () => {
    const result = formatDate('2025-01-15T00:00:00Z');
    expect(result).toMatch(/15.*ene.*2025/i);
  });
});

describe('formatTime', () => {
  it('should format time correctly', () => {
    const result = formatTime('2025-12-05T10:30:00Z');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('should return empty string for null', () => {
    expect(formatTime(null)).toBe('');
  });

  it('should return empty string for empty string', () => {
    expect(formatTime('')).toBe('');
  });

  it('should format time with leading zeros', () => {
    const result = formatTime('2025-12-05T09:05:00Z');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatDateTime', () => {
  it('should format date and time together', () => {
    const result = formatDateTime('2025-12-05T10:30:00Z');
    expect(result).toMatch(/5.*dic.*2025.*\d{2}:\d{2}/i);
  });

  it('should return "Sin fecha" for null', () => {
    expect(formatDateTime(null)).toBe('Sin fecha');
  });

  it('should include both date and time components', () => {
    const result = formatDateTime('2025-01-15T14:45:00Z');
    expect(result).toContain('ene');
    expect(result).toContain('2025');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});
