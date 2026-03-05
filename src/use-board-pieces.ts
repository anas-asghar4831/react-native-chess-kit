import { useMemo, useRef } from 'react';

import type { ChessColor, BoardPiece, ParsedPiece } from './types';

const FEN_PIECE_MAP: Record<string, { code: string; color: 'w' | 'b' }> = {
  p: { code: 'bp', color: 'b' },
  r: { code: 'br', color: 'b' },
  n: { code: 'bn', color: 'b' },
  b: { code: 'bb', color: 'b' },
  q: { code: 'bq', color: 'b' },
  k: { code: 'bk', color: 'b' },
  P: { code: 'wp', color: 'w' },
  R: { code: 'wr', color: 'w' },
  N: { code: 'wn', color: 'w' },
  B: { code: 'wb', color: 'w' },
  Q: { code: 'wq', color: 'w' },
  K: { code: 'wk', color: 'w' },
};

const FILES = 'abcdefgh';

/**
 * Parse the piece-placement part of a FEN string into an array of pieces.
 * Pure function — no React dependencies, suitable for worklets if needed.
 */
function parseFenPieces(fen: string): ParsedPiece[] {
  const placement = fen.split(' ')[0];
  const ranks = placement.split('/');
  const pieces: ParsedPiece[] = [];

  for (let rankIdx = 0; rankIdx < ranks.length; rankIdx++) {
    const rank = ranks[rankIdx];
    let fileIdx = 0;

    for (const char of rank) {
      if (char >= '1' && char <= '8') {
        fileIdx += parseInt(char, 10);
        continue;
      }

      const mapping = FEN_PIECE_MAP[char];
      if (mapping) {
        // FEN ranks are from rank 8 (index 0) down to rank 1 (index 7)
        const square = `${FILES[fileIdx]}${8 - rankIdx}`;
        pieces.push({ code: mapping.code, square, color: mapping.color });
      }
      fileIdx++;
    }
  }

  return pieces;
}

/**
 * Convert square notation to pixel coordinates (top-left corner).
 * Orientation-aware: flips the board when playing as black.
 */
export function squareToXY(
  square: string,
  squareSize: number,
  orientation: ChessColor,
): { x: number; y: number } {
  'worklet';
  const fileIdx = square.charCodeAt(0) - 97; // 'a'=0 .. 'h'=7
  const rankIdx = parseInt(square[1], 10) - 1; // '1'=0 .. '8'=7

  const col = orientation === 'white' ? fileIdx : 7 - fileIdx;
  const row = orientation === 'white' ? 7 - rankIdx : rankIdx;

  return { x: col * squareSize, y: row * squareSize };
}

/**
 * Convert pixel coordinates to a square notation string.
 * Clamps to board bounds. Orientation-aware.
 */
export function xyToSquare(
  x: number,
  y: number,
  squareSize: number,
  orientation: ChessColor,
): string {
  'worklet';
  const col = Math.max(0, Math.min(7, Math.floor(x / squareSize)));
  const row = Math.max(0, Math.min(7, Math.floor(y / squareSize)));

  const fileIdx = orientation === 'white' ? col : 7 - col;
  const rankIdx = orientation === 'white' ? 7 - row : row;

  // String.fromCharCode not available in worklets — use lookup
  const files = 'abcdefgh';
  return `${files[fileIdx]}${rankIdx + 1}`;
}

/**
 * Manages the piece list derived from FEN, with stable IDs for React keys.
 *
 * Stable IDs prevent unmount/remount cycles when pieces change position.
 * A piece keeps its ID as long as it exists on the board — only capture
 * (removal) or promotion (code change) creates a new ID.
 */
export function useBoardPieces(fen: string): BoardPiece[] {
  // Track piece-code counters across renders for stable ID assignment
  const idCounterRef = useRef<Record<string, number>>({});
  const prevPiecesRef = useRef<BoardPiece[]>([]);

  return useMemo(() => {
    const parsed = parseFenPieces(fen);
    const prev = prevPiecesRef.current;
    const prevBySquare = new Map(prev.map((p) => [p.square, p]));

    // Try to reuse IDs from previous render:
    // 1. Same code on same square -> keep ID (piece didn't move)
    // 2. Same code moved to a new square -> find unmatched previous piece of same code
    const usedPrevIds = new Set<string>();
    const result: BoardPiece[] = [];

    // First pass: exact square matches (piece stayed or appeared on same square)
    const unmatched: ParsedPiece[] = [];
    for (const p of parsed) {
      const existing = prevBySquare.get(p.square);
      if (existing && existing.code === p.code && !usedPrevIds.has(existing.id)) {
        usedPrevIds.add(existing.id);
        result.push({ ...p, id: existing.id });
      } else {
        unmatched.push(p);
      }
    }

    // Second pass: match unmatched pieces by code to previous pieces that moved
    for (const p of unmatched) {
      let matchedId: string | null = null;

      for (const prevPiece of prev) {
        if (
          prevPiece.code === p.code &&
          !usedPrevIds.has(prevPiece.id)
        ) {
          matchedId = prevPiece.id;
          usedPrevIds.add(prevPiece.id);
          break;
        }
      }

      if (matchedId) {
        result.push({ ...p, id: matchedId });
      } else {
        // New piece (promotion, or first render) — assign fresh ID
        const counter = idCounterRef.current;
        counter[p.code] = (counter[p.code] ?? 0) + 1;
        result.push({ ...p, id: `${p.code}-${counter[p.code]}` });
      }
    }

    prevPiecesRef.current = result;
    return result;
  }, [fen]);
}
