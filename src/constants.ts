import type { BoardColors } from './types';

// ---------------------------------------------------------------------------
// Default colors
// ---------------------------------------------------------------------------

/** Default board colors (chess.com green) */
export const DEFAULT_BOARD_COLORS: BoardColors = {
  light: '#eeeed2',
  dark: '#769656',
};

/** Default last-move highlight color */
export const DEFAULT_LAST_MOVE_COLOR = 'rgba(255, 255, 0, 0.4)';

/** Default check highlight color (red radial feel) */
export const DEFAULT_CHECK_COLOR = 'rgba(235, 97, 80, 0.8)';

/** Default selected piece square color */
export const DEFAULT_SELECTED_COLOR = 'rgba(20, 85, 200, 0.5)';

/** Default premove highlight color */
export const DEFAULT_PREMOVE_COLOR = 'rgba(20, 85, 200, 0.3)';

/** Default drag target highlight color */
export const DEFAULT_DRAG_TARGET_COLOR = 'rgba(0, 0, 0, 0.1)';

/** Default arrow color */
export const DEFAULT_ARROW_COLOR = 'rgba(243, 166, 50, 0.85)';

/** Default shape (circle) color */
export const DEFAULT_SHAPE_COLOR = 'rgba(21, 120, 27, 0.7)';

/** Default annotation background color */
export const DEFAULT_ANNOTATION_BG = 'rgba(235, 97, 80, 0.9)';

/** Default annotation text color */
export const DEFAULT_ANNOTATION_TEXT = '#ffffff';

// ---------------------------------------------------------------------------
// Animation defaults
// ---------------------------------------------------------------------------

/** Default move animation duration in ms */
export const DEFAULT_MOVE_DURATION = 200;

/** Duration for capture fade-out animation in ms */
export const CAPTURE_FADE_DURATION = 150;

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

/** Legal move dot size as fraction of square size */
export const DOT_SCALE = 0.28;

/** Legal move capture ring size as fraction of square size */
export const RING_SCALE = 0.85;

/** Legal move capture ring border as fraction of square size */
export const RING_BORDER_RATIO = 0.08;

/** Arrow stroke width as fraction of square size (percentage-based viewBox) */
export const ARROW_STROKE_WIDTH = 2.5;

/** Arrow head size */
export const ARROW_HEAD_SIZE = 2.5;

/** Arrow shorten amount (to avoid overlapping squares) */
export const ARROW_SHORTEN_BY = 4;

/** Annotation badge size as fraction of square size */
export const ANNOTATION_SCALE = 0.35;

/** Coordinate font size as fraction of square size */
export const COORDINATE_FONT_SCALE = 0.22;

/** Outside-coordinate gutter width as fraction of square size */
export const COORDINATE_GUTTER_SCALE = 0.45;

/** Drag ghost scale factor (1.1x larger than normal piece) */
export const DRAG_GHOST_SCALE = 1.1;

/** Promotion picker piece padding as fraction of square size */
export const PROMOTION_PIECE_PADDING = 0.1;

// ---------------------------------------------------------------------------
// Piece codes (pre-computed to avoid allocation)
// ---------------------------------------------------------------------------

export const PIECE_CODES = [
  'wp', 'wn', 'wb', 'wr', 'wq', 'wk',
  'bp', 'bn', 'bb', 'br', 'bq', 'bk',
] as const;

/** Board square indices 0-63 (pre-computed) */
export const SQUARE_INDICES = Array.from({ length: 64 }, (_, i) => i);

/** File letters in order */
export const FILES_WHITE = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const FILES_BLACK = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] as const;
export const RANKS_WHITE = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;
export const RANKS_BLACK = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
