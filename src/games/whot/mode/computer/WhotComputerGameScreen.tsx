// Create this new file, e.g., in your `games/whot/` folder
import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { WhotCard, CardSuit } from "../core/ui/whotcard";
import { CardBack } from "../core/ui/CardBack";
import ComputerUI, { levels } from "./whortComputerUI"// Your Computer UI
import { initGame, playCard, pickCard, checkWinner } from "../core/game";
import { GameState, Card, Player } from "../core/types";

const WhotComputerGameScreen = () => {
  // --- STATE MANAGEMENT ---
  // The game state starts as NULL.
  const [game, setGame] = useState<GameState | null>(null);
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  // --- GAME LIFECYCLE ---
  // This function is called when a level is selected.
  const handleStartGame = (selectedLevel: 1 | 2 | 3 | 4 | 5) => {
    setLevel(selectedLevel);
    // It creates the initial game state and updates our state variable.
    const initialGameState = initGame(["You", "Computer"], 5, "rule2");
    setGame(initialGameState);
  };

  // Check for a winner whenever the game state changes.
  useEffect(() => {
    if (game) {
      const winner = checkWinner(game);
      if (winner) {
        Alert.alert("Game Over", `${winner.name} wins the game!`);
        // Optionally reset the game here
        // setGame(null);
        // setLevel(null);
      }
    }
  }, [game]);


  // --- PLAYER ACTIONS ---
  const handlePlayCard = (card: Card) => {
    if (!game || game.currentPlayer !== 0) return; // Player is always index 0

    try {
      const newState = playCard(game, 0, card, "rule2");
      setGame(newState);
    } catch (e: any) {
      Alert.alert("Invalid Move", e.message);
    }
  };

  const handlePickCard = () => {
    if (!game || game.currentPlayer !== 0) return;
    const newState = pickCard(game, 0);
    setGame(newState);
  };


  // --- UI RENDERING ---

  // 1. If the game state is NULL, show the level selector.
  if (!game || !level) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.levelSelectorContainer}>
          <Text style={styles.title}>Choose Your Opponent</Text>
          {levels.map((lvl) => (
            <TouchableOpacity
              key={lvl.value}
              style={styles.levelButton}
              onPress={() => handleStartGame(lvl.value)}
            >
              <Text style={styles.levelButtonText}>{lvl.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // 2. Once the game state exists, render the full game board.
  const humanPlayer = game.players[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Computer Player UI */}
        <ComputerUI
          state={game}
          playerIndex={1} // Computer is always index 1
          level={level}
          onStateChange={setGame} // Pass the setter function
        />

        {/* Middle Area (Piles) */}
        <View style={styles.middleArea}>
          <View style={styles.drawPile}>
            <Text style={styles.drawPileCount}>{game.market.length}</Text>
            <TouchableOpacity onPress={handlePickCard} disabled={game.currentPlayer !== 0}>
              <CardBack />
            </TouchableOpacity>
          </View>
          <View style={styles.playedCard}>
            {game.pile.length > 0 && (
              <WhotCard
                suit={game.pile[game.pile.length - 1].suit}
                number={game.pile[game.pile.length - 1].number}
              />
            )}
          </View>
        </View>

        {/* Turn Indicator */}
        <Text style={styles.turnIndicator}>
          {game.players[game.currentPlayer].name}’s Turn
        </Text>

        {/* Human Player Hand */}
        <View style={styles.playerHand}>
          {humanPlayer.hand.map((card, index) => (
            <TouchableOpacity
              key={`${card.id}-${index}`}
              onPress={() => handlePlayCard(card)}
              disabled={game.currentPlayer !== 0}
            >
              <WhotCard suit={card.suit} number={card.number} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// You can reuse most of your styles from WhotGame.tsx
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3D2C22',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FDFBF6',
    marginBottom: 30,
  },
  middleArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginVertical: 40,
  },
  drawPile: {
    alignItems: 'center',
  },
  drawPileCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FDFBF6',
    marginBottom: 5,
  },
  playedCard: {},
  turnIndicator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FDFBF6',
    backgroundColor: '#000000A0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  playerHand: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  levelSelectorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelButton: {
    backgroundColor: '#A22323',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  levelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WhotComputerGameScreen;