
import { useEffect, useRef, useCallback } from 'react';

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

  const startPress = useCallback(() => {
    isLongPressRef.current = false;
    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const endPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // If it wasn't a long press and we have an onClick handler, call it
    if (!isLongPressRef.current && onClick) {
      onClick();
    }
    
    isLongPressRef.current = false;
  }, [onClick]);

  const cancelPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    isLongPressRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onTouchStart: startPress,
    onTouchEnd: endPress,
    onTouchCancel: cancelPress,
    onMouseDown: startPress,
    onMouseUp: endPress,
    onMouseLeave: cancelPress,
    ...(shouldPreventDefault && {
      onContextMenu: (e: Event) => e.preventDefault(),
    }),
  };
};
