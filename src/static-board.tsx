import React, { useState, useCallback, useMemo } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

import type { StaticBoardProps, ChessColor, PieceCode } from './types';
import { DEFAULT_BOARD_COLORS, DEFAULT_LAST_MOVE_COLOR } from './constants';
import { DefaultPieceSet } from './pieces';
import { useBoardPieces, squareToXY } from './use-board-pieces';
import { BoardBackground } from './board-background';
import { BoardCoordinates } from './board-coordinates';
import { BoardHighlights } from './board-highlights';
import { BoardArrows } from './board-arrows';
import { BoardAnnotations } from './board-annotations';

/**
 * Non-interactive chess board — optimized for lists, thumbnails, and analysis previews.
 *
 * No gesture handler, no drag ghost, no legal move dots.
 * Just: background + coordinates + highlights + pieces + arrows + annotations.
 *
 * Significantly lighter than the full Board component.
 */
export const StaticBoard = React.memo(function StaticBoard({
  fen,
  orientation = 'white',
  boardSize: boardSizeProp,
  colors,
  withCoordinates = false,
  renderPiece,
  pieceSet,
  lastMove,
  highlights,
  arrows,
  annotations,
}: StaticBoardProps) {
  // --- Auto-sizing via onLayout when boardSize not provided ---
  const [measuredSize, setMeasuredSize] = useState(0);
  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setMeasuredSize(Math.min(width, height));
  }, []);

  const boardSize = boardSizeProp ?? measuredSize;
  const squareSize = boardSize / 8;
  const boardColors = colors ?? DEFAULT_BOARD_COLORS;

  // --- Piece data from FEN ---
  const pieces = useBoardPieces(fen);

  // --- Resolve piece renderer: renderPiece > pieceSet > DefaultPieceSet ---
  const resolvedRenderer = useMemo(() => {
    if (renderPiece) return renderPiece;
    const set = pieceSet ?? DefaultPieceSet;
    return (code: string, size: number) => {
      const renderer = set[code as PieceCode];
      if (renderer) return renderer(size);
      // Fallback for unknown piece codes
      return <View style={{ width: size, height: size }} />;
    };
  }, [renderPiece, pieceSet]);

  // If no size yet (auto-sizing), render invisible container for measurement
  if (boardSize === 0) {
    return (
      <View style={{ flex: 1, aspectRatio: 1 }} onLayout={handleLayout} />
    );
  }

  return (
    <View
      style={{ width: boardSize, height: boardSize }}
      onLayout={boardSizeProp ? undefined : handleLayout}
      accessibilityLabel="Chess board"
      accessibilityRole="image"
    >
      {/* Layer 1: Board background */}
      <BoardBackground
        boardSize={boardSize}
        lightColor={boardColors.light}
        darkColor={boardColors.dark}
      />

      {/* Layer 2: Coordinates */}
      {withCoordinates && (
        <BoardCoordinates
          boardSize={boardSize}
          orientation={orientation}
          lightColor={boardColors.light}
          darkColor={boardColors.dark}
          withLetters
          withNumbers
        />
      )}

      {/* Layer 3: Highlights */}
      <BoardHighlights
        boardSize={boardSize}
        orientation={orientation}
        squareSize={squareSize}
        lastMove={lastMove}
        lastMoveColor={DEFAULT_LAST_MOVE_COLOR}
        checkColor="transparent"
        selectedColor="transparent"
        premoveColor="transparent"
        highlights={highlights}
      />

      {/* Layer 4: Pieces (static — no animation needed) */}
      <View
        style={{ position: 'absolute', width: boardSize, height: boardSize }}
        pointerEvents="none"
      >
        {pieces.map((piece) => {
          const { x, y } = squareToXY(piece.square, squareSize, orientation);
          return (
            <View
              key={piece.id}
              style={{
                position: 'absolute',
                width: squareSize,
                height: squareSize,
                transform: [{ translateX: x }, { translateY: y }],
              }}
            >
              {resolvedRenderer(piece.code, squareSize)}
            </View>
          );
        })}
      </View>

      {/* Layer 5: Arrows */}
      {arrows && arrows.length > 0 && (
        <BoardArrows
          boardSize={boardSize}
          orientation={orientation}
          arrows={arrows}
        />
      )}

      {/* Layer 6: Annotations */}
      {annotations && annotations.length > 0 && (
        <BoardAnnotations
          boardSize={boardSize}
          orientation={orientation}
          squareSize={squareSize}
          annotations={annotations}
        />
      )}
    </View>
  );
});
