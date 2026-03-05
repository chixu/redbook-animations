import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

type Props = {
  allData: {
    frame: number;
    rects: number[][]; // percent
  }[]; // percent
  color?: string; // percent
  duration?: number; // seconds
};

export const TranslationsHighlight: React.FC<Props> = ({
  allData,
  duration = 0.6,
  color = 'rgba(255, 221, 0, 0.6)',
}) => {
  const frame = useCurrentFrame();

  const allRects: number[][] = allData.filter(data => data.frame > frame).map(data => {
    return data.rects
  }).flat();

  console.log(allRects)

  return (
      allRects.map(rect => (
        // JSON.stringify(rect)
        <div
          style={{
            position: 'absolute',
            left: rect[0] + '%',
            top: rect[1] + '%',
            width: rect[2] + '%',
            height: rect[3] + '%',
            border: '2px solid rgba(255, 221, 0, 0.8)',
            backgroundColor: 'rgba(255, 221, 0, 0.3)',
            borderRadius: 4,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      ))
  );
};

export default TranslationsHighlight;
