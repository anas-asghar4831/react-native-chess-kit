import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Polygon, Circle as SvgCircle } from 'react-native-svg';

import type { ChessColor, ArrowData, ShapeData } from './types';
import {
  DEFAULT_ARROW_COLOR,
  DEFAULT_SHAPE_COLOR,
  ARROW_STROKE_WIDTH,
  ARROW_HEAD_SIZE,
  ARROW_SHORTEN_BY,
} from './constants';

// ---------------------------------------------------------------------------
// Coordinate utilities (percentage-based viewBox 0-100)
// ---------------------------------------------------------------------------

function squareToViewBoxCenter(
  square: string,
  orientation: ChessColor,
): { x: number; y: number } {
  const fileIdx = square.charCodeAt(0) - 97;
  const rankIdx = parseInt(square[1], 10) - 1;
  const col = orientation === 'white' ? fileIdx : 7 - fileIdx;
  const row = orientation === 'white' ? 7 - rankIdx : rankIdx;
  return {
    x: (col + 0.5) * 12.5,
    y: (row + 0.5) * 12.5,
  };
}

function calculateArrowPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  shortenBy: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };

  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: from.x + ux * shortenBy,
    y1: from.y + uy * shortenBy,
    x2: to.x - ux * shortenBy,
    y2: to.y - uy * shortenBy,
  };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type BoardArrowsProps = {
  boardSize: number;
  orientation: ChessColor;
  arrows?: ArrowData[];
  shapes?: ShapeData[];
};

// ---------------------------------------------------------------------------
// Combined arrows + shapes SVG layer
// ---------------------------------------------------------------------------

/**
 * SVG overlay for arrows and shapes drawn on the board.
 *
 * Uses a percentage-based 100x100 viewBox so coordinates map cleanly
 * to the 8x8 grid (each square = 12.5 x 12.5 units).
 *
 * Renders above the pieces layer so arrows are always visible.
 */
export const BoardArrows = React.memo(function BoardArrows({
  boardSize,
  orientation,
  arrows,
  shapes,
}: BoardArrowsProps) {
  const hasArrows = arrows && arrows.length > 0;
  const hasShapes = shapes && shapes.length > 0;

  if (!hasArrows && !hasShapes) return null;

  return (
    <View
      style={{ position: 'absolute', width: boardSize, height: boardSize }}
      pointerEvents="none"
    >
      <Svg viewBox="0 0 100 100" width={boardSize} height={boardSize}>
        {/* Shapes (circles) -- drawn under arrows */}
        {hasShapes &&
          shapes.map((shape, i) => {
            if (shape.type === 'circle') {
              const center = squareToViewBoxCenter(shape.square, orientation);
              const color = shape.color ?? DEFAULT_SHAPE_COLOR;
              return (
                <SvgCircle
                  key={`circle-${shape.square}-${i}`}
                  cx={center.x}
                  cy={center.y}
                  r={5.5}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.2}
                  opacity={0.85}
                />
              );
            }
            return null;
          })}

        {/* Arrows */}
        {hasArrows &&
          arrows.map((arrow, i) => (
            <ArrowSvg
              key={`arrow-${arrow.from}-${arrow.to}-${i}`}
              from={arrow.from}
              to={arrow.to}
              color={arrow.color ?? DEFAULT_ARROW_COLOR}
              width={arrow.width ?? ARROW_STROKE_WIDTH}
              orientation={orientation}
            />
          ))}
      </Svg>
    </View>
  );
});

// ---------------------------------------------------------------------------
// Single arrow SVG element
// ---------------------------------------------------------------------------

type ArrowSvgProps = {
  from: string;
  to: string;
  color: string;
  width: number;
  orientation: ChessColor;
};

const ArrowSvg = React.memo(function ArrowSvg({
  from,
  to,
  color,
  width,
  orientation,
}: ArrowSvgProps) {
  const fromCoord = squareToViewBoxCenter(from, orientation);
  const toCoord = squareToViewBoxCenter(to, orientation);
  const path = calculateArrowPath(fromCoord, toCoord, ARROW_SHORTEN_BY);

  const dx = path.x2 - path.x1;
  const dy = path.y2 - path.y1;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len === 0) return null;

  const ux = dx / len;
  const uy = dy / len;
  const headSize = ARROW_HEAD_SIZE;

  const tip = { x: path.x2, y: path.y2 };
  const baseLeft = {
    x: path.x2 - ux * headSize * 2 + uy * headSize,
    y: path.y2 - uy * headSize * 2 - ux * headSize,
  };
  const baseRight = {
    x: path.x2 - ux * headSize * 2 - uy * headSize,
    y: path.y2 - uy * headSize * 2 + ux * headSize,
  };

  const arrowPoints = `${tip.x},${tip.y} ${baseLeft.x},${baseLeft.y} ${baseRight.x},${baseRight.y}`;

  return (
    <>
      <Line
        x1={path.x1}
        y1={path.y1}
        x2={path.x2 - ux * headSize * 2}
        y2={path.y2 - uy * headSize * 2}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        opacity={0.85}
      />
      <Polygon points={arrowPoints} fill={color} opacity={0.85} />
    </>
  );
});

// ---------------------------------------------------------------------------
// Standalone exports for advanced consumers
// ---------------------------------------------------------------------------

export { ArrowSvg as Arrow };
