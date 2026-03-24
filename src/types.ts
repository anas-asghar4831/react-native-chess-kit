import type { SharedValue, BaseAnimationBuilder } from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Core chess types
// ---------------------------------------------------------------------------

/** Board orientation / side color */
export type ChessColor = 'white' | 'black';

/** How the user interacts with pieces */
export type MoveMethod = 'drag' | 'click' | 'both';

/** Where to render file/rank coordinate labels */
export type CoordinatePosition = 'inside' | 'outside' | 'none';

/** Promotion piece choice */
export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

/** Haptic feedback event types -- consumer wires to their preferred haptics library */
export type HapticType = 'select' | 'move' | 'capture' | 'error';

// ---------------------------------------------------------------------------
// Piece data
// ---------------------------------------------------------------------------

/** Standard piece codes used throughout the library */
export type PieceCode =
  | 'wp'
  | 'wn'
  | 'wb'
  | 'wr'
  | 'wq'
  | 'wk'
  | 'bp'
  | 'bn'
  | 'bb'
  | 'br'
  | 'bq'
  | 'bk';

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
// Overlay data types
// ---------------------------------------------------------------------------

/** A square highlight (colored rectangle on a specific square) */
export type HighlightData = {
  square: string;
  color: string;
};

/** An arrow drawn between two squares */
export type ArrowData = {
  from: string;
  to: string;
  /** Arrow color. Default: theme-dependent */
  color?: string;
  /** Stroke width as percentage of square size. Default: 0.2 */
  width?: number;
};

/** A shape drawn on the board */
export type ShapeData = {
  type: 'circle';
  square: string;
  color?: string;
};

/** A text annotation on a square (!, ?, !!, ??, etc.) */
export type AnnotationData = {
  square: string;
  text: string;
  color?: string;
  backgroundColor?: string;
};

/** A premove queued for execution */
export type PremoveData = {
  from: string;
  to: string;
  promotion?: PromotionPiece;
};

// ---------------------------------------------------------------------------
// Animation configuration
// ---------------------------------------------------------------------------

export type TimingAnimationConfig = {
  type: 'timing';
  /** Duration in ms. Default: 200 */
  duration?: number;
};

export type SpringAnimationConfig = {
  type: 'spring';
  /** Damping ratio. Default: 0.7 */
  damping?: number;
  /** Stiffness. Default: 200 */
  stiffness?: number;
  /** Mass. Default: 1 */
  mass?: number;
};

/** Animation configuration for piece movement */
export type AnimationConfig = TimingAnimationConfig | SpringAnimationConfig;

// ---------------------------------------------------------------------------
// Piece set
// ---------------------------------------------------------------------------

/** Map of piece code to React element renderer */
export type PieceSetMap = {
  [code in PieceCode]: (size: number) => React.ReactElement;
};

// ---------------------------------------------------------------------------
// Board colors / themes
// ---------------------------------------------------------------------------

export type BoardColors = {
  light: string;
  dark: string;
};

/** A complete board theme with all configurable colors */
export type BoardTheme = {
  /** Display name for the theme */
  name: string;
  /** Square colors */
  board: BoardColors;
  /** Last move highlight color */
  lastMove: string;
  /** Check highlight color */
  check: string;
  /** Selected piece square color */
  selected: string;
  /** Legal move dot color */
  legalDot: string;
  /** Premove highlight color */
  premove: string;
  /** Arrow default color */
  arrow: string;
  /** Coordinate text colors */
  coordinates: {
    light: string;
    dark: string;
  };
};

// ---------------------------------------------------------------------------
// Board ref (exposed to consumers via forwardRef)
// ---------------------------------------------------------------------------

export type BoardRef = {
  /**
   * Programmatically apply a move. Animates the piece to the target square.
   * Returns a Promise that resolves when the move animation completes.
   */
  move: (move: { from: string; to: string; promotion?: string }) => Promise<void>;
  /** Highlight a square with a color. Adds to existing imperative highlights. */
  highlight: (square: string, color: string) => void;
  /** Clear all imperative highlights */
  clearHighlights: () => void;
  /** Reset board to a new FEN position */
  resetBoard: (fen: string) => void;
  /** Undo the last visually applied move (snap back to previous position) */
  undo: () => void;
  /** Clear any queued premoves */
  clearPremoves: () => void;
};

// ---------------------------------------------------------------------------
// Board props
// ---------------------------------------------------------------------------

