import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import type { ChessColor, HighlightData } from './types';
import { squareToXY } from './use-board-pieces';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type BoardHighlightsProps = {
  boardSize: number;
  orientation: ChessColor;
  squareSize: number;
  /** Last move squares to highlight */
  lastMove?: { from: string; to: string } | null;
  lastMoveColor: string;
  /** Check highlight on king square (auto-detected) */
  checkSquare?: string | null;
  checkColor: string;
  /** Selected piece square */
  selectedSquare?: string | null;
  selectedColor: string;
  /** Premove squares */
  premoveSquares?: { from: string; to: string } | null;
  premoveColor: string;
  /** Custom highlights from consumer */
  highlights?: HighlightData[];
  /** Imperative highlights (from ref.highlight()) */
  imperativeHighlights?: HighlightData[];
};

type DragTargetHighlightProps = {
  squareSize: number;
  orientation: ChessColor;
  dragTargetSquare: SharedValue<string | null>;
  color: string;
};

// ---------------------------------------------------------------------------
// Static highlights (View-based, no animation needed)
// ---------------------------------------------------------------------------

/**
 * Renders all board square highlights as a single layer.
 *
 * Combines multiple highlight sources (last move, check, selected piece,
 * premoves, custom, and imperative) into one flat list of colored rectangles.
 * Rendered between the background and pieces layers.
 *
 * Uses plain Views (not Animated) because highlights change discretely
 * on move events, not during animation frames.
 */
export const BoardHighlights = React.memo(function BoardHighlights({
  boardSize,
  orientation,
  squareSize,
  lastMove,
  lastMoveColor,
  checkSquare,
  checkColor,
  selectedSquare,
  selectedColor,
  premoveSquares,
  premoveColor,
  highlights,
  imperativeHighlights,
}: BoardHighlightsProps) {
  // Collect all highlights into a flat array (ordered by visual priority: bottom to top)
  const allHighlights: HighlightData[] = [];

  // Last move (lowest priority -- drawn first, underneath everything)
  if (lastMove) {
    allHighlights.push({ square: lastMove.from, color: lastMoveColor });
    allHighlights.push({ square: lastMove.to, color: lastMoveColor });
  }

  // Premove highlights
  if (premoveSquares) {
    allHighlights.push({ square: premoveSquares.from, color: premoveColor });
    allHighlights.push({ square: premoveSquares.to, color: premoveColor });
  }

  // Selected piece square
  if (selectedSquare) {
    allHighlights.push({ square: selectedSquare, color: selectedColor });
  }

  // Check indicator (king square)
  if (checkSquare) {
    allHighlights.push({ square: checkSquare, color: checkColor });
  }

  // Consumer-provided custom highlights
  if (highlights) {
    for (const h of highlights) {
      allHighlights.push(h);
    }
  }

  // Imperative highlights (from ref.highlight() calls)
  if (imperativeHighlights) {
    for (const h of imperativeHighlights) {
      allHighlights.push(h);
    }
  }

  if (allHighlights.length === 0) return null;

  return (
    <View
      style={{ position: 'absolute', width: boardSize, height: boardSize }}
      pointerEvents="none"
    >
      {allHighlights.map((h, i) => {
        const { x, y } = squareToXY(h.square, squareSize, orientation);
        return (
          <View
            key={`${h.square}-${h.color}-${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: squareSize,
              height: squareSize,
              backgroundColor: h.color,
            }}
          />
        );
      })}
    </View>
  );
});

// ---------------------------------------------------------------------------
// Drag target highlight (Animated, updates on UI thread during drag)
// ---------------------------------------------------------------------------

/**
 * Highlight on the square currently under the dragged piece.
 * Uses Reanimated shared values for zero-JS-bridge updates during drag.
 */
export const DragTargetHighlight = React.memo(function DragTargetHighlight({
  squareSize,
  orientation,
  dragTargetSquare,
  color,
}: DragTargetHighlightProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const square = dragTargetSquare.value;
    if (!square) {
      return { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }] };
    }

    // Inline coordinate calculation (worklet-safe, no function call)
    const fileIdx = square.charCodeAt(0) - 97;
    const rankIdx = parseInt(square[1], 10) - 1;
    const col = orientation === 'white' ? fileIdx : 7 - fileIdx;
    const row = orientation === 'white' ? 7 - rankIdx : rankIdx;

    return {
      opacity: 1,
      transform: [
        { translateX: col * squareSize },
        { translateY: row * squareSize },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: squareSize,
          height: squareSize,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
});

// ---------------------------------------------------------------------------
// Standalone SquareHighlight (exported for advanced consumers)
// ---------------------------------------------------------------------------

type SquareHighlightProps = {
  square: string;
  color: string;
  squareSize: number;
  orientation: ChessColor;
};

/**
 * Single square highlight component.
 * Exported for consumers who build their own overlay layers.
 */
export const SquareHighlight = React.memo(function SquareHighlight({
  square,
  color,
  squareSize,
  orientation,
}: SquareHighlightProps) {
  const { x, y } = squareToXY(square, squareSize, orientation);

  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: squareSize,
        height: squareSize,
        backgroundColor: color,
      }}
      pointerEvents="none"
    />
  );
});
