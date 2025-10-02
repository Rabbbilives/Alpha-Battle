import React from 'react';
import {
  Canvas,
  RoundedRect,
  Text,
  useFont,
  Skia,
  Path,
  Group,
  Circle,
  Rect,
} from '@shopify/react-native-skia';

// Define the possible suits (UNCHANGED)
export type CardSuit = 'circle' | 'triangle' | 'cross' | 'square' | 'star' | 'whot';

interface WhotCardProps {
  suit: CardSuit;
  number: number;
  width?: number;
  height?: number;
}

// A helper component to render the central shape based on the suit (UNCHANGED)
const RenderShape = ({
  suit,
  cx,
  cy,
  size,
}: {
  suit: CardSuit;
  cx: number;
  cy: number;
  size: number;
}) => {
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
          {/* Horizontal bar */}
          <Rect x={cx - size / 2} y={cy - barWidth / 2} width={size} height={barWidth} />
          {/* Vertical bar */}
          <Rect x={cx - barWidth / 2} y={cy - size / 2} width={barWidth} height={size} />
        </Group>
      );
    }
    case 'square':
      return (
        <Rect
          x={cx - size / 2}
          y={cy - size / 2}
          width={size}
          height={size}
          color={suitColor}
        />
      );
    case 'star': {
      const starPath = Skia.Path.Make();
      const points = 5;
      const outerRadius = size / 2;
      const innerRadius = size / 4;
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) {
          starPath.moveTo(x, y);
        } else {
          starPath.lineTo(x, y);
        }
      }
      starPath.close();
      return <Path path={starPath} color={suitColor} />;
    }
    default:
      return null;
  }
};

export const WhotCard = ({ suit, number, width = 100, height = 150 }: WhotCardProps) => {
  const font = useFont(require('@/src/assets/fonts/SpaceMono-Regular.ttf'), 20);
  const whotFont = useFont(require('@/src/assets/fonts/SpaceMono-Regular.ttf'), 30);

  if (!font || !whotFont) {
    return null;
  }

  const cornerRadius = 10;
  const padding = 10;
  const cardStr = String(number);
  const textWidth = font.getTextWidth(cardStr);

  const cx = width / 2;
  const cy = height / 2;
  const shapeSize = width * 0.5;
  const textColor = '#A22323';
  
  // --- MODIFIED: Adjustments for corner element positioning ---

  // 1. Reduced the top margin for the number by changing its Y-coordinate.
  // Original was `padding + font.getSize()` (e.g., 10 + 20 = 30).
  const numberY = padding + 13; // Now the baseline is higher up (closer to the top).

  // 2. Defined the properties for the small shape.
  const smallShapeSize = 14;
  const smallShapeCX = padding + textWidth / 2; // Horizontal center remains the same.

  // 3. Reduced the gap between the number and the small shape below it.
  const numberToShapeGap = 4; // Was effectively 5 in the previous logic.

  // 4. Calculated the new vertical center for the small shape based on the changes above.
  const smallShapeCY = numberY + numberToShapeGap + (smallShapeSize / 2);

  return (
    <Canvas style={{ width, height, margin: 5 }}>
      {/* Card background and border (UNCHANGED) */}
      <RoundedRect x={0} y={0} width={width} height={height} r={cornerRadius} color="#FFFFFF" />
      <RoundedRect
        x={1}
        y={1}
        width={width - 2}
        height={height - 2}
        r={cornerRadius}
        color="#A22323"
        style="stroke"
        strokeWidth={2}
      />

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
          {/* --- TOP-LEFT CORNER (MODIFIED POSITIONS) --- */}
          <Text x={padding} y={numberY} text={cardStr} font={font} color={textColor} />
          <RenderShape suit={suit} cx={smallShapeCX} cy={smallShapeCY} size={smallShapeSize} />

          {/* --- BOTTOM-RIGHT CORNER (ROTATED) --- */}
          <Group origin={{ x: width / 2, y: height / 2 }} transform={[{ rotate: Math.PI }]}>
            <Text x={padding} y={numberY} text={cardStr} font={font} color={textColor} />
            <RenderShape suit={suit} cx={smallShapeCX} cy={smallShapeCY} size={smallShapeSize} />
          </Group>

          {/* Central Shape (UNCHANGED) */}
          <RenderShape suit={suit} cx={cx} cy={cy} size={shapeSize} />
        </>
      )}
    </Canvas>
  );
};