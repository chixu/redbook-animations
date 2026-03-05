import fs from 'fs';
import path from 'path';
import { stringifyArray1level } from '../common/utils.js';


const filePath = './prepare/vocabulary.txt'
const lines = fs.readFileSync(filePath, 'utf-8').split('\n').map(line => line.trim())
    .filter(line => line);
const res = []
let unit = 1;
let title = lines[0];
let count = 0
for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === '---' || line === '+++') {
        continue;
    }
    if (line === '===') {
        console.log('unit', unit, title, count);
        count = 0
        unit++;
        title = lines[++i];
        continue;
    }
    const splits = line.split('|');
    const [word, pos, translation] = splits;
    res.push({
        word,
        translation: translation.trim(),
        pos: pos.trim(),
        unit
    })
    count++;
}

//write to file
// fs.writeFileSync(
//     `prepare/vocabulary.json`,
//     stringifyArray1level(res),
//     'utf-8'
// );

const vocabsData = JSON.parse(fs.readFileSync(
    `prepare/vocabulary.json`,
    'utf-8'
));

vocabsData.forEach(d => {
    const { pos, translation, word, unit } = d;

    // check if translation contains Chinese char
    const isChinese = /[\u4e00-\u9fa5]/.test(translation);
    if (!isChinese) {
        console.log(word, translation);
    }
    if (!pos.match(/^[a-z./]+$/)) {
        console.log(word, pos);
    }
})