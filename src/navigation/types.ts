
// src/navigation/types.ts
export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  GameLobby: { roomId?: string } | undefined;
  GameModeScreen: { mode?: string } | undefined;

  // Wallet
  // Wallet
  Wallet: undefined;
  TransactionHistory: undefined;
  Market: { mode?: "buy" | "sell" } | undefined;
};

export type Player = {
  [x: string]: any;
  name: string;
  rating: number;
  avatar: string;
  country: string;
  stats: Record<string, { wins: number; losses: number; draws: number }>;
  mcoin?: number;
};
