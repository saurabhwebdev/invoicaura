import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  easing?: 'linear' | 'easeOut' | 'easeInOut';
}

// Easing functions
const easings = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
};

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 800, 
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  easing = 'easeOut',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);
  const animationRef = useRef<number>();
  
  // Format the number with commas for thousands separators
  const formatNumber = (num: number): string => {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  useEffect(() => {
    // When the value changes, start from the last displayed value
    previousValueRef.current = displayValue;
    const startValue = previousValueRef.current;
    const endValue = value;
    const startTime = performance.now();
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Function to animate the number
    const animateValue = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easings[easing](progress);
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateValue);
      }
    };
    
    animationRef.current = requestAnimationFrame(animateValue);
    
    // Cleanup animation on unmount or value change
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, easing]);
  
  return (
    <span className={className}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
};

export default AnimatedNumber;