export type BoardProps = {
  // --- Required ---

  /** Current board position in FEN notation */
  fen: string;
  /** Which color is at the bottom of the board */
  orientation: ChessColor;

  // --- Layout ---

  /** Board width/height in pixels. If omitted, auto-sizes from parent via onLayout. */
  boardSize?: number;

  // --- Interaction ---

  /** Whether gesture interaction is enabled. Default: true */
  gestureEnabled?: boolean;
  /** Which side can interact: 'white', 'black', or 'both'. Default: 'both' */
  player?: ChessColor | 'both';
  /** How the user moves pieces. Default: 'both' */
  moveMethod?: MoveMethod;
  /** Whether to show legal move dots when a piece is selected. Default: true */
  showLegalMoves?: boolean;
  /** Enable premove queuing. Default: false */
  premovesEnabled?: boolean;

  // --- Appearance ---

  /** Board square colors. Default: green theme */
  colors?: BoardColors;
  /**
   * Where to render file/rank coordinate labels.
   * - 'inside'  — overlaid on the edge squares (default)
   * - 'outside' — in a gutter around the board (board shrinks slightly)
   * - 'none'    — hidden
   *
   * @default 'inside'
   */
  coordinatePosition?: CoordinatePosition;
  /** @deprecated Use coordinatePosition instead. Kept for backwards compat. */
  withLetters?: boolean;
  /** @deprecated Use coordinatePosition instead. Kept for backwards compat. */
  withNumbers?: boolean;
  /** Custom piece renderer. Receives piece code ('wp', 'bk', etc.) and pixel size. */
  renderPiece?: (pieceCode: string, size: number) => React.ReactElement;
  /** Built-in piece set (alternative to renderPiece). Default: built-in SVG set */
  pieceSet?: PieceSetMap;

  // --- Overlays ---

  /** Last move to highlight (yellow on from/to squares) */
  lastMove?: { from: string; to: string } | null;
  /** Custom highlights. Merged with auto-highlights (last move, check). */
  highlights?: HighlightData[];
  /** Arrows to draw on the board */
  arrows?: ArrowData[];
  /** Shapes to draw on the board (circles) */
  shapes?: ShapeData[];
  /** Text annotations on squares (!, ?, etc.) */
  annotations?: AnnotationData[];
  /** Show drag target indicator under finger during drag. Default: true */
  showDragTarget?: boolean;

  // --- Overlay colors (overrides theme defaults) ---

  /** Last move highlight color. Default: 'rgba(255,255,0,0.4)' */
  lastMoveColor?: string;
  /** Check highlight color. Default: radial gradient red */
  checkHighlightColor?: string;
  /** Selected piece square color. Default: 'rgba(20,85,200,0.5)' */
  selectedSquareColor?: string;
  /** Premove highlight color. Default: 'rgba(20,85,200,0.3)' */
  premoveColor?: string;
  /** Drag target highlight color. Default: 'rgba(0,0,0,0.1)' */
  dragTargetColor?: string;

  // --- Animation ---

  /** Move animation duration in ms (0 = instant). Default: 200 */
  moveDuration?: number;
  /** Animation configuration (timing or spring). Overrides moveDuration if provided. */
  animationConfig?: AnimationConfig;
  /** Animate board rotation on orientation change. Default: true */
  animateFlip?: boolean;
  /**
   * Custom exiting animation for pieces (played on unmount, e.g. captures).
   * - `undefined` (or omitted): uses default FadeOut.duration(150)
   * - `null`: disables all piece exit animations (pieces vanish instantly).
   *   Useful when remounting the entire board via a React key change to
   *   prevent all pieces from fading out simultaneously.
   * - Any `BaseAnimationBuilder`: uses the provided animation.
   */
  pieceExitAnimation?: BaseAnimationBuilder | typeof BaseAnimationBuilder | null;

  // --- Promotion ---

  /**
   * Auto-promote pawns to this piece without showing the picker.
   * When set, the promotion picker is skipped entirely.
   * Example: `autoPromoteTo="q"` always promotes to queen.
   */
  autoPromoteTo?: PromotionPiece;

  /**
   * Called when a pawn promotion occurs. If not provided, the built-in
   * promotion picker is shown. Return the chosen piece to complete the
   * promotion, or throw/reject to cancel.
   *
   * When provided, the built-in picker is NOT shown — the consumer is
   * expected to handle piece selection via their own UI.
   */
  onPromotion?: (from: string, to: string) => Promise<PromotionPiece> | PromotionPiece;

  // --- Callbacks ---

  /** Called after a visual move is applied */
  onMove?: (info: { from: string; to: string }) => void;
  /** Called when a piece is tapped */
  onPieceClick?: (square: string, piece: PieceCode) => void;
  /** Called when an empty square or opponent piece is tapped */
  onSquareClick?: (square: string) => void;
  /** Called when a piece drag begins */
  onPieceDragBegin?: (square: string, piece: PieceCode) => void;
  /** Called when a piece drag ends (regardless of move validity) */
  onPieceDragEnd?: (square: string, piece: PieceCode) => void;
  /** Called on long-press of a square */
  onSquareLongPress?: (square: string) => void;
  /** Called when a premove is set */
  onPremove?: (premove: PremoveData) => void;
  /**
   * Haptic feedback callback. Consumer wires to their preferred haptics library.
   * Called with event type: 'select' (piece pickup), 'move' (piece drop),
   * 'capture' (piece takes), 'error' (invalid move).
   */
  onHaptic?: (type: HapticType) => void;
};

// ---------------------------------------------------------------------------
// Static board props (non-interactive variant)
// ---------------------------------------------------------------------------

export type StaticBoardProps = {
  /** Board position in FEN notation */
  fen: string;
  /** Which color is at the bottom. Default: 'white' */
  orientation?: ChessColor;
  /** Board width/height in pixels. If omitted, auto-sizes from parent. */
  boardSize?: number;
  /** Board square colors. Default: green theme */
  colors?: BoardColors;
  /**
   * Where to render file/rank coordinate labels.
   * - 'inside'  — overlaid on the edge squares
   * - 'outside' — in a gutter around the board (board shrinks slightly)
   * - 'none'    — hidden (default)
   *
   * @default 'none'
   */
  coordinatePosition?: CoordinatePosition;
  /** @deprecated Use coordinatePosition instead */
  withCoordinates?: boolean;
  /** Custom piece renderer */
  renderPiece?: (pieceCode: string, size: number) => React.ReactElement;
  /** Built-in piece set */
  pieceSet?: PieceSetMap;
  /** Last move highlight */
  lastMove?: { from: string; to: string } | null;
  /** Custom highlights */
  highlights?: HighlightData[];
  /** Arrows */
  arrows?: ArrowData[];
  /** Annotations */
  annotations?: AnnotationData[];
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
  /** Square currently under the dragged piece (for drag target highlight) */
  dragTargetSquare: SharedValue<string | null>;
};

// ---------------------------------------------------------------------------
// Legal move dots
// ---------------------------------------------------------------------------

export type LegalMoveTarget = {
  square: string;
  isCapture: boolean;
};
