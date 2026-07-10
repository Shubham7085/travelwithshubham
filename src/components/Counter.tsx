import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';

interface CounterProps {
  value: number;
  duration?: number; // in seconds
  suffix?: string;
  prefix?: string;
}

export default function Counter({ value, duration = 1.5, suffix = '', prefix = '' }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration * 1000;
    const intervalTime = 30; // ~33 fps
    const totalSteps = totalMiliseconds / intervalTime;
    const increment = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className="font-display font-extrabold text-white tracking-tight">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
