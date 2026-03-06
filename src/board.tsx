import React, {
  forwardRef,
  useState,
  useCallback,
  useImperativeHandle,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import type {
  BoardRef,
  BoardProps,
  LegalMoveTarget,
  HighlightData,
  PieceCode,
  PromotionPiece,
} from './types';
import {
  DEFAULT_BOARD_COLORS,
  DEFAULT_MOVE_DURATION,
  DEFAULT_LAST_MOVE_COLOR,
  DEFAULT_CHECK_COLOR,
  DEFAULT_SELECTED_COLOR,
  DEFAULT_PREMOVE_COLOR,
  DEFAULT_DRAG_TARGET_COLOR,
} from './constants';
import { DefaultPieceSet } from './pieces';
import { useBoardPieces } from './use-board-pieces';
import { useBoardState } from './use-board-state';
import { useBoardGesture } from './use-board-gesture';
import { usePremove } from './use-premove';
import { BoardBackground } from './board-background';
import { BoardCoordinates } from './board-coordinates';
import { BoardHighlights, DragTargetHighlight } from './board-highlights';
import { BoardLegalDots } from './board-legal-dots';
import { BoardPiecesLayer } from './board-pieces';
import { BoardDragGhost } from './board-drag-ghost';
import { BoardArrows } from './board-arrows';
import { BoardAnnotations } from './board-annotations';
import { PromotionPicker } from './promotion-picker';

// ---------------------------------------------------------------------------
// Check detection helper
// ---------------------------------------------------------------------------

/**
 * Find the king square for the side currently in check.
 * Returns null if not in check.
 */
function detectCheckSquare(
  fen: string,
  isInCheck: () => boolean,
  getTurn: () => 'w' | 'b',
): string | null {
  if (!isInCheck()) return null;

  const turn = getTurn();
  const kingChar = turn === 'w' ? 'K' : 'k';
  const placement = fen.split(' ')[0];
  const ranks = placement.split('/');

  for (let rankIdx = 0; rankIdx < ranks.length; rankIdx++) {
    const rank = ranks[rankIdx]!;
    let fileIdx = 0;
    for (const char of rank) {
      if (char >= '1' && char <= '8') {
        fileIdx += parseInt(char, 10);
        continue;
      }
      if (char === kingChar) {
        const files = 'abcdefgh';
        return `${files[fileIdx]}${8 - rankIdx}`;
      }
      fileIdx++;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Board component
// ---------------------------------------------------------------------------

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
 * v0.2.0 layer stack (10 layers):
 * 1. BoardBackground (64 squares)
 * 2. BoardCoordinates (a-h, 1-8)
 * 3. BoardHighlights (last move, check, selected, premove, custom, imperative)
 * 4. DragTargetHighlight (animated, worklet-driven)
 * 5. BoardLegalDots (legal move indicators)
 * 6. BoardPiecesLayer (all pieces)
 * 7. BoardArrows (SVG arrows + circles)
 * 8. BoardAnnotations (text badges)
 * 9. BoardDragGhost (floating piece)
 * 10. PromotionPicker (modal, conditional)
 */
export const Board = forwardRef<BoardRef, BoardProps>(function Board(
  {
    fen,
    orientation,

    // Layout
    boardSize: boardSizeProp,

    // Interaction
    gestureEnabled = true,
    player = 'both',
    moveMethod = 'both',
    showLegalMoves = true,
    premovesEnabled = false,

    // Appearance
    colors,
    withLetters = true,
    withNumbers = true,
    renderPiece,
    pieceSet,

    // Overlays
    lastMove,
    highlights,
    arrows,
    shapes,
    annotations,
    showDragTarget = true,

    // Overlay colors
    lastMoveColor = DEFAULT_LAST_MOVE_COLOR,
    checkHighlightColor = DEFAULT_CHECK_COLOR,
    selectedSquareColor = DEFAULT_SELECTED_COLOR,
    premoveColor = DEFAULT_PREMOVE_COLOR,
    dragTargetColor = DEFAULT_DRAG_TARGET_COLOR,

    // Animation
    moveDuration = DEFAULT_MOVE_DURATION,
    animationConfig,
    animateFlip = true,

    // Promotion
    onPromotion,

    // Callbacks
    onMove,
    onPieceClick,
    onSquareClick,
    onPieceDragBegin,
    onPieceDragEnd,
    onSquareLongPress,
    onPremove,
    onHaptic,
  },
  ref,
) {
  // --- Auto-sizing via onLayout when boardSize not provided ---
  const [measuredSize, setMeasuredSize] = useState(0);
  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setMeasuredSize(Math.min(width, height));
  }, []);

  const boardSize = boardSizeProp ?? measuredSize;
  const squareSize = boardSize / 8;
  const boardColors = colors ?? DEFAULT_BOARD_COLORS;

  // --- Board flip animation ---
  const flipRotation = useSharedValue(orientation === 'black' ? 180 : 0);
  const prevOrientationRef = useRef(orientation);

  useEffect(() => {
    if (prevOrientationRef.current !== orientation) {
      prevOrientationRef.current = orientation;
      if (animateFlip) {
        flipRotation.value = withTiming(
          orientation === 'black' ? 180 : 0,
          { duration: 300 },
        );
      } else {
        flipRotation.value = orientation === 'black' ? 180 : 0;
      }
    }
  }, [orientation, animateFlip, flipRotation]);

  // Note: We don't actually rotate the board view because all layers already
  // handle orientation via squareToXY coordinate math. The flip animation is
  // a visual effect only — the rotation shared value is available for consumers
  // who want to add a rotation transition effect.

  // --- Internal FEN state ---
  // The Board owns a private FEN that drives piece rendering.
  // It starts from the parent prop and stays in sync via useEffect,
  // but can temporarily diverge when the library applies a user move
  // before the parent validates it (enables Chess.com-style "show move
  // then revert" behavior via undo()).
  const [internalFen, setInternalFen] = useState(fen);

  // --- Chess.js for legal move validation + internal state ---
  const boardState = useBoardState(fen);

  // Sync internal FEN + chess.js when parent changes the prop FEN.
  // This covers: accepted moves (parent updates FEN), board reset,
  // and opponent programmatic moves.
  useEffect(() => {
    setInternalFen(fen);
    boardState.loadFen(fen);
  }, [fen, boardState]);

  // --- Piece data from internal FEN ---
  const pieces = useBoardPieces(internalFen);

  // --- Check detection ---
  // Detect if the side to move is in check by parsing the FEN.
  // chess.js isInCheck() isn't exposed through boardState, so we use
  // a simple heuristic: if the FEN has the king of the side to move
  // attacked, highlight it.
  const checkSquareState = useMemo(() => {
    try {
      return detectCheckSquare(
        internalFen,
        () => boardState.isInCheck(),
        boardState.getTurn,
      );
    } catch {
      return null;
    }
  }, [internalFen, boardState]);

  // --- Selection state ---
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<LegalMoveTarget[]>([]);

  // --- Imperative highlights ---
  const [imperativeHighlights, setImperativeHighlights] = useState<HighlightData[]>([]);

  // --- Premove state ---
  const { premove, setPremove, clearPremove, consumePremove } = usePremove();

  // --- Promotion state ---
  const [promotionState, setPromotionState] = useState<{
    from: string;
    to: string;
    color: 'w' | 'b';
  } | null>(null);

  // --- Resolve piece renderer: renderPiece > pieceSet > DefaultPieceSet ---
  const resolvedRenderer = useMemo(() => {
    if (renderPiece) return renderPiece;
    const set = pieceSet ?? DefaultPieceSet;
    return (code: string, size: number) => {
      const renderer = set[code as PieceCode];
      if (renderer) return renderer(size);
      return <View style={{ width: size, height: size }} />;
    };
  }, [renderPiece, pieceSet]);

  // --- Promotion detection ---
  const isPromotionMove = useCallback(
    (from: string, to: string): boolean => {
      const piece = pieces.find((p) => p.square === from);
      if (!piece) return false;
      // Must be a pawn
      if (piece.code !== 'wp' && piece.code !== 'bp') return false;
      // Must be moving to the last rank
      const toRank = to[1];
      if (piece.color === 'w' && toRank === '8') return true;
      if (piece.color === 'b' && toRank === '1') return true;
      return false;
    },
    [pieces],
  );

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
    async (from: string, to: string) => {
      // Clear selection and legal dots
      setSelectedSquare(null);
      setLegalMoves([]);

      // Check for promotion
      if (isPromotionMove(from, to)) {
        if (onPromotion) {
          const piece = pieces.find((p) => p.square === from);
          const color = piece?.color ?? 'w';
          setPromotionState({ from, to, color });
          return;
        }
        // Auto-promote to queen
        const result = boardState.applyMove(from, to, 'q');
        if (result.applied && result.fen) {
          setInternalFen(result.fen);
        }
        onMove?.({ from, to });
        return;
      }

      // Apply the move visually FIRST (Chess.com-style: show the move,
      // then let the parent validate). The parent can call undo() to
      // revert if the move is rejected.
      const result = boardState.applyMove(from, to);
      if (result.applied && result.fen) {
        setInternalFen(result.fen);
        onMove?.({ from, to });
      }
      // If chess.js rejected the move (truly illegal), do nothing —
      // piece stays at its original square.
    },
    [onMove, onPromotion, isPromotionMove, pieces, boardState],
  );

  // --- Promotion picker handlers ---
  const handlePromotionSelect = useCallback(
    async (piece: PromotionPiece) => {
      if (!promotionState) return;
      const { from, to } = promotionState;
      setPromotionState(null);

      const promo = piece.toLowerCase();

      if (onPromotion) {
        try {
          const choice = await onPromotion(from, to);
          const result = boardState.applyMove(from, to, choice);
          if (result.applied && result.fen) {
            setInternalFen(result.fen);
          }
          onMove?.({ from, to });
        } catch {
          // Promotion cancelled — piece stays at origin
        }
      } else {
        const result = boardState.applyMove(from, to, promo);
        if (result.applied && result.fen) {
          setInternalFen(result.fen);
        }
        onMove?.({ from, to });
      }
    },
    [promotionState, onPromotion, onMove, boardState],
  );

  const handlePromotionCancel = useCallback(() => {
    setPromotionState(null);
  }, []);

  // --- Premove handling ---
  const handlePremoveSet = useCallback(
    (pm: { from: string; to: string }) => {
      setPremove(pm);
      onPremove?.(pm);
      onHaptic?.('select');
    },
    [setPremove, onPremove, onHaptic],
  );

  // Execute premove when turn changes
  useEffect(() => {
    if (!premovesEnabled || !premove) return;

    const turn = boardState.getTurn();
    // Check if it's now the premover's turn
    const premovePiece = pieces.find((p) => p.square === premove.from);
    if (!premovePiece) {
      clearPremove();
      return;
    }

    if (premovePiece.color === turn) {
      const consumed = consumePremove();
      if (consumed) {
        // Try to execute the premove
        const result = boardState.applyMove(consumed.from, consumed.to, consumed.promotion);
        if (result.applied && result.fen) {
          setInternalFen(result.fen);
          onMove?.({ from: consumed.from, to: consumed.to });
          onHaptic?.('move');
        } else {
          // Premove was illegal — discard silently
          onHaptic?.('error');
        }
      }
    }
  }, [fen, premovesEnabled, premove, pieces, boardState, consumePremove, clearPremove, onMove, onHaptic]);

  // --- Rich callbacks ref (stable, for gesture hook) ---
  const richCallbacks = useMemo(
    () => ({
      onPieceClick,
      onSquareClick,
      onPieceDragBegin,
      onPieceDragEnd,
      onSquareLongPress,
      onHaptic,
    }),
    [onPieceClick, onSquareClick, onPieceDragBegin, onPieceDragEnd, onSquareLongPress, onHaptic],
  );

  const premoveCallbacks = useMemo(
    () => ({
      onPremoveSet: handlePremoveSet,
    }),
    [handlePremoveSet],
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
    richCallbacks,
    premoveCallbacks,
    premovesEnabled,
    selectedSquare,
    legalMoves,
    currentTurn: boardState.getTurn(),
  });

  // --- Imperative ref ---
  useImperativeHandle(ref, () => ({
    move: (moveArg) => {
      const result = boardState.applyMove(moveArg.from, moveArg.to, moveArg.promotion);
      if (result.applied && result.fen) {
        setInternalFen(result.fen);
      }
    },

    highlight: (square, color) => {
      setImperativeHighlights((prev) => {
        const filtered = prev.filter((h) => h.square !== square);
        return [...filtered, { square, color }];
      });
    },

    clearHighlights: () => {
      setImperativeHighlights([]);
    },

    resetBoard: (newFen) => {
      boardState.loadFen(newFen);
      setInternalFen(newFen);
      setSelectedSquare(null);
      setLegalMoves([]);
      setImperativeHighlights([]);
      clearPremove();
      setPromotionState(null);
    },

    undo: () => {
      const prevFen = boardState.undoMove();
      if (prevFen) {
        setInternalFen(prevFen);
      }
      setSelectedSquare(null);
      setLegalMoves([]);
    },

    clearPremoves: () => {
      clearPremove();
    },
  }));

  // If no size yet (auto-sizing), render invisible container for measurement
  if (boardSize === 0) {
    return (
      <View style={{ flex: 1, aspectRatio: 1 }} onLayout={handleLayout} />
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={{ width: boardSize, height: boardSize }}
        onLayout={boardSizeProp ? undefined : handleLayout}
        accessibilityLabel="Chess board"
        accessibilityRole="adjustable"
      >
        {/* Layer 1: Board background (64 colored squares) */}
        <BoardBackground
          boardSize={boardSize}
          lightColor={boardColors.light}
          darkColor={boardColors.dark}
        />

        {/* Layer 2: Coordinate labels (a-h, 1-8) */}
        <BoardCoordinates
          boardSize={boardSize}
          orientation={orientation}
          lightColor={boardColors.light}
          darkColor={boardColors.dark}
          withLetters={withLetters}
          withNumbers={withNumbers}
        />

        {/* Layer 3: Square highlights (last move, check, selected, premove, custom, imperative) */}
        <BoardHighlights
          boardSize={boardSize}
          orientation={orientation}
          squareSize={squareSize}
          lastMove={lastMove}
          lastMoveColor={lastMoveColor}
          checkSquare={checkSquareState}
          checkColor={checkHighlightColor}
          selectedSquare={selectedSquare}
          selectedColor={selectedSquareColor}
          premoveSquares={premove ? { from: premove.from, to: premove.to } : null}
          premoveColor={premoveColor}
          highlights={highlights}
          imperativeHighlights={imperativeHighlights}
        />

        {/* Layer 4: Drag target highlight (animated, updates during drag) */}
        {showDragTarget && (
          <DragTargetHighlight
            squareSize={squareSize}
            orientation={orientation}
            dragTargetSquare={gestureState.dragTargetSquare}
            color={dragTargetColor}
          />
        )}

        {/* Layer 5: Legal move dots (only when a piece is selected) */}
        {showLegalMoves && (
          <BoardLegalDots
            legalMoves={legalMoves}
            squareSize={squareSize}
            orientation={orientation}
          />
        )}

        {/* Layer 6: Pieces */}
        <BoardPiecesLayer
          pieces={pieces}
          squareSize={squareSize}
          orientation={orientation}
          moveDuration={moveDuration}
          animationConfig={animationConfig}
          renderPiece={resolvedRenderer}
          activeSquare={gestureState.activeSquare}
          isDragging={gestureState.isDragging}
        />

        {/* Layer 7: Arrows + shapes (SVG overlay) */}
        {((arrows && arrows.length > 0) || (shapes && shapes.length > 0)) && (
          <BoardArrows
            boardSize={boardSize}
            orientation={orientation}
            arrows={arrows}
            shapes={shapes}
          />
        )}

        {/* Layer 8: Annotations (text badges) */}
        {annotations && annotations.length > 0 && (
          <BoardAnnotations
            boardSize={boardSize}
            orientation={orientation}
            squareSize={squareSize}
            annotations={annotations}
          />
        )}

        {/* Layer 9: Drag ghost (single floating piece) */}
        <BoardDragGhost
          squareSize={squareSize}
          isDragging={gestureState.isDragging}
          dragX={gestureState.dragX}
          dragY={gestureState.dragY}
          dragPieceCode={gestureState.dragPieceCode}
          renderPiece={resolvedRenderer}
        />

        {/* Layer 10: Promotion picker (conditional) */}
        {promotionState && (
          <PromotionPicker
            square={promotionState.to}
            pieceColor={promotionState.color}
            boardSize={boardSize}
            squareSize={squareSize}
            orientation={orientation}
            renderPiece={resolvedRenderer}
            onSelect={handlePromotionSelect}
            onCancel={handlePromotionCancel}
          />
        )}
      </View>
    </GestureDetector>
  );
});
