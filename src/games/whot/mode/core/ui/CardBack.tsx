import React from 'react';
import { Canvas, RoundedRect, Text, useFont, Group } from '@shopify/react-native-skia';

interface CardBackProps {
  width?: number;
  height?: number;
}

export const CardBack = ({ width = 100, height = 150 }: CardBackProps) => {
  const font = useFont(require('../../../../../assets/fonts/SpaceMono-Regular.ttf'), 20); // Font for "Whot" text
  const smallFont = useFont(require('../../../../../assets/fonts/SpaceMono-Regular.ttf'), 12); // Smaller font for "Whot" on back

  if (!font || !smallFont) {
    return null;
  }

  const cornerRadius = 10;
  const textColor = '#FDFBF6'; // Light text color for contrast on dark background
  const backgroundColor = '#A22323'; // Dark red background as per reference

  // Calculate center for main WHOT text
  const mainWhotText = 'WHOT';
  const mainWhotTextWidth = font.getTextWidth(mainWhotText);
  const mainWhotX = (width - mainWhotTextWidth) / 2;
  const mainWhotY = (height / 2) + (font.getSize() / 2);

  // Calculate center for small rotated "Whot" text
  const smallWhotText = 'Whot';
  const smallWhotTextWidth = smallFont.getTextWidth(smallWhotText);

  return (
    <Canvas style={{ width, height, margin: 5 }}>
      {/* Card Background (dark red) */}
      <RoundedRect x={0} y={0} width={width} height={height} r={cornerRadius} color={backgroundColor} />
      {/* Card Border (light color for contrast) */}
      <RoundedRect
        x={1}
        y={1}
        width={width - 2}
        height={height - 2}
        r={cornerRadius}
        color="#FDFBF6"
        style="stroke"
        strokeWidth={2}
      />

      {/* Main "WHOT" text in the center */}
      <Text x={mainWhotX} y={mainWhotY} text={mainWhotText} font={font} color={textColor} />

      {/* Top-left small rotated "Whot" text */}
      <Group
        origin={{ x: width * 0.25, y: height * 0.25 }}
        transform={[{ rotate: -Math.PI / 4 }]} // Rotate 45 degrees counter-clockwise
      >
        <Text
          x={width * 0.25 - smallWhotTextWidth / 2} // Adjust x to be centered on its new origin
          y={height * 0.25 + smallFont.getSize() / 2} // Adjust y to be centered on its new origin
          text={smallWhotText}
          font={smallFont}
          color={textColor}
        />
      </Group>

      {/* Bottom-right small rotated "Whot" text */}
      <Group
        origin={{ x: width * 0.75, y: height * 0.75 }}
        transform={[{ rotate: (3 * Math.PI) / 4 }]} // Rotate 135 degrees clockwise
      >
        <Text
          x={width * 0.75 - smallWhotTextWidth / 2}
          y={height * 0.75 + smallFont.getSize() / 2}
          text={smallWhotText}
          font={smallFont}
          color={textColor}
        />
      </Group>
    </Canvas>
  );
};