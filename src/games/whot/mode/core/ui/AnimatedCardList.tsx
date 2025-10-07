import React, { forwardRef, useImperativeHandle, useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    WithTimingConfig,
    runOnJS,
    SharedValue,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import { getCoords, Card } from "../../computer/WhotComputerGameScreen" // Assuming helpers are imported

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = 70;
const CARD_HEIGHT = 100;

// --- TYPES ---
export type AnimatedCard = Card & {
    initialIndex: number; // Used for Z-index/overlap ordering
};

export interface IndividualCardHandle {
    moveCard: (newX: number, newY: number, config: WithTimingConfig) => Promise<void>;
    flipCard: (faceUp: boolean, config: WithTimingConfig) => Promise<void>;
}

export interface AnimatedCardListHandle {
    dealCard: (card: Card, target: 'player' | 'computer' | 'pile', cardIndexInHand: number, isFaceUp: boolean) => Promise<void>;
}

interface AnimatedCardListProps {
    initialDeckData: Card[];
    marketPos: { x: number; y: number };
}

const IndividualAnimatedCard = React.memo(
    forwardRef<IndividualCardHandle, { card: AnimatedCard; initialPosition: { x: number; y: number } }>(
        ({ card, initialPosition }, ref) => {
            const x = useSharedValue(initialPosition.x);
            const y = useSharedValue(initialPosition.y);
            const rotationZ = useSharedValue(0); // 0 = back, 180 = front

            useImperativeHandle(ref, () => ({
                moveCard: (newX, newY, config) => {
                    return new Promise(resolve => {
                        x.value = withTiming(newX, config);
                        y.value = withTiming(newY, config, (finished) => {
                            if (finished) {
                                runOnJS(resolve)();
                            }
                        });
                    });
                },
                flipCard: (faceUp, config) => {
                    return new Promise(resolve => {
                        rotationZ.value = withTiming(faceUp ? 180 : 0, config, (finished) => {
                            if (finished) {
                                runOnJS(resolve)();
                            }
                        });
                    });
                },
            }));

            const animatedStyle = useAnimatedStyle(() => {
                return {
                    transform: [
                        { translateX: x.value - CARD_WIDTH / 2 },
                        { translateY: y.value - CARD_HEIGHT / 2 },
                        { rotateZ: `${rotationZ.value}deg` },
                    ],
                    transformOrigin: 'center',
                };
            });

            const frontCardStyle = useAnimatedStyle(() => {
                const rotateY = interpolate(
                    rotationZ.value,
                    [0, 90, 180],
                    [0, 90, 180],
                    Extrapolation.CLAMP
                );
                return {
                    transform: [{ rotateY: `${rotateY}deg` }],
                    backfaceVisibility: 'hidden',
                };
            });

            const backCardStyle = useAnimatedStyle(() => {
                const rotateY = interpolate(
                    rotationZ.value,
                    [0, 90, 180],
                    [180, 270, 360],
                    Extrapolation.CLAMP
                );
                return {
                    transform: [{ rotateY: `${rotateY}deg` }],
                    backfaceVisibility: 'hidden',
                };
            });

            const isActuallyFaceUp = rotationZ.value === 180;

            return (
                <Animated.View style={[styles.cardContainer, animatedStyle, { zIndex: card.initialIndex }]}>
                    <Animated.View style={[styles.cardFace, backCardStyle, styles.cardBack]}>
                        <Text style={styles.cardBackText}>WHOT</Text>
                    </Animated.View>

                    <Animated.View style={[styles.cardFace, frontCardStyle, styles.cardFront]}>
                        {isActuallyFaceUp && (
                            <Text style={styles.cardFrontText}>
                                {card.rank}{card.suit}
                            </Text>
                        )}
                    </Animated.View>
                </Animated.View>
            );
        }
    )
);

IndividualAnimatedCard.displayName = 'IndividualAnimatedCard';

const AnimatedCardList = forwardRef<AnimatedCardListHandle, AnimatedCardListProps>(
    ({ initialDeckData, marketPos }, ref) => {
        const cardRefs = useRef<{ [key: string]: IndividualCardHandle | null }>({});
        const [cardsInPlay, setCardsInPlay] = useState<AnimatedCard[]>([]);

        useEffect(() => {
            const newCardsInPlay: AnimatedCard[] = initialDeckData.map((card, index) => ({
                ...card,
                initialIndex: index,
            }));
            setCardsInPlay(newCardsInPlay);
        }, [initialDeckData]);

        const dealCard = useCallback(
            async (cardToDeal: Card, target: 'player' | 'computer' | 'pile', cardIndexInHand: number, shouldFlip: boolean): Promise<void> => {
                const cardRef = cardRefs.current[cardToDeal.id];
                if (!cardRef) {
                    console.error("Card ref not found for animation:", cardToDeal.id);
                    return;
                }

                const targetCoords = getCoords(target);
                const moveTimingConfig: WithTimingConfig = { duration: 400 };
                const flipTimingConfig: WithTimingConfig = { duration: 250 };

                await cardRef.moveCard(targetCoords.x, targetCoords.y, moveTimingConfig);
                if (shouldFlip) {
                    await cardRef.flipCard(true, flipTimingConfig);
                }
            },
            []
        );

        useImperativeHandle(ref, () => ({
            dealCard,
        }), [dealCard]);

        return (
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                {cardsInPlay.map(card => (
                    <IndividualAnimatedCard
                        key={card.id}
                        card={card}
                        ref={el => { cardRefs.current[card.id] = el; }}
                        initialPosition={getCoords('market')}
                    />
                ))}
            </View>
        );
    }
);

AnimatedCardList.displayName = 'AnimatedCardList';

export default AnimatedCardList;

// --- STYLES ---
const styles = StyleSheet.create({
    cardContainer: {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 5,
        backgroundColor: 'transparent',
    },
    cardFace: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute', // Important for the flip effect to layer them
    },
    cardBack: {
        backgroundColor: '#1C3144', // Dark Blue/Pattern
        borderColor: '#FFD700',
        borderWidth: 2,
    },
    cardBackText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 20,
    },
    cardFront: {
        backgroundColor: '#FFF',
        borderColor: '#333',
        borderWidth: 1,
    },
    cardFrontText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    }
});