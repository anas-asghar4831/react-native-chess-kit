import { useMemo, useCallback, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';

import type { ChessColor, MoveMethod, BoardPiece, LegalMoveTarget, GestureState } from './types';
import { xyToSquare } from './use-board-pieces';

type GestureCallbacks = {
  onPieceSelected: (square: string) => void;
  onPieceMoved: (from: string, to: string) => void;
  onSelectionCleared: () => void;
};

type UseBoardGestureParams = {
  squareSize: number;
  orientation: ChessColor;
  gestureEnabled: boolean;
  player: ChessColor | 'both';
  moveMethod: MoveMethod;
  pieces: BoardPiece[];
  callbacks: GestureCallbacks;
  /** Currently selected square (for tap-to-move second tap) */
  selectedSquare: string | null;
  /** Legal move targets from the currently selected piece */
  legalMoves: LegalMoveTarget[];
};

type UseBoardGestureReturn = {
  gesture: ReturnType<typeof Gesture.Pan>;
  gestureState: GestureState;
};

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
 */
export function useBoardGesture({
  squareSize,
  orientation,
  gestureEnabled,
  player,
  moveMethod,
  pieces,
  callbacks,
  selectedSquare,
  legalMoves,
}: UseBoardGestureParams): UseBoardGestureReturn {
  // Shared values for drag tracking — updated on UI thread only
  const activeSquare = useSharedValue<string | null>(null);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragPieceCode = useSharedValue<string | null>(null);

  const gestureState: GestureState = {
    activeSquare,
    dragX,
    dragY,
    isDragging,
    dragPieceCode,
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

  // --- JS-thread bridge functions called from worklets via runOnJS ---
  // These read current values from refs, so they always have fresh data.

  const handleBegin = useCallback((touchX: number, touchY: number) => {
    const square = xyToSquare(touchX, touchY, squareSize, orientation);
    const currentPieces = piecesRef.current;
    const currentSelected = selectedSquareRef.current;
    const currentLegalMoves = legalMovesRef.current;
    const cbs = callbacksRef.current;
    const canClick = moveMethod !== 'drag';

    // Build lookup for the current touch
    const piece = currentPieces.find((p) => p.square === square);
    const isPlayerPiece = piece
      ? player === 'both' || (piece.color === 'w' ? 'white' : 'black') === player
      : false;

    // Click-to-move: second tap on a legal target square
    const legalSquares = new Set(currentLegalMoves.map((m) => m.square));
    if (canClick && currentSelected && legalSquares.has(square)) {
      cbs.onPieceMoved(currentSelected, square);
      activeSquare.value = null;
      isDragging.value = false;
      dragPieceCode.value = null;
      return;
    }

    if (isPlayerPiece && piece) {
      // Tapped/started dragging a player piece
      activeSquare.value = square;
      dragX.value = touchX;
      dragY.value = touchY;
      dragPieceCode.value = piece.code;
      cbs.onPieceSelected(square);
    } else {
      // Tapped empty square or opponent piece — clear selection
      activeSquare.value = null;
      dragPieceCode.value = null;
      if (currentSelected) {
        cbs.onSelectionCleared();
      }
    }
  }, [squareSize, orientation, player, moveMethod, activeSquare, dragX, dragY, isDragging, dragPieceCode]);

  const handleEnd = useCallback((touchX: number, touchY: number) => {
    const fromSquare = activeSquare.value;
    if (!fromSquare) return;

    const toSquare = xyToSquare(touchX, touchY, squareSize, orientation);
    isDragging.value = false;

    if (fromSquare !== toSquare) {
      callbacksRef.current.onPieceMoved(fromSquare, toSquare);
    }

    activeSquare.value = null;
    dragPieceCode.value = null;
  }, [squareSize, orientation, activeSquare, isDragging, dragPieceCode]);

  // --- Build the gesture (STABLE — only changes on layout/config changes) ---
  const canDrag = moveMethod !== 'click';

  const gesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(gestureEnabled)
      .minDistance(0) // Also detect taps (zero-distance pans)
      .onBegin((e) => {
        'worklet';
        // Bridge to JS for piece lookup + selection logic
        runOnJS(handleBegin)(e.x, e.y);
      })
      .onStart(() => {
        'worklet';
        if (!canDrag || !activeSquare.value) return;
        isDragging.value = true;
      })
      .onUpdate((e) => {
        'worklet';
        if (!canDrag || !isDragging.value) return;
        // Only 2 shared value writes — no JS bridge, no re-renders
        dragX.value = e.x;
        dragY.value = e.y;
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
      });
  }, [
    gestureEnabled,
    canDrag,
    handleBegin,
    handleEnd,
    // Shared values are stable refs — listed for exhaustive-deps but don't cause recreations
    activeSquare,
    dragX,
    dragY,
    isDragging,
  ]);

  return { gesture, gestureState };
}
