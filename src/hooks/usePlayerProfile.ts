// src/hooks/usePlayerProfile.ts

import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';

/**
 * A focused hook to get the current player's profile formatted for game components.
 * It also returns the loading status from the user state.
 */
export const usePlayerProfile = () => {
  // Select both the profile data AND the loading status
  const { profile, loading } = useAppSelector((state) => state.user);

  const playerProfile = useMemo(() => {
    const ayoStats = profile?.gameStats?.find(
      (stat: any) => stat.gameId === 'ayo'
    );

    return {
      name: profile?.name ?? 'Player',
      country: profile?.country ?? 'NG',
      avatar: profile?.avatar ?? null,
      rating: ayoStats?.rating ?? 100,
      isAI: false,
    };
  }, [profile]);

  // Return both the processed profile data and the loading flag
  return { ...playerProfile, isLoading: loading };
};