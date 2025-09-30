// whot/core/rules2.ts
import { Card, GameState } from "./types";

/**
 * Check if a move is valid in Rule 2.
 */
export const isValidMoveRule2 = (
  card: Card,
  state: GameState
): boolean => {
  const topCard = state.pile[state.pile.length - 1];

  // Must match suit or number
  return card.suit === topCard.suit || card.number === topCard.number;
};

/**
 * Apply Rule 2 effects.
 */
export const applyCardEffectRule2 = (
  card: Card,
  state: GameState,
  playerIndex: number
): GameState => {
  const newState: GameState = { ...state };

  switch (card.number) {
    case 1: // Hold On → skip next player
      newState.currentPlayer =
        (playerIndex + newState.direction * 2 + newState.players.length) %
        newState.players.length;
      break;

    case 2: // Pick Two (cannot be defended in Rule 2)
      newState.pendingPick = (newState.pendingPick || 0) + 2;
      newState.currentPlayer =
        (playerIndex + newState.direction + newState.players.length) %
        newState.players.length;
      break;

    case 14: // General Market → all others draw 1
      newState.players = newState.players.map((p, idx) => {
        if (idx === playerIndex) return p;
        const [drawn, ...rest] = newState.market;
        newState.market = rest;
        return { ...p, hand: [...p.hand, drawn] };
      });
      newState.currentPlayer =
        (playerIndex + newState.direction + newState.players.length) %
        newState.players.length;
      break;

    default:
      // Normal card → just pass turn
      newState.currentPlayer =
        (playerIndex + newState.direction + newState.players.length) %
        newState.players.length;
      break;
  }

  // Push card to pile
  newState.pile = [...newState.pile, card];

  // Remove card from player’s hand
  newState.players = newState.players.map((p, idx) =>
    idx === playerIndex
      ? { ...p, hand: p.hand.filter((c) => c.id !== card.id) }
      : p
  );

  // 🚨 Rule 2 Extra: after a special card, player MUST play a normal card
  if ([1, 2, 14].includes(card.number)) {
    newState.mustPlayNormal = true; // flag → checked by UI/engine
  } else {
    newState.mustPlayNormal = false;
  }

  return newState;
};
