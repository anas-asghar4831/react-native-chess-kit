import React from 'react';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

type BoardDragGhostProps = {
  squareSize: number;
  isDragging: SharedValue<boolean>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  dragPieceCode: SharedValue<string | null>;
  /** Render the piece image for a given piece code */
  renderPiece: (code: string, size: number) => React.ReactElement;
};

/**
 * Floating piece that follows the user's finger during drag.
 *
 * Only ONE instance exists — not one per piece. It reads drag position
 * from shared values on the UI thread, so zero JS bridge calls and
 * zero re-renders while dragging.
 */
export const BoardDragGhost = React.memo(function BoardDragGhost({
  squareSize,
  isDragging,
  dragX,
  dragY,
  dragPieceCode,
  renderPiece,
}: BoardDragGhostProps) {
  const animatedStyle = useAnimatedStyle(() => {
    if (!isDragging.value || !dragPieceCode.value) {
      return { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }] };
    }

    return {
      opacity: 1,
      // Center the piece on the finger, slightly above for visibility
      transform: [
        { translateX: dragX.value - squareSize / 2 },
        { translateY: dragY.value - squareSize },
        { scale: 1.1 },
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
          zIndex: 100,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <DragGhostContent
        renderPiece={renderPiece}
        squareSize={squareSize}
        dragPieceCode={dragPieceCode}
      />
    </Animated.View>
  );
});

/**
 * Inner content that renders the actual piece image.
 * Separate component so the Animated.View wrapper doesn't need
 * to re-render when the piece code changes — it uses shared value.
 */
const DragGhostContent = React.memo(function DragGhostContent({
  renderPiece,
  squareSize,
  dragPieceCode,
}: {
  renderPiece: (code: string, size: number) => React.ReactElement;
  squareSize: number;
  dragPieceCode: SharedValue<string | null>;
}) {
  // We render all 12 possible piece types and show/hide based on dragPieceCode.
  // This avoids re-mounting the Image component during drag.
  // Only the opacity changes — pure worklet animation.
  const codes = PIECE_CODES;

  return (
    <>
      {codes.map((code) => (
        <GhostPieceSlot
          key={code}
          code={code}
          squareSize={squareSize}
          dragPieceCode={dragPieceCode}
          renderPiece={renderPiece}
        />
      ))}
    </>
  );
});

const GhostPieceSlot = React.memo(function GhostPieceSlot({
  code,
  squareSize,
  dragPieceCode,
  renderPiece,
}: {
  code: string;
  squareSize: number;
  dragPieceCode: SharedValue<string | null>;
  renderPiece: (code: string, size: number) => React.ReactElement;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: dragPieceCode.value === code ? 1 : 0,
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: squareSize, height: squareSize },
        animatedStyle,
      ]}
    >
      {renderPiece(code, squareSize)}
    </Animated.View>
  );
});

// All 12 piece codes — pre-computed to avoid allocation
const PIECE_CODES = ['wp', 'wn', 'wb', 'wr', 'wq', 'wk', 'bp', 'bn', 'bb', 'br', 'bq', 'bk'];
