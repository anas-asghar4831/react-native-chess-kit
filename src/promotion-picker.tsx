import React, { useCallback } from 'react';
import { View, Pressable } from 'react-native';

import type { ChessColor, PromotionPiece, PieceSetMap } from './types';
import { squareToXY } from './use-board-pieces';
import { PROMOTION_PIECE_PADDING } from './constants';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type PromotionPickerProps = {
  /** Square the pawn is promoting on */
  square: string;
  /** Color of the promoting pawn */
  pieceColor: 'w' | 'b';
  /** Board size in pixels */
  boardSize: number;
  squareSize: number;
  orientation: ChessColor;
  /** Piece renderer (from renderPiece prop or pieceSet) */
  renderPiece: (code: string, size: number) => React.ReactElement;
  /** Called when user picks a promotion piece */
  onSelect: (piece: PromotionPiece) => void;
  /** Called when user cancels (taps outside) */
  onCancel: () => void;
};

// ---------------------------------------------------------------------------
// Promotion pieces in order
// ---------------------------------------------------------------------------

const PROMOTION_PIECES: PromotionPiece[] = ['q', 'r', 'b', 'n'];

function promotionPieceCode(color: 'w' | 'b', piece: PromotionPiece): string {
  return `${color}${piece}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Promotion piece picker overlay.
 *
 * Appears as a vertical column of 4 pieces (Q, R, B, N) anchored to the
 * promotion square. Expands downward when promoting on the top edge,
 * upward when promoting on the bottom edge.
 *
 * A semi-transparent backdrop covers the board. Tapping outside cancels.
 */
export const PromotionPicker = React.memo(function PromotionPicker({
  square,
  pieceColor,
  boardSize,
  squareSize,
  orientation,
  renderPiece,
  onSelect,
  onCancel,
}: PromotionPickerProps) {
  const { x, y } = squareToXY(square, squareSize, orientation);
  const pieceSize = squareSize * (1 - PROMOTION_PIECE_PADDING * 2);
  const padding = squareSize * PROMOTION_PIECE_PADDING;

  // Determine if the picker should expand downward or upward
  // If the promotion square is in the top half, expand downward
  const expandDown = y < boardSize / 2;

  const handleSelect = useCallback(
    (piece: PromotionPiece) => {
      onSelect(piece);
    },
    [onSelect],
  );

  return (
    <View
      style={{
        position: 'absolute',
        width: boardSize,
        height: boardSize,
        zIndex: 200,
      }}
    >
      {/* Backdrop -- dims the board and captures cancel taps */}
      <Pressable
        style={{
          position: 'absolute',
          width: boardSize,
          height: boardSize,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
        onPress={onCancel}
      />

      {/* Piece column */}
      <View
        style={{
          position: 'absolute',
          left: x,
          top: expandDown ? y : y - squareSize * 3,
          width: squareSize,
          backgroundColor: '#ffffff',
          borderRadius: 4,
          // Subtle shadow for elevation
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 8,
          overflow: 'hidden',
        }}
      >
        {PROMOTION_PIECES.map((piece) => {
          const code = promotionPieceCode(pieceColor, piece);
          return (
            <Pressable
              key={piece}
              onPress={() => handleSelect(piece)}
              style={({ pressed }) => ({
                width: squareSize,
                height: squareSize,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
              })}
              accessibilityLabel={`Promote to ${PIECE_NAMES[piece]}`}
              accessibilityRole="button"
            >
              <View style={{ width: pieceSize, height: pieceSize }}>
                {renderPiece(code, pieceSize)}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const PIECE_NAMES: Record<PromotionPiece, string> = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
};
