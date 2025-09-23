// src/screens/profile/ProfileScreen.tsx
import React, { useEffect } from 'react';
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
import { Star, Medal, ArrowLeft, User } from 'lucide-react-native';

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
  // Get all necessary state directly from the Redux store.
  // This simplifies the component and prevents race conditions.
  const { token } = useAppSelector((state) => state.auth);
  const { profile: reduxProfile, loading: userLoading, error: userError } = useAppSelector((state) => state.user);

  // This simple effect handles fetching data after an app restart.
  useEffect(() => {
    // If we have a token (from login or storage) but no profile data yet, fetch it.
    if (isOwnProfile && token && !reduxProfile) {
      dispatch(fetchUserProfile());
    }
  }, [isOwnProfile, token, reduxProfile, dispatch]);

  // Determine which user to display: one from the route params (for other users) or the one from Redux.
  const playerToShow = !isOwnProfile ? route.params?.player : reduxProfile;

  // --- RENDER LOGIC ---

  // 1. Show a loading spinner if the user profile is being fetched.
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

  // 2. Show an error message if the fetch failed.
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

  // 3. If viewing your own profile and there's no token, prompt to sign in.
  if (isOwnProfile && !token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <User size={64} color="gray" />
          <Text style={styles.title}>Authentication Required</Text>
          <Text style={styles.subtitle}>Please sign in to view your profile</Text>
          <TouchableOpacity
            style={styles.button}
            // ✅ This uses the corrected nested navigation
            onPress={() => navigation.navigate('Auth', { screen: 'SignIn' })}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // 4. If there's no player data to show for any other reason.
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
  // Normalize the data from the playerToShow object
  const avatar = playerToShow.avatar ?? null;
  const name = playerToShow.name ?? 'Unknown Player';
  const country = playerToShow.country ?? '';
  const gameStats = playerToShow.gameStats ?? [];
  const totalRating = gameStats.length > 0 ? gameStats.reduce((sum: number, stat: any) => sum + (stat.rating || 1000), 0) / gameStats.length : 1000;
  const rank = getRankFromRating(totalRating);
  const mcoin = playerToShow.mcoin ?? 0;
  const showMCoin = rank && ['Warrior', 'Master', 'Alpha'].includes(rank?.level ?? '');

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

          <View style={styles.coinRow}>
            {showMCoin && (
              <>
                <Medal size={16} color="purple" />
                <Text style={styles.coinText}>{mcoin} M-coin</Text>
              </>
            )}
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statTitle}>Game Stats</Text>
            {gameStats.length === 0 ? (
              <Text style={styles.statDetails}>No stats available</Text>
            ) : (
              gameStats.map((s: any) => (
                <View key={s.gameId} style={{ marginTop: 8, width: '100%' }}>
                  <Text style={{ fontWeight: '600', textAlign: 'center' }}>{String(s.gameId).toUpperCase()}</Text>
                  <Text style={styles.statDetails}>
                    W: {s.wins ?? 0} | L: {s.losses ?? 0} | D: {s.draws ?? 0} | Rating: {s.rating ?? 1000}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
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
  coinRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 12
  },
  coinText: { 
    marginLeft: 6,
    fontWeight: '500',
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
  statDetails: { 
    color: '#6B7280', 
    marginTop: 4,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});