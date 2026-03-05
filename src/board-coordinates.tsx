import React from 'react';
import { View, Text } from 'react-native';

import type { ChessColor } from './types';

type BoardCoordinatesProps = {
  boardSize: number;
  orientation: ChessColor;
  lightColor: string;
  darkColor: string;
  withLetters: boolean;
  withNumbers: boolean;
};

const FILES_WHITE = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const FILES_BLACK = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
const RANKS_WHITE = ['8', '7', '6', '5', '4', '3', '2', '1'];
const RANKS_BLACK = ['1', '2', '3', '4', '5', '6', '7', '8'];

/**
 * File letters (a-h) and rank numbers (1-8) drawn on the board edges.
 *
 * Rendered as absolute-positioned Text components inside each corner square.
 * File letters appear on the bottom rank, rank numbers on the left file.
 * Colors alternate to contrast with the square behind them.
 */
export const BoardCoordinates = React.memo(function BoardCoordinates({
  boardSize,
  orientation,
  lightColor,
  darkColor,
  withLetters,
  withNumbers,
}: BoardCoordinatesProps) {
  if (!withLetters && !withNumbers) return null;

  const squareSize = boardSize / 8;
  const fontSize = squareSize * 0.22;
  const padding = squareSize * 0.06;
  const files = orientation === 'white' ? FILES_WHITE : FILES_BLACK;
  const ranks = orientation === 'white' ? RANKS_WHITE : RANKS_BLACK;

  return (
    <View
      style={{ position: 'absolute', width: boardSize, height: boardSize }}
      pointerEvents="none"
    >
      {/* Rank numbers along left edge (inside each row's first square) */}
      {withNumbers &&
        ranks.map((rank, row) => {
          // First column square: row 0 col 0 = light if (0+0)%2===0
          const isLight = row % 2 === 0;
          const textColor = isLight ? darkColor : lightColor;

          return (
            <Text
              key={`r-${rank}`}
              style={{
                position: 'absolute',
                left: padding,
                top: row * squareSize + padding,
                fontSize,
                fontWeight: '700',
                color: textColor,
              }}
            >
              {rank}
            </Text>
          );
        })}

      {/* File letters along bottom edge (inside each column's last square) */}
      {withLetters &&
        files.map((file, col) => {
          // Last row (7), column col: light if (7+col)%2===0
          const isLight = (7 + col) % 2 === 0;
          const textColor = isLight ? darkColor : lightColor;

          return (
            <Text
              key={`f-${file}`}
              style={{
                position: 'absolute',
                right: (7 - col) * squareSize + padding,
                bottom: padding,
                fontSize,
                fontWeight: '700',
                color: textColor,
                textAlign: 'right',
              }}
            >
              {file}
            </Text>
          );
        })}
    </View>
  );
});
