import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';
import type { PieceSetMap } from '../types';

// ---------------------------------------------------------------------------
// Shared stroke / fill constants
// ---------------------------------------------------------------------------

const WHITE_FILL = '#ffffff';
const WHITE_STROKE = '#333333';
const BLACK_FILL = '#333333';
const BLACK_STROKE = '#1a1a1a';
const STROKE_WIDTH = 1.5;

// ---------------------------------------------------------------------------
// King
// ---------------------------------------------------------------------------

const WhiteKing = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={WHITE_FILL}
      stroke={WHITE_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Cross */}
      <Path d="M 22.5,11.63 L 22.5,6" fill="none" />
      <Path d="M 20,8 L 25,8" fill="none" />
      {/* Head */}
      <Path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
      {/* Body and base */}
      <Path d="M 12.5,37 C 18,33.5 27,33.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" />
      {/* Base line */}
      <Path d="M 12,37.5 C 18,40.5 27,40.5 33,37.5" fill="none" />
      {/* Crown detail lines */}
      <Path d="M 20,8 L 25,8" fill="none" />
      <Path
        d="M 32,29.5 C 32,29.5 40.5,25.5 38.03,19.85 C 34.15,14 25,18 22.5,24.5 L 22.5,26.6 L 22.5,24.5 C 20,18 10.85,14 6.97,19.85 C 4.5,25.5 13,29.5 13,29.5"
        fill="none"
        stroke={WHITE_STROKE}
        strokeWidth={1}
      />
    </G>
  </Svg>
));

const BlackKing = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={BLACK_FILL}
      stroke={BLACK_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Cross */}
      <Path d="M 22.5,11.63 L 22.5,6" stroke={BLACK_STROKE} fill="none" />
      <Path d="M 20,8 L 25,8" stroke={BLACK_STROKE} fill="none" />
      {/* Head */}
      <Path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
      {/* Body and base */}
      <Path d="M 12.5,37 C 18,33.5 27,33.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" />
      {/* Base line */}
      <Path d="M 12,37.5 C 18,40.5 27,40.5 33,37.5" fill="none" />
      {/* Crown detail lines (white inner lines for contrast) */}
      <Path
        d="M 32,29.5 C 32,29.5 40.5,25.5 38.03,19.85 C 34.15,14 25,18 22.5,24.5 L 22.5,26.6 L 22.5,24.5 C 20,18 10.85,14 6.97,19.85 C 4.5,25.5 13,29.5 13,29.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth={1}
      />
    </G>
  </Svg>
));

// ---------------------------------------------------------------------------
// Queen
// ---------------------------------------------------------------------------

const WhiteQueen = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={WHITE_FILL}
      stroke={WHITE_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Crown tip circles */}
      <Circle cx={6} cy={12} r={2.75} />
      <Circle cx={14} cy={9} r={2.75} />
      <Circle cx={22.5} cy={8} r={2.75} />
      <Circle cx={31} cy={9} r={2.75} />
      <Circle cx={39} cy={12} r={2.75} />
      {/* Crown body */}
      <Path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.5,10.5 L 26,27.5 L 22.5,10 L 19,27.5 L 14.5,10.5 L 14,25 L 6.5,13.5 L 9,26 Z" />
      {/* Lower body */}
      <Path d="M 9,26 C 9,28 10.5,29.5 11.5,30 C 17,31.5 28,31.5 33.5,30 C 34.5,29.5 36,28 36,26" />
      {/* Base curves */}
      <Path d="M 11.5,30 C 15,33.5 30,33.5 33.5,30" fill="none" />
      <Path d="M 12,33.5 C 18,37.5 27,37.5 33,33.5" fill="none" />
    </G>
  </Svg>
));

const BlackQueen = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={BLACK_FILL}
      stroke={BLACK_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Crown tip circles */}
      <Circle cx={6} cy={12} r={2.75} />
      <Circle cx={14} cy={9} r={2.75} />
      <Circle cx={22.5} cy={8} r={2.75} />
      <Circle cx={31} cy={9} r={2.75} />
      <Circle cx={39} cy={12} r={2.75} />
      {/* Crown body */}
      <Path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.5,10.5 L 26,27.5 L 22.5,10 L 19,27.5 L 14.5,10.5 L 14,25 L 6.5,13.5 L 9,26 Z" />
      {/* Lower body */}
      <Path d="M 9,26 C 9,28 10.5,29.5 11.5,30 C 17,31.5 28,31.5 33.5,30 C 34.5,29.5 36,28 36,26" />
      {/* Base curves */}
      <Path d="M 11.5,30 C 15,33.5 30,33.5 33.5,30" fill="none" />
      <Path d="M 12,33.5 C 18,37.5 27,37.5 33,33.5" fill="none" />
      {/* Inner detail lines for contrast */}
      <Path
        d="M 11,29.5 C 15,32 30,32 34,29.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth={1}
      />
    </G>
  </Svg>
));

