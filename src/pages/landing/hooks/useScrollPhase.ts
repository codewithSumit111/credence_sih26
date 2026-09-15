import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

export interface ScrollPhase {
  scrollYProgress: MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useScrollPhase(): ScrollPhase {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  return { scrollYProgress, containerRef };
}

export function useRangeTransform(
  value: MotionValue<number>,
  inputRange: [number, number],
  outputRange: [number, number]
): MotionValue<number> {
  return useTransform(value, inputRange, outputRange);
}
