import React from 'react';
import { View, Text, FlatList, TouchableOpacity, useWindowDimensions, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import your screens
import NotificationScreen from "@/src/screens/notification/Notification";
import ProfileScreen from "@/src/screens/profile/ProfileScreen";
import MarketScreen from "@/src/screens/market/MarketScreen";
import WalletScreen from "@/src/screens/wallet/WalletScreen";
import { Player } from '@/src/navigation/types';

const Tab = createBottomTabNavigator();

type RootStackParamList = {
  GameLobby: { gameId: string };
};

type Game = {
  id: string;
  title: string;
  icon: string;
};

const GAMES: Game[] = [
  { id: 'chess', title: 'Chess', icon: '♟️' },
  { id: 'ayo', title: 'Ayo', icon: '🪙' },
  { id: 'whot', title: 'Whot', icon: '♠️' },
  { id: 'ludo', title: 'Ludo', icon: '🎲' },
  { id: 'droughts', title: 'Draughts', icon: '♛' },
  { id: 'cards', title: 'Cards', icon: '🃏' },
];

type GameCardProps = {
  item: Game;
  onPress: () => void;
};

const GameCard: React.FC<GameCardProps> = ({ item, onPress }) => (
  <View style={styles.card}>
    <Text style={styles.cardIcon}>{item.icon}</Text>
    <Text style={styles.cardTitle}>{item.title}</Text>
    <TouchableOpacity style={styles.playButton} onPress={onPress}>
      <Text style={styles.playButtonText}>Play</Text>
    </TouchableOpacity>
  </View>
);

// ✅ Wrap your Game grid as its own screen for the Tab
function GamesScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const numColumns = width > 600 ? 3 : 2;

  const handleGamePress = (game: Game) => {
    navigation.navigate('GameLobby', { gameId: game.id });
  };

  return (
    <LinearGradient colors={['#0b1f3a', '#27175d']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Choose Your Game</Text>
      </View>
      <FlatList
        data={GAMES}
        renderItem={({ item }) => (
          <GameCard item={item} onPress={() => handleGamePress(item)} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.grid}
      />
    </LinearGradient>
  );
}

const mockPlayer: Player = {
  name: 'Player One',
  rating: 1500,
  avatar: '',
  country: 'US',
  stats: {
    chess: { wins: 10, losses: 5, draws: 2 },
    ayo: { wins: 20, losses: 10, draws: 5 },
  },
  mcoin: 100,
};

function ProfileTabScreen() {
  return (
    <ProfileScreen
      player={mockPlayer}
      isOwnProfile={true}
      currentGameMode="chess"
    />
  );
}

// ✅ Bottom Tab Navigation including Games
export default function HomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2E86DE",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 65,
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Wallet") iconName = "wallet-outline";
          else if (route.name === "Market") iconName = "swap-horizontal-outline";
          else if (route.name === "Profile") iconName = "person-circle-outline";
          else if (route.name === "Notifications") iconName = "notifications-outline";
          else if (route.name === "Games") iconName = "game-controller-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Games" component={GamesScreen} />
      <Tab.Screen name="Profile" component={ProfileTabScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
     
      <Tab.Screen name="Notifications" component={NotificationScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  grid: {
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff20',
    borderRadius: 10,
    padding: 20,
    margin: 10,
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 10,
  },
  playButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  playButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
});
