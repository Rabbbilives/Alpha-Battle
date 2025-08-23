// src/store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";


import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";

const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user", "auth"], // only persist these slices
};
  
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
