import { useMemo, useCallback, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';

import type {
  ChessColor,
  MoveMethod,
  BoardPiece,
  LegalMoveTarget,
  GestureState,
  PieceCode,
  HapticType,
  PremoveData,
} from './types';
import { xyToSquare } from './use-board-pieces';

// ---------------------------------------------------------------------------
// Callback types
// ---------------------------------------------------------------------------

type GestureCallbacks = {
  onPieceSelected: (square: string) => void;
  onPieceMoved: (from: string, to: string) => void;
  onSelectionCleared: () => void;
};

/** Rich callbacks exposed to consumers (all optional) */
type RichCallbacks = {
  onPieceClick?: (square: string, piece: PieceCode) => void;
  onSquareClick?: (square: string) => void;
  onPieceDragBegin?: (square: string, piece: PieceCode) => void;
  onPieceDragEnd?: (square: string, piece: PieceCode) => void;
  onSquareLongPress?: (square: string) => void;
  onHaptic?: (type: HapticType) => void;
};

/** Premove-related callbacks from board.tsx */
type PremoveCallbacks = {
  onPremoveSet?: (premove: PremoveData) => void;
};

// ---------------------------------------------------------------------------
// Params
// ---------------------------------------------------------------------------

type UseBoardGestureParams = {
  squareSize: number;
  orientation: ChessColor;
  gestureEnabled: boolean;
  player: ChessColor | 'both';
  moveMethod: MoveMethod;
  pieces: BoardPiece[];
  callbacks: GestureCallbacks;
  richCallbacks?: RichCallbacks;
  premoveCallbacks?: PremoveCallbacks;
  /** Whether premoves are enabled */
  premovesEnabled?: boolean;
  /** Currently selected square (for tap-to-move second tap) */
  selectedSquare: string | null;
  /** Legal move targets from the currently selected piece */
  legalMoves: LegalMoveTarget[];
  /** Whose turn it is ('w' or 'b') — used for premove detection */
  currentTurn?: 'w' | 'b';
};

type UseBoardGestureReturn = {
  gesture: ReturnType<typeof Gesture.Pan>;
  gestureState: GestureState;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if a piece color matches the current player turn */
function isPieceTurn(pieceColor: 'w' | 'b', currentTurn: 'w' | 'b'): boolean {
  return pieceColor === currentTurn;
}

/** Map piece color char to player ChessColor */
function pieceColorToPlayer(color: 'w' | 'b'): ChessColor {
  return color === 'w' ? 'white' : 'black';
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Single centralized gesture handler for the entire board.
 *
 * Instead of 32 separate Gesture.Pan() handlers (one per piece), we use ONE
 * handler on the board container. Touch -> coordinate math -> which piece.
 *
 * Supports three modes:
 * - 'drag': drag piece to target square
 * - 'click': tap source piece, then tap target square
 * - 'both': drag or click (default)
 *
 * All drag position tracking uses shared values — zero JS bridge calls,
 * zero re-renders during drag. Only the final move triggers JS via runOnJS.
 *
 * The gesture object is STABLE (only recreated when squareSize, orientation,
 * gestureEnabled, player, or moveMethod change). Frequently-changing data
 * (pieces, selectedSquare, legalMoves) is read from refs via runOnJS bridge
 * functions, avoiding costly gesture teardown/rebuild on every move.
 *
 * v0.2.0 additions:
 * - Rich callbacks (onPieceClick, onSquareClick, onPieceDragBegin, onPieceDragEnd)
 * - Drag target square tracking (shared value for DragTargetHighlight)
 * - Premove support (queue move when not your turn)
 * - Haptic feedback via callback
 * - Long press detection for onSquareLongPress
 */
export function useBoardGesture({
  squareSize,
  orientation,
  gestureEnabled,
  player,
  moveMethod,
  pieces,
  callbacks,
  richCallbacks,
  premoveCallbacks,
  premovesEnabled = false,
  selectedSquare,
  legalMoves,
  currentTurn,
}: UseBoardGestureParams): UseBoardGestureReturn {
  // Shared values for drag tracking — updated on UI thread only
  const activeSquare = useSharedValue<string | null>(null);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragPieceCode = useSharedValue<string | null>(null);
  const dragTargetSquare = useSharedValue<string | null>(null);

  const gestureState: GestureState = {
    activeSquare,
    dragX,
    dragY,
    isDragging,
    dragPieceCode,
    dragTargetSquare,
  };

  // --- Refs for frequently-changing data (read from JS thread via runOnJS) ---
  // These update every move but do NOT cause gesture object recreation.
  const piecesRef = useRef(pieces);
  piecesRef.current = pieces;

  const selectedSquareRef = useRef(selectedSquare);
  selectedSquareRef.current = selectedSquare;

  const legalMovesRef = useRef(legalMoves);
  legalMovesRef.current = legalMoves;

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const richCallbacksRef = useRef(richCallbacks);
  richCallbacksRef.current = richCallbacks;

  const premoveCallbacksRef = useRef(premoveCallbacks);
  premoveCallbacksRef.current = premoveCallbacks;

  const currentTurnRef = useRef(currentTurn);
  currentTurnRef.current = currentTurn;

  // Track the piece being dragged for rich drag-end callback
  const draggedPieceRef = useRef<{ square: string; code: PieceCode } | null>(null);

  // --- JS-thread bridge functions called from worklets via runOnJS ---
  // These read current values from refs, so they always have fresh data.

  const handleBegin = useCallback((touchX: number, touchY: number) => {
    const square = xyToSquare(touchX, touchY, squareSize, orientation);
    const currentPieces = piecesRef.current;
    const currentSelected = selectedSquareRef.current;
    const currentLegalMoves = legalMovesRef.current;
    const cbs = callbacksRef.current;
    const rich = richCallbacksRef.current;
    const canClick = moveMethod !== 'drag';

    // Build lookup for the current touch
    const piece = currentPieces.find((p) => p.square === square);
    const isPlayerPiece = piece
      ? player === 'both' || pieceColorToPlayer(piece.color) === player
      : false;

    // Check if it's this piece's turn (for premove detection)
    const turn = currentTurnRef.current;
    const isOwnTurn = piece && turn
      ? isPieceTurn(piece.color, turn)
      : true; // default to true if turn not tracked

    // Click-to-move: second tap on a legal target square
    const legalSquares = new Set(currentLegalMoves.map((m) => m.square));
    if (canClick && currentSelected && legalSquares.has(square)) {
      cbs.onPieceMoved(currentSelected, square);
      // Clear optimistic worklet value — move is complete
      activeSquare.value = null;
      isDragging.value = false;
      dragPieceCode.value = null;
      dragTargetSquare.value = null;
      rich?.onHaptic?.('move');
      return;
    }

    // Chess.com-style deselect: tapping the already-selected piece toggles it off
    if (canClick && currentSelected === square) {
      cbs.onSelectionCleared();
      activeSquare.value = null;
      dragPieceCode.value = null;
      dragTargetSquare.value = null;
      return;
    }

    if (isPlayerPiece && piece) {
      // Premove: player piece but not their turn
      if (premovesEnabled && !isOwnTurn) {
        // If there's already a selected square, this tap completes a premove
        if (currentSelected && currentSelected !== square) {
          premoveCallbacksRef.current?.onPremoveSet?.({
            from: currentSelected,
            to: square,
          });
          cbs.onSelectionCleared();
          activeSquare.value = null;
          dragPieceCode.value = null;
          dragTargetSquare.value = null;
          return;
        }
        // First tap: select the piece for premove
        // activeSquare.value / dragX.value / dragY.value already set by onBegin worklet
        dragPieceCode.value = piece.code;
        cbs.onPieceSelected(square);
        rich?.onPieceClick?.(square, piece.code as PieceCode);
        rich?.onHaptic?.('select');
        return;
      }

      // Normal case: tapped/started dragging a player piece on their turn
      // activeSquare.value / dragX.value / dragY.value already set by onBegin worklet
      dragPieceCode.value = piece.code;
      draggedPieceRef.current = { square, code: piece.code as PieceCode };
      cbs.onPieceSelected(square);

      // Rich callbacks
      rich?.onPieceClick?.(square, piece.code as PieceCode);
      rich?.onHaptic?.('select');
    } else {
      // Tapped empty square or opponent piece

      // If premoves enabled and there's a selection, check if this is a premove target
      if (premovesEnabled && currentSelected && !isOwnTurn) {
        premoveCallbacksRef.current?.onPremoveSet?.({
          from: currentSelected,
          to: square,
        });
        cbs.onSelectionCleared();
        activeSquare.value = null;
        dragPieceCode.value = null;
        dragTargetSquare.value = null;
        return;
      }

      // Clear the optimistic worklet value — no valid piece here
      activeSquare.value = null;
      dragPieceCode.value = null;
      dragTargetSquare.value = null;
      if (currentSelected) {
        cbs.onSelectionCleared();
      }

      // Rich callback: square click (empty square or opponent piece)
      rich?.onSquareClick?.(square);
    }
  }, [squareSize, orientation, player, moveMethod, premovesEnabled, activeSquare, dragX, dragY, isDragging, dragPieceCode, dragTargetSquare]);

  const handleDragStart = useCallback((touchX: number, touchY: number) => {
    const rich = richCallbacksRef.current;
    const dragged = draggedPieceRef.current;
    if (dragged) {
      rich?.onPieceDragBegin?.(dragged.square, dragged.code);
    }
    // Update drag target to current square
    const square = xyToSquare(touchX, touchY, squareSize, orientation);
    dragTargetSquare.value = square;
  }, [squareSize, orientation, dragTargetSquare]);

  const handleDragUpdate = useCallback((touchX: number, touchY: number) => {
    // Update drag target square (for highlight). This runs on JS thread
    // but is called from worklet via runOnJS only when the square changes.
    const square = xyToSquare(touchX, touchY, squareSize, orientation);
    dragTargetSquare.value = square;
  }, [squareSize, orientation, dragTargetSquare]);

  const handleEnd = useCallback((touchX: number, touchY: number) => {
    const fromSquare = activeSquare.value;
    if (!fromSquare) return;

    const toSquare = xyToSquare(touchX, touchY, squareSize, orientation);
    isDragging.value = false;
    dragTargetSquare.value = null;

    const rich = richCallbacksRef.current;

    // Fire drag end callback
    const dragged = draggedPieceRef.current;
    if (dragged) {
      rich?.onPieceDragEnd?.(toSquare, dragged.code);
      draggedPieceRef.current = null;
    }

    if (fromSquare !== toSquare) {
      // Check if this is a premove (not your turn)
      const turn = currentTurnRef.current;
      const piece = piecesRef.current.find((p) => p.square === fromSquare);
      const isOwnTurn = piece && turn ? isPieceTurn(piece.color, turn) : true;

      if (premovesEnabled && !isOwnTurn) {
        premoveCallbacksRef.current?.onPremoveSet?.({
          from: fromSquare,
          to: toSquare,
        });
      } else {
        callbacksRef.current.onPieceMoved(fromSquare, toSquare);
      }

      // Move completed — clear selection
      activeSquare.value = null;
      dragPieceCode.value = null;
    }
    // When fromSquare === toSquare (tap with no movement), keep selection alive
    // so the user can complete a click-to-move on the next tap.
  }, [squareSize, orientation, activeSquare, isDragging, dragPieceCode, dragTargetSquare, premovesEnabled]);

  // Long press handler (separate gesture, composed with pan)
  const handleLongPress = useCallback((touchX: number, touchY: number) => {
    const square = xyToSquare(touchX, touchY, squareSize, orientation);
    richCallbacksRef.current?.onSquareLongPress?.(square);
  }, [squareSize, orientation]);

  // --- Build the gesture (STABLE — only changes on layout/config changes) ---
  const canDrag = moveMethod !== 'click';

  // Track the last drag target square to avoid redundant runOnJS calls
  const lastDragTargetCol = useSharedValue(-1);
  const lastDragTargetRow = useSharedValue(-1);

  const gesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(gestureEnabled)
      .minDistance(0) // Also detect taps (zero-distance pans)
      .onBegin((e) => {
        'worklet';
        // Set shared values IMMEDIATELY on the UI thread so onStart can read them
        // synchronously. xyToSquare is tagged 'worklet' — safe to call here.
        // handleBegin (JS thread) will CLEAR activeSquare if the square is invalid.
        const sq = xyToSquare(e.x, e.y, squareSize, orientation);
        activeSquare.value = sq;
        dragX.value = e.x;
        dragY.value = e.y;
        // Bridge to JS for piece lookup + selection logic
        runOnJS(handleBegin)(e.x, e.y);
      })
      .onStart((e) => {
        'worklet';
        if (!canDrag || !activeSquare.value) return;
        isDragging.value = true;
        runOnJS(handleDragStart)(e.x, e.y);
      })
      .onUpdate((e) => {
        'worklet';
        if (!canDrag || !isDragging.value) return;
        // Only 2 shared value writes — no JS bridge, no re-renders
        dragX.value = e.x;
        dragY.value = e.y;

        // Update drag target square (only when square changes to minimize JS bridge calls)
        const col = Math.max(0, Math.min(7, Math.floor(e.x / squareSize)));
        const row = Math.max(0, Math.min(7, Math.floor(e.y / squareSize)));
        if (col !== lastDragTargetCol.value || row !== lastDragTargetRow.value) {
          lastDragTargetCol.value = col;
          lastDragTargetRow.value = row;
          runOnJS(handleDragUpdate)(e.x, e.y);
        }
      })
      .onEnd((e) => {
        'worklet';
        if (!isDragging.value || !activeSquare.value) return;
        runOnJS(handleEnd)(e.x, e.y);
      })
      .onFinalize(() => {
        'worklet';
        // Safety reset if gesture was interrupted
        isDragging.value = false;
        dragTargetSquare.value = null;
        lastDragTargetCol.value = -1;
        lastDragTargetRow.value = -1;
      });
  }, [
    gestureEnabled,
    canDrag,
    squareSize,
    handleBegin,
    handleDragStart,
    handleDragUpdate,
    handleEnd,
    // Shared values are stable refs — listed for exhaustive-deps but don't cause recreations
    activeSquare,
    dragX,
    dragY,
    isDragging,
    dragTargetSquare,
    lastDragTargetCol,
    lastDragTargetRow,
  ]);

  // Compose with long press if the consumer wants it
  // For now, long press is detected via a separate gesture that runs simultaneously.
  // This is done at the board level if needed — keeping the pan gesture clean here.

  return { gesture, gestureState };
}
