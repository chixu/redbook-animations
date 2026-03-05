import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

type Rect = [number, number, number, number];

interface RandomHighlightProps {
  startIndex: number;
  endIndex: number;
  fps?: number;
  changeCount?: number;
  allRects: Rect[];
  endFrame?: number;
  startFrame?: number;
}

export const RandomHighlight: React.FC<RandomHighlightProps> = ({
  startIndex,
  endIndex,
  fps = 5,
  changeCount = 7,
  allRects,
  startFrame = 0,
  endFrame,
}) => {
  const frame = useCurrentFrame();

  const path: number[] = useMemo(() => {
    const indexs = allRects.map((rect, index) => index);
    const filteredIndexs = indexs.filter((index) => index != startIndex && index != endIndex);
    let randomIndexs = filteredIndexs.sort(() => Math.random() - 0.5);
    if (randomIndexs.length > changeCount) {
      randomIndexs = randomIndexs.slice(0, changeCount);
      if (startIndex) randomIndexs.unshift(startIndex);
      randomIndexs.push(endIndex);
      return randomIndexs;
    }
    if (startIndex) randomIndexs.unshift(startIndex);
    randomIndexs.push(endIndex);
    console.log(changeCount, allRects.length)
    const rotationCount = Math.max(1, Math.round(changeCount / allRects.length));
    const path: number[] = [];
    for (let i = 0; i < rotationCount; i++) {
      path.push(...randomIndexs);
    }
    return path;
  }, [allRects, changeCount, endIndex, startIndex]);
  const currentRect = useMemo(() => {
    const index = Math.floor((frame - startFrame) / fps);

    if (path[index]) {
      return allRects[path[index]];
    } else {
      // blink
      if (frame % 40 < 12) {
        return null;
      }
      return allRects[endIndex];
    }
  }, [frame, startFrame, fps, allRects, path, endIndex]);

  // if (!currentRect) {
  //   return null;
  // }

  return (
    currentRect && <div
      style={{
        position: 'absolute',
        left: currentRect[0] + '%',
        top: currentRect[1] + '%',
        width: currentRect[2] + '%',
        height: currentRect[3] + '%',
        border: '3px solid rgba(250, 75, 31, 1)',
        backgroundColor: 'rgba(255, 221, 0, 0.1)',
        borderRadius: 4,
        pointerEvents: 'none',
        zIndex: 20,
        // transition: 'none',
      }}
    />
  );
};

export default RandomHighlight;
