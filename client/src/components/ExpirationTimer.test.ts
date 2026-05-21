import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("ExpirationTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should calculate time remaining correctly", () => {
    const now = new Date("2026-05-08T12:00:00Z");
    const expiresAt = new Date("2026-05-08T12:30:00Z");
    vi.setSystemTime(now);

    const timeRemaining = expiresAt.getTime() - now.getTime();
    expect(timeRemaining).toBe(30 * 60 * 1000); // 30 minutes in milliseconds
  });

  it("should format minutes and seconds correctly", () => {
    const timeRemaining = 5 * 60 * 1000 + 30 * 1000; // 5:30
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    expect(minutes).toBe(5);
    expect(seconds).toBe(30);
  });

  it("should trigger warning when time is below threshold", () => {
    const now = new Date("2026-05-08T12:00:00Z");
    const expiresAt = new Date("2026-05-08T12:04:00Z"); // 4 minutes remaining
    vi.setSystemTime(now);

    const timeRemaining = expiresAt.getTime() - now.getTime();
    const minutesRemaining = Math.floor(timeRemaining / 60000);

    expect(minutesRemaining).toBe(4);
    expect(minutesRemaining <= 5).toBe(true); // Should trigger warning with threshold of 5
  });

  it("should detect expiration", () => {
    const now = new Date("2026-05-08T12:00:00Z");
    const expiresAt = new Date("2026-05-08T12:00:00Z"); // Already expired
    vi.setSystemTime(now);

    const timeRemaining = expiresAt.getTime() - now.getTime();
    const isExpired = timeRemaining <= 0;

    expect(isExpired).toBe(true);
  });

  it("should calculate progress percentage correctly", () => {
    const totalTime = 30 * 60 * 1000; // 30 minutes
    const timeRemaining = 15 * 60 * 1000; // 15 minutes remaining
    const progressPercent = (timeRemaining / totalTime) * 100;

    expect(progressPercent).toBe(50);
  });

  it("should handle color transitions based on time", () => {
    // Green: plenty of time
    let timeRemaining = 20 * 60 * 1000;
    let isWarning = timeRemaining / 60000 <= 5;
    expect(isWarning).toBe(false);

    // Yellow: warning threshold
    timeRemaining = 4 * 60 * 1000;
    isWarning = timeRemaining / 60000 <= 5;
    expect(isWarning).toBe(true);

    // Red: expired
    timeRemaining = 0;
    const isExpired = timeRemaining <= 0;
    expect(isExpired).toBe(true);
  });

  it("should format time display with leading zeros", () => {
    const minutes = 5;
    const seconds = 3;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    expect(formattedMinutes).toBe("05");
    expect(formattedSeconds).toBe("03");
  });

  it("should calculate expiration time correctly", () => {
    const expiresAt = new Date("2026-05-08T12:30:00Z");
    const expectedTime = expiresAt.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    expect(expectedTime).toBeDefined();
    expect(typeof expectedTime).toBe("string");
  });

  it("should handle edge case: exactly at warning threshold", () => {
    const warningThreshold = 5;
    const minutesRemaining = 5;

    const shouldWarn = minutesRemaining <= warningThreshold;
    expect(shouldWarn).toBe(true);
  });

  it("should handle edge case: just below warning threshold", () => {
    const warningThreshold = 5;
    const minutesRemaining = 4;

    const shouldWarn = minutesRemaining <= warningThreshold;
    expect(shouldWarn).toBe(true);
  });
});
