import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameStats } from '../../navigation/types';
import { fetchGameStatsThunk, updateGameStatsThunk, fetchAllGameStatsThunk } from '../thunks/gameStatsThunks';

interface GameStatsState {
  ayoStats: GameStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: GameStatsState = {
  ayoStats: null,
  loading: false,
  error: null,
};

const gameStatsSlice = createSlice({
  name: 'gameStats',
  initialState,
  reducers: {
    clearGameStats: (state) => {
      state.ayoStats = null;
      state.error = null;
    },
    setGameStats: (state, action: PayloadAction<GameStats>) => {
      state.ayoStats = action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch game stats
      .addCase(fetchGameStatsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.ayoStats = action.payload;
      })
      .addCase(fetchGameStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update game stats
      .addCase(updateGameStatsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGameStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.ayoStats = action.payload;
      })
      .addCase(updateGameStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch all game stats
      .addCase(fetchAllGameStatsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllGameStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Find ayo stats from all games
        state.ayoStats = action.payload.allGameStats.find(stats => stats.gameId === 'ayo') || null;
      })
      .addCase(fetchAllGameStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearGameStats, setGameStats } = gameStatsSlice.actions;
export default gameStatsSlice.reducer;
