import React from 'react';
import { View } from 'react-native';

type BoardBackgroundProps = {
  boardSize: number;
  lightColor: string;
  darkColor: string;
};

/**
 * 64 static colored squares forming the chess board grid.
 *
 * These are plain Views with backgroundColor — no animations, no gesture
 * handlers. They never re-render after mount unless the board theme changes.
 */
export const BoardBackground = React.memo(function BoardBackground({
  boardSize,
  lightColor,
  darkColor,
}: BoardBackgroundProps) {
  const squareSize = boardSize / 8;

  return (
    <View style={{ width: boardSize, height: boardSize, flexDirection: 'row', flexWrap: 'wrap' }}>
      {SQUARE_INDICES.map((i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const isLight = (row + col) % 2 === 0;

        return (
          <View
            key={i}
            style={{
              width: squareSize,
              height: squareSize,
              backgroundColor: isLight ? lightColor : darkColor,
            }}
          />
        );
      })}
    </View>
  );
});

// Pre-computed array of 0-63 to avoid allocation on every render
const SQUARE_INDICES = Array.from({ length: 64 }, (_, i) => i);
