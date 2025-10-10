// IndividualAnimatedCard.tsx

import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import {
    useSharedValue,
    withTiming,
    WithTimingConfig,
    runOnJS, // To resolve promises from the UI thread
} from 'react-native-reanimated';

import { AnimatedWhotCard } from './AnimatedWhotCard';
import { Card, AnimatedCard, CARD_WIDTH, CARD_HEIGHT } from './WhotCardTypes';

// This handle defines the functions that the parent component can call on this card
export interface IndividualCardHandle {
    moveCard: (
        targetX: number,
        targetY: number,
        config?: WithTimingConfig
    ) => Promise<void>;
    flipCard: (
        isFaceUp: boolean,
        config?: WithTimingConfig
    ) => Promise<void>;
}

interface IndividualAnimatedCardProps {
    card: Card;
    index: number;
    initialPosition: { x: number; y: number };
}

const IndividualAnimatedCard = forwardRef<IndividualCardHandle, IndividualAnimatedCardProps>(
    ({ card, index, initialPosition }, ref) => {
        // --- Animated State ---
        // We subtract half the card's dimensions because getCoords provides the CENTER point,
        // but Skia draws from the TOP-LEFT corner.
        const x = useSharedValue(initialPosition.x - CARD_WIDTH / 2);
        const y = useSharedValue(initialPosition.y - CARD_HEIGHT / 2);
        
        // Rotation state: 0 = face down (0°), 1 = face up (180°)
        const rotate = useSharedValue(0);

        // --- Animation Logic ---

        // Expose control functions to the parent component (AnimatedCardList)
        useImperativeHandle(ref, () => ({
            /**
             * Animates the card's position to a new target.
             * Returns a promise that resolves when the animation is complete.
             */
            moveCard: (targetX, targetY, config = { duration: 300 }) => {
                console.log(`Moving card ${card.id} to (${targetX}, ${targetY})`);
                return new Promise((resolve) => {
                    // Adjust target coordinates from center to top-left for drawing
                    const adjustedX = targetX - CARD_WIDTH / 2;
                    const adjustedY = targetY - CARD_HEIGHT / 2;
                    
                    const onComplete = (finished?: boolean) => {
                        'worklet';
                        if (finished) {
                            runOnJS(resolve)();
                        }
                    };

                    x.value = withTiming(adjustedX, config, onComplete);
                    y.value = withTiming(adjustedY, config); // Only one callback needed
                });
            },

            /**
             * Animates the card's flip rotation.
             * Returns a promise that resolves when the animation is complete.
             */
            flipCard: (isFaceUp, config = { duration: 300 }) => {
                return new Promise((resolve) => {
                    const onComplete = (finished?: boolean) => {
                        'worklet';
                        if (finished) {
                            runOnJS(resolve)();
                        }
                    };
                    
                    rotate.value = withTiming(isFaceUp ? Math.PI : 0, config, onComplete);
                });
            },
        }));

        // --- Render ---

        // Combine the static card data with the dynamic animated values
        const animatedCardData: AnimatedCard = {
            ...card,
            x,
            y,
            rotate,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            initialIndex: index,
        };

        // The AnimatedWhotCard component handles the actual Skia drawing
        return <AnimatedWhotCard card={animatedCardData} />;
    }
);

export default IndividualAnimatedCard;