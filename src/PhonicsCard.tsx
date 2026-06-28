import React from "react";

export interface PhonicsCardProps {
  word: string;
  phonics: [string, string];
  translation: string;
}

function isPhoneticsVowel(str: string) {
  const vowels = 'eɪ, juː,ju,u, ə, ɪ, i, iə, ɔɪ, ɒ, ʊ, ʌ, iː, uː, iːə, eə, ɪə, ʊə, ɑː, ɔː, eʊ, aɪ, æ, ɜː, aʊ, e, əʊ'
    // , oʊ
    .split(',').map(i => i.trim())
  return vowels.includes(str.replace('(r)', '').replace(/['ˈˌ ]/, ''))
}

function renderZiranpinduCell(data: [string, string], isPhonetics: boolean) {
  const res = []
  const [wordStr, phoneticsStr] = data;
  const wordParts = wordStr.split(/[,|]/)
  // handle h,ɜː(r); h,ə(r)
  const phoneticsStrs = phoneticsStr.split(/[;；]/);
  if (phoneticsStrs.length === 2) {
    return renderZiranpinduCell([wordStr, phoneticsStrs[0]], isPhonetics)
  } else if (phoneticsStrs.length > 2) {
    throw new Error(`phonetics ${phoneticsStr} has more than 2 parts`)
  }
  const phoneticsParts = phoneticsStr.split(",")
  const syllableParts = wordStr.split('|')
  if (wordParts.length !== phoneticsParts.length) {
    throw new Error(`word ${wordStr} phonetics ${phoneticsStr} not match`)
  }
  let syllablePartStart = 0;
  for (let i = 0; i < syllableParts.length; i++) {
    const syllable = []
    const syllablePart = syllableParts[i];
    const wordParts = syllablePart.split(',')
    for (let j = 0; j < wordParts.length; j++) {
      const wordPart = wordParts[j];
      const phoneticsPart = phoneticsParts[syllablePartStart + j];
      // syllable.push(wordPart)
      const className = isPhoneticsVowel(phoneticsPart) ? 'v-char' : 'c-char';
      const content = isPhonetics ? phoneticsPart : wordPart;
      syllable.push(<span key={content} className={className}>{content}</span>)
    }
    syllablePartStart += wordParts.length;
    res.push(syllable)
  }
  return res;
}

const PhonicsCard: React.FC<PhonicsCardProps> = ({
  word,
  phonics,
  translation,
}) => {
  console.log('PhonicsCard', word, phonics, translation)
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "33.33%",
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: "72px",
          fontWeight: "bold",
          color: "#FFD700",
          marginBottom: "8px",
        }}
      >
        {renderZiranpinduCell(phonics, false)}
      </div>
      <div
        style={{
          fontSize: "48px",
          color: "#FFFFFF",
          opacity: 0.9,
          marginBottom: "8px",
        }}
      >
        <span style={{ color: '#222' }}>/</span>
        {renderZiranpinduCell(phonics, true)}
        <span style={{ color: '#222' }}>/</span>
      </div>
      <div
        style={{
          fontSize: "36px",
          color: "#222",
        }}
      >
        {translation}
      </div>
    </div>
  );
};

export default PhonicsCard;
