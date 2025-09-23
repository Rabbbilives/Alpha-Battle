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
  gameStats?: Array<{
    gameId: string;
    wins: number;
    losses: number;
    draws: number;
    rating: number;
  }>;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

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