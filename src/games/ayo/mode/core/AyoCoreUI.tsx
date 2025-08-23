// src/screens/game/AyoGame.tsx
"use client";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AyoSkiaBoard } from "./AyoSkiaBoard";
import PlayerProfileCompact from "@/src/screens/profile/PlayerProfileCompact";
import { AyoGameState } from "./AyoCoreLogic";

interface Player {
  name: string;
  country: string;
  rating: number;
  isAI: boolean;
}

interface AnimatedSeed {
  id: string;
  fromPit: number;
  toPit: number;
  delay: number;
}

interface AyoGameProps {
  gameState: AyoGameState;
  onPitPress: (pitIndex: number) => void;
  animatedSeeds?: AnimatedSeed[];
  player: Player;
  opponent: Player;
}

const AyoGame: React.FC<AyoGameProps> = ({
  gameState,
  onPitPress,
  animatedSeeds = [],
  player,
  opponent,
}) => {
  return (
    <View style={styles.container}>

     <PlayerProfileCompact 
        name={opponent.name}
        country={opponent.country}
        rating={opponent.rating}
        isAI={opponent.isAI}
      />


      <View style={styles.boardContainer}>
        <AyoSkiaBoard 
          board={gameState.board} 
          onPitPress={onPitPress}
          animatingPath={animatedSeeds.map(seed => seed.toPit)}
        />
      </View>

      <PlayerProfileCompact 
        name={player.name}
        country={player.country}
        rating={player.rating}
        isAI={player.isAI}
      />

      {/* Scores */}
      <View style={styles.scores}>
        <Text>{player.name}: {gameState.scores[1]}</Text>
        <Text>{opponent.name}: {gameState.scores[2]}</Text>
      </View>

      {gameState.isGameOver && (
        <Text style={styles.gameOver}>
          Game Over! Winner:{" "}
          {gameState.scores[1] > gameState.scores[2]
            ? player.name
            : gameState.scores[2] > gameState.scores[1]
            ? opponent.name
            : "Draw"}
        </Text>
      )}
      
    </View>
  );
};

export default AyoGame;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1b120b", alignItems: "center", justifyContent: "center" },
  boardContainer: { flex: 1, width: "100%" },
  scores: { flexDirection: "row", justifyContent: "space-between", width: "80%" },
  gameOver: { marginTop: 20, fontSize: 18, fontWeight: "bold", color: "red" },
});
