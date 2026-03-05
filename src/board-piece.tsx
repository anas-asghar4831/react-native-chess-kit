import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

type BoardPieceProps = {
  /** Target pixel position (top-left of destination square) */
  targetX: number;
  targetY: number;
  /** Square size in pixels */
  squareSize: number;
  /** Move animation duration in ms */
  moveDuration: number;
  /** The piece visual (rendered by parent via renderPiece) */
  children: React.ReactElement;
  /** Gesture state: is this piece currently being dragged? */
  activeSquare: SharedValue<string | null>;
  isDragging: SharedValue<boolean>;
  /** This piece's current square */
  square: string;
};

/**
 * A single animated chess piece.
 *
 * Animates ONLY `transform` and `opacity` — Reanimated's fast path on Android.
 * No layout properties (top/left/width/height) are animated, avoiding costly
 * layout recalculations on low-end devices.
 *
 * During drag:
 * - Original piece hides (opacity: 0) — the drag ghost shows instead
 * - No position changes on the original piece during drag
 *
 * After a move:
 * - Snaps to new position via withTiming on translateX/translateY
 * - Duration controlled by user's animation speed setting
 */
export const BoardPieceView = React.memo(
  function BoardPieceView({
    targetX,
    targetY,
    squareSize,
    moveDuration,
    children,
    activeSquare,
    isDragging,
    square,
  }: BoardPieceProps) {
    // Shared values for smooth animated position — written from JS, read on UI thread
    const currentX = useSharedValue(targetX);
    const currentY = useSharedValue(targetY);

    // When target position changes (piece moved), animate to the new square.
    // useEffect is the correct pattern for reacting to JS prop changes —
    // useDerivedValue is meant for shared-value-to-shared-value derivation.
    useEffect(() => {
      currentX.value = moveDuration > 0
        ? withTiming(targetX, { duration: moveDuration })
        : targetX;
      currentY.value = moveDuration > 0
        ? withTiming(targetY, { duration: moveDuration })
        : targetY;
    }, [targetX, targetY, moveDuration, currentX, currentY]);

    const animatedStyle = useAnimatedStyle(() => {
      const isBeingDragged = isDragging.value && activeSquare.value === square;

      return {
        transform: [
          { translateX: currentX.value },
          { translateY: currentY.value },
        ],
        // Hide original piece during drag — drag ghost renders on top
        opacity: isBeingDragged ? 0 : 1,
      };
    });

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: squareSize,
            height: squareSize,
          },
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    );
  },
  // Custom comparator: only re-render when position or square changes
  (prev, next) =>
    prev.targetX === next.targetX &&
    prev.targetY === next.targetY &&
    prev.square === next.square &&
    prev.squareSize === next.squareSize &&
    prev.moveDuration === next.moveDuration &&
    prev.children === next.children,
);
