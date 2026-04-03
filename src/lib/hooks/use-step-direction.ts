import { useState, useRef, useCallback } from "react";

export type Direction = 1 | 0 | -1;

export function useStepDirection<T>(
  order: T[] | readonly T[],
  initialValue: T,
) {
  const [value, setValue] = useState<T>(initialValue);
  const [direction, setDirection] = useState<Direction>(0);
  const prevValueRef = useRef<T>(initialValue);

  const goTo = useCallback(
    (newValue: T) => {
      if (newValue === prevValueRef.current) return;
      const prevIdx = order.indexOf(prevValueRef.current);
      const nextIdx = order.indexOf(newValue);
      if (prevIdx !== -1 && nextIdx !== -1) {
        setDirection(nextIdx > prevIdx ? 1 : -1);
      }
      prevValueRef.current = newValue;
      console.log(newValue);

      setValue(newValue);
    },
    [order],
  );

  return { value, direction, goTo };
}