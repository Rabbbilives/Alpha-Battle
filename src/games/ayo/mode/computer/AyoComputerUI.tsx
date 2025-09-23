// AyoComputerUI.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, ActivityIndicator } from 'react-native';
import { initializeComputerGame, playComputerTurn, AyoComputerState, ComputerLevel, getComputerMove } from "./AyoComputerLogic";
import { calculateMoveResult } from "../core/AyoCoreLogic";
import { AyoGame } from "../core/AyoCoreUI";
import { usePlayerProfile } from '@/src/hooks/usePlayerProfile';
import AyoGameOver from "@/src/games/ayo/mode/core/AyoGameOver" // <-- added

const levels = [
  { label: "Rookie (Easy)", value: 1, rating: 1000, reward: 10 },
  { label: "Player (Normal)", value: 2, rating: 1250, reward: 20 },
  { label: "Warrior (Hard)", value: 3, rating: 1500, reward: 30 },
  { label: "Master (Expert)", value: 4, rating: 1700, reward: 40 },
  { label: "Alpha (Legend)", value: 5, rating: 1900, reward: 50 },
];

export default function AyoComputerUI() {
  const [gameState, setGameState] = useState<AyoComputerState | null>(null);
  const [level, setLevel] = useState<ComputerLevel | null>(null);
  const [animationPaths, setAnimationPaths] = useState<number[][]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const playerProfile = usePlayerProfile();
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ player: 1 | 2; pit: number } | null>(null);

  const startGame = (lvl: ComputerLevel) => {
    setLevel(lvl);
    setGameState(initializeComputerGame(lvl));
  };

  const onAnimationDone = () => {
    if (pendingMove && gameState) {
      const newState = playComputerTurn(gameState, pendingMove.pit);
      setGameState(newState);
      if (pendingMove.player === 1) setAiThinking(false);
    }
    setIsAnimating(false);
    setPendingMove(null);
    setAnimationPaths([]);
  };

  const handleMove = (pitIndex: number) => {
    if (!gameState || isAnimating || gameState.game.currentPlayer !== 2) return;

    const moveResult = calculateMoveResult(gameState.game, pitIndex);
    if (moveResult.animationPaths.length > 0) {
      setIsAnimating(true);
      setPendingMove({ player: 2, pit: pitIndex });
      setAnimationPaths(moveResult.animationPaths);
    } else {
      const newState = playComputerTurn(gameState, pitIndex);
      setGameState(newState);
    }
  };

  useEffect(() => {
    if (!gameState || !level || isAnimating || gameState.game.currentPlayer !== 1 || gameState.isPlayerWinner !== null) {
      return;
    }

    setAiThinking(true);
    const timer = setTimeout(() => {
      if (!gameState || gameState.game.currentPlayer !== 1) {
        setAiThinking(false);
        return;
      }

      const aiMove = getComputerMove(gameState.game, level);
      const moveResult = calculateMoveResult(gameState.game, aiMove);

      if (moveResult.animationPaths.length > 0) {
        setIsAnimating(true);
        setPendingMove({ player: 1, pit: aiMove });
        setAnimationPaths(moveResult.animationPaths);
      } else {
        const newState = playComputerTurn(gameState, aiMove);
        setGameState(newState);
        setAiThinking(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [gameState, level, isAnimating]);

  const opponent = useMemo(() => {
    if (!level) return null;
    const levelData = levels.find(l => l.value === level);
    return {
      name: `${levelData?.label.split(' ')[0]} AI`,
      country: "NG",
      rating: levelData?.rating || 1000,
      isAI: true,
    };
  }, [level]);

  return (
    <View style={styles.container}>
      {!gameState ? (
        <View style={styles.levelSelector}>
          <Text style={styles.title}>Choose Difficulty</Text>
          {levels.map((lvl) => (
            <TouchableOpacity
              key={lvl.value}
              style={styles.levelButton}
              onPress={() => startGame(lvl.value as ComputerLevel)}
            >
              <Text style={styles.levelText}>{lvl.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.gameContainer}>
          <AyoGame
            initialGameState={gameState.game}
            onPitPress={handleMove}
            opponent={opponent}
            player={{
              name: playerProfile?.name ?? 'You',
              country: playerProfile?.country ?? 'NG',
              rating: playerProfile?.rating ?? 1200,
              isAI: false
            }}
          />

          {aiThinking && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />}

          {gameState.isPlayerWinner !== null && level && (
            <AyoGameOver
              result={gameState.isPlayerWinner ? "win" : "loss"}
              level={level}
              mode="computer"
              onRestart={() => startGame(level)}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#222' },
  levelSelector: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  title: { color: 'white', fontSize: 20, marginBottom: 20 },
  levelButton: { backgroundColor: '#444', padding: 12, borderRadius: 8, marginVertical: 6, width: '80%', alignItems: 'center' },
  levelText: { color: 'white', fontSize: 18 },
  gameContainer: { flex: 1 },
});
