import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, Dimensions, Text, Button, ScrollView } from "react-native";
import { Canvas, Rect } from "@shopify/react-native-skia";
import { 
    withTiming, 
    runOnJS 
} from 'react-native-reanimated';

// ⚠️ Adjust this import path if needed based on your file structure
import AnimatedCardList, { AnimatedCardListHandle, Card } from "../core/ui/AnimatedCardList";
import ComputerUI, { levels } from "./whortComputerUI"; 

// --- Core Game Types and Helpers ---
// EXPORTING Card type so AnimatedCardList can import it
export type Card = { id: string; suit: string; rank: string; number?: string }; 
type GameState = { players: { name: string, hand: Card[] }[]; pile: Card[]; market: Card[]; currentPlayer: number };

const CARD_WIDTH = 70;
const CARD_HEIGHT = 100;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock Game Initialization
const initGame = (players: string[], handSize: number, rule: string): GameState => {
    const allCards: Card[] = [];
    for (let i = 1; i <= 25; i++) {
        // Ensure initial cards for players and pile are created first (c-1 to c-13)
        allCards.push({ id: `c-${i}`, suit: i % 2 === 0 ? 'Star' : 'Whot', rank: String(i), number: String(i) });
    }
    return {
        players: [
            // Player 0 gets 6 cards (c-1 to c-6)
            { name: players[0], hand: allCards.slice(0, 6) }, 
            // Player 1 (Computer) gets 6 cards (c-7 to c-12)
            { name: players[1], hand: allCards.slice(6, 12) }, 
        ],
        // Pile gets 1 card (c-13)
        pile: allCards.slice(12, 13),
        // Market gets the rest (c-14 to c-25)
        market: allCards.slice(13),
        currentPlayer: 0, // Player 0 starts
    };
};

const useWhotFonts = () => ({ font: null, whotFont: null, areLoaded: true });

// Coordinate Calculator
// EXPORTING getCoords so AnimatedCardList can import it
export const getCoords = (location: 'market' | 'player' | 'computer' | 'pile', index: number = 0) => {
    const MARKET_X = SCREEN_WIDTH / 2 - CARD_WIDTH / 2;
    const MARKET_Y = SCREEN_HEIGHT / 2 - CARD_HEIGHT / 2;
    
    // Total width of a 6-card hand, used for centering
    const HAND_GAP = 10;
    const MAX_CARDS_IN_HAND = 6;
    const HAND_WIDTH = MAX_CARDS_IN_HAND * CARD_WIDTH + (MAX_CARDS_IN_HAND - 1) * HAND_GAP;
    
    // Base position for deck/pile (Center of the card)
    const deckCenter = { x: MARKET_X + CARD_WIDTH / 2, y: MARKET_Y + CARD_HEIGHT / 2 };

    switch (location) {
        case 'market': 
            // Apply a small offset based on index for a stacked deck look
            const offset = index * 0.5; 
            return { x: deckCenter.x + offset, y: deckCenter.y + offset };
        
        case 'pile': 
            // Fixed position next to the market
            return { x: MARKET_X + CARD_WIDTH + HAND_GAP + CARD_WIDTH / 2, y: deckCenter.y };
        
        case 'player': 
            // Calculate the starting point to center the hands
            const playerStartX = SCREEN_WIDTH / 2 - HAND_WIDTH / 2;
            const playerX = playerStartX + index * (CARD_WIDTH + HAND_GAP) + CARD_WIDTH / 2;
            return { x: playerX, y: SCREEN_HEIGHT - 50 }; 
            
        case 'computer': 
            // Calculate the starting point to center the hands
            const computerStartX = SCREEN_WIDTH / 2 - HAND_WIDTH / 2;
            const computerX = computerStartX + index * (CARD_WIDTH + HAND_GAP) + CARD_WIDTH / 2;
            return { x: computerX, y: 50 };
            
        default: return deckCenter;
    }
};

