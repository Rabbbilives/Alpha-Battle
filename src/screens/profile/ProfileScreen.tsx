import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getFlagEmoji } from '../../utils/flags';
import { getRankFromRating } from '../../utils/rank';
import { Star, Medal, ArrowLeft, User } from 'lucide-react-native';
import { Player } from '../../navigation/types';

type ProfileScreenProps = {
  player: Player;
  isOwnProfile: boolean;
  currentGameMode: string;
};

export default function ProfileScreen({ player, isOwnProfile, currentGameMode }: ProfileScreenProps) {
  const rank = getRankFromRating(player.rating);
  const showMcoin = rank.level === 'Warrior' || rank.level === 'Master' || rank.level === 'Alpha';
  const visibleStats = isOwnProfile ? player.stats : { [currentGameMode]: player.stats[currentGameMode] };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity>
          <ArrowLeft size={24} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        {player.avatar ? (
          <Image source={{ uri: player.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <User size={48} color="gray" />
          </View>
        )}
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.countryFlag}>{getFlagEmoji(player.country)}</Text>
        <View style={styles.rankRow}>
          <Text style={styles.rankIcon}>{rank.icon}</Text>
          <Text style={styles.rankText}>{rank.level}</Text>
        </View>

        <View style={styles.coinRow}>
          <Star size={16} color="gold" />
          <Text style={styles.coinText}>{player.rating} R-coin</Text>
        </View>

        <View style={styles.coinRow}>
          <Medal size={16} color="purple" />
          <Text style={styles.coinText}>{showMcoin ? `${player.mcoin} M-coin` : 'Unavailable'}</Text>
        </View>

        {isOwnProfile && (
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Stats</Text>
        {Object.entries(visibleStats).map(([mode, stat]) => (
          <View key={mode} style={styles.statBlock}>
            <Text style={styles.statTitle}>{mode.toUpperCase()}</Text>
            <Text style={styles.statDetails}>
              Wins: {stat.wins}  Losses: {stat.losses}  Draws: {stat.draws}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Matches</Text>
        <Text style={styles.sectionText}>Match logs will appear here.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.sectionText}>Highlight badges, ranks, and trophies.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  countryFlag: {
    fontSize: 14,
    color: 'gray',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rankIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  coinText: {
    marginLeft: 6,
  },
  editButton: {
    marginTop: 12,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  statBlock: {
    marginBottom: 8,
  },
  statTitle: {
    fontWeight: '500',
  },
  statDetails: {
    fontSize: 14,
    color: 'gray',
  },
  sectionText: {
    fontSize: 14,
    color: 'gray',
  },
});
