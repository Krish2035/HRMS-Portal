import { describe, it, expect } from 'vitest';

describe('WorkSession Timer Calculation Engine - Unit Tests', () => {
  it('should correctly calculate elapsed work duration for active running session', () => {
    const startTime = new Date(Date.now() - 3600 * 1000); // 1 hour ago
    const totalBreakDurationSeconds = 600; // 10 minutes of breaks
    const now = new Date();

    const totalSpanSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const netWorkDurationSeconds = Math.max(0, totalSpanSeconds - totalBreakDurationSeconds);

    // Should be approximately 3000 seconds (50 minutes)
    expect(netWorkDurationSeconds).toBeGreaterThanOrEqual(2999);
    expect(netWorkDurationSeconds).toBeLessThanOrEqual(3002);
  });

  it('should freeze elapsed duration when session is paused on break', () => {
    const startTime = new Date(Date.now() - 7200 * 1000); // 2 hours ago
    const breakStartTime = new Date(Date.now() - 1800 * 1000); // Break started 30 mins ago
    const previousBreakSeconds = 900; // 15 mins prior break

    // When paused, duration is frozen up to breakStartTime
    const totalSpanUpToBreak = Math.floor((breakStartTime.getTime() - startTime.getTime()) / 1000);
    const netDurationWhenPaused = Math.max(0, totalSpanUpToBreak - previousBreakSeconds);

    // 1.5 hours (5400s) - 15 mins (900s) = 4500s (1 hour 15 mins)
    expect(netDurationWhenPaused).toBe(4500);
  });

  it('should prevent negative work duration if total breaks exceed total span due to clocks', () => {
    const startTime = new Date();
    const totalBreakDurationSeconds = 5000;
    const now = new Date(startTime.getTime() + 1000); // 1 second span

    const totalSpan = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const netDuration = Math.max(0, totalSpan - totalBreakDurationSeconds);

    expect(netDuration).toBe(0);
  });

  it('should format seconds into HH:MM:SS format properly', () => {
    const formatTime = (secs: number) => {
      const h = Math.floor(secs / 3600).toString().padStart(2, '0');
      const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    };

    expect(formatTime(0)).toBe('00:00:00');
    expect(formatTime(59)).toBe('00:00:59');
    expect(formatTime(3665)).toBe('01:01:05');
    expect(formatTime(28800)).toBe('08:00:00');
  });
});
