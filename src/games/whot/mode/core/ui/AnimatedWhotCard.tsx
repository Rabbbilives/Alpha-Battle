import React from 'react';
import { Canvas, Group, Skia } from '@shopify/react-native-skia';
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
    const { font, whotFont, areLoaded } = useWhotFonts();

    if (!areLoaded) {
        return null; // Don't render anything until fonts are loaded
    }

    const transform = useDerivedValue(() => {
        return [{ translateX: x.value }, { translateY: y.value }];
    }, [x, y]);

    const animationTransform = useDerivedValue(() => {
        const matrix = Skia.Matrix();
        matrix.translate(width / 2, height / 2);
        matrix.scale(Math.cos(rotate.value), 1);
        matrix.translate(-width / 2, -height / 2);
        return matrix;
    }, [rotate, width, height]);

    const faceCorrectionMatrix = Skia.Matrix();
    faceCorrectionMatrix.translate(width / 2, height / 2);
    faceCorrectionMatrix.scale(-1, 1);
    faceCorrectionMatrix.translate(-width / 2, -height / 2);

    const backOpacity = useDerivedValue(() => {
        return rotate.value <= Math.PI / 2 ? 1 : 0;
    }, [rotate]);

    const frontOpacity = useDerivedValue(() => {
        return rotate.value >= Math.PI / 2 ? 1 : 0;
    }, [rotate]);

    return (
        <Canvas style={{ width, height }}>
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
        </Canvas>
    );
};
