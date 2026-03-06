import { useState, useCallback } from 'react';

import type { PremoveData } from './types';

type UsePremoveReturn = {
  /** The currently queued premove (only one at a time, like lichess) */
  premove: PremoveData | null;
  /** Queue a premove. Replaces any existing premove. */
  setPremove: (premove: PremoveData) => void;
  /** Clear the queued premove */
  clearPremove: () => void;
  /**
   * Try to execute the queued premove.
   * Returns the premove if one was queued (so the caller can apply it),
   * then clears the queue. Returns null if no premove was queued.
   */
  consumePremove: () => PremoveData | null;
};

/**
 * Manages a single premove queue (one premove at a time).
 *
 * Premoves work like lichess:
 * 1. When it's not your turn, you can drag/click a move — it queues as a premove
 * 2. The premove squares are highlighted with a distinct color
 * 3. When your turn begins (FEN changes and it's now your turn), the premove
 *    is automatically attempted via the board's internal chess.js
 * 4. If the premove is legal, it's applied; if not, it's silently discarded
 *
 * The board.tsx orchestrates this: it calls consumePremove() in a useEffect
 * that watches the FEN (turn change), then attempts the move.
 */
export function usePremove(): UsePremoveReturn {
  const [premove, setPremoveState] = useState<PremoveData | null>(null);

  const setPremove = useCallback((pm: PremoveData) => {
    setPremoveState(pm);
  }, []);

  const clearPremove = useCallback(() => {
    setPremoveState(null);
  }, []);

  const consumePremove = useCallback((): PremoveData | null => {
    let consumed: PremoveData | null = null;
    setPremoveState((current) => {
      consumed = current;
      return null;
    });
    return consumed;
  }, []);

  return {
    premove,
    setPremove,
    clearPremove,
    consumePremove,
  };
}
