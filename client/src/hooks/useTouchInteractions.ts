/**
 * Hook para otimizar interações de toque em dispositivos móveis
 * Detecta swipes, long press, e outros gestos
 */

import { useRef, useCallback, useState } from "react";

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

interface SwipeOptions {
  minDistance?: number;
  maxDuration?: number;
}

interface UseTouchInteractionsReturn {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  swipeDirection: "left" | "right" | "up" | "down" | null;
  isLongPress: boolean;
}

export function useTouchInteractions(
  onSwipe?: (direction: "left" | "right" | "up" | "down") => void,
  onLongPress?: () => void,
  options: SwipeOptions = {}
): UseTouchInteractionsReturn {
  const { minDistance = 50, maxDuration = 300 } = options;

  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchEndRef = useRef<TouchPoint | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | "up" | "down" | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setIsLongPress(false);

    // Set long press timeout
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      onLongPress?.();
    }, 500);
  }, [onLongPress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Clear long press timeout
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }

    const touch = e.changedTouches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    if (!touchStartRef.current || !touchEndRef.current) return;

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const duration = touchEndRef.current.time - touchStartRef.current.time;

    // Check if it's a swipe (not a long press)
    if (duration < maxDuration && !isLongPress) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > minDistance) {
        // Determine direction
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

        if (isHorizontal) {
          const direction = deltaX > 0 ? "right" : "left";
          setSwipeDirection(direction as "left" | "right");
          onSwipe?.(direction as "left" | "right");
        } else {
          const direction = deltaY > 0 ? "down" : "up";
          setSwipeDirection(direction as "up" | "down");
          onSwipe?.(direction as "up" | "down");
        }

        // Reset after animation
        setTimeout(() => setSwipeDirection(null), 300);
      }
    }
  }, [minDistance, maxDuration, isLongPress, onSwipe]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Can be used for drag operations
    // Prevent default scrolling if needed
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
    swipeDirection,
    isLongPress,
  };
}
