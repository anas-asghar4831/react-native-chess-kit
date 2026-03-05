import { useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';

import type { ChessColor, BoardPiece, LegalMoveTarget } from './types';

type MoveResult = {
  /** Whether the move was applied to the internal chess.js instance */
  applied: boolean;
  /** The new FEN after the move (if applied) */
  fen?: string;
};

type BoardStateReturn = {
  /** Get legal moves for a piece on the given square */
  getLegalMoves: (square: string) => LegalMoveTarget[];
  /** Check if a given square has a piece belonging to the active player */
  isPlayerPiece: (square: string, pieces: BoardPiece[], player: ChessColor | 'both') => boolean;
  /** Apply a move to the internal chess state. Returns the new FEN if valid. */
  applyMove: (from: string, to: string, promotion?: string) => MoveResult;
  /** Undo the last move on the internal chess state */
  undoMove: () => string | null;
  /** Load a new FEN into the internal chess state */
  loadFen: (fen: string) => void;
  /** Get the current FEN from internal state */
  getFen: () => string;
  /** Get the current turn from internal state */
  getTurn: () => 'w' | 'b';
};

/**
 * Manages the internal chess.js instance for legal move validation.
 *
 * This mirrors the visual board state. When the parent passes a new FEN,
 * the internal chess.js is synced. Legal move queries and move application
 * happen against this instance.
 *
 * The chess.js instance lives in a ref — no React state, no re-renders.
 */
export function useBoardState(initialFen: string): BoardStateReturn {
  const chessRef = useRef<Chess>(null!);
  if (!chessRef.current) chessRef.current = new Chess(initialFen);

  const getLegalMoves = useCallback((square: string): LegalMoveTarget[] => {
    try {
      const moves = chessRef.current.moves({ square: square as Square, verbose: true });
      return moves.map((m) => ({
        square: m.to,
        isCapture: m.captured !== undefined,
      }));
    } catch {
      return [];
    }
  }, []);

  const isPlayerPiece = useCallback(
    (square: string, pieces: BoardPiece[], player: ChessColor | 'both'): boolean => {
      const piece = pieces.find((p) => p.square === square);
      if (!piece) return false;

      if (player === 'both') return true;

      const pieceColor: ChessColor = piece.color === 'w' ? 'white' : 'black';
      return pieceColor === player;
    },
    [],
  );

  const applyMove = useCallback((from: string, to: string, promotion?: string): MoveResult => {
    try {
      chessRef.current.move({
        from: from as Square,
        to: to as Square,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });
      return { applied: true, fen: chessRef.current.fen() };
    } catch {
      return { applied: false };
    }
  }, []);

  const undoMove = useCallback((): string | null => {
    const result = chessRef.current.undo();
    return result ? chessRef.current.fen() : null;
  }, []);

  const loadFen = useCallback((fen: string) => {
    chessRef.current.load(fen);
  }, []);

  const getFen = useCallback(() => chessRef.current.fen(), []);

  const getTurn = useCallback(() => chessRef.current.turn(), []);

  return {
    getLegalMoves,
    isPlayerPiece,
    applyMove,
    undoMove,
    loadFen,
    getFen,
    getTurn,
  };
}
