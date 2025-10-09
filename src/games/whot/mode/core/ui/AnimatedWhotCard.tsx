import React from 'react';
import { Group, Skia } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { WhotCardFace } from './WhotCardFace'; 
import { WhotCardBack } from './WhotCardBack'; 
import { useWhotFonts } from './useWhotFonts';
import type { AnimatedCard } from './WhotCardTypes';

interface AnimatedWhotCardProps {
    card: AnimatedCard;
}

export const AnimatedWhotCard = ({ card }: AnimatedWhotCardProps) => {
    const { x, y, rotate, suit, number, width, height } = card; 
    const { font, whotFont } = useWhotFonts();

    const transform = useDerivedValue(() => {
        return [{ translateX: x.value }, { translateY: y.value }];
    }, [x, y]);

    const animationTransform = useDerivedValue(() => {
        const matrix = Skia.Matrix();
        matrix.translate(width / 2, height / 2);
        matrix.rotate(rotate.value * Math.PI, 0, 1, 0); // Rotate around Y-axis
        matrix.translate(-width / 2, -height / 2);
        return matrix;
    }, [rotate, width, height]);

    const faceCorrectionMatrix = Skia.Matrix();
    faceCorrectionMatrix.translate(width / 2, height / 2);
    faceCorrectionMatrix.rotate(Math.PI, 0, 1, 0); // Pre-rotate the face 180 degrees
    faceCorrectionMatrix.translate(-width / 2, -height / 2);

    const backOpacity = useDerivedValue(() => (rotate.value < 0.5 ? 1 : 0), [rotate]);
    const frontOpacity = useDerivedValue(() => (rotate.value >= 0.5 ? 1 : 0), [rotate]);

    return (
        <Group transform={transform}>
            <Group matrix={animationTransform}>
                <Group opacity={backOpacity}>
                    <WhotCardBack width={width} height={height} />
                </Group>
                <Group opacity={frontOpacity} matrix={faceCorrectionMatrix}>
                    <WhotCardFace
                        suit={suit}
                        number={number}
                        width={width}
                        height={height}
                        font={font}
                        whotFont={whotFont}
                    />
                </Group>
            </Group>
        </Group>
    );
};