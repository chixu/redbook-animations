import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import ffmpeg from "fluent-ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import CopyWebpackPlugin from "copy-webpack-plugin";
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

ffmpeg.setFfprobePath(ffprobePath.path);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wordsCount = 20;
const unitNumber = 22;
const fromIndex = 0;
const toIndex = Math.floor(52 / wordsCount);



const getAudioDuration = (audioPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration);
      }
    });
  });
};

async function getVideoDurations() {
  // const durations = [];
  videoDurations = [];
  for (let i = fromIndex; i <= toIndex; i++) {
    const foldername = `${unitNumber.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    const metaDataPath = `/flashcards/${foldername}/`;
    const audioPath = path.resolve(__dirname, `public${metaDataPath}audio.mp3`);
    const audioDuration = await getAudioDuration(audioPath);
    videoDurations.push(audioDuration);
  }
}
let videoDurations = [];

const renderVideo = async (startIndex) => {
  const entry = path.resolve(__dirname, "src/index.ts");
  const foldername = `${unitNumber.toString().padStart(2, '0')}-${startIndex.toString().padStart(2, '0')}`;
  const outputLocation = path.resolve(__dirname, `out/flashcards-${foldername}.mp4`);
  if (fs.existsSync(outputLocation)) {
    console.log(`Video ${outputLocation} already exists, skip rendering`);
    return;
  }
  const metaDataPath = `/flashcards/${foldername}/`;
  const audioPath = path.resolve(__dirname, `public${metaDataPath}audio.mp3`);
  const metaData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `public${metaDataPath}data.json`), 'utf8'));

  console.log(`Getting audio duration for ${audioPath}...`);
  const audioDuration = videoDurations[startIndex];
  const startAudioTime = videoDurations.filter((_, index) => index < startIndex).reduce((acc, cur) => acc + cur, 0);
  const allAudioDuration = videoDurations.reduce((acc, cur) => acc + cur, 0);
  console.log(`Audio duration: ${audioDuration.toFixed(2)} seconds`);

  console.log(`Bundling video for startIndex=${startIndex}...`);
  const bundled = await bundle({
    entryPoint: entry,
    webpackOverride: (config) => {
      config.plugins = config.plugins || [];
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, "public"),
              to: "",
              noErrorOnMissing: true,
            },
          ],
        })
      );
      return config;
    },
  });

  console.log(`Selecting composition for startIndex=${startIndex}...`);
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "FlashCardScene",
    inputProps: {
      startIndex: startIndex * wordsCount,
      data: metaData.data,
      audioUrl: `${metaDataPath}audio.mp3`,
      durationInFrames: Math.ceil(audioDuration * 30),
      startTime: startAudioTime,
      totalTime: allAudioDuration,
    },
    durationInFrames: Math.ceil(audioDuration * 30),
  });

  console.log(`Rendering video for startIndex=${startIndex} (duration: ${audioDuration.toFixed(2)}s)...`);
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation,
    inputProps: {
      startIndex: startIndex * wordsCount,
      data: metaData.data,
      audioUrl: `${metaDataPath}audio.mp3`,
      startTime: startAudioTime,
      totalTime: allAudioDuration,
    },
    durationInFrames: Math.ceil(audioDuration * 30),
    pixelFormat: "yuv420p",
    proResProfile: undefined,
    overwrite: true,
  });

  console.log(`✅ Video exported: ${outputLocation}`);
};

const main = async () => {
  // return;
  console.log("Starting batch video export...");
  while (true) {
    try {
      await getVideoDurations();
      break;
    } catch (err) {
      console.error("Error getting video durations:", err);
    }
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  for (let i = fromIndex; i <= toIndex; i++) {
    const startIndex = i;
    console.log(`\n=== Processing batch ${i + 1} (startIndex=${startIndex}) ===`);
    await renderVideo(startIndex);
  }

  console.log("\n✅ All videos exported successfully!");
};

main().then(() => {
  const outputPath = `merged-${fromIndex}-${toIndex}.mp4`;
  // 1. Tell fluent-ffmpeg where the binaries are
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  ffmpeg.setFfprobePath(ffprobeInstaller.path);
  // Create a new ffmpeg command
  const command = ffmpeg();
  for (let i = fromIndex; i <= toIndex; i++) {
    const filePath = path.join(`./out/flashcards-${unitNumber.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}.mp4`);
    command.input(filePath);
  }
  command
    .on('error', (err) => {
      console.error('An error occurred: ' + err.message);
    })
    .on('end', () => {
      console.log('Merging finished successfully!');
      // open the output folder
    })
    .mergeToFile(outputPath, './temp/'); // Second argument is a temp directory
}).catch((err) => {
  console.error("Error during video export:", err);
  process.exit(1);
});
