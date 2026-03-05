import type { SharedValue } from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Core chess types
// ---------------------------------------------------------------------------

/** Board orientation / side color */
export type ChessColor = 'white' | 'black';

/** How the user interacts with pieces */
export type MoveMethod = 'drag' | 'click' | 'both';

// ---------------------------------------------------------------------------
// Piece data
// ---------------------------------------------------------------------------

/** A single piece on the board with its position and identity */
export type BoardPiece = {
  /** Unique stable identifier (survives position changes): e.g. "wp-0", "bk-0" */
  id: string;
  /** Piece code matching standard notation: 'wp', 'wn', 'wb', 'wr', 'wq', 'wk', 'bp', etc. */
  code: string;
  /** Current square in algebraic notation: 'a1'..'h8' */
  square: string;
  /** 'w' or 'b' */
  color: 'w' | 'b';
};

/** Intermediate representation from FEN parsing (before ID assignment) */
export type ParsedPiece = {
  code: string;
  square: string;
  color: 'w' | 'b';
};

// ---------------------------------------------------------------------------
// Board ref (exposed to consumers via forwardRef)
// ---------------------------------------------------------------------------

export type BoardRef = {
  /** Pre-apply a move to internal state. Visual animation happens when parent updates the FEN prop. */
  move: (move: { from: string; to: string }) => void;
  /** Highlight a square with a color */
  highlight: (square: string, color: string) => void;
  /** Clear all imperative highlights */
  clearHighlights: () => void;
  /** Reset board to a new FEN position */
  resetBoard: (fen: string) => void;
  /** Undo the last visually applied move (snap back to previous position) */
  undo: () => void;
};

// ---------------------------------------------------------------------------
// Board props
// ---------------------------------------------------------------------------

export type BoardColors = {
  light: string;
  dark: string;
};

export type BoardProps = {
  /** Current board position in FEN notation */
  fen: string;
  /** Which color is at the bottom of the board */
  orientation: ChessColor;
  /** Board width/height in pixels */
  boardSize: number;
  /** Whether gesture interaction is enabled */
  gestureEnabled: boolean;
  /** Which side can interact: 'white', 'black', or 'both' */
  player: ChessColor | 'both';
  /** Called after a visual move is applied */
  onMove?: (info: { from: string; to: string }) => void;
  /** Board square colors */
  colors: BoardColors;
  /** Move animation duration in ms (0 = instant) */
  moveDuration: number;
  /** Whether to show file labels (a-h) */
  withLetters: boolean;
  /** Whether to show rank numbers (1-8) */
  withNumbers: boolean;
  /** Custom piece renderer. Receives piece code ('wp', 'bk', etc.) and pixel size. */
  renderPiece?: (pieceCode: string, size: number) => React.ReactElement;
  /** Whether to show legal move dots when a piece is selected */
  showLegalMoves: boolean;
  /** How the user moves pieces */
  moveMethod: MoveMethod;
};

// ---------------------------------------------------------------------------
// Gesture shared values (internal, but exported for advanced overlay use)
// ---------------------------------------------------------------------------

export type GestureState = {
  /** Square the active piece started from (null if no drag/selection) */
  activeSquare: SharedValue<string | null>;
  /** Current drag position in board-local pixels */
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  /** Whether a drag gesture is currently active */
  isDragging: SharedValue<boolean>;
  /** The piece code being dragged (for rendering the ghost) */
  dragPieceCode: SharedValue<string | null>;
};

// ---------------------------------------------------------------------------
// Legal move dots
// ---------------------------------------------------------------------------

export type LegalMoveTarget = {
  square: string;
  isCapture: boolean;
};
