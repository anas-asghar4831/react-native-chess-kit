import React, { forwardRef, useState, useCallback, useImperativeHandle, useEffect } from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import type { BoardRef, BoardProps, LegalMoveTarget } from './types';
import { useBoardPieces } from './use-board-pieces';
import { useBoardState } from './use-board-state';
import { useBoardGesture } from './use-board-gesture';
import { BoardBackground } from './board-background';
import { BoardCoordinates } from './board-coordinates';
import { BoardLegalDots } from './board-legal-dots';
import { BoardPiecesLayer } from './board-pieces';
import { BoardDragGhost } from './board-drag-ghost';

/**
 * High-performance custom chess board built on Reanimated + Gesture Handler.
 *
 * Architecture:
 * - 1 gesture handler (vs 32 in typical implementations)
 * - ~40 components mounted (vs ~281)
 * - ~75 native views (vs ~470)
 * - 0 React Context providers
 * - 0 re-renders during drag (pure worklet — only 2 shared value writes per frame)
 *
 * Follows chess.com/lichess pattern: single gesture receiver on the board,
 * coordinate math to determine touched piece, shared values for drag state.
 */
export const Board = forwardRef<BoardRef, BoardProps>(function Board(
  {
    fen,
    orientation,
    boardSize,
    gestureEnabled,
    player,
    onMove,
    colors,
    moveDuration,
    withLetters,
    withNumbers,
    renderPiece,
    showLegalMoves,
    moveMethod,
  },
  ref,
) {
  const squareSize = boardSize / 8;

  // --- Piece data from FEN ---
  const pieces = useBoardPieces(fen);

  // --- Chess.js for legal move validation ---
  const boardState = useBoardState(fen);

  // Sync internal chess.js when parent changes FEN (puzzle reset, opponent move, etc.)
  // Must be in useEffect — side effects during render violate React's rules
  // and can fire multiple times in concurrent mode.
  useEffect(() => {
    boardState.loadFen(fen);
  }, [fen, boardState]);

  // --- Selection state (triggers legal dots display) ---
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<LegalMoveTarget[]>([]);

  // Default piece renderer (no-op if parent provides renderPiece)
  const defaultRenderPiece = useCallback(
    (code: string, size: number) => (
      <View style={{ width: size, height: size, backgroundColor: 'rgba(0,0,0,0.3)' }} />
    ),
    [],
  );
  const pieceRenderer = renderPiece ?? defaultRenderPiece;

  // --- Gesture callbacks ---
  const handlePieceSelected = useCallback(
    (square: string) => {
      setSelectedSquare(square);
      if (showLegalMoves) {
        setLegalMoves(boardState.getLegalMoves(square));
      }
    },
    [showLegalMoves, boardState],
  );

  const handleSelectionCleared = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  const handlePieceMoved = useCallback(
    (from: string, to: string) => {
      // Clear selection and legal dots
      setSelectedSquare(null);
      setLegalMoves([]);

      // Notify parent — parent decides whether to accept/reject
      onMove?.({ from, to });
    },
    [onMove],
  );

  // --- Single centralized gesture ---
  const { gesture, gestureState } = useBoardGesture({
    squareSize,
    orientation,
    gestureEnabled,
    player,
    moveMethod,
    pieces,
    callbacks: {
      onPieceSelected: handlePieceSelected,
      onPieceMoved: handlePieceMoved,
      onSelectionCleared: handleSelectionCleared,
    },
    selectedSquare,
    legalMoves,
  });

  // --- Imperative ref for parent (move, highlight, reset, undo) ---
  useImperativeHandle(ref, () => ({
    move: (move) => {
      // Pre-apply to internal chess.js so subsequent getLegalMoves calls
      // reflect the new position. The parent will also update the FEN prop,
      // which triggers useBoardPieces -> piece position animates via shared values.
      boardState.applyMove(move.from, move.to);
    },

    highlight: (_square, _color) => {
      // Highlights are handled by overlay layers in the consuming app,
      // not internally — this is a no-op stub for API compatibility.
      // Use the Board's overlay API or render your own highlight layer.
    },

    clearHighlights: () => {
      // Same as highlight — handled by overlay layer
    },

    resetBoard: (newFen) => {
      boardState.loadFen(newFen);
      setSelectedSquare(null);
      setLegalMoves([]);
    },

    undo: () => {
      boardState.undoMove();
      setSelectedSquare(null);
      setLegalMoves([]);
    },
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={{ width: boardSize, height: boardSize }}>
        {/* Layer 1: Board background (64 colored squares) */}
        <BoardBackground
          boardSize={boardSize}
          lightColor={colors.light}
          darkColor={colors.dark}
        />

        {/* Layer 2: Coordinate labels (a-h, 1-8) */}
        <BoardCoordinates
          boardSize={boardSize}
          orientation={orientation}
          lightColor={colors.light}
          darkColor={colors.dark}
          withLetters={withLetters}
          withNumbers={withNumbers}
        />

        {/* Layer 3: Legal move dots (only when a piece is selected) */}
        {showLegalMoves && (
          <BoardLegalDots
            legalMoves={legalMoves}
            squareSize={squareSize}
            orientation={orientation}
          />
        )}

        {/* Layer 4: Pieces */}
        <BoardPiecesLayer
          pieces={pieces}
          squareSize={squareSize}
          orientation={orientation}
          moveDuration={moveDuration}
          renderPiece={pieceRenderer}
          activeSquare={gestureState.activeSquare}
          isDragging={gestureState.isDragging}
        />

        {/* Layer 5: Drag ghost (single floating piece) */}
        <BoardDragGhost
          squareSize={squareSize}
          isDragging={gestureState.isDragging}
          dragX={gestureState.dragX}
          dragY={gestureState.dragY}
          dragPieceCode={gestureState.dragPieceCode}
          renderPiece={pieceRenderer}
        />
      </View>
    </GestureDetector>
  );
});
