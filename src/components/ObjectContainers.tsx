import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import Rect from './Rect';

type Props = {
  dataItems: {
    rect: number[]; // percent
    end?: number; // seconds
    start?: number; // seconds
  }[];
};

export const ObjectContainers: React.FC<Props> = ({
  dataItems,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const displayedItems = useMemo(() => {
    if (!dataItems) return [];
    return dataItems.filter(item => {
      const start = item.start ? Math.round(item.start * fps) : -1;
      const end = item.end ? Math.round(item.end * fps) : Infinity;
      return frame >= start && frame < end;
    });
  }, [frame, fps, dataItems]);

  console.log('displayedItems', dataItems.length, displayedItems.length)

  return (
    displayedItems.map(item => {
      if (item.rect) {
        return (
          <Rect key={item.rect.join(',')} rect={item.rect} />
        )
      }
      return null;
    })
  );
};

export default ObjectContainers;
