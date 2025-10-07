import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { Card } from '../../core/types';

export type AnimatedCard = Card & {
    x: SharedValue<number>;
    y: SharedValue<number>;
    rotate: SharedValue<number>;
    isFaceUp: SharedValue<boolean>;
    width: number;
    height: number;
};

export const CARD_WIDTH = 70;
export const CARD_HEIGHT = 100;

export const useAnimatedCard = (initialCard: Card, initialX: number, initialY: number): AnimatedCard => {
    const x = useSharedValue(initialX);
    const y = useSharedValue(initialY);
    const rotate = useSharedValue(0);
    const isFaceUp = useSharedValue(false);

    return {
        ...initialCard,
        x,
        y,
        rotate,
        isFaceUp,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
    };
};