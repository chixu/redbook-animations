import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {
  time: number; // seconds
  x: number; // percent
  y: number; // percent
  width: number; // percent
  height: number; // percent
  duration?: number; // seconds
  color?: string;
  borderRadius?: number;
};

export const Highlight: React.FC<Props> = ({
  time,
  x,
  y,
  width,
  height,
  duration = 0.6,
  color = 'rgba(255, 221, 0, 0.6)',
  borderRadius = 6,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const startFrame = Math.round(time * fps);
  const durF = Math.max(1, Math.round(duration * fps));
  const age = frame - startFrame;

  let opacity = 0;
  if (age >= 0 && age < durF) {
    const fadeFrames = Math.max(2, Math.round(0.08 * fps));
    if (age < fadeFrames) opacity = (age / fadeFrames) * 0.9;
    else if (age > durF - fadeFrames) opacity = ((durF - age) / fadeFrames) * 0.9;
    else opacity = 0.9;
  }

  const left = `${x}%`;
  const top = `${y}%`;
  const wpx = `${width}%`;
  const hpx = `${height}%`;

  return (
    <div style={{position: 'absolute', left, top, width: wpx, height: hpx, pointerEvents: 'none', zIndex: 3}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          background: color,
          opacity,
          borderRadius,
          transform: `scale(${1 + opacity * 0.06})`,
        }}
      />
    </div>
  );
};

export default Highlight;
