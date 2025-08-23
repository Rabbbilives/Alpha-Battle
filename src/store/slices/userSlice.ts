// src/store/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  profile: any;
  name: string | null;
  mCoin: number;
  rCoin: number;
  rank: string | null;
};

const initialState: UserState = {
  name: null,
  mCoin: 0,
  rCoin: 0,
  rank: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ name: string; rank: string }>) => {
      state.name = action.payload.name;
      state.rank = action.payload.rank;
    },
    updateMCoin: (state, action: PayloadAction<number>) => {
      state.mCoin += action.payload;
    },
    updateRCoin: (state, action: PayloadAction<number>) => {
      state.rCoin += action.payload;
    },
    resetUser: () => initialState,
  },
});

export const { setUser, updateMCoin, updateRCoin, resetUser } =
  userSlice.actions;
export default userSlice.reducer;
