import React from 'react';
import type { SharedValue } from 'react-native-reanimated';

import type { ChessColor, BoardPiece } from './types';
import { BoardPieceView } from './board-piece';
import { squareToXY } from './use-board-pieces';

type BoardPiecesProps = {
  pieces: BoardPiece[];
  squareSize: number;
  orientation: ChessColor;
  moveDuration: number;
  renderPiece: (code: string, size: number) => React.ReactElement;
  activeSquare: SharedValue<string | null>;
  isDragging: SharedValue<boolean>;
};

/**
 * Renders all pieces on the board.
 *
 * Each piece gets a stable key (from useBoardPieces) so React doesn't
 * unmount/remount pieces that moved — it updates their position props
 * and the BoardPieceView animates the transition.
 */
export const BoardPiecesLayer = React.memo(function BoardPiecesLayer({
  pieces,
  squareSize,
  orientation,
  moveDuration,
  renderPiece,
  activeSquare,
  isDragging,
}: BoardPiecesProps) {
  return (
    <>
      {pieces.map((piece) => {
        const { x, y } = squareToXY(piece.square, squareSize, orientation);

        return (
          <BoardPieceView
            key={piece.id}
            targetX={x}
            targetY={y}
            squareSize={squareSize}
            moveDuration={moveDuration}
            activeSquare={activeSquare}
            isDragging={isDragging}
            square={piece.square}
          >
            {renderPiece(piece.code, squareSize)}
          </BoardPieceView>
        );
      })}
    </>
  );
});
