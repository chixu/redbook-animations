import { spring } from "remotion";
import { interpolate, Easing } from 'remotion';
import React, { useEffect, useState, useMemo } from "react";
import {
  AbsoluteFill,
  // Audio,
  interpolate,
  Sequence,
  Html5Audio,
  useCurrentFrame,
  staticFile,
  useVideoConfig,
} from "remotion";
import PhonicsCard from "./PhonicsCard";

export interface TextbookFlashlightProps {
  version: string,
  grade: string,
  unit: string,
};

const fps = 30;

// const wordPosition = {
//   "lineCount": {
//     "was": 2,
//     "kilometre": 2,
//     "gingerbread house": 2,
//     "go": 2,
//     "see": 2,
//     "take": 3,
//     "inspiring": 2,
//     "restaurant": 2,
//     "New Zealand": 2,
//     "Hong Kong-Zhuhai-Macao Bridge": 3,
//     "Terracotta Warriors": 2,
//     "Jinggangshan Revolution Museum": 3,
//   },
//   "wordLineCount": {
//     "gingerbread house": 2,
//     "Terracotta Warriors": 2,
//     "Hong Kong-Zhuhai-Macao Bridge": 2,
//     "Jinggangshan Revolution Museum": 2
//   },
//   "xOffsets": {
//     "was": 50,
//     "climb": 5,
//     "kilometre": 0,
//     "gingerbread house": 125,
//     "send": 26,
//     "go": 66,
//     "thousand": -30,
//     "clay": 0,
//     "see": 20,
//     "village": -60,
//     "eat": 10,
//     "dry": 40,
//     "take": 10,
//     "view": 10,
//     "inspiring": 0,
//     "bamboo": 30,
//     "pumpkin": 30,
//     "restaurant": 0,
//     "airport": -48,
//     "New Zealand": 0,
//     "Hong Kong-Zhuhai-Macao Bridge": 0,
//     "Paris": 0,
//     "Eiffel Tower": -250,
//     "Terracotta Warriors": 170,
//     "Jinggangshan Revolution Museum": 0,
//     "the Red Army": 0
//   },
//   "yOffsets": {},
//   "lineHeights": {}
// }

const data = {
  "imageWidth": 586,
  "imageHeight": 902
}

