import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  type SharedValue,
  type BaseAnimationBuilder,
} from 'react-native-reanimated';

import type { AnimationConfig } from './types';
import { DEFAULT_MOVE_DURATION } from './constants';

type BoardPieceProps = {
  /** Target pixel position (top-left of destination square) */
  targetX: number;
  targetY: number;
  /** Square size in pixels */
  squareSize: number;
  /** Animation config for piece movement (timing or spring) */
  animationConfig?: AnimationConfig;
  /** Fallback move duration if animationConfig not provided */
  moveDuration?: number;
  /** The piece visual (rendered by parent via renderPiece) */
  children: React.ReactElement;
  /** Gesture state: is this piece currently being dragged? */
  activeSquare: SharedValue<string | null>;
  isDragging: SharedValue<boolean>;
  /** This piece's current square */
  square: string;
  /**
   * Exiting animation played when this piece unmounts (e.g. captured).
   * Pass `undefined` to disable (piece disappears instantly on unmount).
   */
  exitingAnimation?: BaseAnimationBuilder | typeof BaseAnimationBuilder;
};

/**
 * Animate a shared value using the provided AnimationConfig.
 * Falls back to withTiming with moveDuration for backwards compatibility.
 */
function animateValue(
  target: number,
  config?: AnimationConfig,
  moveDuration?: number,
): number {
  if (config) {
    if (config.type === 'spring') {
      return withSpring(target, {
        damping: config.damping ?? 15,
        stiffness: config.stiffness ?? 200,
        mass: config.mass ?? 1,
      });
    }
    // timing
    return withTiming(target, {
      duration: config.duration ?? DEFAULT_MOVE_DURATION,
    });
  }

  const duration = moveDuration ?? DEFAULT_MOVE_DURATION;
  if (duration <= 0) return target;
  return withTiming(target, { duration });
}

/**
 * A single animated chess piece.
 *
 * Uses two nested Animated.Views to avoid the Reanimated warning
 * "Property opacity may be overwritten by a layout animation":
 *
 * Outer view: position (transform) + exiting layout animation (FadeOut)
 * Inner view: drag-hide opacity
 *
 * Only `transform` and `opacity` are animated — Reanimated's fast path
 * on Android. No layout properties (top/left/width/height), avoiding
 * costly layout recalculations on low-end devices.
 *
 * During drag:
 * - Inner view hides (opacity: 0) — the drag ghost shows instead
 *
 * After a move:
 * - Outer view snaps to new position via withTiming/withSpring
 *
 * On capture (unmount):
 * - Outer view plays the exitingAnimation (default: FadeOut, no conflict with inner opacity)
 * - Pass exitingAnimation={undefined} to disable (instant disappear on full board remount)
 */
export const BoardPieceView = React.memo(
  function BoardPieceView({
    targetX,
    targetY,
    squareSize,
    animationConfig,
    moveDuration,
    children,
    activeSquare,
    isDragging,
    square,
    exitingAnimation,
  }: BoardPieceProps) {
    // Shared values for smooth animated position — written from JS, read on UI thread
    const currentX = useSharedValue(targetX);
    const currentY = useSharedValue(targetY);

    // When target position changes (piece moved), animate to the new square.
    // useEffect is the correct pattern for reacting to JS prop changes —
    // useDerivedValue is meant for shared-value-to-shared-value derivation.
    useEffect(() => {
      currentX.value = animateValue(targetX, animationConfig, moveDuration);
      currentY.value = animateValue(targetY, animationConfig, moveDuration);
    }, [targetX, targetY, animationConfig, moveDuration, currentX, currentY]);

    // Position style on outer view — no opacity here to avoid conflict
    // with the FadeOut exiting layout animation
    const positionStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: currentX.value },
        { translateY: currentY.value },
      ],
    }));

    // Drag-hide opacity on inner view — separate from the exiting animation
    const opacityStyle = useAnimatedStyle(() => {
      const isBeingDragged = isDragging.value && activeSquare.value === square;
      return { opacity: isBeingDragged ? 0 : 1 };
    });

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: squareSize,
            height: squareSize,
          },
          positionStyle,
        ]}
        // Exiting animation when this piece is captured (removed from the piece list).
        // Lives on the outer view so it doesn't conflict with the
        // drag-hide opacity on the inner view.
        // Pass undefined to disable (e.g. during full board remount via key change).
        exiting={exitingAnimation}
      >
        <Animated.View style={[{ flex: 1 }, opacityStyle]}>
          {children}
        </Animated.View>
      </Animated.View>
    );
  },
  // Custom comparator: only re-render when position, square, or animation config changes
  (prev, next) =>
    prev.targetX === next.targetX &&
    prev.targetY === next.targetY &&
    prev.square === next.square &&
    prev.squareSize === next.squareSize &&
    prev.moveDuration === next.moveDuration &&
    prev.animationConfig === next.animationConfig &&
    prev.children === next.children,
);
