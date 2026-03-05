import "./index.css";
import { Composition, staticFile, getInputProps } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { BackgroundImage, getDuration } from "./BackgroundImage";
import WordHighlighter from "./WordHighlighter";
import WordHighlighter2 from "./WordHighlighter2";
import WordHighlighterRandom from "./WordHighlighterRandom";
import FlashCardScene from "./FlashCardScene";
import { calculateMetadata } from "@remotion/media-utils";
import { useEffect, useState } from "react";

// Each <Composition> is an entry in the sidebar!
const inputProps = getInputProps();

console.log('inputProps', inputProps)
export const RemotionRoot: React.FC = () => {
  const version = "renjiao-4-2-1";
  const audioSrc = `/${version}/sound.mp3`
  // const audioSrc2 = `/${version}/sound2.mp3`

  const foldername = '01-00';
  const wordsCount = 20;
  const metaDataPath = `/flashcards/${foldername}/`
  const [audioDuration, setAudioDuration] = useState(150);
  const [metaData, setMetaData] = useState<any>({});

  useEffect(() => {
    console.log('audioSrc', audioSrc)
    const fetchMetaData = async () => {
      const data = await fetch(staticFile(metaDataPath + "data.json"));
      const json = await data.json();
      console.log('json', json)
      setMetaData(json);
    };
    fetchMetaData();
  }, []);
  // load audio and get the audio length in second

  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="FlashCardScene"
        component={FlashCardScene}
        fps={30}
        width={1080}
        height={1440}
        durationInFrames={inputProps.durationInFrames ?? 100}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          startIndex: parseInt(foldername.split('-')[1]) * wordsCount,
          data: [],
          audioUrl: staticFile(metaDataPath + "audio.mp3"),
        }}
        // calculateMetadata={async ({ props }) => {
        //   const { durationInSeconds } = await getMediaMetadata(props.src);

        //   return {
        //     durationInFrames: Math.floor(durationInSeconds * 30),
        //   };
        // }}
      />
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1440}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      <Composition
        id="Unit1Highlight"
        component={() => (
          <WordHighlighter
            // imageSrc={staticFile("1.jpg")}
            // audioSrc={staticFile("Unit 1.mp3")}
            imageSrc={(`/${version}/1.jpg`)}
            audioSrc={audioSrc}
            dataFile={`/${version}/wordData.json`}
            highlightDuration={1.0}
          />
        )}
        durationInFrames={Math.ceil(audioDuration * 30)} // Increased duration
        fps={30}
        width={1080}
        height={1440}
      />

      <Composition
        id="Unit1Highlight-Random"
        component={() => (
          <WordHighlighterRandom
            // imageSrc={staticFile("1.jpg")}
            // audioSrc={staticFile("Unit 1.mp3")}
            imageSrc={(`/${version}/1.jpg`)}
            audioSrc={audioSrc}
            dataFile={`/${version}/wordData.json`}
          />
        )}
        durationInFrames={Math.ceil(audioDuration * 30)} // Increased duration
        fps={30}
        width={1080}
        height={1440}
      />

      <Composition
        id="Unit1Highlight-Cn-En"
        component={() => (
          <WordHighlighter2
            // imageSrc={staticFile("1.jpg")}
            // audioSrc={staticFile("Unit 1.mp3")}
            imageSrc={(`/${version}/1.jpg`)}
            audioSrc={audioSrc2}
            dataFile={`/${version}/wordData2.json`}
            highlightDuration={1.0}
          />
        )}
        durationInFrames={Math.ceil(audioDuration * 30)} // Increased duration
        fps={30}
        width={1080}
        height={1440}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1440}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />

      <Composition
        id="BackgroundImage"
        component={BackgroundImage}
        durationInFrames={Math.ceil(12 * 30)}
        fps={30}
        width={1080}
        height={1440}
      />
    </>
  );
};
