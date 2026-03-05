import React from 'react';

type Props = {
  rect: number[];
  color?: string; // percent
  borderColor?: string; // percent
};

export const Rect: React.FC<Props> = ({
  rect,
  // color = 'rgba(255, 221, 0, 0.6)',
  // blue + gray
  // color = '#002d5eff',
  color= '#2a2933ff',
  borderColor,
}) => {

  return (
    rect && (
      <div
        style={{
          position: 'absolute',
          left: rect[0] + '%',
          top: rect[1] + '%',
          width: rect[2] + '%',
          height: rect[3] + '%',
          ...(borderColor ? {border: `2px solid ${borderColor}`} : {}),
          backgroundColor: color,
          // borderRadius: 4,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    )
  )
};

export default Rect;
