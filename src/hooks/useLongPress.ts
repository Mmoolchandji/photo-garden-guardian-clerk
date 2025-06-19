import { useEffect, useRef, useCallback } from 'react';

// Add movement threshold (in pixels) to distinguish scroll vs tap/hold
const MOVE_THRESHOLD = 10;

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
  shouldPreventDefault?: boolean;
}

export const useLongPress = ({
  onLongPress,
  onClick,
  delay = 500,
  shouldPreventDefault = true
}: UseLongPressOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isLongPressRef = useRef(false);
  const movedRef = useRef(false);
  const startTouchXY = useRef<{x: number, y: number} | null>(null);

  // Handle touch start
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    movedRef.current = false;
    const touch = e.touches[0];
    startTouchXY.current = { x: touch.clientX, y: touch.clientY };
    isLongPressRef.current = false;
    timeoutRef.current = setTimeout(() => {
      // Only trigger long press if the touch hasn't moved significantly
      // (onTouchMove clears the timeout if moved)
      isLongPressRef.current = true;
      onLongPress();
    }, delay);

    // Removed e.preventDefault() from here to avoid issues with passive listeners.
    // Context menu prevention for desktop is handled by onContextMenu.
    // For mobile, if context menu on long tap is an issue, CSS or specific prevention in onLongPress might be needed.
  }, [delay, onLongPress]);

  // Track finger movement (for scroll)
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startTouchXY.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startTouchXY.current.x;
    const dy = touch.clientY - startTouchXY.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
      movedRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      isLongPressRef.current = false;
    }
  }, []);

  // End/cancel on touch end/cancel
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // If it was a tap (not a long press and not a move)
    if (!isLongPressRef.current && !movedRef.current && onClick) {
      onClick();
      // Prevent "ghost click" or other default browser actions that might follow touchend
      // This is important if the earlier preventDefault in onTouchStart was removed or ineffective
      if (e.cancelable) {
        e.preventDefault();
      }
    }
    
    isLongPressRef.current = false;
    movedRef.current = false;
    startTouchXY.current = null;
  }, [onClick]);

  const onTouchCancel = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isLongPressRef.current = false;
    movedRef.current = false;
    startTouchXY.current = null;
  }, []);

  // Mouse handlers remain the same (for desktop), but don't interact with touch logic
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isLongPressRef.current = false;
    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, delay);
    // Desktop context menu handled by onContextMenu
  }, [delay, onLongPress]);

  const onMouseUp = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isLongPressRef.current && onClick) onClick();
    isLongPressRef.current = false;
  }, [onClick]);

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isLongPressRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    ...(shouldPreventDefault && {
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    }),
    // To ensure scroll/tap works well, add "touch-action: manipulation" in consumer's style ideally
  };
};
