// whot-core/game.ts
import { Card, GameState, Player } from "./types";
import { generateDeck, shuffleDeck } from "./deck";

// Rule 1 imports
import {
  isValidMove as isValidMoveRule1,
  applyCardEffect as applyCardEffectRule1,
} from "./rules";

// Rule 2 imports
import {
  isValidMoveRule2,
  applyCardEffectRule2,
} from "./rules2";

/**
 * Initialize a new game.
 * ruleVersion = "rule1" (default) or "rule2"
 */
export const initGame = (
  playerNames: string[],
  startingHand: number = 5,
  ruleVersion: "rule1" | "rule2" = "rule1"
): GameState => {
  const fullDeck = shuffleDeck(generateDeck(ruleVersion));
  const players: Player[] = playerNames.map((name, idx) => {
    const hand = fullDeck.slice(idx * startingHand, (idx + 1) * startingHand);
    return { id: `player-${idx}`, name, hand };
  });

  const dealtCards = players.length * startingHand;
  const pile: Card[] = [fullDeck[dealtCards]];
  const market = fullDeck.slice(dealtCards + 1);

  return {
    players,
    market,
    pile,
    currentPlayer: 0,
    direction: 1,
    pendingPick: 0,
    calledSuit: undefined,
    mustPlayNormal: false, // used in Rule 2
  };
};

/**
 * Select ruleset dynamically (Rule 1 or Rule 2)
 */
const useRuleSet = (ruleVersion: "rule1" | "rule2") => {
  return ruleVersion === "rule1"
    ? { isValidMove: isValidMoveRule1, applyCardEffect: applyCardEffectRule1 }
    : { isValidMove: isValidMoveRule2, applyCardEffect: applyCardEffectRule2 };
};

/**
 * Handle a player playing a card.
 */
export const playCard = (
  state: GameState,
  playerIndex: number,
  card: Card,
  ruleVersion: "rule1" | "rule2" = "rule1"
): GameState => {
  const player = state.players[playerIndex];
  if (!player) throw new Error("Invalid player index");

  const { isValidMove, applyCardEffect } = useRuleSet(ruleVersion);

  if (!isValidMove(card, state)) {
    throw new Error("Invalid move");
  }

  return applyCardEffect(card, state, playerIndex);
};

/**
 * Handle a player picking from the market.
 */
export const pickCard = (
  state: GameState,
  playerIndex: number
): GameState => {
  if (state.market.length === 0) throw new Error("Market is empty!");

  let cardsToPick = state.pendingPick || 1;
  const drawn = state.market.slice(0, cardsToPick);
  const market = state.market.slice(cardsToPick);

  const players = state.players.map((p, idx) =>
    idx === playerIndex ? { ...p, hand: [...p.hand, ...drawn] } : p
  );

  const nextPlayer =
    (playerIndex + state.direction + state.players.length) %
    state.players.length;

  return {
    ...state,
    players,
    market,
    currentPlayer: nextPlayer,
    pendingPick: 0,
    mustPlayNormal: false, // reset after drawing
  };
};

/**
 * Check winner.
 */
export const checkWinner = (state: GameState): Player | null => {
  return state.players.find((p) => p.hand.length === 0) || null;
};
