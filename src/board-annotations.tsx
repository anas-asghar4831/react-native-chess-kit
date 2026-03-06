import React from 'react';
import { View, Text } from 'react-native';

import type { ChessColor, AnnotationData } from './types';
import { squareToXY } from './use-board-pieces';
import { DEFAULT_ANNOTATION_BG, DEFAULT_ANNOTATION_TEXT, ANNOTATION_SCALE } from './constants';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type BoardAnnotationsProps = {
  boardSize: number;
  orientation: ChessColor;
  squareSize: number;
  annotations: AnnotationData[];
};

// ---------------------------------------------------------------------------
// Annotations layer
// ---------------------------------------------------------------------------

/**
 * Text annotation badges on chess squares (!, ?, !!, ??, etc.).
 *
 * Each annotation appears as a small colored badge at the top-right
 * corner of the target square. Positioned absolutely, pointer-events none.
 */
export const BoardAnnotations = React.memo(function BoardAnnotations({
  boardSize,
  orientation,
  squareSize,
  annotations,
}: BoardAnnotationsProps) {
  if (annotations.length === 0) return null;

  const badgeSize = squareSize * ANNOTATION_SCALE;
  const fontSize = badgeSize * 0.65;

  return (
    <View
      style={{ position: 'absolute', width: boardSize, height: boardSize }}
      pointerEvents="none"
    >
      {annotations.map((ann, i) => {
        const { x, y } = squareToXY(ann.square, squareSize, orientation);
        const bgColor = ann.backgroundColor ?? DEFAULT_ANNOTATION_BG;
        const textColor = ann.color ?? DEFAULT_ANNOTATION_TEXT;

        return (
          <View
            key={`ann-${ann.square}-${i}`}
            style={{
              position: 'absolute',
              // Position at top-right corner of the square
              left: x + squareSize - badgeSize - 1,
              top: y + 1,
              minWidth: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: bgColor,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 2,
            }}
          >
            <Text
              style={{
                color: textColor,
                fontSize,
                fontWeight: '700',
                lineHeight: badgeSize * 0.85,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {ann.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

// ---------------------------------------------------------------------------
// Standalone export for advanced consumers
// ---------------------------------------------------------------------------

type AnnotationBadgeProps = {
  square: string;
  text: string;
  squareSize: number;
  orientation: ChessColor;
  color?: string;
  backgroundColor?: string;
};

/**
 * Single annotation badge component.
 * Exported for consumers who build their own overlay layers.
 */
export const Annotation = React.memo(function Annotation({
  square,
  text,
  squareSize,
  orientation,
  color,
  backgroundColor,
}: AnnotationBadgeProps) {
  const { x, y } = squareToXY(square, squareSize, orientation);
  const badgeSize = squareSize * ANNOTATION_SCALE;
  const fontSize = badgeSize * 0.65;
  const bgColor = backgroundColor ?? DEFAULT_ANNOTATION_BG;
  const textColor = color ?? DEFAULT_ANNOTATION_TEXT;

  return (
    <View
      style={{
        position: 'absolute',
        left: x + squareSize - badgeSize - 1,
        top: y + 1,
        minWidth: badgeSize,
        height: badgeSize,
        borderRadius: badgeSize / 2,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
      }}
      pointerEvents="none"
    >
      <Text
        style={{
          color: textColor,
          fontSize,
          fontWeight: '700',
          lineHeight: badgeSize * 0.85,
          textAlign: 'center',
        }}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
});
