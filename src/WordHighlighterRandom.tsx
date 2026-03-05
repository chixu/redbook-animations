import React, { useEffect, useState, useMemo } from "react";
import { Audio, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import Highlight2 from "./Highlight2";
import RandomHighlight from "./RandomHighlight";
import ObjectContainers from "./components/ObjectContainers";

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
  dataFile?: string; // e.g. 'wordData.json'
  highlightDuration?: number;
}> = ({ imageSrc, audioSrc, dataFile = "wordData.json" }) => {
  const frame = useCurrentFrame();
  const lineWidth = 220;
  const { fps, width, height } = useVideoConfig();

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [internalWords, setInternalWords] = useState<WordItem[] | null>(null);
  const [rawJson, setRawJson] = useState<any[] | null>(null);
  const [canvasPositions, setCanvasPositions] = useState<any[] | null>(null);
  const [scriptItems, setScriptItems] = useState<any[]>([]);
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

  const options = useMemo(() => {
    if (!imgNatural) return null;

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

    const options: any = {
      displayedW,
      displayedH,
      offsetLeft,
      offsetTop,
      nw,
      nh,
      containerW,
      containerH,
    }
    return options;
  }, [imgNatural, width, height])

  // load JSON data from public/wordData.json if no words prop provided
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const url = resolveSrc(dataFile);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // if (!Array.isArray(json)) throw new Error("Invalid JSON");
        if (!cancelled) {
          setRawJson(json);
        }
      } catch (e) {
        console.error(e)
        // ignore
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [dataFile, width, height]);


  function convertToCanvasPosition(
    {
      rect,
      displayedW,
      displayedH,
      offsetLeft,
      offsetTop,
      nw,
      nh,
      containerW,
      containerH,
    }: {
      rect: number[];
      displayedW: number;
      displayedH: number;
      offsetLeft: number;
      offsetTop: number;
      nw: number;
      nh: number;
      containerW: number;
      containerH: number;
    }
  ) {
    const [px, py, pw, ph] = rect;
    const xOnCanvas = px * (displayedW / nw) + offsetLeft - 12;
    const yOnCanvas = py * (displayedH / nh) + offsetTop - 14;
    const wOnCanvas = Math.min(pw * (displayedW / nw), 400);
    const hOnCanvas = ph * (displayedH / nh) + 4;

    const xPercent = (xOnCanvas / containerW) * 100;
    const yPercent = (yOnCanvas / containerH) * 100;
    const wPercent = (wOnCanvas / containerW) * 100;
    const hPercent = (hOnCanvas / containerH) * 100;

    return [xPercent, yPercent, wPercent, hPercent];
  }

  const [currentWordIndex, randomHighlightStartFrame] = useMemo(() => {
    if (!rawJson) return [-1, 0];
    const allWordsData = rawJson.data;
    let i = 0;
    for (i = 1; i < allWordsData.length; i++) {
      if (frame < allWordsData[i].startTimeSec * fps - 45) {
        return [i - 1, i === 1 ? 0 : allWordsData[i - 1].startTimeSec * fps - 45];
      }
    }
    return [i - 1, allWordsData[i - 1].startTimeSec * fps - 45];
  }, [rawJson, frame, fps]);


  useEffect(() => {
    if (!rawJson) return;
    if (!options) return;
    const wordRects = Object.values(rawJson.wordRects)
    const mapped: any[] = Object.values(wordRects).map((it: any, idx: number) => {
      return convertToCanvasPosition({
        rect: it,
        ...options,
      })
    })
    console.log('mapped', mapped)
    setCanvasPositions(mapped);
  }, [rawJson, imgNatural, options]);

  useEffect(() => {
    if (!rawJson) return;
    if (!options) return;
    const res = rawJson.scripts.map(item => ({
      ...item,
      rect: convertToCanvasPosition({
        rect: item.rect,
        ...options,
      })
    }));
    // const data = rawJson.data;

    // for (const item of data) {
    //   let rects = rawJson.transData[item.word];
    //   rects = Array.isArray(rects[0]) ? rects : [rects]
    //   rects = rects.map(rect => convertToCanvasPosition({
    //     rect,
    //     ...options,
    //   }))
    //   res.push({
    //     frame: (item.startTimeSec + item.durationSec) * fps,
    //     rects,
    //   })
    // }
    // console.log('res', res)
    setScriptItems(res);
  }, [rawJson, imgNatural, options, fps]);

  // When both rawJson and image natural size are available, map pixel positions to percents
  useEffect(() => {
    // console.log(rawJson)
    // console.log(imgNatural)
    // if (!rawJson) return;
    // if (!imgNatural) return;

    // const nw = imgNatural.w;
    // const nh = imgNatural.h;
    // const containerW = width;
    // const containerH = height;

    // const imageAspect = nw / nh;
    // const containerAspect = containerW / containerH;

    // let displayedW = containerW;
    // let displayedH = containerH;
    // if (containerAspect > imageAspect) {
    //   // container wider than image -> image height = containerH
    //   displayedH = containerH;
    //   displayedW = imageAspect * displayedH;
    // } else {
    //   // container taller -> image width = containerW
    //   displayedW = containerW;
    //   displayedH = displayedW / imageAspect;
    // }

    // const offsetLeft = (containerW - displayedW) / 2;
    // const offsetTop = (containerH - displayedH) / 2;

    // const options: any = {
    //   displayedW,
    //   displayedH,
    //   offsetLeft,
    //   offsetTop,
    //   nw,
    //   nh,
    //   containerW,
    //   containerH,
    // }

    // const mapped: WordItem[] = rawJson.map((it: any, idx: number) => {
    //   const [px = 0, py = 0, pw = 0, ph = 0] = it.position ?? [];
    //   // const height = 10;
    //   // py = py + ph - height; // adjust y to bottom-left
    //   // ph = height; // set fixed height
    //   // scale pixel coords by displayed/original ratio, then add offset, then convert to percent of container
    //   // const xOnCanvas = px * (displayedW / nw) + offsetLeft - 12;
    //   // const yOnCanvas = py * (displayedH / nh) + offsetTop - 14;
    //   // const wOnCanvas = Math.min(pw * (displayedW / nw), 400);
    //   // const hOnCanvas = ph * (displayedH / nh) + 4;
    //   // // const nextItem = rawJson[idx + 1];
    //   // // const duration = nextItem ? nextItem.time - it.time - 0.1 : 3.0;

    //   // const xPercent = (xOnCanvas / containerW) * 100;
    //   // const yPercent = (yOnCanvas / containerH) * 100;
    //   // const wPercent = (wOnCanvas / containerW) * 100;
    //   // const hPercent = (hOnCanvas / containerH) * 100;

    //   const [xPercent, yPercent, wPercent, hPercent] = convertToCanvasPosition({
    //     px: px + pw + 5,
    //     py,
    //     pw: lineWidth - pw - 5,
    //     ph,
    //     ...options,
    //   })

    //   return {
    //     id: `w-${idx}`,
    //     text: it.word ?? it.text ?? "",
    //     x: xPercent,
    //     y: yPercent,
    //     width: wPercent,
    //     height: hPercent,
    //     start: Number(it.time) ?? 0,
    //     // duration
    //   } as WordItem;
    // });

    // setInternalWords(mapped);
  }, [rawJson, imgNatural, options]);

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

      {canvasPositions && <RandomHighlight
        startIndex={rawJson.randomIndexArray[currentWordIndex - 1] ?? null}
        endIndex={rawJson.randomIndexArray[currentWordIndex]}
        allRects={canvasPositions}
        endFrame={randomHighlightStartFrame + 40}
        startFrame={randomHighlightStartFrame}
      />}

      {
        scriptItems && <ObjectContainers
          dataItems={scriptItems}
        />
      }

      {/* {(internalWords ?? []).map((w) => (
        <React.Fragment key={w.id}>
          <Highlight2 time={w.start} x={w.x} y={w.y} width={w.width} height={w.height} duration={w.duration} />
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
      ))} */}
    </div>
  );
};

export default WordHighlighter;
