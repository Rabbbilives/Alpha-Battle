// WhotComputerGameScreen.tsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, Dimensions, Text, Button, ScrollView } from "react-native";
import { Canvas, Rect } from "@shopify/react-native-skia";
import { runOnJS } from 'react-native-reanimated';

import AnimatedCardList, { AnimatedCardListHandle } from "../core/ui/AnimatedCardList";
import { Card } from '../core/types';
import { getCoords } from '../core/coordinateHelper';
import { initGame } from '../core/whotLogic';

const levels = [{ label: "Easy", value: 1 }];

// Helper type for clarity
type GameData = ReturnType<typeof initGame>;

const WhotComputerGameScreen = () => {
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [game, setGame] = useState<GameData | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [allCards, setAllCards] = useState<Card[]>([]);
    const [cardsReady, setCardsReady] = useState(false);

    const cardListRef = useRef<AnimatedCardListHandle>(null);
    const marketPosition = useMemo(() => getCoords('market'), []);

    const initializeGame = useCallback((lvl: string) => {
        const gameData = initGame(["Player", "Computer"], 6);
        setAllCards(gameData.allCards);
        setGame(gameData);
        setSelectedLevel(lvl);
        setIsAnimating(true);
    }, []);

    useEffect(() => {
        if (game && allCards.length > 0) {
            const timer = setTimeout(() => setCardsReady(true), 100);
            return () => clearTimeout(timer);
        }
    }, [game, allCards]);

    // ✅ REFACTORED AGAIN: This logic is now simple, sequential, and bug-free.
    useEffect(() => {
        if (!cardsReady || !cardListRef.current || !game) return;

        const dealer = cardListRef.current;

        const dealSequentially = async () => {
            console.log("Starting SEQUENTIAL deal...");
            const handSize = game.gameState.players[0].hand.length;

            // 1. Deal all cards face down to their initial positions
            const flipPromises: Promise<void>[] = [];

            for (let i = 0; i < handSize; i++) {
                const playerCard = game.gameState.players[0].hand[i];
                const computerCard = game.gameState.players[1].hand[i];

                // Deal to Player (face down)
                if (playerCard) {
                    await dealer.dealCard(playerCard, 'player', { cardIndex: i, handSize }, false);
                }

                // Deal to Computer (face down)
                if (computerCard) {
                    await dealer.dealCard(computerCard, 'computer', { cardIndex: i, handSize }, false);
                }
            }

            // 2. Deal the open card to the pile (face down)
            const pileCard = game.gameState.pile[0];
            if (pileCard) {
                await dealer.dealCard(pileCard, 'pile', { cardIndex: 0, handSize: 1 }, false);
            }

            // Add a small delay before flipping all cards
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. Flip all player cards and the pile card simultaneously
            for (let i = 0; i < handSize; i++) {
                const playerCard = game.gameState.players[0].hand[i];
                if (playerCard) {
                    flipPromises.push(dealer.flipCard(playerCard, true));
                }
            }
            if (pileCard) {
                flipPromises.push(dealer.flipCard(pileCard, true));
            }

            await Promise.all(flipPromises);

            console.log("Deal sequence complete.");
            runOnJS(setIsAnimating)(false);
        };

        dealSequentially();
        setCardsReady(false); // Prevent this from running again

    }, [cardsReady, game]);

    if (!selectedLevel) {
        // ... Level selection JSX is unchanged ...
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.title}>Select Computer Level</Text>
                {levels.map((level) => (
                    <View key={level.value} style={styles.levelButtonContainer}>
                        <Button
                            title={`${level.label}`}
                            onPress={() => initializeGame(level.label)}
                            color="#1E5E4E"
                        />
                    </View>
                ))}
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <Canvas style={[StyleSheet.absoluteFillObject, isAnimating && { zIndex: 21 }]}>
                <Rect x={0} y={0} width={Dimensions.get('window').width} height={Dimensions.get('window').height} color="#1E5E4E" />
                {allCards.length > 0 && (
                    <AnimatedCardList
                        ref={cardListRef}
                        cardsInPlay={allCards}
                        marketPos={marketPosition}
                    />
                )}
            </Canvas>

            <View style={styles.controlsOverlay}>
                <Text style={styles.playerHandText}>Your Hand ({game?.gameState.players[0].hand.length ?? 0} cards)</Text>
                {isAnimating && <View style={styles.blocker}><Text style={{ color: 'white' }}>Dealing...</Text></View>}
            </View>
        </View>
    );
};

// ... Styles are unchanged ...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1E5E4E' },
    centerContent: { justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, color: '#FFF', marginBottom: 20, textAlign: 'center' },
    levelButtonContainer: { marginBottom: 15, width: 200 },
    controlsOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 150, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    playerHandText: { color: 'white', fontSize: 16, marginBottom: 10 },
    blocker: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 20 }
});


export default WhotComputerGameScreen;