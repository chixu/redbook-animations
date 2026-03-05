import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const versionName = args[0];
const index = args[1] ?? '';

if (!versionName) {
    throw new Error("versionName is required");
}

const wordPosition = JSON.parse(fs.readFileSync(path.join(process.cwd(), `public/${versionName}/wordPosition.json`), "utf-8"));
const wordTime = JSON.parse(fs.readFileSync(path.join(process.cwd(), `public/${versionName}/wordTime${index}.json`), "utf-8"));

//validate the keys are the same
const wordPositionKeys = Object.keys(wordPosition);
// const wordTimeKeys = Object.keys(wordTime);
if (wordPositionKeys.length !== wordTime.length) {
    throw new Error("wordPosition and wordTime keys are not the same");
}
//validate the keys are the same
// if (wordPositionKeys.some((key) => !wordTimeKeys.includes(key))) {
//     throw new Error("wordPosition and wordTime keys are not the same");
// }

const res = []
for (let i = 0; i < wordTime.length; i++) {
    const timeData = wordTime[i];
    const word = wordPositionKeys[i];
    if(word !== timeData.sentence) {
        throw new Error("wordPosition and wordTime keys are not the same");
    }
    res.push({
        word,
        position: wordPosition[word],
        time: timeData.startTimeSec
    })
}
//write to file
fs.writeFileSync(path.join(process.cwd(), `public/${versionName}/wordData${index}.json`), JSON.stringify(res, null, 2));
