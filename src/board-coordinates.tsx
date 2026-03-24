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
  /** 'inside' overlays on edge squares, 'outside' renders in a gutter area. */
  position?: 'inside' | 'outside';
  /** Gutter width in pixels (only used when position='outside'). */
  gutterWidth?: number;
};

const FILES_WHITE = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const FILES_BLACK = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
const RANKS_WHITE = ['8', '7', '6', '5', '4', '3', '2', '1'];
const RANKS_BLACK = ['1', '2', '3', '4', '5', '6', '7', '8'];

/**
 * File letters (a-h) and rank numbers (1-8) drawn on or around the board.
 *
 * Two modes:
 * - **inside** (default): absolute-positioned inside each edge square, colors
 *   alternate to contrast with the square behind them.
 * - **outside**: rendered in a gutter area around the board. Rank numbers to
 *   the left, file letters along the bottom. Uses the dark square color.
 */
export const BoardCoordinates = React.memo(function BoardCoordinates({
  boardSize,
  orientation,
  lightColor,
  darkColor,
  withLetters,
  withNumbers,
  position = 'inside',
  gutterWidth = 0,
}: BoardCoordinatesProps) {
  if (!withLetters && !withNumbers) return null;

  const squareSize = boardSize / 8;
  const files = orientation === 'white' ? FILES_WHITE : FILES_BLACK;
  const ranks = orientation === 'white' ? RANKS_WHITE : RANKS_BLACK;

  // ── Outside mode: labels in gutter area around the board ──
  if (position === 'outside') {
    const fontSize = gutterWidth * 0.65;
    const textColor = darkColor;

    return (
      <>
        {/* Rank numbers — left gutter, vertically centered on each row */}
        {withNumbers && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: gutterWidth,
              height: boardSize,
            }}
            pointerEvents="none"
          >
            {ranks.map((rank, row) => (
              <View
                key={`r-${rank}`}
                style={{
                  position: 'absolute',
                  top: row * squareSize,
                  width: gutterWidth,
                  height: squareSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize,
                    fontWeight: '600',
                    color: textColor,
                  }}
                >
                  {rank}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* File letters — bottom gutter, horizontally centered on each column */}
        {withLetters && (
          <View
            style={{
              position: 'absolute',
              left: withNumbers ? gutterWidth : 0,
              bottom: 0,
              width: boardSize,
              height: gutterWidth,
            }}
            pointerEvents="none"
          >
            {files.map((file, col) => (
              <View
                key={`f-${file}`}
                style={{
                  position: 'absolute',
                  left: col * squareSize,
                  width: squareSize,
                  height: gutterWidth,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize,
                    fontWeight: '600',
                    color: textColor,
                  }}
                >
                  {file}
                </Text>
              </View>
            ))}
          </View>
        )}
      </>
    );
  }

  // ── Inside mode (default): absolute-positioned inside edge squares ──
  const fontSize = squareSize * 0.22;
  const padding = squareSize * 0.06;

  return (
    <View
      style={{ position: 'absolute', width: boardSize, height: boardSize }}
      pointerEvents="none"
    >
      {/* Rank numbers along left edge (inside each row's first square) */}
      {withNumbers &&
        ranks.map((rank, row) => {
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
