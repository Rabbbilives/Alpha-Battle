import React, { useImperativeHandle, forwardRef } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

interface SeedProps {
  initialX: number;
  initialY: number;
  size?: number;
}

export interface SeedRef {
  moveTo: (x: number, y: number, delay: number) => void;
  captureTo: (x: number, y: number) => void;
}

const Seed = forwardRef<SeedRef, SeedProps>(({ initialX, initialY, size = 14 }, ref) => {
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: '#4CAF50',
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  useImperativeHandle(ref, () => ({
    moveTo: (newX: number, newY: number, delay: number) => {
      x.value = withDelay(delay, withTiming(newX, { duration: 250 }));
      y.value = withDelay(delay, withTiming(newY, { duration: 250 }));
    },
    captureTo: (targetX: number, targetY: number) => {
      x.value = withTiming(targetX, { duration: 400 });
      y.value = withTiming(targetY, { duration: 400 });
      scale.value = withTiming(0, { duration: 400 });
      opacity.value = withTiming(0, { duration: 400 });
    },
  }));

  return <Animated.View style={style} />;
});

export default Seed;
