import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from 'react-native';
import { WhotCard, CardSuit } from './whotcard';
import { CardBack } from './CardBack';

interface Card {
  suit: CardSuit;
  number: number;
}

// Generate example cards for display
const playerHand: Card[] = [
  { suit: 'triangle', number: 2 },
  { suit: 'cross', number: 5 },
  { suit: 'triangle', number: 8 },
  { suit: 'cross', number: 1 },
  { suit: 'star', number: 2 },
];

const playedCard: Card = { suit: 'cross', number: 2 };

const deckCount = 40; // Number of cards in the draw pile
const opponentHandCount = 5; // Number of cards in opponent's hand

const App = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nigerian Whot Game</Text>

        {/* Opponent's Hand (face-down cards) */}
        <View style={styles.opponentHand}>
          {Array(opponentHandCount)
            .fill(0)
            .map((_, i) => (
              <CardBack key={`opponent-${i}`} />
            ))}
        </View>

        <View style={styles.middleArea}>
          {/* Draw Pile (face-down) */}
          <View style={styles.drawPile}>
            <Text style={styles.drawPileCount}>{deckCount}</Text>
            <CardBack />
          </View>

          {/* Played Card (face-up) */}
          <View style={styles.playedCard}>
            <WhotCard suit={playedCard.suit} number={playedCard.number} />
          </View>
        </View>

        <Text style={styles.turnIndicator}>Your Turn</Text>

        {/* Player's Hand (face-up cards) */}
        <View style={styles.playerHand}>
          {playerHand.map((card, index) => (
            <WhotCard key={`player-${card.suit}-${card.number}-${index}`} suit={card.suit} number={card.number} />
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

export default App;