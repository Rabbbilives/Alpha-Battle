// src/core/AyoCoreLogic.ts

export interface AyoGameState {
  board: number[];         // 12 pits (6 per player)
  scores: { [key: number]: number }; // scores[1], scores[2]
  currentPlayer: 1 | 2;
  isGameOver: boolean;
}

export const PLAYER_ONE_PITS = [0, 1, 2, 3, 4, 5];
export const PLAYER_TWO_PITS = [6, 7, 8, 9, 10, 11];

export const initializeGame = (): AyoGameState => ({
  board: Array(12).fill(4), // 4 seeds per pit
  scores: { 1: 0, 2: 0 },
  currentPlayer: 1,
  isGameOver: false,
});

export const makeMove = (state: AyoGameState, pitIndex: number): AyoGameState => {
  let { board, scores, currentPlayer } = state;
  board = [...board];
  scores = { ...scores };

  let seeds = board[pitIndex];
  if (seeds === 0) return state; // invalid move
  board[pitIndex] = 0;

  let currentIndex = pitIndex;

  while (seeds > 0) {
    currentIndex = (currentIndex + 1) % 12;
    board[currentIndex]++;
    seeds--;

    // Capture rule (if pit reaches exactly 4, capture immediately)
    if (board[currentIndex] === 4) {
      const owner = PLAYER_ONE_PITS.includes(currentIndex) ? 1 : 2;
      scores[owner] += 4;
      board[currentIndex] = 0;
    }
  }

  // Continuation rule (if last pit has > 1, keep sowing)
  while (board[currentIndex] > 1) {
    seeds = board[currentIndex];
    board[currentIndex] = 0;
    while (seeds > 0) {
      currentIndex = (currentIndex + 1) % 12;
      board[currentIndex]++;
      seeds--;

      if (board[currentIndex] === 4) {
        const owner = PLAYER_ONE_PITS.includes(currentIndex) ? 1 : 2;
        scores[owner] += 4;
        board[currentIndex] = 0;
      }
    }
  }

  // Special rule: If only 8 seeds remain, all belong to the player who just captured
  const totalSeeds = board.reduce((a, b) => a + b, 0);
  if (totalSeeds === 8) {
    scores[currentPlayer] += 8;
    board = Array(12).fill(0);
  }

  // End condition: if opponent has no seeds, give all remaining seeds to current player
  const opponentPits = currentPlayer === 1 ? PLAYER_TWO_PITS : PLAYER_ONE_PITS;
  const opponentSeeds = opponentPits.reduce((sum, idx) => sum + board[idx], 0);
  if (opponentSeeds === 0) {
    scores[currentPlayer] += board.reduce((a, b) => a + b, 0);
    board = Array(12).fill(0);
  }

  // Switch player
  const nextPlayer: 1 | 2 = currentPlayer === 1 ? 2 : 1;

  // Check game over
  const isGameOver = board.every(pit => pit === 0);

  return {
    board,
    scores,
    currentPlayer: isGameOver ? currentPlayer : nextPlayer,
    isGameOver,
  };
};
