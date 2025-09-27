// src/screens/profile/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Button,
} from 'react-native';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '@/src/navigation/types';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchUserProfile } from '@/src/store/thunks/authThunks';
import { getFlagEmoji } from '../../utils/flags';
import { getRankFromRating } from '../../utils/rank';
import { Medal, ArrowLeft, User } from 'lucide-react-native';
import { getGameStats } from '@/src/services/api/authService';

type ProfileScreenProps = {
  isOwnProfile: boolean;
};

// Define the navigation and route prop types for this screen
type ProfileScreenNavigationProp = NavigationProp<RootStackParamList>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ isOwnProfile = true }: ProfileScreenProps) {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileScreenRouteProp>();
  const dispatch = useAppDispatch();

  // --- SINGLE SOURCE OF TRUTH: REDUX ---
  const { token } = useAppSelector((state) => state.auth);
  const { profile: reduxProfile, loading: userLoading, error: userError } = useAppSelector((state) => state.user);

  // New state to manage the selected game for detailed stats
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<any[]>([]);
  const [gameStatsLoading, setGameStatsLoading] = useState(false);

  useEffect(() => {
    if (isOwnProfile && token && !reduxProfile) {
      dispatch(fetchUserProfile());
    }
  }, [isOwnProfile, token, reduxProfile, dispatch]);

  const playerToShow = !isOwnProfile ? (route.params as { player: any })?.player : reduxProfile;

  useEffect(() => {
    const fetchGameStats = async () => {
      if (isOwnProfile && token) {
        setGameStatsLoading(true);
        try {
          const DEFAULT_GAMES = [
            { id: 'chess', title: 'Chess' },
            { id: 'ayo', title: 'Ayo' },
            { id: 'whot', title: 'Whot' },
            { id: 'ludo', title: 'Ludo' },
            { id: 'draughts', title: 'Draughts' },
          ];

          const allStats = await Promise.all(
            DEFAULT_GAMES.map(async (game) => {
              try {
                const stat = await getGameStats(game.id, token);
                return stat;
              } catch (error) {
                return {
                  gameId: game.id,
                  title: game.title,
                  wins: 0,
                  losses: 0,
                  draws: 0,
                  rating: 1000,
                  hasExistingStats: false
                };
              }
            })
          );
          setGameStats(allStats);
          if (allStats.length > 0) {
            // Automatically select the first game to show stats for on load
            setSelectedGameId(allStats[0].gameId);
          }
        } catch (error) {
          console.error('Failed to fetch game stats:', error);
          if (playerToShow && playerToShow.gameStats) {
            setGameStats(playerToShow.gameStats);
            if (playerToShow.gameStats.length > 0) {
              setSelectedGameId(playerToShow.gameStats[0].gameId);
            }
          }
        } finally {
          setGameStatsLoading(false);
        }
      } else if (playerToShow && playerToShow.gameStats) {
        setGameStats(playerToShow.gameStats);
        if (playerToShow.gameStats.length > 0) {
          setSelectedGameId(playerToShow.gameStats[0].gameId);
        }
      }
    };

    fetchGameStats();
  }, [isOwnProfile, playerToShow, token]);

  // --- RENDER LOGIC ---
  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (userError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {userError}</Text>
          <Button title="Retry" onPress={() => dispatch(fetchUserProfile())} />
        </View>
      </SafeAreaView>
    );
  }

  if (isOwnProfile && !token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <User size={64} color="gray" />
          <Text style={styles.title}>Authentication Required</Text>
          <Text style={styles.subtitle}>Please sign in to view your profile</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Auth', { screen: 'SignIn' } as any)}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!playerToShow) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text>No profile data available.</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // --- SUCCESS: RENDER THE PROFILE ---
  const avatar = playerToShow.avatar ?? null;
  const name = playerToShow.name ?? 'Unknown Player';
  const country = playerToShow.country ?? '';
  const totalRating = gameStats.length > 0 ? gameStats.reduce((sum: number, stat: any) => sum + (stat.rating || 1000), 0) / gameStats.length : 1000;
  const rank = getRankFromRating(totalRating);
  const mcoin = playerToShow.mcoin ?? 0;
  const showMCoin = rank && ['Warrior', 'Master', 'Alpha'].includes(rank?.level ?? '');

  const statsToRender = gameStats.length > 0 ? gameStats : (playerToShow?.gameStats || []);
  const selectedGame = statsToRender.find(stat => stat.gameId === selectedGameId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <User size={48} color="gray" />
            </View>
          )}
          <Text style={styles.playerName}>{name}</Text>
          <Text style={styles.countryFlag}>{getFlagEmoji(country)}</Text>

          <View style={styles.rankRow}>
            <Text style={styles.rankIcon}>{rank?.icon ?? '🌱'}</Text>
            <Text style={styles.rankText}>{rank?.level ?? 'Rookie'}</Text>
          </View>
        </View>

        {/* --- R-Coin and M-Coin --- */}
        <View style={styles.coinSection}>
          {/* Display R-coin for the selected game */}
          {selectedGame && (
            <View style={styles.rCoinBlock}>
              <Text style={styles.coinHeader}>R-Coin: {selectedGame.title}</Text>
              <Text style={styles.coinValue}>{selectedGame.rating ?? 1000}</Text>
            </View>
          )}
          {/* Display M-Coin if available */}
          {showMCoin && (
            <View style={styles.mCoinBlock}>
              <Medal size={24} color="#6B46C1" />
              <Text style={styles.coinHeader}>M-Coin</Text>
              <Text style={styles.coinValue}>{mcoin}</Text>
            </View>
          )}
        </View>

        {/* --- Tappable Game Stats List --- */}
        <View style={styles.gameListContainer}>
          <Text style={styles.gameListTitle}>Games</Text>
          <ScrollView horizontal style={styles.gamesScrollView} showsHorizontalScrollIndicator={false}>
            {gameStatsLoading ? (
              <ActivityIndicator size="small" color="#666" style={{ paddingHorizontal: 20 }} />
            ) : statsToRender.length === 0 ? (
              <Text style={styles.noGamesText}>No games played yet</Text>
            ) : (
              statsToRender.map((s: any) => (
                <TouchableOpacity
                  key={s.gameId}
                  style={[
                    styles.gameChip,
                    selectedGameId === s.gameId && styles.selectedGameChip
                  ]}
                  onPress={() => setSelectedGameId(s.gameId)}
                >
                  <Text style={[
                    styles.gameChipText,
                    selectedGameId === s.gameId && styles.selectedGameChipText
                  ]}>
                    {s.title}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* --- Detailed Stats for Selected Game --- */}
        {selectedGame && (
          <View style={styles.statBlock}>
            <Text style={styles.statTitle}>{selectedGame.title} Stats</Text>
            <View style={styles.detailedStatsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Wins</Text>
                <Text style={styles.statValue}>{selectedGame.wins ?? 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Losses</Text>
                <Text style={styles.statValue}>{selectedGame.losses ?? 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Draws</Text>
                <Text style={styles.statValue}>{selectedGame.draws ?? 0}</Text>
              </View>
            </View>
            <View style={styles.ratingBlock}>
              <Text style={styles.statLabel}>R-Coin</Text>
              <Text style={styles.statValue}>{selectedGame.rating ?? 1000}</Text>
            </View>
          </View>
        )}
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollView: {
    flex: 1,
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  },
  errorText: { 
    color: 'red',
    textAlign: 'center',
    marginBottom: 20 
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2E86DE',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  headerText: { 
    marginLeft: 12, 
    fontSize: 20, 
    fontWeight: '700' 
  },
  profileSection: { 
    alignItems: 'center',
    padding: 16 
  },
  avatar: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  avatarPlaceholder: { 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  playerName: { 
    fontSize: 22, 
    fontWeight: 'bold',
  },
  countryFlag: { 
    marginTop: 4,
    fontSize: 18,
  },
  rankRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 6, 
    paddingHorizontal: 12,
    borderRadius: 20, 
    marginTop: 12, 
    backgroundColor: '#F3F4F6' 
  },
  rankIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  rankText: { 
    fontWeight: '600',
    fontSize: 16,
  },
  coinSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  rCoinBlock: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    marginRight: 16,
    minWidth: 120,
  },
  mCoinBlock: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    minWidth: 120,
  },
  coinHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  coinValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  gameListContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  gameListTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  gamesScrollView: {
    flexDirection: 'row',
  },
  gameChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  selectedGameChip: {
    backgroundColor: '#2E86DE',
  },
  gameChipText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  selectedGameChipText: {
    color: '#fff',
  },
  statBlock: { 
    marginTop: 24, 
    width: '100%', 
    padding: 16, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 10,
    alignItems: 'center',
  },
  statTitle: { 
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  detailedStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  ratingBlock: {
    marginTop: 16,
    alignItems: 'center',
  },
  noGamesText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});