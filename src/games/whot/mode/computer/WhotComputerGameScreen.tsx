// Create this new file, e.g., in your `games/whot/` folder
import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Alert, FlatList, ActivityIndicator } from "react-native";
import { WhotCard } from "../core/ui/whotcard";
import { CardBack } from "../core/ui/CardBack";
import { initGame, playCard, pickCard, checkWinner } from "../core/game";
import { GameState, Card } from "../core/types";
import WhotPlayerProfile from "../core/ui/whotplayerProfile";
import { usePlayerProfile } from "@/src/hooks/usePlayerProfile" // Adjust path as needed

// Constants for card dimensions
const CARD_WIDTH = 80;
const CARD_HEIGHT = 120;

const WhotComputerGameScreen = () => {
  const [game, setGame] = useState<GameState>(initGame(["Player", "Computer"], 7, "rule2"));

  // Call the custom hook to get live player data for the 'whot' game
  const { name, country, rating, avatar, isLoading, loadGameStats, updateGameStats } = usePlayerProfile('whot');

  // Load the player's game stats when the component first renders
  useEffect(() => {
    loadGameStats();
  }, [loadGameStats]);

  // This effect runs whenever the game state changes to check for a winner
  useEffect(() => {
    if (game) {
      const winner = checkWinner(game);
      if (winner) {
        Alert.alert("Game Over", `${winner.name} wins the game!`);

        // Example: Here you would calculate the new rating and update the stats
        // const newRating = calculateNewRating(rating, ...); 
        const isHumanWinner = winner.name === name;

        if (isHumanWinner) {
          // updateGameStats('win', newRating);
          console.log("Player WON. Update stats here.");
        } else {
          // updateGameStats('loss', newRating);
          console.log("Player LOST. Update stats here.");
        }
      }
    }
  }, [game, name, updateGameStats]);


  // Handler for when the player plays a card
  const handlePlayCard = (card: Card) => {
    if (game.currentPlayer !== 0) return; // Player is always index 0

    try {
      const newState = playCard(game, 0, card, "rule2");
      setGame(newState);
    } catch (e: any) {
      Alert.alert("Invalid Move", e.message);
    }
  };

  // Handler for when the player draws a card from the market
  const handlePickCard = () => {
    if (game.currentPlayer !== 0) return;
    const newState = pickCard(game, 0);
    setGame(newState);
  };

  const humanPlayer = game.players[0];
  const computerPlayer = game.players[1];

  // Create a data object for the human player from the hook's live data
  const humanPlayerData = {
      name: name,
      rating: rating,
      country: country,
      avatar: avatar,
      cardCount: humanPlayer.hand.length,
      isAI: false,
  };

  // Create a static data object for the AI opponent
  const computerPlayerData = {
      name: "Computer",
      rating: 1800, // This could be based on a selected difficulty level
      country: "US",
      avatar: null,
      cardCount: computerPlayer.hand.length,
      isAI: true,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* === TOP ZONE: OPPONENT === */}
        <View style={styles.topZone}>
          <WhotPlayerProfile {...computerPlayerData} />
          <FlatList
            data={computerPlayer.hand}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            keyExtractor={(_, index) => `opponent-${index}`}
            renderItem={({ index }) => (
              <View style={[styles.cardWrapper, { marginLeft: index > 0 ? -50 : 0 }]}>
                <CardBack width={CARD_WIDTH} height={CARD_HEIGHT} />
              </View>
            )}
            style={styles.handList}
            contentContainerStyle={{flexGrow: 1, justifyContent: 'flex-end'}}
          />
        </View>

        {/* === MIDDLE ZONE: GAME PILES === */}
        <View style={styles.middleZone}>
          {game.pile.length > 0 && (
            <View style={styles.playedCard}>
              <WhotCard
                width={CARD_WIDTH + 10}
                height={CARD_HEIGHT + 10}
                suit={game.pile[game.pile.length - 1].suit}
                number={game.pile[game.pile.length - 1].number}
              />
            </View>
          )}

          <TouchableOpacity onPress={handlePickCard} disabled={game.currentPlayer !== 0}>
            <View style={styles.drawPile}>
                <CardBack width={CARD_WIDTH} height={CARD_HEIGHT} />
                <View style={styles.drawPileBadge}>
                    <Text style={styles.drawPileCount}>{game.market.length}</Text>
                </View>
                <Text style={styles.drawText}>DRAW</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* === BOTTOM ZONE: PLAYER === */}
        <View style={styles.bottomZone}>
          {isLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <WhotPlayerProfile {...humanPlayerData} />
          )}
          <FlatList
            data={humanPlayer.hand}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => handlePlayCard(item)}
                disabled={game.currentPlayer !== 0}
                style={[styles.cardWrapper, { marginLeft: index > 0 ? -50 : 0 }]}
              >
                <WhotCard suit={item.suit} number={item.number} width={CARD_WIDTH} height={CARD_HEIGHT} />
              </TouchableOpacity>
            )}
            style={styles.handList}
            contentContainerStyle={{flexGrow: 1, justifyContent: 'flex-end'}}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// You can reuse most of your styles from WhotGame.tsx
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#046307', // Green felt background from the screenshot
  },
  container: {
    flex: 1,
    justifyContent: 'space-between', // Pushes top/bottom zones to edges
    alignItems: 'center',
    paddingVertical: 10,
  },
  // ZONES
  topZone: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  middleZone: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  bottomZone: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  // PILES
  playedCard: {
    marginRight: 40,
  },
  drawPile: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 10,
  },
  drawPileBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#A22323',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
    zIndex: 1, // Ensure it's on top
  },
  drawPileCount: {
    color: 'white',
    fontWeight: 'bold',
  },
  drawText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
  // HANDS
  handList: {
    flex: 1, // Allows the list to take the remaining available space
  },
  cardWrapper: {
    // This is a placeholder. The essential overlap style (negative margin)
    // is applied directly within the FlatList's renderItem for logic.
  },
});
export default WhotComputerGameScreen;