export type CardSuit = 'circle' | 'triangle' | 'cross' | 'square' | 'star' | 'whot';

export interface Card {
  id: string;
  suit: CardSuit;
  number: number;
}

export interface AnimatedCard extends Card {
  x: import('react-native-reanimated').SharedValue<number>;
  y: import('react-native-reanimated').SharedValue<number>;
  rotate: import('react-native-reanimated').SharedValue<number>;
  isFaceUp: import('react-native-reanimated').SharedValue<boolean>;
}

export interface WhotCardProps {
  card: AnimatedCard;
  width: number;
  height: number;
}

export interface WhotCardFaceProps {
  suit: CardSuit;
  number: number;
  width: number;
  height: number;
  font: import('@shopify/react-native-skia').SkFont | null;
  whotFont: import('@shopify/react-native-skia').SkFont | null;
}

export interface WhotCardBackProps {
  width: number;
  height: number;
}