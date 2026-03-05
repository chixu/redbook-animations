import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const versionName = args[0];

if (!versionName) {
  throw new Error("versionName is required");
}

const wordRectsRaw = JSON.parse(fs.readFileSync(path.join(process.cwd(), `public/${versionName}/wordRects.json`), "utf-8"));
const wordTime = JSON.parse(fs.readFileSync(path.join(process.cwd(), `public/${versionName}/wordTime.json`), "utf-8"));
const res = [];
const { wordData: wordRects, transData: transRects } = wordRectsRaw;
for (const wordData of wordTime.data) {
  const { word, startTimeSec, durationSec } = wordData;
  const wordRect = wordRects[word];
  const transRect = transRects[word];
  if (!wordRect || !transRect) {
    throw new Error(`word ${word} not found in wordRects or transRects`);
  }

  // if transRect is 2d array, flatten it
  if (Array.isArray(transRect[0])) {
    transRect.forEach((rect) => {
      res.push({
        rect,
        end: startTimeSec + Math.max(durationSec + 3, Math.round(durationSec * 3.3)),
      })
    })
  } else {
    res.push({
      rect: transRect,
      end: startTimeSec + Math.max(durationSec + 3, Math.round(durationSec * 3.3)),
    })
  }

}
//write to file
fs.writeFileSync(path.join(process.cwd(), `public/${versionName}/wordData.json`), JSON.stringify({
  scripts: res,
  wordRects,
  ...wordTime,
}, null, 2));
