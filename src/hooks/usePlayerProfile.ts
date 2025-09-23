  // src/hooks/usePlayerProfile.ts

import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const usePlayerProfile = () => {
  const profile = useSelector((state: RootState) => state.user.profile);
  const name = useSelector((state: RootState) => state.user.name);
  const mCoin = useSelector((state: RootState) => state.user.mCoin);
  const rCoin = useSelector((state: RootState) => state.user.rCoin);
  const rank = useSelector((state: RootState) => state.user.rank);
  const loading = useSelector((state: RootState) => state.user.loading);
  const error = useSelector((state: RootState) => state.user.error);

  return {
    profile,
    name,
    mCoin,
    rCoin,
    rank,
    loading,
    error,
    data: profile || {
      name: name || 'Guest',
      mCoin: mCoin || 0,
      rCoin: rCoin || 0,
      rank: rank || 'Rookie',
    }
  };
};
