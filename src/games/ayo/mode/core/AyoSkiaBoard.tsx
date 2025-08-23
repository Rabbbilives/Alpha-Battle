"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, View, Text, Platform } from "react-native";
import { Canvas, Circle, Group } from "@shopify/react-native-skia";
import { useSharedValue, withTiming, Easing, useDerivedValue } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const BOARD_PADDING = 20;
const PIT_RADIUS = 40;
const PIT_SPACING = 20;
const SEED_RADIUS = 6;

interface AyoSkiaBoardProps {
  board: number[];
  animatingPath?: number[];
  onPitPress: (pitIndex: number) => void;
  onAnimationEnd?: () => void;
}

export const AyoSkiaBoard: React.FC<AyoSkiaBoardProps> = ({
  board,
  animatingPath,
  onPitPress,
  onAnimationEnd,
}) => {
  // Animated seed position (demo: one seed moving along the path)
  const animX = useSharedValue(0);
  const animY = useSharedValue(0);

  // Precompute pit centers (top row mirrored right->left)
  const pitPositions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const row = i < 6 ? 0 : 1;
      const col = row === 0 ? 5 - i : i - 6;
      return {
        index: i,
        x: BOARD_PADDING + PIT_RADIUS + col * (2 * PIT_RADIUS + PIT_SPACING),
        y: BOARD_PADDING + PIT_RADIUS + row * (2 * PIT_RADIUS + PIT_SPACING),
        r: PIT_RADIUS,
      };
    });
  }, []);

  // Animate along the provided path
  useEffect(() => {
    if (!animatingPath || animatingPath.length === 0) return;
    let i = 0;
    const step = () => {
      if (i >= animatingPath.length) {
        onAnimationEnd?.();
        return;
      }
      const pitIdx = animatingPath[i];
      const { x, y } = pitPositions[pitIdx];

      animX.value = withTiming(x, { duration: 300, easing: Easing.inOut(Easing.ease) });
      animY.value = withTiming(
        y,
        { duration: 300, easing: Easing.inOut(Easing.ease) },
        (finished) => {
          if (finished) {
            i++;
            step();
          }
        }
      );
    };
    step();
  }, [animatingPath, pitPositions, animX, animY, onAnimationEnd]);

  // Values readable by Skia nodes
  const derivedX = useDerivedValue(() => animX.value);
  const derivedY = useDerivedValue(() => animY.value);

  // Hit test helper
  const hitTestPit = (x: number, y: number) => {
    for (const p of pitPositions) {
      const dx = x - p.x;
      const dy = y - p.y;
      if (dx * dx + dy * dy <= p.r * p.r) return p.index;
    }
    return null;
  };

  const handleTouch = (evt: any) => {
    const t = evt.touches[0];
    if (!t) return;
    const pit = hitTestPit(t.x, t.y);
    if (pit != null) onPitPress(pit);
  };

  const canvasWidth = width;
  const canvasHeight = BOARD_PADDING * 2 + PIT_RADIUS * 2 + PIT_SPACING + PIT_RADIUS * 2;

  return (
    <Canvas style={{ width: canvasWidth, height: canvasHeight, backgroundColor: "#1b120b" }} onTouch={handleTouch}>
      {/* Pits + seeds */}
      {pitPositions.map((pos, i) => (
        <Group key={i}>
          <Circle cx={pos.x} cy={pos.y} r={PIT_RADIUS} color="#8B5E3C" />
          {/* Arrange seeds in a ring */}
          {Array.from({ length: board[i] || 0 }, (_, s) => {
            const angle = (s / Math.max(1, board[i])) * 2 * Math.PI;
            const seedX = pos.x + Math.cos(angle) * (PIT_RADIUS * 0.5);
            const seedY = pos.y + Math.sin(angle) * (PIT_RADIUS * 0.5);
            return <Circle key={s} cx={seedX} cy={seedY} r={SEED_RADIUS} color="black" />;
          })}
        </Group>
      ))}

      {/* Animated traveling seed (demo) */}
      {animatingPath && animatingPath.length > 0 && (
        <Circle cx={derivedX} cy={derivedY} r={SEED_RADIUS} color="red" />
      )}
    </Canvas>
  );
};
