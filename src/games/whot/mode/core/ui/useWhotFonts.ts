import { useFont } from '@shopify/react-native-skia';
import type { SkFont } from '@shopify/react-native-skia';

export const useWhotFonts = () => {
  // Use system font instead of custom font to avoid asset loading issues
  const font = useFont(null, 20);
  const whotFont = useFont(null, 30);
  
  return {
    font,
    whotFont,
    areLoaded: !!font && !!whotFont
  };
};