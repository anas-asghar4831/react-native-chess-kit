# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.2] - 2026-03-24

### Added

- `StaticBoard` component for non-interactive board display
- Overlay primitives: `SquareHighlight`, `Arrow`, `Annotation`, `PromotionPicker`
- `DefaultPieceSet` export for custom piece rendering reference
- `BOARD_THEMES` and `BOARD_COLORS` presets
- Premove support
- Check detection with visual indicator

### Fixed

- Piece stability across FEN changes via smart diffing

## [0.5.0] - 2026-03-01

### Added

- Initial public release
- High-performance chess board with single gesture handler
- Zero re-renders during drag via Reanimated worklets
- Custom piece rendering via `renderPiece` prop
- Coordinate labels (letters and numbers)
- Legal move visualization
- Programmatic move API via ref
