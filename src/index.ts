// react-native-chess-kit
// High-performance chess board for React Native

// ---------------------------------------------------------------------------
// Main components
// ---------------------------------------------------------------------------

export { Board } from './board';
export { StaticBoard } from './static-board';

// ---------------------------------------------------------------------------
// Overlay primitives (for advanced consumers building custom layers)
// ---------------------------------------------------------------------------

export { SquareHighlight } from './board-highlights';
export { Arrow } from './board-arrows';
export { Annotation } from './board-annotations';
export { PromotionPicker } from './promotion-picker';

// ---------------------------------------------------------------------------
// Default piece set
// ---------------------------------------------------------------------------

export { DefaultPieceSet } from './pieces';

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

export { BOARD_THEMES, BOARD_COLORS } from './themes';

// ---------------------------------------------------------------------------
// Constants (useful for custom overlays matching library defaults)
// ---------------------------------------------------------------------------

export {
  DEFAULT_BOARD_COLORS,
  DEFAULT_LAST_MOVE_COLOR,
  DEFAULT_CHECK_COLOR,
  DEFAULT_SELECTED_COLOR,
  DEFAULT_PREMOVE_COLOR,
  DEFAULT_DRAG_TARGET_COLOR,
  DEFAULT_ARROW_COLOR,
  DEFAULT_SHAPE_COLOR,
  DEFAULT_ANNOTATION_BG,
  DEFAULT_ANNOTATION_TEXT,
  DEFAULT_MOVE_DURATION,
  CAPTURE_FADE_DURATION,
} from './constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type {
  // Core chess types
  ChessColor,
  MoveMethod,
  PromotionPiece,
  HapticType,
  PieceCode,

  // Board component API
  BoardRef,
  BoardProps,
  BoardColors,
  StaticBoardProps,
  CoordinatePosition,

  // Piece data (useful for custom piece renderers)
  BoardPiece,
  ParsedPiece,
  PieceSetMap,

  // Overlay data types
  HighlightData,
  ArrowData,
  ShapeData,
  AnnotationData,
  PremoveData,

  // Animation config
  AnimationConfig,
  TimingAnimationConfig,
  SpringAnimationConfig,

  // Board theme
  BoardTheme,

  // Gesture state (useful for advanced overlays)
  GestureState,

  // Legal move dots (useful if building custom dot rendering)
  LegalMoveTarget,
} from './types';

// ---------------------------------------------------------------------------
// Utility functions (useful for overlay positioning)
// ---------------------------------------------------------------------------

export { squareToXY, xyToSquare } from './use-board-pieces';
