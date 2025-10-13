// AnimatedCardList.tsx

import React, { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { WithTimingConfig } from 'react-native-reanimated';
import { getCoords } from '../coordinateHelper';
import { Card } from '../types'; // Correct import
import IndividualAnimatedCard, { IndividualCardHandle } from './IndividualAnimatedCard';

export interface AnimatedCardListHandle {
    dealCard: (
        card: Card,
        target: 'player' | 'computer' | 'pile',
        options: { cardIndex: number; handSize: number },
        shouldFlip: boolean
    ) => Promise<void>;
    flipCard: (
        card: Card,
        isFaceUp: boolean
    ) => Promise<void>;
}

interface AnimatedCardListProps {
    cardsInPlay: Card[];
    marketPos: { x: number; y: number };
    onCardPress: (card: Card) => void;
}

const AnimatedCardList = forwardRef<AnimatedCardListHandle, AnimatedCardListProps>(
    ({ cardsInPlay, marketPos, onCardPress }, ref) => {
        const cardRefs = useRef<{ [key: string]: IndividualCardHandle | null }>({});
        
        const dealCard = useCallback(
            async (cardToDeal: Card, target: 'player' | 'computer' | 'pile', options: { cardIndex: number; handSize: number }, shouldFlip: boolean) => {
                const cardRef = cardRefs.current[cardToDeal.id];
                if (!cardRef) {
                    console.error('Card ref not found:', cardToDeal.id);
                    return;
                }
                
                const targetCoords = getCoords(target, options);
                const moveConfig: WithTimingConfig = { duration: 400 };
                const flipConfig: WithTimingConfig = { duration: 400 };

                const movePromise = cardRef.moveCard(targetCoords.x, targetCoords.y, moveConfig);
                const flipPromise = shouldFlip
                    ? cardRef.flipCard(true, flipConfig)
                    : Promise.resolve();

                await Promise.all([movePromise, flipPromise]);
            },
            []
        );
        
        const flipCard = useCallback(
            async (cardToFlip: Card, isFaceUp: boolean) => {
                const cardRef = cardRefs.current[cardToFlip.id];
                if (!cardRef) {
                    console.error('Card ref not found for flipping:', cardToFlip.id);
                    return;
                }
                const flipConfig: WithTimingConfig = { duration: 400 };
                await cardRef.flipCard(isFaceUp, flipConfig);
            },
            []
        );
        
        AnimatedCardList.displayName = 'AnimatedCardList';

        useImperativeHandle(ref, () => ({
            dealCard,
            flipCard,
        }));
        
        return (
            <>
                {cardsInPlay.map((card, i) => (
                    <IndividualAnimatedCard
                        key={card.id}
                        card={card}
                        index={i}
                        ref={(el) => { cardRefs.current[card.id] = el; }}
                        initialPosition={marketPos}
                        onPress={onCardPress}
                    />
                ))}
            </>
        );
    }
);

export default AnimatedCardList;