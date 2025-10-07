// games/whot/core/animationUtils.ts
import { 
    useSharedValue, 
    withTiming, 
    runOnJS, 
    SharedValue 
} from 'react-native-reanimated';

// Define placeholder types if they aren't available
export type Card = { id: string; suit: string; rank: string };
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

/**
 * Utility function to initialize an array of Cards with Reanimated SharedValues.
 * NOTE: This is NOT a React Hook. It is called only once to initialize state.
 */
export const initializeAnimatedCardsData = (
    deck: Card[], 
    marketPos: { x: number, y: number }
): AnimatedCard[] => {
    return deck.map(card => ({
        ...card,
        x: useSharedValue(marketPos.x), // useSharedValue call is safe here as it's within a function 
        y: useSharedValue(marketPos.y), // called by useState initializer/useEffect
        rotate: useSharedValue(0),
        isFaceUp: useSharedValue(false),
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
    }));
};

/**
 * Animates a card's position.
 */
export const animateCardMove = (
    card: AnimatedCard, 
    newX: number, 
    newY: number, 
    delay: number, 
    callback?: () => void
) => {
    // Basic implementation for demonstration
    setTimeout(() => {
        card.x.value = withTiming(newX);
        card.y.value = withTiming(newY, {}, (isFinished) => {
            if (isFinished && callback) {
                runOnJS(callback)();
            }
        });
    }, delay);
};

/**
 * Animates a card flip (rotate and face up status).
 */
export const animateCardFlip = (
    card: AnimatedCard, 
    faceUp: boolean, 
    callback?: () => void
) => {
    // Example flip logic: rotate 180 degrees
    card.rotate.value = withTiming(card.rotate.value + 180, {}, (isFinished) => {
        if (isFinished) {
            runOnJS(() => {
                card.isFaceUp.value = faceUp;
                if (callback) callback();
            })();
        }
    });
};