const resolveSrc = (s: string) => {
  if (!s) return s;
  if (/^https?:\/\//.test(s) || s.startsWith("data:")) return s;
  const trimmed = s.startsWith("/") ? s.slice(1) : s;
  try {
    return staticFile(trimmed);
  } catch (e) {
    return trimmed;
  }
};

function getCurrentWord(wordPosition: any, frame: number) {
  const index = Math.floor(frame / 50);
  return {
    word: Object.keys(wordPosition.xOffsets)[index],
    lineCount: index,
    preLineCount: Math.max(0, index - 1),
  };
}

function getAudioDataByWord(word: string, audioData: any) {
  const data = audioData.data.find((item: any) => item.word === word);
  if (!data) {
    throw new Error(`Audio data not found for word: ${word}`);
  }
  return data;
}

const showPhonics = true;

function getPositionY(y: number) {
  const maxHeight = showPhonics ? 300 : 500;
  if (y > maxHeight) {
    return [maxHeight, maxHeight - y]
  }
  return [y, 0];
}

const startDelay = 60;

function getHighlightBoxInterpolation(data: any, audioData: any): {
  frames: number[], xPositions: number[], backgroundYs: number[],
  yPositions: number[], width: number[], height: number[],
  showPhoenics?: boolean,
} {
  if (!data || !audioData) return {};
  const frames: number[] = [];
  const xPositions: number[] = [];
  const yPositions: number[] = [];
  const backgroundYs: number[] = [];
  const width: number[] = [];
  const height: number[] = [];
  const { words, wordData, transData } = data;
  words.forEach((word: string, index: number) => {
    const transBox = transData[word];
    const wordBox = wordData[word];
    const prevWord = words[index - 1];
    const prevTransBox = prevWord ? transData[prevWord] : wordData[words[0]];
    const currentAudioData = getAudioDataByWord(word, audioData);
    const { startTimeSec, durationSec } = currentAudioData;
    console.log('currentAudioData', currentAudioData)
    xPositions.push(prevTransBox[0], wordBox[0], wordBox[0], transBox[0]);
    // yPositions.push(
    //   getPositionY(prevTransBox[1])[0], 
    //   getPositionY(wordBox[1])[0], 
    //   getPositionY(wordBox[1])[0],
    //   getPositionY(transBox[1])[0]);
    yPositions.push(
      prevTransBox[1],
      wordBox[1],
      wordBox[1],
      transBox[1]);
    backgroundYs.push(
      getPositionY(prevTransBox[1])[1],
      getPositionY(wordBox[1])[1],
      getPositionY(wordBox[1])[1],
      getPositionY(transBox[1])[1]);
    width.push(prevTransBox[2], wordBox[2], wordBox[2], transBox[2]);
    height.push(prevTransBox[3], wordBox[3], wordBox[3], transBox[3]);
    const breakTime = Math.max(1.5, durationSec * 1.2) + 0.8;
    frames.push(
      // Math.max(0, startTimeSec * fps),
      index === 0 ? 0 : startTimeSec * fps + startDelay,
      startTimeSec * fps + 6 + startDelay,
      (durationSec + startTimeSec + breakTime) * fps + startDelay,
      (durationSec + startTimeSec + breakTime) * fps + 6 + startDelay
    )
    console.log(frames)
    console.log(yPositions)
    console.log(width)
  })
  return {
    frames,
    xPositions,
    yPositions,
    backgroundYs,
    width,
    height,
  }
}

export const TextbookFlashlight: React.FC<TextbookFlashlightProps> = ({
  version,
  grade,
  unit,
}) => {
  const dataFileName = `${version}_${grade}_${unit}`;
  const dataAudioFileName = `${dataFileName}-audio`;
  const audioFileUrl = resolveSrc(`textbookFlashlight/${dataAudioFileName}.mp3`);
  console.log('audioFileUrl', audioFileUrl)
  const [wordPositionData, setWordPositionData] = useState<typeof wordPosition>(null);
  const [wordAudioData, setWordAudioData] = useState<any>(null);
  const frame = useCurrentFrame();
  const [imgLoaded, setImgLoaded] = useState(false);
  const { fps, width: canvasWidth, height: canvasHeight } = useVideoConfig();
  useEffect(() => {
    console.log('loading', dataFileName)
    fetch(resolveSrc(`textbookFlashlight/${dataFileName}.json`)).then(res => res.json()).then(json => {
      console.log(json)
      setWordPositionData(json);
    });
    fetch(resolveSrc(`textbookFlashlight/${dataAudioFileName}.json`)).then(res => res.json()).then(json => {
      console.log(json)
      setWordAudioData(json);
    });
  }, []);
  const { frames, xPositions, backgroundYs, yPositions, width, height } = useMemo(
    () => getHighlightBoxInterpolation(wordPositionData, wordAudioData)
    , [wordPositionData, wordAudioData]);

  if (!wordPositionData || !wordAudioData) return null;

  // 1. 计算图片等比例缩放系数 (1080 / 1000 = 1.08)
  const scaleFactor = canvasWidth / data.imageWidth;
  const scaledImgHeight = data.imageHeight * scaleFactor;

  // 2. 获取当前帧对应的单词数据
  // const currentSegment = data.segments.find(
  //   (seg) => frame >= seg.startFrame && frame <= seg.endFrame
  // );

  // const sortedSegments = [...data.segments].sort((a, b) => a.startFrame - b.startFrame);

  // const currentTargetIndex = sortedSegments.findIndex(
  //   (seg) => frame >= seg.startFrame
  // );

  // const { word } = getCurrentWord(wordPositionData, frame);
  const word = 'hello'
  const currentAudioData = getAudioDataByWord(word, wordAudioData);

  const highlightXPosition = interpolate(frame, frames, xPositions);
  const highlightYPosition = interpolate(frame, frames, yPositions);
  const highlightWidth = interpolate(frame, frames, width);
  const highlightHeight = interpolate(frame, frames, height);
  const backgroundY = interpolate(frame, frames, backgroundYs);
  // const fromOffset = currentTargetIndex === -1
  //   ? 0
  //   : currentTargetIndex === 0
  //     ? 0
  //     : -(sortedSegments[currentTargetIndex - 1].box.y * scaleFactor);

  // const toOffset = currentTargetIndex === -1
  //   ? 0
  //   : -(sortedSegments[currentTargetIndex].box.y * scaleFactor);

  // const startFrame = currentTargetIndex === -1
  //   ? 0
  //   : sortedSegments[currentTargetIndex].startFrame;

  // const animatedYOffset = spring({
  //   frame,
  //   fps,
  //   from: -preLineCount * 60,
  //   to: -lineCount * 60,
  //   // delay: 20,
  //   config: {
  //     damping: 15,
  //     stiffness: 100,
  //     mass: 0.5,
  //   },
  //   durationInFrames: 20
  // });
  // const animatedYOffset = 0;
  // const animatedYOffset = interpolate(frame, [0, 6, 40, 46], [0, -100, -100, -200], {
  //   easing: Easing.easeInOut,
  //   extrapolateLeft: 'clamp',
  //   extrapolateRight: 'clamp',
  // });

  // 4. 计算 CSS clip-path inset 的四个边界值
  let clipPathStyle = 'inset(0px 0px 100% 0px)'; // 默认完全裁剪隐藏
  let borderStyle: React.CSSProperties = { opacity: 0 };
  const topPadding = 10;
  const leftPadding = 4;
  // 将原图原币像素坐标，等比例乘以缩放系数
  const topPx = highlightYPosition * scaleFactor;
  const leftPx = highlightXPosition * scaleFactor;
  const rightPx = canvasWidth - (highlightXPosition + highlightWidth) * scaleFactor;
  const bottomPx = scaledImgHeight - (highlightYPosition + highlightHeight) * scaleFactor;

  clipPathStyle = `inset(${topPx - topPadding}px ${rightPx}px ${bottomPx}px ${leftPx - leftPadding}px)`;

  // 动态跟随时黄色边框的样式调整
  borderStyle = {
    opacity: 1,
    position: 'absolute',
    left: leftPx - leftPadding,
    top: topPx - topPadding,
    width: highlightWidth * scaleFactor + leftPadding,
    height: highlightHeight * scaleFactor + topPadding,
    border: '5px solid #FFEB3B',
    borderRadius: '6px',
    // boxShadow: '0 0 12px rgba(255, 235, 59, 0.5)',
    // transition: 'all 0.2s ease-in-out',
  };

  // 共享的课本图片公共样式
  const imageStyle: React.CSSProperties = {
    width: `${canvasWidth}px`,
    height: `${scaledImgHeight}px`,
    position: 'absolute',
    top: 0,
    left: 0,
  };
  // Animate from 0 to 1 after 25 frames


  // A <AbsoluteFill> is just a absolutely positioned <div>!
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* 滚轴容器：包裹底图、高亮顶图和边框，统一做 Y 轴平移 */}
      <div
        style={{
          width: '100%',
          height: `${scaledImgHeight}px`,
          transform: `translateY(${backgroundY * scaleFactor}px)`,
          position: 'relative',
        }}
      >
        {/* 【底层】变暗 + 模糊的背景 */}
        <img
          src={resolveSrc(`textbookFlashlight/${version}_${grade}_${unit}.jpg`)}
          style={{
            ...imageStyle,
            filter: 'brightness(0.35) blur(4px)',
          }}
          alt="background"
        />

        {/* 【顶层】高清探照灯区域：通过 clipPath 裁剪展现 */}
        <img
          src={resolveSrc(`textbookFlashlight/${version}_${grade}_${unit}.jpg`)}
          style={{
            ...imageStyle,
            filter: 'brightness(1.15)', // 保持极度清晰，并提亮 15%
            clipPath: clipPathStyle,
            // transition: 'clip-path 0.2s ease-out', // 让探照灯框切换时有丝滑的缩放感
          }}
          alt="spotlight"
        />

        {/* 【辅助层】外围跟随的动态黄色荧光边框 */}
        <div style={borderStyle} />
      </div>

      {/* 音频渲染轨道（自动根据配置的多段音频并行/串行加载） */}
      {/* {data.segments.map((seg) => (
        <Audio
          key={seg.id}
          src={seg.audio}
          startFrom={seg.startFrame}
          endAt={seg.endFrame}
        />
      ))} */}
      <Sequence from={startDelay}>
        <Html5Audio src={audioFileUrl} />
      </Sequence>

      {/* PhonicsCard - bottom 1/3 of screen */}
      <PhonicsCard
        word={currentAudioData.word}
        phonics={currentAudioData.phonics}
        translation={currentAudioData.translation}
      />
    </AbsoluteFill>
    // <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: imgLoaded ? undefined : "#111" }}>
    //   {/* <Audio src={audioUrl} startFrom={0} /> */}
    //   <img
    //     src={resolveSrc(`textbookFlashlight/${version}_${grade}_${unit}.jpg`)}
    //     alt="background"
    //     onLoad={(e) => {
    //       const el = e.currentTarget as HTMLImageElement;
    //       // setImgNatural({ w: el.naturalWidth, h: el.naturalHeight });
    //       setImgLoaded(true);
    //     }}
    //     // onError={() => setImgError(true)}
    //     style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "contain", display: "block", zIndex: 1 }}
    //   />
    // </div>
  );
};

export default TextbookFlashlight;
