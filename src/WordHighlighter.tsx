import React, { useEffect, useState } from "react";
import { Audio, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import Highlight from "./Highlight";

type WordItem = {
  id: string;
  text: string;
  // bounding box as percentages (0-100)
  x: number;
  y: number;
  width: number;
  height: number;
  // start time in seconds
  start: number;
};

export const WordHighlighter: React.FC<{
  imageSrc: string;
  audioSrc: string;
  // optional: pass words directly, otherwise component will try to load `public/wordData.json`
  words?: WordItem[];
  dataFile?: string; // e.g. 'wordData.json'
  highlightDuration?: number;
}> = ({ imageSrc, audioSrc, words, dataFile = "wordData.json", highlightDuration = 0.6 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [internalWords, setInternalWords] = useState<WordItem[] | null>(words ?? null);
  const [rawJson, setRawJson] = useState<any[] | null>(null);
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);

  // resolve public/static file URLs
  const resolveSrc = (s: string) => {
    if (!s) return s;
    if (/^https?:\/\//.test(s) || s.startsWith("data:")) return s;
    const trimmed = s.startsWith("/") ? s.slice(1) : s;
    try {
      return staticFile(trimmed);
    } catch (e) {
      return trimmed;
    }
  };

  const imgUrl = resolveSrc(imageSrc);
  const audioUrl = resolveSrc(audioSrc);

  // load JSON data from public/wordData.json if no words prop provided
  useEffect(() => {
    if (words && words.length > 0) {
      setInternalWords(words);
      return;
    }
    let cancelled = false;
    const fetchData = async () => {
      try {
        const url = resolveSrc(dataFile);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!Array.isArray(json)) throw new Error("Invalid JSON");
        if (!cancelled) setRawJson(json);
      } catch (e) {
        // ignore
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [words, dataFile, width, height]);

  // When both rawJson and image natural size are available, map pixel positions to percents
  useEffect(() => {
    if (!rawJson || internalWords) return;
    if (!imgNatural) return;

    const nw = imgNatural.w;
    const nh = imgNatural.h;
    const containerW = width;
    const containerH = height;

    const imageAspect = nw / nh;
    const containerAspect = containerW / containerH;

    let displayedW = containerW;
    let displayedH = containerH;
    if (containerAspect > imageAspect) {
      // container wider than image -> image height = containerH
      displayedH = containerH;
      displayedW = imageAspect * displayedH;
    } else {
      // container taller -> image width = containerW
      displayedW = containerW;
      displayedH = displayedW / imageAspect;
    }

    const offsetLeft = (containerW - displayedW) / 2;
    const offsetTop = (containerH - displayedH) / 2;

    const mapped: WordItem[] = rawJson.map((it: any, idx: number) => {
      let [px = 0, py = 0, pw = 0, ph = 0] = it.position ?? [];
      const height = 10;
      py = py + ph - height; // adjust y to bottom-left
      ph = height; // set fixed height
      // scale pixel coords by displayed/original ratio, then add offset, then convert to percent of container
      const xOnCanvas = px * (displayedW / nw) + offsetLeft;
      const yOnCanvas = py * (displayedH / nh) + offsetTop;
      const wOnCanvas = pw * (displayedW / nw);
      const hOnCanvas = ph * (displayedH / nh);
      const nextItem = rawJson[idx + 1];
      const duration = nextItem ? nextItem.time - it.time - 0.1 : 3.0;

      const xPercent = (xOnCanvas / containerW) * 100;
      const yPercent = (yOnCanvas / containerH) * 100;
      const wPercent = (wOnCanvas / containerW) * 100;
      const hPercent = (hOnCanvas / containerH) * 100;

      return {
        id: `w-${idx}`,
        text: it.word ?? it.text ?? "",
        x: xPercent,
        y: yPercent,
        width: wPercent,
        height: hPercent,
        start: Number(it.time) ?? 0,
        duration
      } as WordItem;
    });

    setInternalWords(mapped);
  }, [rawJson, imgNatural, width, height, internalWords]);

  // render
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: imgLoaded ? undefined : "#111" }}>
      <Audio src={audioUrl} startFrom={0} />

      <img
        src={imgUrl}
        alt="background"
        onLoad={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          setImgNatural({ w: el.naturalWidth, h: el.naturalHeight });
          setImgLoaded(true);
        }}
        onError={() => setImgError(true)}
        style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "contain", display: "block", zIndex: 1 }}
      />

      {imgError && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, color: "white", background: "#900" }}>
          Failed to load image: {imageSrc}
        </div>
      )}

      {(internalWords ?? []).map((w) => (
        <React.Fragment key={w.id}>
          <Highlight time={w.start} x={w.x} y={w.y} width={w.width} height={w.height} duration={w.duration} />
          <div
            style={{
              position: "absolute",
              left: `${w.x}%`,
              top: `${w.y}%`,
              width: `${w.width}%`,
              height: `${w.height}%`,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 4,
            }}
          >
            <div style={{ position: "relative", color: "transparent" }}>{w.text}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default WordHighlighter;
