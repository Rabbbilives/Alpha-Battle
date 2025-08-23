
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from "@/src/navigation/types"
import { Provider } from "react-redux";
import { store, persistor } from "@/src/store";
import SplashScreen from '@/src/screens/game/splashscreen';
import HomeScreen from '@/src/screens/game/HomeScreen';
import GameLobby from '@/src/screens/game/GameLobbyScreen';
import GameModeScreen from '@/src/screens/game/GameModeScreen';
import { PersistGate } from "redux-persist/integration/react";
import WalletScreen from '@/src/screens/wallet/WalletScreen';
import TransactionHistoryScreen from '@/src/screens/wallet/TransactionHistoryScreen';
import { WalletProvider } from '@/src/screens/wallet/WalletContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}> 
    <WalletProvider>
    <Stack.Navigator initialRouteName="Splash">

        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Alpha Battle Games', headerShown: false }}
        />
        <Stack.Screen
          name="GameLobby"
          component={GameLobby}
          options={{ title: 'Game Lobby' }}
        />
        <Stack.Screen
          name="GameModeScreen"
          component={GameModeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Wallet"
          component={WalletScreen}
          options={{ title: 'My Wallet' }}
        />
        <Stack.Screen
          name="TransactionHistory"
          component={TransactionHistoryScreen}
          options={{ title: 'Transaction History' }}
        />
      </Stack.Navigator>
      </WalletProvider>
      </PersistGate>
      </Provider>
  );
}
