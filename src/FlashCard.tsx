import React from 'react';
import { AbsoluteFill } from 'remotion';


interface FlashCardProps {
  word: string;
  translation: string;
  index: number;
}

export const FlashCard: React.FC<FlashCardProps> = ({ word, translation, index }) => {
  // console.log(word)
  return (
    <AbsoluteFill style={{
      backgroundColor: '#f5f5f5',
      padding: '4rem',
    }}>
      <div style={{
        position: 'absolute',
        top: '4rem',
        left: '4rem',
        fontSize: '3rem',
        color: '#666',
      }}>
        #{index}
      </div>

      <h1 style={{
        fontSize: '6rem',
        fontWeight: 'bold',
        marginTop: '500px',
        textAlign: 'center',
      }}>
        {word}
      </h1>

      {translation && (
        <p style={{
          marginTop: '100px',
          fontSize: '4rem',
          color: '#666',
          textAlign: 'center',
        }}>
          {translation}
        </p>
      )}
    </AbsoluteFill>
  );
};

export default FlashCard;