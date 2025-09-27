// Alpha-Battle/src/games/ayo/mode/computer/AyoGameOver.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ComputerLevel } from './AyoComputerLogic';

const levels = [
  { label: "Apprentice (Easy)", value: 1, rating: 1250, reward: 10 },
  { label: "Knight (Normal)", value: 2, rating: 1500, reward: 15 },
  { label: "Warrior (Hard)", value: 3, rating: 1700, reward: 20 },
  { label: "Master (Expert)", value: 4, rating: 1900, reward: 25 },
  { label: "Alpha (Legend)", value: 5, rating: 2100, reward: 30 },
];

const BATTLE_BONUS = 15;

// --- Add rating to props
interface AyoGameOverProps {
  result: 'win' | 'loss' | 'draw';
  level?: ComputerLevel;
  onRematch?: () => void;
  onNewBattle?: () => void;
  playerName: string;
  opponentName: string;
  playerRating: number; // ✅ NEW
}

const AyoGameOver: React.FC<AyoGameOverProps> = ({
  result,
  level,
  onRematch,
  onNewBattle,
  playerName,
  opponentName,
  playerRating, // ✅ use it
}) => {
  const isWin = result === 'win';
  const isLoss = result === 'loss';
  const isDraw = result === 'draw';

  const { levelReward, newRating } = useMemo(() => {
    if (!isWin || !level) {
      return { levelReward: 0, newRating: playerRating };
    }
    const levelData = levels.find((l) => l.value === level);
    const reward = levelData?.reward ?? 0;
    const total = isWin ? reward + BATTLE_BONUS : 0;
    return {
      levelReward: reward,
      newRating: playerRating + total, // ✅ profile rating + reward + bonus
    };
  }, [level, isWin, playerRating]);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {isWin && <Text style={styles.winText}>You Won!</Text>}
        {isLoss && <Text style={styles.loseText}>You Lost!</Text>}
        {isDraw && <Text style={styles.drawText}>It’s a Draw!</Text>}

        <Text style={styles.winnerText}>
          {isDraw
            ? `${playerName} and ${opponentName} tied`
            : `Winner: ${isWin ? playerName : opponentName}`}
        </Text>

        {(isWin || isDraw) && (
          <View style={styles.rewardSection}>
            <View style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>Battle Bonus</Text>
              <Text style={styles.rewardValue}>
                <Ionicons name="diamond" size={16} color="#FFD700" /> +
                {isWin ? BATTLE_BONUS : 0} R-coin
              </Text>
            </View>

            {isWin && (
              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>Level Reward</Text>
                <Text style={styles.rewardValue}>
                  <Ionicons name="diamond" size={16} color="#FFD700" /> +
                  {levelReward} R-coin
                </Text>
              </View>
            )}

            <View style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>Rapid Rating</Text>
              <Text style={[styles.rewardValue, styles.totalRewardValue]}>
                <Ionicons name="diamond" size={16} color="#FFD700" /> {newRating}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {onRematch && (
            <TouchableOpacity
              style={[styles.button, styles.rematchButton]}
              onPress={onRematch}
            >
              <Text style={styles.buttonText}>Rematch</Text>
            </TouchableOpacity>
          )}
          {onNewBattle && (
            <TouchableOpacity
              style={[styles.button, styles.newBattleButton]}
              onPress={onNewBattle}
            >
              <Text style={styles.buttonText}>New Battle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  winText: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50' },
  loseText: { fontSize: 32, fontWeight: 'bold', color: '#F44336' },
  drawText: { fontSize: 32, fontWeight: 'bold', color: '#FFD700' },
  winnerText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    marginVertical: 10,
  },
  rewardSection: {
    width: '100%',
    backgroundColor: '#444',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rewardLabel: { color: '#E0E0E0', fontSize: 16 },
  rewardValue: { color: '#FFD700', fontSize: 16, fontWeight: '600' },
  totalRewardValue: { fontSize: 18, fontWeight: 'bold' },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  rematchButton: { backgroundColor: '#4A90E2' },
  newBattleButton: { backgroundColor: '#666' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default AyoGameOver;
