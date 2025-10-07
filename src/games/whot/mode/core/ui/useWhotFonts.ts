// File: Alpha-Battle/src/games/whot/mode/core/ui/useWhotFonts.ts
import { useFont } from '@shopify/react-native-skia';
import type { SkFont } from '@shopify/react-native-skia';

export const useWhotFonts = () => {
  // Use system font instead of custom font to avoid asset loading issues
  const font = useFont(null, 20);
  const whotFont = useFont(null, 30);
  
  // Consider fonts loaded if they exist (even if null, which means system font)
  const areLoaded = font !== undefined && whotFont !== undefined;
  
  return {
    font,
    whotFont,
    areLoaded
  };
};