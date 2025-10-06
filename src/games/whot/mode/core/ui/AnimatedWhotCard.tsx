import React from 'react';
import { Group } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { Skia } from '@shopify/react-native-skia';
import { WhotCard } from './whotcard';
import type { AnimatedCard } from './WhotCardTypes';

interface AnimatedWhotCardProps {
  card: AnimatedCard;
  width: number;
  height: number;
}

export const AnimatedWhotCard = ({ card, width, height }: AnimatedWhotCardProps) => {
  const { x, y, isFaceUp } = card;

  // Use a spring for the flip animation to make it bouncy
  const flipAnimation = useSharedValue(isFaceUp.value ? 1 : 0);

  // This derived value creates the 3D rotation for the flip effect
  const transform = useDerivedValue(() => {
    const matrix = Skia.Matrix();
    matrix.translate(width / 2, height / 2);
    matrix.rotate(flipAnimation.value * Math.PI);
    matrix.translate(-width / 2, -height / 2);
    return matrix;
  }, [flipAnimation]);

  const origin = { x: width / 2, y: height / 2 };

  return (
    <Group transform={[{ translateX: x.value }, { translateY: y.value }]} origin={origin}>
      <Group matrix={transform} origin={origin}>
        {isFaceUp.value ? (
          <WhotCard
            card={card}
            width={width}
            height={height}
          />
        ) : (
          <WhotCard
            card={card}
            width={width}
            height={height}
          />
        )}
      </Group>
    </Group>
  );
};

