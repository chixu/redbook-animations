import { AbsoluteFill, useVideoConfig, staticFile, Audio } from "remotion";
import { calculateMetadata } from "@remotion/media-utils";
import WordHighlighter from "./WordHighlighter";
import { unit1 } from "./data/unit1";

// Calculate audio duration to set video length
export const getDuration = async () => {
  const metadata = await calculateMetadata({ src: staticFile("Unit 1.mp3") });
  return metadata.durationInSeconds;
};

export const BackgroundImage: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ width, height }}>
      <WordHighlighter
        imageSrc={staticFile("1.jpg")}
        audioSrc={staticFile("Unit 1.mp3")}
        words={unit1}
        highlightDuration={0.6}
      />
    </AbsoluteFill>
  );
};