// --- Main Component ---
const WhotComputerGameScreen = () => {
    const { areLoaded } = useWhotFonts();
    
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [game, setGame] = useState<GameState | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Cards array containing ALL cards in the game (used to populate AnimatedCardList)
    const [initialDeckData, setInitialDeckData] = useState<Card[]>([]);
    
    // ⚠️ NEW STATE: Flag to ensure AnimatedCardList has rendered its individual card components
    const [cardsReady, setCardsReady] = useState(false); 
    
    // Ref for calling the AnimatedCardList imperative functions
    const cardListRef = useRef<AnimatedCardListHandle>(null);

    // Determine the market position once
    const marketPosition = useMemo(() => getCoords('market'), []);

    // Function called when a level is selected
    const initializeGame = useCallback((lvl: string) => {
        const newGame = initGame(["Player", "Computer"], 6, "rule2");
        
        // Combine ALL cards (Player, Computer, Pile, Market)
        const allGameCards: Card[] = [
            ...newGame.players[0].hand, 
            ...newGame.players[1].hand, 
            ...newGame.pile, 
            ...newGame.market
        ].filter((card, index, self) => index === self.findIndex((c) => c.id === card.id)); 

        // Set the list of ALL cards that AnimatedCardList should render
        setInitialDeckData(allGameCards);
        
        // Set the game state and animation flag
        setGame(newGame); 
        setSelectedLevel(lvl);
        setIsAnimating(true); // Start blocking UI while dealing
    }, []); 

    // 1. Wait for `initialDeckData` and `game` to be set, then delay for component mounting
    useEffect(() => {
        if (initialDeckData.length > 0 && game) {
             // Delay to ensure AnimatedCardList and all child refs are assigned.
             const timer = setTimeout(() => {
                 setCardsReady(true);
             }, 50); 
             
             return () => clearTimeout(timer);
        }
    }, [initialDeckData.length, game]);

    // 2. Start the deal sequence only when `cardsReady` is true
    useEffect(() => {
        // We use `game && game.players` to satisfy TypeScript that game is not null
        if (cardsReady && cardListRef.current && game && game.players.length > 0) {
            const dealer = cardListRef.current;
            const dealSequentially = async () => {
                console.log("Starting deal sequence...");
                
                // Deal 5 cards each, one by one, alternating player and computer
                for (let i = 0; i < 5; i++) {
                    // 1. Deal to Player (Face Up)
                    const playerCard = game!.players[0].hand[i];
                    await dealer.dealCard(playerCard, 'player', i, true);
                    
                    // 2. Deal to Computer (Face Down)
                    const computerCard = game!.players[1].hand[i];
                    await dealer.dealCard(computerCard, 'computer', i, false); 
                }
                
                // Deal the 6th card to the Player and Computer
                await dealer.dealCard(game!.players[0].hand[5], 'player', 5, true);
                await dealer.dealCard(game!.players[1].hand[5], 'computer', 5, false);

                // 3. Deal the first card to the Pile (Face Up)
                const pileCard = game!.pile[0];
                await dealer.dealCard(pileCard, 'pile', 0, true);
                
                // The remaining cards (market) stay in the 'market' position (default)
                
                console.log("Deal sequence complete.");
                setIsAnimating(false); // Enable controls
            };

            dealSequentially();
            
            // Reset the flag to prevent re-running if the game state changes later
            setCardsReady(false);
        }
    }, [cardsReady]); 

    // --- Render Logic ---

    // 1. Initial State: Level Selection
    if (!selectedLevel) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.title}>Select Computer Level</Text>
                <ScrollView style={styles.levelSelector}>
                    {levels.map((level) => (
                        <View key={level.value} style={styles.levelButtonContainer}>
                            <Button 
                                title={`${level.label}`} 
                                onPress={() => initializeGame(level.label)} 
                                color="#1E5E4E"
                            />
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }
    
    // 2. Game State: Canvas, Cards, and UI
    return (
        <View style={styles.container}>
            {/* Background Skia Canvas */}
            <Canvas style={StyleSheet.absoluteFillObject}>
                <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} color="#1E5E4E" />
            </Canvas>

            {/* Animated Cards Layer */}
            {initialDeckData.length > 0 && (
                <AnimatedCardList 
                    ref={cardListRef} 
                    initialDeckData={initialDeckData} 
                    marketPos={marketPosition} 
                />
            )}

            {/* Computer UI Display (Top of screen) */}
            <View style={styles.computerUI}>
                <ComputerUI 
                    state={game} 
                    playerIndex={1} 
                    level={levels.find(l => l.label === selectedLevel)?.value || 1} 
                    onStateChange={setGame} 
                />
            </View>

            {/* Overlay for player controls (Bottom of screen) */}
            <View style={styles.controlsOverlay}>
                <Text style={styles.playerHandText}>Your Hand ({game?.players[0].hand.length ?? 0} cards)</Text>
                {/* Block user interaction while dealing */}
                {isAnimating && <View style={styles.blocker}><Text style={{color: 'white'}}>Dealing...</Text></View>}
            </View>
        </View>
    );
};

export default WhotComputerGameScreen;

// --- STYLES (Unchanged) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
    },
    title: {
        fontSize: 24,
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    centerContent: { 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    levelSelector: { 
        width: '90%',
        maxHeight: '70%',
    },
    levelButtonContainer: { 
        marginBottom: 15,
        alignItems: 'center',
    },
    levelReward: { 
        color: '#FFD700',
        fontSize: 14,
        marginTop: 5,
    },
    computerUI: {
        position: 'absolute',
        top: 20,
        width: '100%',
        alignItems: 'center',
        zIndex: 5,
    },
    controlsOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        zIndex: 10, 
    },
    playerHandText: {
        color: 'white',
        fontSize: 16,
        marginBottom: 10,
    },
    blocker: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20, 
    }
});