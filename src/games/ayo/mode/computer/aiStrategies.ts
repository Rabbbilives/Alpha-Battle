import { AyoGameState } from "../core/AyoCoreLogic"

/**
 * Helper: get valid pits for current player
 */
export function getValidMoves(game: AyoGameState): number[] {
  return game.board
    .map((seeds, index) => (seeds > 0 ? index : null))
    .filter((x) => x !== null) as number[];
}

/**
 * Level 1: Rookie → play random move
 */
export function randomMove(game: AyoGameState): number {
  const validMoves = getValidMoves(game);
  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

/**
 * Level 2: Greedy → pick the pit with most seeds
 */
export function greedyMove(game: AyoGameState): number {
  const validMoves = getValidMoves(game);
  return validMoves.reduce((best, curr) =>
    game.board[curr] > game.board[best] ? curr : best
  );
}

/**
 * Level 3: Capture-seeking → prefer moves ending on opponent side
 */
export function captureMove(game: AyoGameState): number {
  const validMoves = getValidMoves(game);
  return (
    validMoves.find(
      (move) => (move + game.board[move]) % 12 >= 6 // lands on opponent side
    ) ?? randomMove(game)
  );
}

/**
 * Level 4: Scatter → if no capture available, spread seeds to avoid opponent gain
 */
export function scatterMove(game: AyoGameState): number {
  const validMoves = getValidMoves(game);

  // Try to avoid feeding opponent (don’t end on their side if possible)
  const safeMove = validMoves.find(
    (move) => (move + game.board[move]) % 12 < 6 // ends on own side
  );

  return safeMove ?? greedyMove(game);
}

/**
 * Level 5: Alpha → choose move that maximizes immediate capture or prevents loss
 */
export function alphaMove(game: AyoGameState): number {
  const validMoves = getValidMoves(game);

  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  validMoves.forEach((move) => {
    const lastIndex = (move + game.board[move]) % 12;
    const potentialCapture = game.board[lastIndex]; // simplistic eval
    if (potentialCapture > bestScore) {
      bestScore = potentialCapture;
      bestMove = move;
    }
  });

  return bestMove;
}