// ---------------------------------------------------------------------------
// Rook
// ---------------------------------------------------------------------------

const WhiteRook = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={WHITE_FILL}
      stroke={WHITE_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Crenellations (merlons) */}
      <Path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 Z" />
      <Path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 Z" />
      <Path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 Z" />
      {/* Body */}
      <Path d="M 34,14 L 31,17 L 14,17 L 11,14" />
      <Path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" fill={WHITE_FILL} />
      <Path d="M 31,29.5 L 33,32 L 12,32 L 14,29.5" />
      {/* Inner lines */}
      <Path d="M 14,17 L 31,17" fill="none" />
      <Path d="M 14,29.5 L 31,29.5" fill="none" />
      <Path d="M 14,17 L 14,29.5" fill="none" />
      <Path d="M 31,17 L 31,29.5" fill="none" />
    </G>
  </Svg>
));

const BlackRook = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={BLACK_FILL}
      stroke={BLACK_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Crenellations (merlons) */}
      <Path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 Z" />
      <Path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 Z" />
      <Path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 Z" />
      {/* Body */}
      <Path d="M 34,14 L 31,17 L 14,17 L 11,14" />
      <Path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" fill={BLACK_FILL} />
      <Path d="M 31,29.5 L 33,32 L 12,32 L 14,29.5" />
      {/* Inner lines for contrast */}
      <Path d="M 14,17 L 31,17" fill="none" stroke="#ffffff" strokeWidth={1} />
      <Path d="M 14,29.5 L 31,29.5" fill="none" stroke="#ffffff" strokeWidth={1} />
      <Path d="M 14,17 L 14,29.5" fill="none" stroke="#ffffff" strokeWidth={1} />
      <Path d="M 31,17 L 31,29.5" fill="none" stroke="#ffffff" strokeWidth={1} />
    </G>
  </Svg>
));

// ---------------------------------------------------------------------------
// Bishop
// ---------------------------------------------------------------------------

const WhiteBishop = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={WHITE_FILL}
      stroke={WHITE_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Top ball */}
      <Circle cx={22.5} cy={8} r={2.5} />
      {/* Mitre (head) */}
      <Path d="M 17.5,26 L 15,13 L 22.5,7 L 30,13 L 27.5,26" />
      {/* Mitre slit */}
      <Path d="M 22.5,15.5 L 22.5,20.5" fill="none" strokeWidth={1.5} />
      <Path d="M 20,18 L 25,18" fill="none" strokeWidth={1.5} />
      {/* Collar */}
      <Path d="M 17.5,26 C 21,28 24,28 27.5,26 C 28.5,27.5 29,29 29,31 C 29,33 27.5,34.5 22.5,34.5 C 17.5,34.5 16,33 16,31 C 16,29 16.5,27.5 17.5,26" />
      {/* Base */}
      <Path d="M 14.5,34.5 C 18,37.5 27,37.5 30.5,34.5 L 31,39 L 14,39 L 14.5,34.5 Z" />
    </G>
  </Svg>
));

const BlackBishop = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={BLACK_FILL}
      stroke={BLACK_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Top ball */}
      <Circle cx={22.5} cy={8} r={2.5} />
      {/* Mitre (head) */}
      <Path d="M 17.5,26 L 15,13 L 22.5,7 L 30,13 L 27.5,26" />
      {/* Mitre slit */}
      <Path d="M 22.5,15.5 L 22.5,20.5" fill="none" stroke="#ffffff" strokeWidth={1.5} />
      <Path d="M 20,18 L 25,18" fill="none" stroke="#ffffff" strokeWidth={1.5} />
      {/* Collar */}
      <Path d="M 17.5,26 C 21,28 24,28 27.5,26 C 28.5,27.5 29,29 29,31 C 29,33 27.5,34.5 22.5,34.5 C 17.5,34.5 16,33 16,31 C 16,29 16.5,27.5 17.5,26" />
      {/* Base */}
      <Path d="M 14.5,34.5 C 18,37.5 27,37.5 30.5,34.5 L 31,39 L 14,39 L 14.5,34.5 Z" />
      {/* Inner detail line for contrast */}
      <Path
        d="M 17.5,26 C 21,28 24,28 27.5,26"
        fill="none"
        stroke="#ffffff"
        strokeWidth={1}
      />
    </G>
  </Svg>
));

