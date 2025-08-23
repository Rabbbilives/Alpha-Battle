import React, { useState, useEffect, useMemo } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Button, ActivityIndicator } from 'react-native';
import { initializeComputerGame, playComputerTurn, AyoComputerState, ComputerLevel, getComputerMove } from "./AyoComputerLogic";
import  AyoGame  from "../core/AyoCoreUI"
import { usePlayerProfile } from '@/src/hooks/usePlayerProfile';

const levels = [
  { label: "Rookie (Easy)", value: 1, rating: 1000 },
  { label: "Player (Normal)", value: 2, rating: 1250 },
  { label: "Warrior (Hard)", value: 3, rating: 1500 },
  { label: "Master (Expert)", value: 4, rating: 1700 },
  { label: "Alpha (Legend)", value: 5, rating: 1900 },
];

export default function AyoComputerUI() {
  const [gameState, setGameState] = useState<AyoComputerState | null>(null);
  const [level, setLevel] = useState<ComputerLevel | null>(null);
  const [animatedSeeds, setAnimatedSeeds] = useState<AnimatedSeed[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const playerProfile = usePlayerProfile();

  // Start a new game
  const startGame = (lvl: ComputerLevel) => {
    setLevel(lvl);
    setGameState(initializeComputerGame(lvl));
  };

  // Handle player move
  const handleMove = (pitIndex: number) => {
    if (!gameState || gameState.isPlayerWinner !== null || gameState.game.currentPlayer !== 1) return;

    const currentSeeds = gameState.game.board[pitIndex];
    if (currentSeeds === 0) return;

    animateSeeds(pitIndex, currentSeeds, () => {
      const newState = playComputerTurn(gameState, pitIndex);
      setGameState(newState);
    });
  };

  // Animate seeds utility
  const animateSeeds = (pitIndex: number, count: number, onFinish: () => void) => {
    const newAnimatedSeeds: AnimatedSeed[] = [];
    for (let i = 0; i < count; i++) {
      newAnimatedSeeds.push({
        id: `seed-${pitIndex}-${i}`,
        fromPit: pitIndex,
        toPit: (pitIndex + i + 1) % 12,
        delay: i * 100,
      });
    }
    setAnimatedSeeds(newAnimatedSeeds);

    setTimeout(() => {
      setAnimatedSeeds([]);
      onFinish();
    }, count * 100 + 500);
  };

  // Auto computer move when it’s AI turn
  useEffect(() => {
    if (!gameState || !level) return;
    if (gameState.isPlayerWinner !== null) return;
    if (gameState.game.currentPlayer !== 2) return;

    setAiThinking(true);

    setTimeout(() => {
      const aiMove = getComputerMove(gameState.game, level); // choose pit based on AI logic
      const seeds = gameState.game.board[aiMove];

      animateSeeds(aiMove, seeds, () => {
        const newState = playComputerTurn(gameState, aiMove);
        setGameState(newState);
        setAiThinking(false);
      });
    }, 800); // AI "thinking delay"
  }, [gameState, level]);

  // Reset game
  const resetGame = () => {
    if (level) setGameState(initializeComputerGame(level));
    else setGameState(null);
  };

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
    <ImageBackground
      source={require('../../../../assets/images/splash-bg.png')}
      style={styles.container}
    >
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
          <Text style={styles.turnIndicator}>
            {gameState.game.currentPlayer === 1 
              ? "Your Turn" 
              : aiThinking ? "Computer is thinking..." : "Computer's Turn"}
          </Text>

          <AyoGame
            gameState={gameState.game}
            onPitPress={handleMove}
            animatedSeeds={animatedSeeds}
            player={{
              name: playerProfile.name || "Player 1",
              country: playerProfile.country || "US",
              rating: playerProfile.rating || 1200,
              isAI: false,
            }}
            opponent={opponent!}
          />

          {aiThinking && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />}

          {gameState.isPlayerWinner !== null && (
            <View style={styles.resultBox}>
              {gameState.isPlayerWinner ? (
                <Text style={styles.winText}>
                  🎉 You Win! +{gameState.reward} R-coin
                </Text>
              ) : (
                <Text style={styles.loseText}>😢 You Lost!</Text>
              )}
              <Button title="Play Again" onPress={resetGame} />
            </View>
          )}
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center", color: '#fff' },
  levelSelector: { alignItems: "center" },
  levelButton: {
    backgroundColor: "#444",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    width: "80%",
  },
  levelText: { color: "#fff", fontSize: 16, textAlign: "center" },
  gameContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  resultBox: { marginTop: 20, alignItems: "center" },
  winText: { fontSize: 20, fontWeight: "bold", color: "green", marginBottom: 10 },
  loseText: { fontSize: 20, fontWeight: "bold", color: "red", marginBottom: 10 },
  turnIndicator: { fontSize: 22, fontWeight: "bold", color: '#fff', marginVertical: 10 },
});
