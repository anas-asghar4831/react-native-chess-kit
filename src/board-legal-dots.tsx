import React from 'react';
import { View } from 'react-native';

import type { ChessColor, LegalMoveTarget } from './types';
import { squareToXY } from './use-board-pieces';

type BoardLegalDotsProps = {
  legalMoves: LegalMoveTarget[];
  squareSize: number;
  orientation: ChessColor;
};

/**
 * Legal move indicator dots, rendered only when a piece is selected.
 *
 * Dots are CONDITIONALLY rendered (only for actual legal move squares,
 * typically 5-15) instead of always mounting 64 invisible dot views.
 */
export const BoardLegalDots = React.memo(function BoardLegalDots({
  legalMoves,
  squareSize,
  orientation,
}: BoardLegalDotsProps) {
  if (legalMoves.length === 0) return null;

  const dotSize = squareSize * 0.28;
  const ringSize = squareSize * 0.85;
  const borderWidth = squareSize * 0.08;

  return (
    <View
      style={{ position: 'absolute', width: squareSize * 8, height: squareSize * 8 }}
      pointerEvents="none"
    >
      {legalMoves.map((move) => {
        const { x, y } = squareToXY(move.square, squareSize, orientation);

        if (move.isCapture) {
          return (
            <View
              key={move.square}
              style={{
                position: 'absolute',
                left: x + (squareSize - ringSize) / 2,
                top: y + (squareSize - ringSize) / 2,
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderWidth,
                borderColor: 'rgba(0, 0, 0, 0.25)',
              }}
            />
          );
        }

        return (
          <View
            key={move.square}
            style={{
              position: 'absolute',
              left: x + (squareSize - dotSize) / 2,
              top: y + (squareSize - dotSize) / 2,
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
            }}
          />
        );
      })}
    </View>
  );
});
