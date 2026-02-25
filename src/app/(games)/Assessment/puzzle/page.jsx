"use client";

import { useEffect, useState, useRef } from "react";

const puzzleLevels = [
  { level: 1, pieces: 2, image: "/pictures/games/puzzle/level1.jpg" },
  { level: 2, pieces: 4, image: "/pictures/games/puzzle/level2.jpg" },
  { level: 3, pieces: 6, image: "/pictures/games/puzzle/level3.jpg" },
  { level: 4, pieces: 9, image: "/pictures/games/puzzle/level4.jpg" },
  { level: 5, pieces: 12, image: "/pictures/games/puzzle/level4.jpg"}
];

const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 170;

export default function PuzzlePage() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [pieces, setPieces] = useState([]);
  const [slots, setSlots] = useState([]);
  const [moves, setMoves] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const firstMoveTime = useRef(null);
  const lastMoveTime = useRef(null);
  const moveIntervals = useRef([]);

  const currentLevel = puzzleLevels[levelIndex];

  // Calculate grid
  const columns = Math.ceil(Math.sqrt(currentLevel.pieces));
  const rows = Math.ceil(currentLevel.pieces / columns);

  const pieceWidth = IMAGE_WIDTH / columns;
  const pieceHeight = IMAGE_HEIGHT / rows;
  
  useEffect(() => {
    initializeLevel();
  }, [levelIndex]);

  function initializeLevel() {
    const newPieces = [];
    const newSlots = [];

    for (let i = 0; i < currentLevel.pieces; i++) {
      const correctRow = Math.floor(i / columns);
      const correctCol  = (i % columns);
      //console.log("Index:", i, "Row:", correctRow, "Col:", correctCol);
      newPieces.push({ id: i, correctRow, correctCol });
      newSlots.push(null);
    }

    setPieces(shuffle(newPieces));
    setSlots(newSlots);
    setMoves(0);
    setErrors(0);
    setStartTime(Date.now());
    firstMoveTime.current = null;
    lastMoveTime.current = null;
    moveIntervals.current = [];
  }

  function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function handleDrop(pieceId, slotIndex) {
    const now = Date.now();

    if (!firstMoveTime.current) firstMoveTime.current = now - startTime;
    if (lastMoveTime.current) moveIntervals.current.push(now - lastMoveTime.current);
    lastMoveTime.current = now;

    setMoves(prev => prev + 1);

    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const newSlots = [...slots];
    const newPieces = [...pieces];

    // If slot already has a piece, put it back in pool
    if (newSlots[slotIndex]) newPieces.push(newSlots[slotIndex]);

    // Place new piece in slot
    newSlots[slotIndex] = piece;
    setSlots(newSlots);

    // Remove dropped piece from pool
    const updatedPieces = newPieces.filter(p => p.id !== pieceId);
    setPieces(updatedPieces);

    // Count error if piece is in wrong slot
    if (piece.correctRow * columns + piece.correctCol !== slotIndex) {
      setErrors(prev => prev + 1);
    }

    checkCompletion(newSlots);
  }

  function handleSlotClick(slotIndex) {
    const newSlots = [...slots];
    const piece = newSlots[slotIndex];
    if (!piece) return;

    // Remove piece from slot and return to pool
    newSlots[slotIndex] = null;
    setSlots(newSlots);
    setPieces(prev => [...prev, piece]);
  }

  function checkCompletion(currentSlots) {
  const isCorrect = currentSlots.every((slot, idx) => {
    if (!slot) return false;

    const targetRow = Math.floor(idx / columns);
    const targetCol = (columns - 1) - (idx % columns);

    return (
      slot.correctRow === targetRow &&
      slot.correctCol === targetCol
    );
  });

  if (isCorrect) setTimeout(finishLevel, 800);
}

  function finishLevel() {
    const totalTime = (Date.now() - startTime) / 1000;
    const efficiency = currentLevel.pieces / moves;
    const errorRate = errors / moves;

    const result = {
      assessmentType: "visuospatial_puzzle",
      level: currentLevel.level,
      pieces: currentLevel.pieces,
      timeSeconds: totalTime,
      moves,
      errors,
      efficiency,
      errorRate,
      firstMoveLatencyMs: firstMoveTime.current,
      moveIntervalsMs: moveIntervals.current,
      timestamp: new Date().toISOString()
    };

    saveAssessment(result);

    if (levelIndex < puzzleLevels.length - 1) setLevelIndex(prev => prev + 1);
  }

  function saveAssessment(result) {
    const existing = JSON.parse(localStorage.getItem("cognitiveAssessment_puzzle")) || [];
    existing.push(result);
    localStorage.setItem("cognitiveAssessment_puzzle", JSON.stringify(existing));
  }

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h2>پازل - سطح {currentLevel.level}</h2>

      {/* Board */}
      <div
        style={{
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, ${pieceWidth}px)`,
          gridTemplateRows: `repeat(${rows}, ${pieceHeight}px)`,
          margin: "30px auto",
          border: "2px solid #333"
        }}
      >
        {slots.map((slot, index) => (
          <div
            key={index}
            onClick={() => handleSlotClick(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const pieceId = Number(e.dataTransfer.getData("piece"));
              handleDrop(pieceId, index);
            }}
            style={{
              width: pieceWidth,
              height: pieceHeight,
              backgroundImage: slot ? `url(${currentLevel.image})` : "none",
              backgroundSize: `${IMAGE_WIDTH}px ${IMAGE_HEIGHT}px`,
              backgroundPosition: slot
                ? `-${(IMAGE_WIDTH / columns) * slot.correctCol}px -${(IMAGE_HEIGHT / rows) * slot.correctRow}px`
                : "0 0",
              border: "1px solid #aaa",
              cursor: slot ? "pointer" : "default"
            }}
          />
        ))}
      </div>

      {/* Pieces */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
          maxWidth: 600,
          margin: "0 auto"
        }}
      >
        {pieces.map(piece => (
          <div
            key={piece.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("piece", piece.id)}
            style={{
              width: pieceWidth,
              height: pieceHeight,
              backgroundImage: `url(${currentLevel.image})`,
              backgroundSize: `${IMAGE_WIDTH}px ${IMAGE_HEIGHT}px`,
              backgroundPosition: `-${(IMAGE_WIDTH / columns) * piece.correctCol}px -${(IMAGE_HEIGHT / rows) * piece.correctRow}px`,
              cursor: "grab",
              border: "1px solid #333"
            }}
          />
        ))}
      </div>
    </div>
  );
}