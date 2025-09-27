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

// Define the possible suits
export type CardSuit = 'circle' | 'triangle' | 'cross' | 'square' | 'star' | 'whot';

interface WhotCardProps {
  suit: CardSuit;
  number: number;
  width?: number;
  height?: number;
}

// A helper component to render the central shape based on the suit
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
  // All suit colors are now dark red as per the reference image
  const suitColor = '#A22323';

  switch (suit) {
    case 'circle':
      return <Circle cx={cx} cy={cy} r={size / 2} color={suitColor} />;

    case 'triangle': {
      const path = Skia.Path.Make();
      const h = (size * Math.sqrt(3)) / 2; // Height of equilateral triangle
      path.moveTo(cx, cy - h / 2);
      path.lineTo(cx - size / 2, cy + h / 2);
      path.lineTo(cx + size / 2, cy + h / 2);
      path.close();
      return <Path path={path} color={suitColor} />;
    }

    case 'cross': {
      const barWidth = size / 3.5;
      return (
        <Group color={suitColor}>
          <Rect x={cx - size / 2} y={cy - barWidth / 2} width={size} height={barWidth} />
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
        const innerRadius = size / 4; // Adjust for pointiness
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / points - Math.PI / 2; // Start from top
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          if (i === 0) {
            starPath.moveTo(x, y);
          } else {
            starPath.lineTo(x, y);
          }
        }
        starPath.close();
        return <Path path={starPath} color={suitColor} />; // Stars now also match the suitColor
      }

    default:
      return null;
  }
};

export const WhotCard = ({ suit, number, width = 100, height = 150 }: WhotCardProps) => {
  // Make sure to provide a path to your font file
  const font = useFont(require('../assets/fonts/HelveticaBold.ttf'), 20); // Larger font for numbers
  const whotFont = useFont(require('../assets/fonts/HelveticaBold.ttf'), 30); // Larger font for WHOT

  if (!font || !whotFont) {
    return null; // Font is loading
  }

  const cornerRadius = 10;
  const padding = 12; // Increased padding for numbers
  const cardStr = String(number);

  // Center coordinates and size for the main shape
  const cx = width / 2;
  const cy = height / 2;
  const shapeSize = width * 0.5;

  const textColor = '#A22323'; // Dark red for numbers as per the reference image

  return (
    <Canvas style={{ width, height, margin: 5 }}>
      {/* Card Background (white) */}
      <RoundedRect x={0} y={0} width={width} height={height} r={cornerRadius} color="#FFFFFF" />
      {/* Card Border (dark red) */}
      <RoundedRect
        x={1}
        y={1}
        width={width - 2}
        height={height - 2}
        r={cornerRadius}
        color="#A22323" // Dark red border
        style="stroke"
        strokeWidth={2}
      />

      {/* Render the central content */}
      {suit === 'whot' ? (
        <Text
          x={cx - whotFont.getTextWidth('WHOT?') / 2}
          y={cy + whotFont.getSize() / 2} // Vertically center WHOT text
          text="WHOT?"
          font={whotFont}
          color="#A22323" // Dark red for WHOT text
        />
      ) : (
        <>
          {/* Top-left number */}
          <Text x={padding} y={padding + font.getSize() * 0.7} text={cardStr} font={font} color={textColor} />
          {/* Bottom-right number (rotated) */}
          <Group
            origin={{ x: width / 2, y: height / 2 }} // Rotate around card center
            transform={[{ rotate: Math.PI }]}
          >
            <Text
              x={width - padding - font.getTextWidth(cardStr)} // Position from right edge
              y={height - padding - font.getSize() * 0.2} // Position from bottom edge
              text={cardStr}
              font={font}
              color={textColor}
            />
          </Group>
          <RenderShape suit={suit} cx={cx} cy={cy} size={shapeSize} />
        </>
      )}
    </Canvas>
  );
};