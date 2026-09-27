import { useEffect } from 'react'
import { m, useMotionValue, useTransform, animate } from 'framer-motion'

export const AnimatedCounter = ({ value, duration = 1.2 }: { value: string | number, duration?: number }) => {
  const isNumber = typeof value === 'number';
  const match = !isNumber && typeof value === 'string' ? value.match(/^(\d+)(.*)$/) : null;
  
  const targetNum = isNumber ? value as number : (match ? parseInt(match[1], 10) : null);
  const suffix = match ? match[2] : (isNumber ? '' : value);

  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => {
    if (targetNum === null) return String(value);
    return `${Math.round(latest)}${suffix}`;
  });

  useEffect(() => {
    if (targetNum !== null) {
      count.set(0);
      const controls = animate(count, targetNum, { duration, ease: "easeOut" });
      return controls.stop;
    }
  }, [targetNum, duration, count]);

  if (targetNum === null) return <>{value}</>;
  return <m.span>{display}</m.span>;
}
