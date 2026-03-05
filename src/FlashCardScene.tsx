import React from 'react';
import { useCurrentFrame, useVideoConfig, Audio } from 'remotion';
import FlashCard from './FlashCard';
import Progressbar from './Progressbar';
import { useState } from 'react';

type WordData = {
  word: string;
  translation: string;
  pos: string;
  unit: number;
  startTimeSec: number;
  durationSec: number;
}

type Props = {
  data: WordData[];
  startIndex: number;
  startTime: number;
  totalTime: number;
  audioUrl: string;
};

export const FlashCardScene: React.FC<Props> = ({
  data,
  startIndex,
  startTime,
  totalTime,
  audioUrl
}) => {
  // if (!data) return null;
  // console.log('data', data);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const percent = (time + startTime) / totalTime * 100;
  // const [index, setIndex] = useState(1);
  // const [word, setWord] = useState('');
  // const [translation, setTranslation] = useState('');
  let index = startIndex + 1;
  let word = '';
  let translation = ''
  if (data) {
    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      const nextStart = data[i + 1]?.startTimeSec || Infinity;
      if (time >= d.startTimeSec && time <= d.startTimeSec + d.durationSec * 3) {
        word = d.word;
        translation = '';
        index = i + startIndex + 1;
      } else if (time >= d.startTimeSec + d.durationSec * 3 && time <= nextStart) {
        const pos = d.pos ? `${d.pos} ` : '';
        word = d.word;
        translation = pos + d.translation;
        index = i + startIndex + 1;
      }
    }
  }

  return (
    <div >
      <Audio src={audioUrl} startFrom={0} />
      <FlashCard
        index={index}
        word={word}
        translation={translation}
      />
      <Progressbar
        percent={percent}
      />
    </div>
  );
};

export default FlashCardScene;
