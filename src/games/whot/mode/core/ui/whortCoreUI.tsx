import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { WhotCard, CardSuit } from "./whotcard";
import { CardBack } from "./CardBack";
import { initGame, playCard, pickCard, checkWinner } from "../game"; // ✅ import engine
import { GameState, Card } from "../types";

const WhotGame = () => {
  const [game, setGame] = useState<GameState>(
    initGame(["You", "Opponent"], 5, "rule2") // start with Rule 2 (you can swap to rule1 for Warrior+)
  );

  const currentPlayer = game.players[game.currentPlayer];

  const handlePlayCard = (card: Card) => {
    try {
      const newState = playCard(game, game.currentPlayer, card, game.ruleVersion);
      setGame(newState);

      const winner = checkWinner(newState);
      if (winner) {
        alert(`${winner.name} wins!`);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handlePickCard = () => {
    const newState = pickCard(game, game.currentPlayer);
    setGame(newState);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nigerian Whot Game</Text>

        {/* Opponent’s Hand */}
        <View style={styles.opponentHand}>
          {game.players[1].hand.map((_, i) => (
            <CardBack key={`opponent-${i}`} />
          ))}
        </View>

        <View style={styles.middleArea}>
          {/* Draw Pile */}
          <View style={styles.drawPile}>
            <Text style={styles.drawPileCount}>{game.market.length}</Text>
            <TouchableOpacity onPress={handlePickCard}>
              <CardBack />
            </TouchableOpacity>
          </View>

          {/* Played Pile */}
          <View style={styles.playedCard}>
            {game.pile.length > 0 && (
              <WhotCard
                suit={game.pile[game.pile.length - 1].suit}
                number={game.pile[game.pile.length - 1].number}
              />
            )}
          </View>
        </View>

        <Text style={styles.turnIndicator}>
          {currentPlayer.name}’s Turn
        </Text>

        {/* Player Hand */}
        <View style={styles.playerHand}>
          {currentPlayer.hand.map((card, index) => (
            <TouchableOpacity
              key={`player-${card.suit}-${card.number}-${index}`}
              onPress={() => handlePlayCard(card)}
            >
              <WhotCard suit={card.suit} number={card.number} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3D2C22', // Dark wood-like background
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
    marginBottom: 20,
  },
  opponentHand: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  middleArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 40,
  },
  drawPile: {
    alignItems: 'center',
    marginRight: 20,
  },
  drawPileCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FDFBF6',
    marginBottom: 5,
  },
  playedCard: {
    marginLeft: 20,
  },
  turnIndicator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FDFBF6',
    backgroundColor: '#000000A0', // Semi-transparent black background
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 40,
  },
  playerHand: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

export default WhotGame;