// ---------------------------------------------------------------------------
// Knight
// ---------------------------------------------------------------------------

const WhiteKnight = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={WHITE_FILL}
      stroke={WHITE_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Horse head */}
      <Path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
      <Path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" />
      {/* Eye */}
      <Circle cx={12} cy={25.5} r={0.5} fill={WHITE_STROKE} stroke="none" />
      {/* Nostril */}
      <Path
        d="M 17,34.5 C 18.5,32 19.28,30 19,28.25"
        fill="none"
        strokeWidth={1}
      />
    </G>
  </Svg>
));

const BlackKnight = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={BLACK_FILL}
      stroke={BLACK_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Horse head */}
      <Path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
      <Path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" />
      {/* Eye (white for contrast) */}
      <Circle cx={12} cy={25.5} r={0.5} fill="#ffffff" stroke="none" />
      {/* Nostril / mane detail */}
      <Path
        d="M 17,34.5 C 18.5,32 19.28,30 19,28.25"
        fill="none"
        stroke="#ffffff"
        strokeWidth={1}
      />
      {/* Mane line for contrast */}
      <Path
        d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31"
        fill="none"
        stroke="#ffffff"
        strokeWidth={1}
      />
    </G>
  </Svg>
));

// ---------------------------------------------------------------------------
// Pawn
// ---------------------------------------------------------------------------

const WhitePawn = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={WHITE_FILL}
      stroke={WHITE_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M 22.5,9 C 19.79,9 17.609,11.19 17.609,13.9 C 17.609,15.42 18.34,16.77 19.47,17.62 C 16.98,19.04 15.35,21.72 15.35,24.79 C 15.35,25.87 15.59,26.88 15.99,27.81 C 13.08,29.21 11,32.16 11,35.6 L 11,37.5 C 11,38.33 11.67,39 12.5,39 L 32.5,39 C 33.33,39 34,38.33 34,37.5 L 34,35.6 C 34,32.16 31.92,29.21 29.01,27.81 C 29.41,26.88 29.65,25.87 29.65,24.79 C 29.65,21.72 28.02,19.04 25.53,17.62 C 26.66,16.77 27.39,15.42 27.39,13.9 C 27.39,11.19 25.21,9 22.5,9 Z" />
    </G>
  </Svg>
));

const BlackPawn = React.memo(({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G
      fill={BLACK_FILL}
      stroke={BLACK_STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M 22.5,9 C 19.79,9 17.609,11.19 17.609,13.9 C 17.609,15.42 18.34,16.77 19.47,17.62 C 16.98,19.04 15.35,21.72 15.35,24.79 C 15.35,25.87 15.59,26.88 15.99,27.81 C 13.08,29.21 11,32.16 11,35.6 L 11,37.5 C 11,38.33 11.67,39 12.5,39 L 32.5,39 C 33.33,39 34,38.33 34,37.5 L 34,35.6 C 34,32.16 31.92,29.21 29.01,27.81 C 29.41,26.88 29.65,25.87 29.65,24.79 C 29.65,21.72 28.02,19.04 25.53,17.62 C 26.66,16.77 27.39,15.42 27.39,13.9 C 27.39,11.19 25.21,9 22.5,9 Z" />
    </G>
  </Svg>
));

// ---------------------------------------------------------------------------
// Piece render functions
// ---------------------------------------------------------------------------

const wp = (size: number) => <WhitePawn size={size} />;
const wn = (size: number) => <WhiteKnight size={size} />;
const wb = (size: number) => <WhiteBishop size={size} />;
const wr = (size: number) => <WhiteRook size={size} />;
const wq = (size: number) => <WhiteQueen size={size} />;
const wk = (size: number) => <WhiteKing size={size} />;

const bp = (size: number) => <BlackPawn size={size} />;
const bn = (size: number) => <BlackKnight size={size} />;
const bb = (size: number) => <BlackBishop size={size} />;
const br = (size: number) => <BlackRook size={size} />;
const bq = (size: number) => <BlackQueen size={size} />;
const bk = (size: number) => <BlackKing size={size} />;

// ---------------------------------------------------------------------------
// Default piece set
// ---------------------------------------------------------------------------

export const DefaultPieceSet: PieceSetMap = {
  wp,
  wn,
  wb,
  wr,
  wq,
  wk,
  bp,
  bn,
  bb,
  br,
  bq,
  bk,
};
