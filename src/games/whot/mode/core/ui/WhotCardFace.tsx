import React from 'react';
import { Group, Skia, RoundedRect, Text, Path, Circle, Rect } from '@shopify/react-native-skia';
import type { SkFont } from '@shopify/react-native-skia';
import { type CardSuit } from './WhotCardTypes';

interface RenderShapeProps {
  suit: CardSuit;
  cx: number;
  cy: number;
  size: number;
}

const RenderShape = ({ suit, cx, cy, size }: RenderShapeProps) => {
  const suitColor = '#A22323';
  switch (suit) {
    case 'circle': 
      return <Circle cx={cx} cy={cy} r={size / 2} color={suitColor} />;
    case 'triangle': {
      const path = Skia.Path.Make();
      const h = (size * Math.sqrt(3)) / 2;
      path.moveTo(cx, cy - h / 2);
      path.lineTo(cx - size / 2, cy + h / 2);
      path.lineTo(cx + size / 2, cy + h / 2);
      path.close();
      return <Path path={path} color={suitColor} />;
    }
    case 'cross': {
      const barWidth = size / 2.03;
      return (
        <Group color={suitColor}>
          <Rect x={cx - size / 2} y={cy - barWidth / 2} width={size} height={barWidth} />
          <Rect x={cx - barWidth / 2} y={cy - size / 2} width={barWidth} height={size} />
        </Group>
      );
    }
    case 'square': 
      return <Rect x={cx - size / 2} y={cy - size / 2} width={size} height={size} color={suitColor} />;
    case 'star': {
      const path = Skia.Path.Make();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? size / 2 : size / 4;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.close();
      return <Path path={path} color={suitColor} />;
    }
    default: 
      return null;
  }
};

export interface WhotCardFaceProps {
  suit: CardSuit;
  number: number;
  width: number;
  height: number;
  font: SkFont | null;
  whotFont: SkFont | null;
}

export const WhotCardFace = ({ suit, number, width, height, font, whotFont }: WhotCardFaceProps) => {
  if (!font || !whotFont) return null;

  const cornerRadius = 10;
  const padding = 10;
  const cardStr = String(number);
  const textWidth = font.getTextWidth(cardStr);
  const cx = width / 2;
  const cy = height / 2;
  const numberY = padding + 13;
  const smallShapeSize = 14;
  const smallShapeCX = padding + textWidth / 2;
  const smallShapeCY = numberY + 4 + (smallShapeSize / 2);

  return (
    <Group>
      <RoundedRect x={0} y={0} width={width} height={height} r={cornerRadius} color="#FFFFFF" />
      <RoundedRect x={1} y={1} width={width - 2} height={height - 2} r={cornerRadius} color="#A22323" style="stroke" strokeWidth={2} />
      
      {suit === 'whot' ? (
        <Text 
          x={cx - whotFont.getTextWidth('WHOT?') / 2} 
          y={cy + whotFont.getSize() / 2} 
          text="WHOT?" 
          font={whotFont} 
          color="#A22323" 
        />
      ) : (
        <>
          <Text x={padding} y={numberY} text={cardStr} font={font} color="#A22323" />
          <RenderShape suit={suit} cx={smallShapeCX} cy={smallShapeCY} size={smallShapeSize} />
          
          <Group origin={{ x: width / 2, y: height / 2 }} transform={[{ rotate: Math.PI }]}>
            <Text x={padding} y={numberY} text={cardStr} font={font} color="#A22323" />
            <RenderShape suit={suit} cx={smallShapeCX} cy={smallShapeCY} size={smallShapeSize} />
          </Group>
          
          <RenderShape suit={suit} cx={cx} cy={cy} size={width * 0.5} />
        </>
      )}
    </Group>
  );
};