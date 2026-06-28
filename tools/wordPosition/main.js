import fs from 'fs'
import path from 'path'
import { getGradeCn } from '../../../redbook-eng/common/js/textbook/grade.js'

// get args
const args = process.argv.slice(2);
const version = args[0];
const grade = args[1];
const unit = args[2];

if (!version || !grade) {
  console.log('Usage: node main.js <version> <grade>');
  process.exit(1);
}

const redbookPath = path.resolve(`../redbook-eng`);
const datapath = path.resolve(redbookPath, `common/eng/primary_vocab_${version}.txt`);
const words = [];
const lines = fs.readFileSync(datapath, 'utf8').split('\n').filter(line => line.trim() !== '');
lines.forEach(line => {
  const lineData = line.split('|');
  const gradeCn = getGradeCn(grade);
  if (lineData[0] === gradeCn && lineData[1] === `Unit ${unit}`) {
    words.push(lineData[2]);
  }
});

words.forEach(item => {
  console.log(`"${item}": 0,`)
})
// get current file dir
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const currentDir = path.resolve(__dirname);
console.log(currentDir)

fs.writeFileSync(path.resolve(currentDir, `${version}_${grade}_${unit}.txt`), words.join('\n'), 'utf8');


// ======================================================================


let lineHeight = 34;
const lineWidth = 420;
const origX = 50;
const origY = 256;
const letterSpace = 20;

const lineCount = {
  'was': 2,
  'kilometre': 2,
  'gingerbread house': 2,
  'go': 2,
  'see': 2,
  'take': 3,
  'inspiring': 2,
  'restaurant': 2,
  'New Zealand': 2,
  'Hong Kong-Zhuhai-Macao Bridge': 3,
  'Terracotta Warriors': 2,
  'Jinggangshan Revolution Museum': 3,
}
const wordLineCount = {
  'gingerbread house': 2,
  'Hong Kong-Zhuhai-Macao Bridge': 2,
  'Jinggangshan Revolution Museum': 2,
}
const yOffsets = {
  airport: 52,
  "New Zealand": 48,
  // "Paris": -6,
  // 'Jinggangshan Revolution Museum': -4,
  // "the Red Army": -10,
}
const lineHeights = {
  airport: 55,
}
const xOffsets = {
  "hello": -8,
  "hi": 0,
  "Good morning.": -40,
  "I": 0,
  "am": 10,
  "*ah": 0,
  "a": 15,
  "cat": 0,
  "Miss": 0,
  "Good afternoon.": -50,
  "class": -10,
  "goodbye": 0,
  "bye": 8,
}
let previousY = origY
let yOffset = 0;
const wordsWidth = {}
for (const word of words) {
  wordsWidth[word] = Math.round(word.length * letterSpace);
}
const res = {
  wordData: {},
  transData: {},
  words: words,
}
words.forEach((word, i) => {
  const { wordData, transData } = res;
  if (lineHeights[word]) {
    lineHeight = lineHeights[word]
  }
  const nextWord = words[i + 1];
  // const itemData2 = data[word];
  // const itemData = [itemData2[0] * imageWidth, itemData2[1] * imageHeight, itemData2[2] * imageWidth, itemData2[3] * imageHeight];
  const currentY = previousY;
  // if (wordLineCount[word] > 1) {
  //   itemData = []
  //   if (xOffsets[word]) {
  //     const w = lineHeight * (wordLineCount[word] - 1)
  //     itemData.push([origX, currentY, lineWidth, w])
  //     itemData.push([origX, currentY + w, xOffsets[word], lineHeight])
  //   } else {
  //     itemData = [origX, currentY, lineWidth, lineHeight * wordLineCount[word]]
  //   }
  // }
  const height = lineHeight * (wordLineCount[word] ?? 1)
  const width = Math.min(wordsWidth[word] + (xOffsets[word] ?? 0), lineWidth)
  let itemData = [origX, currentY, width, height];
  previousY = currentY + (lineCount[word] ?? 1) * lineHeight + (yOffsets[nextWord] ?? 0);
  transData[word] = [origX, currentY, lineWidth, previousY - currentY]
  // console.log(itemData)
  wordData[word] = itemData
})

function tryLoadJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    return {};
  }
}

function loadPhonicsData() {
  const primaryPath = path.resolve('../redbook-eng/primary_vocab/');
  const path1 = path.resolve(primaryPath, 'output', version, 'phonetics-all.json');
  const path2 = path.resolve(primaryPath, 'output-patch', version, 'phonetics.json');
  const path3 = path.resolve(primaryPath, 'output-patch', version, `phonetics-${grade}.json`);
  const data1 = tryLoadJson(path1);
  const data2 = tryLoadJson(path2);
  const data3 = tryLoadJson(path3);
  return {
    ...data1,
    ...data2,
    ...data3,
  }
}

const phonicsData = loadPhonicsData();

function applyPhonicsData(phonicsData) {
  const targetPath = path.resolve(
    `public/textbookFlashlight/${version}_${grade}_${unit}-audio.json`);
  const data = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  data.data.forEach(item => {
    const phonics = phonicsData[item.word];
    if (!phonics) {
      throw new Error(`Phonetics data not found for ${item.word}`);
    }
    console.log(item.word);
    item.phonics = phonics;
  })
  fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
}
console.log(phonicsData)
applyPhonicsData(phonicsData);
const destDir = path.resolve('./public/textbookFlashlight')
fs.writeFileSync(path.resolve(destDir, `${version}_${grade}_${unit}.json`), JSON.stringify(res, null, 2), 'utf8');
