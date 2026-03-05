// react-native-chess-kit
// High-performance chess board for React Native

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export { Board } from './board';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type {
  // Core chess types
  ChessColor,
  MoveMethod,

  // Board component API
  BoardRef,
  BoardProps,
  BoardColors,

  // Piece data (useful for custom piece renderers)
  BoardPiece,
  ParsedPiece,

  // Gesture state (useful for advanced overlays)
  GestureState,

  // Legal move dots (useful if building custom dot rendering)
  LegalMoveTarget,
} from './types';

// ---------------------------------------------------------------------------
// Utility functions (useful for overlay positioning)
// ---------------------------------------------------------------------------

export { squareToXY, xyToSquare } from './use-board-pieces';
