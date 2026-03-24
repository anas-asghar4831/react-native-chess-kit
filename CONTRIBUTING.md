# Contributing to react-native-chess-kit

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/react-native-chess-kit.git
   cd react-native-chess-kit
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feat/my-feature
   ```

## Development Setup

### Prerequisites

- Node.js >= 18
- npm >= 9

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build the library (CommonJS + ESM + TypeScript declarations) |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run clean` | Remove build artifacts |

### Project Structure

```
src/
  board.tsx              # Main Board component
  static-board.tsx       # Non-interactive board variant
  board-background.tsx   # 64-square background layer
  board-pieces.tsx       # Piece rendering layer
  board-piece.tsx        # Individual piece component
  board-highlights.tsx   # Square highlight overlays
  board-legal-dots.tsx   # Legal move indicators
  board-drag-ghost.tsx   # Floating piece during drag
  board-arrows.tsx       # SVG arrow overlays
  board-annotations.tsx  # Text annotation badges
  board-coordinates.tsx  # File/rank labels
  promotion-picker.tsx   # Promotion piece selector
  use-board-state.ts     # chess.js integration hook
  use-board-pieces.ts    # FEN parsing + stable piece IDs
  use-board-gesture.ts   # Centralized gesture handler
  use-premove.ts         # Premove queue management
  pieces/                # Default SVG piece set
  types.ts               # All TypeScript types
  themes.ts              # Built-in board themes
  constants.ts           # Default values
  index.ts               # Public API exports
```

## Making Changes

1. Make your changes in a feature branch
2. Ensure TypeScript compiles: `npm run typecheck`
3. Ensure linting passes: `npm run lint`
4. Ensure formatting is correct: `npm run format:check`
5. Build successfully: `npm run build`
6. Write a clear commit message following the [convention](#commit-convention)

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring (no feature or fix) |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates, etc. |

### Examples

```
feat(board): add spring animation support
fix(gesture): prevent ghost piece flicker on fast taps
docs: update README with new props
chore: upgrade react-native-reanimated to v4
```

## Pull Request Process

1. **Update documentation** if your change affects the public API
2. **Fill out the PR template** completely
3. **Ensure CI passes** (typecheck, lint, build)
4. **Request review** from a maintainer
5. **Squash and merge** is the preferred merge strategy

### PR Title

Use the same [Conventional Commits](#commit-convention) format for PR titles.

### What makes a good PR?

- Focused: one feature or fix per PR
- Small: easier to review, faster to merge
- Tested: describe how you tested your changes
- Documented: update README/types if the public API changes

## Coding Standards

### TypeScript

- **Strict mode** is enforced (`"strict": true`)
- Use `unknown` instead of `any`
- Prefer type inference over explicit annotations where types are obvious
- Export types from `types.ts`, not from component files
- Use JSDoc comments for public APIs

### React Native / Reanimated

- All animation must run on the **UI thread** (worklets only)
- Never trigger React re-renders during gestures
- Use `useSharedValue` for gesture/animation state
- Use `useAnimatedStyle` for animated props
- Prefer `transform` + `opacity` for animations (Reanimated fast path)

### Performance Rules

- No unnecessary re-renders (use `React.memo`, `useMemo`, `useCallback` where appropriate)
- No inline object/array creation in JSX props
- Keep the component tree shallow
- Profile on a low-end Android device before submitting performance changes

### Style

- No semicolons (Prettier handles this)
- Single quotes
- 2-space indentation
- Trailing commas

## Reporting Bugs

Use the [Bug Report template](https://github.com/anas-asghar4831/react-native-chess-kit/issues/new?template=bug_report.md) and include:

- Library version
- React Native version
- Platform (iOS/Android) and OS version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or screen recordings if applicable

## Requesting Features

Use the [Feature Request template](https://github.com/anas-asghar4831/react-native-chess-kit/issues/new?template=feature_request.md) and include:

- Use case description
- Proposed API (if applicable)
- Alternative solutions you've considered

---

Thank you for helping make `react-native-chess-kit` better!
