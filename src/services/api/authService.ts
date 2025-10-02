// src/services/apiService.ts
import axios from 'axios';

// --- IMPORTANT: Replace with your actual backend URL ---
const API_BASE_URL = "https://ap-backend-2crm.onrender.com/api";

// --- TypeScript Interfaces for API data ---
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  country?: string;
  mcoin?: number;
  rating?: number; // Added top-level rating
  gameStats?: Array<{
    gameId: string;
    wins: number;
    losses: number;
    draws: number;
    rating: number;
  }>;
}

export interface GameStats {
  id: string;
  gameId: string;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// New functions to be added to authService.ts
export const fetchGameStats = async (token: string, gameId: string): Promise<GameStats> => {
  try {
    const response = await api.get<{ gameStats: GameStats }>(`/auth/game-stats/${gameId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.gameStats;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch game statistics.");
  }
};

export const updateGameStats = async (
  token: string,
  gameId: string,
  stats: Partial<{ wins: number; losses: number; draws: number; rating: number }>
): Promise<GameStats> => {
  try {
    const response = await api.put<{ gameStats: GameStats }>(`/auth/game-stats/${gameId}`, stats, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.gameStats;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update game statistics.");
  }
};

export const fetchAllGameStats = async (token: string): Promise<{ allGameStats: GameStats[] }> => {
  try {
    const response = await api.get<{ allGameStats: GameStats[] }>('/auth/game-stats/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch all game statistics.");
  }
};


// --- Create a configured Axios instance ---
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- API Functions ---
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", { email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Sign in failed. Please check your credentials.");
  }
};

// ✅ --- ADD THIS NEW FUNCTION ---
export const signUp = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/register", { name, email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Sign up failed. Please try again.");
  }
};
// ------------------------------

export const getProfile = async (token: string): Promise<UserProfile> => {
  try {
    const response = await api.get<{ user: UserProfile }>("/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch profile. Your session may have expired.");
  }
};