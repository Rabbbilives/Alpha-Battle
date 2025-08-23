export const getRankFromRating = (rating: number) => {
  if (rating >= 2500) {
    return { level: 'Alpha', icon: '👑' };
  }
  if (rating >= 2000) {
    return { level: 'Master', icon: '🏆' };
  }
  if (rating >= 1500) {
    return { level: 'Warrior', icon: '⚔️' };
  }
  if (rating >= 1000) {
    return { level: 'Knight', icon: '🛡️' };
  }
  return { level: 'Beginner', icon: '🌱' };
};
