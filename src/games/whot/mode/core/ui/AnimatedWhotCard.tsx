// games/whot/core/ui/AnimatedWhotCard.tsx
import React from 'react';
import { Group, Skia, useDerivedValue } from '@shopify/react-native-skia';
import { WhotCardFace } from './WhotCardFace'; 
import { WhotCardBack } from './WhotCardBack'; 
import { useWhotFonts } from './useWhotFonts';
import type { AnimatedCard } from './WhotCardTypes';

interface AnimatedWhotCardProps {
    card: AnimatedCard;
    isAnimating?: boolean; // Prop no longer strictly needed but kept for context
}

export const AnimatedWhotCard = ({ card }: AnimatedWhotCardProps) => {
    const { x, y, isFaceUp, rotate, suit, number, width, height } = card; 
    const { font, whotFont } = useWhotFonts();

    // Use derived value for 3D rotation matrix
    const transform = useDerivedValue(() => {
        const matrix = Skia.Matrix();
        // Translate to the center of the card, rotate, then translate back
        matrix.translate(width / 2, height / 2);
        // Rotate around the Y-axis. rotate.value is 0 to 1 (0 to 180 degrees)
        matrix.rotate(rotate.value * Math.PI, 0, 1, 0); 
        matrix.translate(-width / 2, -height / 2);
        return matrix;
    }, [rotate, width, height]);

    const origin = { x: width / 2, y: height / 2 };

    if (!font || !whotFont) return null; // Wait for fonts

    return (
        // Group for position animation (translateX, translateY)
        <Group
            transform={[{ translateX: x.value }, { translateY: y.value }]}
            origin={origin}
        >
            {/* Group for flip animation (3D matrix) */}
            <Group matrix={transform} origin={origin}>
                {isFaceUp.value ? (
                    <WhotCardFace
                        suit={suit}
                        number={number}
                        width={width}
                        height={height}
                        font={font}
                        whotFont={whotFont}
                    />
                ) : (
                    <WhotCardBack
                        width={width}
                        height={height}
                    />
                )}
            </Group>
        </Group>
    );
};