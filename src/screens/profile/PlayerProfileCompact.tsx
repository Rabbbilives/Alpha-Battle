import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import CountryFlag from 'react-native-country-flag';
import { Ionicons } from '@expo/vector-icons';

const getRank = (rating: number) => {
  if (rating >= 1900) return { name: 'Alpha', icon: '🔱' };
  if (rating >= 1700) return { name: 'Master', icon: '👑' };
  if (rating >= 1500) return { name: 'Warrior', icon: '🔷' };
  if (rating >= 1250) return { name: 'Pro', icon: '🟢' };
  return { name: 'Rookie', icon: '🟤' };
};

const PlayerProfileCompact = ({ name, country, rating, avatar, timeLeft, isAI = false }: {
  name: string;
  country: string;
  rating: number;
  avatar?: string | null;
  timeLeft?: string;
  isAI?: boolean;
}) => {
  const rank = getRank(rating);
  const displayAvatar = avatar || 'https://ui-avatars.com/api/?name=' + name;

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {isAI ? (
          <Ionicons name="hardware-chip-outline" size={48} color="#E5E5E5" style={styles.aiIcon} />
        ) : (
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name}>{name}</Text>
          <CountryFlag isoCode={isAI ? 'NG' : country} size={18} style={styles.flag} />
        </View>
        <View style={styles.row}>
          <Text style={styles.rank}>
            {rank.icon} {rank.name}
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}> {rating}</Text>
        </View>
        {timeLeft && (
          <View style={styles.row}>
            <Ionicons name="time-outline" size={14} color="#4A90E2" />
            <Text style={styles.timer}> {timeLeft}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    width: '100%',
    alignSelf: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  info: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  flag: {
    borderRadius: 3,
  },
  rank: {
    fontSize: 15,
    color: '#E5E5E5',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  rating: {
    fontSize: 15,
    color: '#FFD700',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  timer: {
    fontSize: 15,
    color: '#4A90E2',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  aiIcon: {
    width: 52,
    height: 52,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default PlayerProfileCompact;
