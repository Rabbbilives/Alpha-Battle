import { Card, CardSuit, GameState } from "./types";

/**
 * Check if a move is valid based on current pile + rules.
 */
export const isValidMove = (
  card: Card,
  state: GameState
): boolean => {
  const topCard = state.pile[state.pile.length - 1];
  const calledSuit = state.calledSuit;

  // If Whot was played and a suit was called → must follow that
  if (calledSuit && topCard.suit === "whot") {
    return card.suit === calledSuit || card.suit === "whot";
  }

  // Otherwise → must match suit or number or be a Whot
  return (
    card.suit === topCard.suit ||
    card.number === topCard.number ||
    card.suit === "whot"
  );
};

/**
 * Apply special card effects to the game state.
 */
export const applyCardEffect = (
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

    case 2: // Pick Two
      newState.pendingPick = (newState.pendingPick || 0) + 2;
      newState.currentPlayer =
        (playerIndex + newState.direction + newState.players.length) %
        newState.players.length;
      break;

    case 5: // Pick Three
      newState.pendingPick = (newState.pendingPick || 0) + 3;
      newState.currentPlayer =
        (playerIndex + newState.direction + newState.players.length) %
        newState.players.length;
      break;

    case 8: // Suspension (skip next player)
      newState.currentPlayer =
        (playerIndex + newState.direction * 2 + newState.players.length) %
        newState.players.length;
      break;

    case 14: // General Market → all other players draw 1
      newState.players = newState.players.map((p, idx) => {
        if (idx === playerIndex) return p; // skip the player who played it
        const [drawn, ...rest] = newState.market;
        return { ...p, hand: [...p.hand, drawn] };
      });
      newState.market = newState.market.slice(newState.players.length - 1);
      newState.currentPlayer =
        (playerIndex + newState.direction + newState.players.length) %
        newState.players.length;
      break;

    case 20: // Whot → Call Shape
      // Must be set manually in UI → here we just mark it as required
      newState.calledSuit = undefined; // UI will set this
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

  // Push the card to pile
  newState.pile = [...newState.pile, card];

  // Remove from player's hand
  newState.players = newState.players.map((p, idx) => {
    if (idx !== playerIndex) return p;
    return { ...p, hand: p.hand.filter((c) => c.id !== card.id) };
  });

  return newState;
};
