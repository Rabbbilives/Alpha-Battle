// src/store/thunks/authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api/authService';
import { RootState } from '../index'; // Import RootState

// Thunk for user sign-in
export const signInUser = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.signIn(email, password);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ --- ADD THIS NEW THUNK ---
export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({ name, email, password }: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.signUp(name, email, password);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
// -----------------------------

// Thunk for fetching the user profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token;
      if (!token) {
        return rejectWithValue('No token found');
      }
      const profile = await api.getProfile(token);
      return profile;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);