import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { AyoSkiaImageBoard } from "./AyoSkiaBoard";
import GamePlayerProfile from "./GamePlayerProfile";
import {
  AyoGameState,
  initializeGame,
  calculateMoveResult,
  getValidMoves,
  Capture,
} from "./AyoCoreLogic";
import { useGameTimer } from "@/src/hooks/useGameTimer";
import AyoGameOver from "../computer/AyoGameOver"; // ✅ import overlay

type AyoGameProps = {
  initialGameState?: AyoGameState;
  onPitPress?: (pitIndex: number) => void;
  player?: { name: string; country?: string; rating?: number; isAI?: boolean };
  opponent?: { name: string; country?: string; rating?: number; isAI?: boolean };
};

export const AyoGame: React.FC<AyoGameProps> = ({
  initialGameState,
  onPitPress,
  player: propPlayer,
  opponent: propOpponent,
}) => {
  const [gameState, setGameState] = useState<AyoGameState>(
    initialGameState ?? initializeGame()
  );
  const [boardBeforeMove, setBoardBeforeMove] = useState<number[]>(gameState.board);
  const [animatingPaths, setAnimatingPaths] = useState<number[][]>([]);
  const [captures, setCaptures] = useState<Capture[]>([]);

  const defaultPlayer = { name: "Player", country: "NG", rating: 1200, isAI: false };
  const defaultOpponent = { name: "Opponent", country: "US", rating: 1500, isAI: true };

  const player = propPlayer ?? defaultPlayer;
  const opponent = propOpponent ?? defaultOpponent;

  const { player1Time, player2Time, startTimer, pauseTimer, formatTime, setLastActivePlayer } =
    useGameTimer(300);

  const isAnimating = animatingPaths.length > 0;

  // --- AI Move (opponent is currentPlayer 1) ---
  useEffect(() => {
    if (gameState.currentPlayer === 1 && !gameState.isGameOver && !isAnimating) {
      const validMoves = getValidMoves(gameState);
      if (validMoves.length === 0) return;
      const aiMove = validMoves.reduce((best, pit) =>
        gameState.board[pit] > gameState.board[best] ? pit : best
      );
      const timerId = setTimeout(() => {
        setBoardBeforeMove(gameState.board);
        const moveResult = calculateMoveResult(gameState, aiMove);
        setAnimatingPaths(moveResult.animationPaths);
        setCaptures(moveResult.captures);
        setGameState(moveResult.nextState);
      }, 800);
      return () => clearTimeout(timerId);
    }
  }, [gameState, isAnimating]);

  // --- Timer management ---
  useEffect(() => {
    if (gameState.isGameOver) {
      pauseTimer();
      return;
    }
    if (isAnimating) {
      pauseTimer();
      return;
    }
    setLastActivePlayer(gameState.currentPlayer);
    if (gameState.currentPlayer === 1) {
      pauseTimer();
    } else if (gameState.currentPlayer === 2) {
      startTimer();
    }
  }, [gameState.currentPlayer, gameState.isGameOver, isAnimating]);

  const handlePlayerMove = useCallback(
    (pitIndex: number) => {
      if (gameState.currentPlayer !== 2 || isAnimating) return;
      pauseTimer();
      setBoardBeforeMove(gameState.board);
      const moveResult = calculateMoveResult(gameState, pitIndex);
      setAnimatingPaths(moveResult.animationPaths);
      setCaptures(moveResult.captures);
      setGameState(moveResult.nextState);

      if (onPitPress) onPitPress(pitIndex);
    },
    [gameState, isAnimating]
  );

  const handleCaptureDuringAnimation = useCallback(
    (pitIndex: number) => {
      const captureInfo = captures.find((c) => c.pitIndex === pitIndex);
      if (!captureInfo) return;
      setGameState((prevState) => {
        const newScores = { ...prevState.scores };
        newScores[captureInfo.awardedTo] += 4;
        return { ...prevState, scores: newScores };
      });
    },
    [captures]
  );

  const handleAnimationEnd = useCallback(() => {
    setAnimatingPaths([]);
    setCaptures([]);
  }, []);

  const memoizedPaths = useMemo(() => animatingPaths, [animatingPaths]);
  const memoizedCaptures = useMemo(() => captures.map((c) => c.pitIndex), [captures]);

  // --- Compute result for GameOver popup ---
  let result: "win" | "loss" | "draw" | null = null;
  if (gameState.isGameOver) {
    if (gameState.scores[2] > gameState.scores[1]) result = "win";
    else if (gameState.scores[1] > gameState.scores[2]) result = "loss";
    else result = "draw";
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <GamePlayerProfile
          {...opponent}
          score={gameState.scores[1]}
          timeLeft={formatTime(player1Time)}
          isActive={gameState.currentPlayer === 1 && !isAnimating}
          country={opponent.country || "NG"}
          rating={opponent.rating || 1200}
        />
      </View>

      <View style={styles.boardContainer}>
        <AyoSkiaImageBoard
          board={gameState.board}
          boardBeforeMove={boardBeforeMove}
          onPitPress={handlePlayerMove}
          animatingPaths={memoizedPaths}
          captures={memoizedCaptures}
          onAnimationEnd={handleAnimationEnd}
          onCaptureDuringAnimation={handleCaptureDuringAnimation}
        />
      </View>

      <View style={styles.profileContainer}>
        <GamePlayerProfile
          {...player}
          score={gameState.scores[2]}
          timeLeft={formatTime(player2Time)}
          isActive={gameState.currentPlayer === 2 && !isAnimating}
          country={player.country || "NG"}
          rating={player.rating || 1200}
        />
      </View>

      {result && (
        <AyoGameOver
          result={result}
          playerName={player.name}
          opponentName={opponent.name}
          onRematch={() => setGameState(initializeGame())}
          onNewBattle={() => setGameState(initializeGame())}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", padding: 10, backgroundColor: "#222" },
  profileContainer: { alignItems: "center", marginBottom: 12 },
  boardContainer: { flex: 1, justifyContent: "center" },
});

export default AyoGame;
