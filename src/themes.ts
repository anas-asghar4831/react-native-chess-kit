import type { BoardTheme, BoardColors } from './types';

// ---------------------------------------------------------------------------
// Board color presets (matching popular chess platforms)
// ---------------------------------------------------------------------------

const greenTheme: BoardTheme = {
  name: 'Green',
  board: { light: '#eeeed2', dark: '#769656' },
  lastMove: 'rgba(255, 255, 0, 0.4)',
  check: 'rgba(235, 97, 80, 0.8)',
  selected: 'rgba(20, 85, 200, 0.5)',
  legalDot: 'rgba(0, 0, 0, 0.25)',
  premove: 'rgba(20, 85, 200, 0.3)',
  arrow: 'rgba(243, 166, 50, 0.85)',
  coordinates: { light: '#769656', dark: '#eeeed2' },
};

const brownTheme: BoardTheme = {
  name: 'Brown',
  board: { light: '#f0d9b5', dark: '#b58863' },
  lastMove: 'rgba(255, 255, 0, 0.4)',
  check: 'rgba(235, 97, 80, 0.8)',
  selected: 'rgba(20, 85, 200, 0.5)',
  legalDot: 'rgba(0, 0, 0, 0.25)',
  premove: 'rgba(20, 85, 200, 0.3)',
  arrow: 'rgba(243, 166, 50, 0.85)',
  coordinates: { light: '#b58863', dark: '#f0d9b5' },
};

const blueTheme: BoardTheme = {
  name: 'Blue',
  board: { light: '#dee3e6', dark: '#8ca2ad' },
  lastMove: 'rgba(255, 255, 0, 0.4)',
  check: 'rgba(235, 97, 80, 0.8)',
  selected: 'rgba(20, 85, 200, 0.5)',
  legalDot: 'rgba(0, 0, 0, 0.25)',
  premove: 'rgba(20, 85, 200, 0.3)',
  arrow: 'rgba(243, 166, 50, 0.85)',
  coordinates: { light: '#8ca2ad', dark: '#dee3e6' },
};

const purpleTheme: BoardTheme = {
  name: 'Purple',
  board: { light: '#e8daf0', dark: '#9b72b0' },
  lastMove: 'rgba(255, 255, 0, 0.4)',
  check: 'rgba(235, 97, 80, 0.8)',
  selected: 'rgba(20, 85, 200, 0.5)',
  legalDot: 'rgba(0, 0, 0, 0.25)',
  premove: 'rgba(20, 85, 200, 0.3)',
  arrow: 'rgba(243, 166, 50, 0.85)',
  coordinates: { light: '#9b72b0', dark: '#e8daf0' },
};

const grayTheme: BoardTheme = {
  name: 'Gray',
  board: { light: '#e0e0e0', dark: '#888888' },
  lastMove: 'rgba(255, 255, 0, 0.4)',
  check: 'rgba(235, 97, 80, 0.8)',
  selected: 'rgba(20, 85, 200, 0.5)',
  legalDot: 'rgba(0, 0, 0, 0.25)',
  premove: 'rgba(20, 85, 200, 0.3)',
  arrow: 'rgba(243, 166, 50, 0.85)',
  coordinates: { light: '#888888', dark: '#e0e0e0' },
};

const woodTheme: BoardTheme = {
  name: 'Wood',
  board: { light: '#e6c88c', dark: '#a67c52' },
  lastMove: 'rgba(255, 255, 0, 0.35)',
  check: 'rgba(235, 97, 80, 0.8)',
  selected: 'rgba(20, 85, 200, 0.5)',
  legalDot: 'rgba(0, 0, 0, 0.2)',
  premove: 'rgba(20, 85, 200, 0.3)',
  arrow: 'rgba(243, 166, 50, 0.85)',
  coordinates: { light: '#a67c52', dark: '#e6c88c' },
};

const iceTheme: BoardTheme = {
  name: 'Ice',
  board: { light: '#e8f0f8', dark: '#7ba0c4' },
  lastMove: 'rgba(255, 255, 0, 0.35)',
  check: 'rgba(235, 97, 80, 0.8)',
  selected: 'rgba(20, 85, 200, 0.5)',
  legalDot: 'rgba(0, 0, 0, 0.25)',
  premove: 'rgba(20, 85, 200, 0.3)',
  arrow: 'rgba(243, 166, 50, 0.85)',
  coordinates: { light: '#7ba0c4', dark: '#e8f0f8' },
};

const tournamentTheme: BoardTheme = {
  name: 'Tournament',
  board: { light: '#fffff0', dark: '#3d945e' },
  lastMove: 'rgba(255, 255, 0, 0.4)',
  check: 'rgba(235, 97, 80, 0.8)',
  selected: 'rgba(20, 85, 200, 0.5)',
  legalDot: 'rgba(0, 0, 0, 0.25)',
  premove: 'rgba(20, 85, 200, 0.3)',
  arrow: 'rgba(243, 166, 50, 0.85)',
  coordinates: { light: '#3d945e', dark: '#fffff0' },
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/** All built-in board themes */
export const BOARD_THEMES = {
  green: greenTheme,
  brown: brownTheme,
  blue: blueTheme,
  purple: purpleTheme,
  gray: grayTheme,
  wood: woodTheme,
  ice: iceTheme,
  tournament: tournamentTheme,
} as const;

/** Shorthand board color presets (just light/dark, no overlay colors) */
export const BOARD_COLORS: Record<keyof typeof BOARD_THEMES, BoardColors> = {
  green: greenTheme.board,
  brown: brownTheme.board,
  blue: blueTheme.board,
  purple: purpleTheme.board,
  gray: grayTheme.board,
  wood: woodTheme.board,
  ice: iceTheme.board,
  tournament: tournamentTheme.board,
};
