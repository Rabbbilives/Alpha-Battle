// File: Alpha-Battle/src/games/whot/mode/core/ui/useWhotFonts.ts
import { useFont } from '@shopify/react-native-skia';
import type { SkFont } from '@shopify/react-native-skia';

export const useWhotFonts = () => {

  const font = useFont(null, 20);
  const whotFont = useFont(null, 30);

  const areLoaded = font !== undefined && whotFont !== undefined;
  
  return {
    font,
    whotFont,
    areLoaded
  };
};