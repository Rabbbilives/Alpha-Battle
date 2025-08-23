import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const usePlayerProfile = () => {
  const profile = useSelector((state: RootState) => state.user.profile);
  return profile || {};
};
