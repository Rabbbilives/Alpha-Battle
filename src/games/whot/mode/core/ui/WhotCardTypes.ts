// games/whot/core/ui/WhotCardTypes.ts
import type { SharedValue, SkFont } from '@shopify/react-native-skia';

// Define all possible suits
export type CardSuit = "circle" | "triangle" | "cross" | "square" | "star" | "whot";

// Core Card data structure
export interface Card {
    id: string;
    suit: CardSuit;
    number: number;
}

// Animated Card structure used by Skia/Reanimated
export interface AnimatedCard extends Card {
    x: SharedValue<number>;
    y: SharedValue<number>;
    rotate: SharedValue<number>; // 0 to 1 (0 to 180 degrees)
    isFaceUp: SharedValue<boolean>;
    width: number;
    height: number;
}

export interface WhotCardFaceProps {
    suit: CardSuit;
    number: number;
    width: number;
    height: number;
    font: SkFont | null;
    whotFont: SkFont | null;
}

export interface WhotCardBackProps {
    width: number;
    height: number;
}

// Card dimensions used throughout the app
export const CARD_WIDTH = 80;
export const CARD_HEIGHT = 120;