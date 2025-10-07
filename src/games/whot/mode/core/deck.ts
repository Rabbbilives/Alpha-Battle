// games/whot/core/deck.ts
import { Card, CardSuit } from "./types";

/**
 * Generate a Whot deck.
 */
export const generateDeck = (ruleVersion: "rule1" | "rule2" = "rule1"): Card[] => {
    const suits: CardSuit[] = ["circle", "triangle", "cross", "square", "star"];
    const deck: Card[] = [];

    // Add normal suits (1-14)
    suits.forEach((suit) => {
        for (let num = 1; num <= 14; num++) {
            deck.push({
                id: `${suit}-${num}`,
                suit,
                number: num,
            });
        }
    });

    if (ruleVersion === "rule1") {
        // Add 5 Whot cards (number 20)
        for (let i = 1; i <= 5; i++) {
            deck.push({
                id: `whot-${i}`,
                suit: "whot",
                number: 20,
            });
        }
    }

    return deck;
};

/**
 * Shuffle deck using Fisher-Yates.
 */
export const shuffleDeck = (deck: Card[]): Card[] => {
    const arr = [...deck];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};