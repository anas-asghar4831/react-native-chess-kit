[![npm version](https://img.shields.io/npm/v/react-native-chess-kit.svg)](https://www.npmjs.com/package/react-native-chess-kit)
[![npm downloads](https://img.shields.io/npm/dm/react-native-chess-kit.svg)](https://www.npmjs.com/package/react-native-chess-kit)
[![CI](https://github.com/anas-asghar4831/react-native-chess-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/anas-asghar4831/react-native-chess-kit/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/react-native-chess-kit.svg)](https://github.com/anas-asghar4831/react-native-chess-kit/blob/main/LICENSE)

# react-native-chess-kit

High-performance chess board for React Native. Built for 60fps on budget Android devices.

## Performance

| Metric | react-native-chess-kit | expo-chessboard |
|--------|----------------------|-----------------|
| Gesture handlers | 1 (centralized) | 32 (one per piece) |
| Mounted components | ~40 | ~281 |
| Native views | ~75 | ~470 |
| React Context providers | 0 | 8 |
| Re-renders during drag | 0 | Per-frame |

Zero React re-renders during drag -- all animation runs on the UI thread via Reanimated worklets. Pieces animate only `transform` + `opacity` (Reanimated's fast path). Stable piece IDs survive position changes without unmount/remount cycles.

## Installation

```bash
npm install react-native-chess-kit
```

### Peer dependencies

```bash
npm install react-native-reanimated react-native-gesture-handler chess.js
```

| Package | Version |
|---------|---------|
| react-native-reanimated | >= 3.0.0 |
| react-native-gesture-handler | >= 2.0.0 |
| chess.js | >= 1.0.0 |
| react | >= 18.0.0 |
| react-native | >= 0.70.0 |

## Usage

```tsx
import { useRef } from 'react';
import { Board } from 'react-native-chess-kit';
import type { BoardRef } from 'react-native-chess-kit';

function ChessScreen() {
  const boardRef = useRef<BoardRef>(null);

  return (
    <Board
      ref={boardRef}
      fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      orientation="white"
      boardSize={360}
      gestureEnabled={true}
      player="white"
      colors={{ light: '#eeeed2', dark: '#769656' }}
      moveDuration={200}
      withLetters={true}
      withNumbers={true}
      showLegalMoves={true}
      moveMethod="both"
      onMove={({ from, to }) => {
        console.log(`Moved from ${from} to ${to}`);
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fen` | `string` | required | Board position in FEN notation |
| `orientation` | `'white' \| 'black'` | required | Which color is at the bottom |
| `boardSize` | `number` | required | Board width/height in pixels |
| `gestureEnabled` | `boolean` | required | Whether touch interaction is enabled |
| `player` | `'white' \| 'black' \| 'both'` | required | Which side can move pieces |
| `colors` | `{ light: string, dark: string }` | required | Square colors |
| `moveDuration` | `number` | required | Animation duration in ms (0 = instant) |
| `withLetters` | `boolean` | required | Show file labels (a-h) |
| `withNumbers` | `boolean` | required | Show rank numbers (1-8) |
| `showLegalMoves` | `boolean` | required | Show legal move dots on piece selection |
| `moveMethod` | `'drag' \| 'click' \| 'both'` | required | How the user moves pieces |
| `onMove` | `(info: { from, to }) => void` | optional | Called after a move gesture completes |
| `renderPiece` | `(code, size) => ReactElement` | optional | Custom piece renderer |

## Ref API

```ts
const boardRef = useRef<BoardRef>(null);

// Programmatic move (e.g. opponent's move, puzzle auto-play)
boardRef.current?.move({ from: 'e2', to: 'e4' });

// Highlight a square
boardRef.current?.highlight('e4', 'rgba(255, 255, 0, 0.5)');

// Clear all highlights
boardRef.current?.clearHighlights();

// Reset to a new position
boardRef.current?.resetBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

// Undo the last visual move (snap back)
boardRef.current?.undo();
```

## Custom Piece Rendering

Use `renderPiece` to provide your own piece images:

```tsx
import { Image } from 'expo-image';

const PIECE_IMAGES = {
  wp: require('./assets/pieces/wp.png'),
  wn: require('./assets/pieces/wn.png'),
  // ... etc
};

<Board
  renderPiece={(code, size) => (
    <Image
      source={PIECE_IMAGES[code]}
      style={{ width: size, height: size }}
      cachePolicy="memory-disk"
    />
  )}
  // ... other props
/>
```

## Exports

```ts
// Component
export { Board } from 'react-native-chess-kit';

// Types
export type {
  BoardRef,
  BoardProps,
  BoardColors,
  BoardPiece,
  ChessColor,
  MoveMethod,
  GestureState,
  LegalMoveTarget,
  ParsedPiece,
} from 'react-native-chess-kit';

// Utilities (useful for overlay positioning)
export { squareToXY, xyToSquare } from 'react-native-chess-kit';
```

## Architecture

The board follows the chess.com / lichess pattern:

- **Single gesture handler** at the board level (not per-piece)
- **Reanimated shared values** for drag state (zero JS thread work during drag)
- **Stable piece IDs** via smart FEN diffing (pieces survive position changes)
- **chess.js** for internal legal move validation
- **Worklet-only animation** using transform + opacity (Reanimated fast path)

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## Security

To report a vulnerability, please see our [Security Policy](SECURITY.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## License

MIT
