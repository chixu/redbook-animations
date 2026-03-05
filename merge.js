// const ffmpeg = require('fluent-ffmpeg');
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import path from 'path';

const startIndex = 0;
const endIndex = 5;
const outputPath = `merged-${startIndex}-${endIndex}.mp4`;

// 1. Tell fluent-ffmpeg where the binaries are
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// Create a new ffmpeg command
const command = ffmpeg();
for (let i = startIndex; i <= endIndex; i++) {
    const filePath = path.join(`./out/flashcards-${i}.mp4`);
    command.input(filePath);
}

command
    .on('error', (err) => {
        console.error('An error occurred: ' + err.message);
    })
    .on('end', () => {
        console.log('Merging finished successfully!');
    })
    .mergeToFile(outputPath, './temp/'); // Second argument is a temp directory