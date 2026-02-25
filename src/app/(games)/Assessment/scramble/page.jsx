"use client"

import { useEffect, useState, useRef } from "react"
import { clinicalTrials } from "@/data/scramble_words"

export default function ClinicalScramble() {
  const TRIAL_TIME = 15 // seconds
  const MAX_FAILURES_PER_LEVEL = 3

  const [trialIndex, setTrialIndex] = useState(0)
  const [selected, setSelected] = useState([])
  const [shuffled, setShuffled] = useState([])
  const [timeLeft, setTimeLeft] = useState(TRIAL_TIME)
  const [gameOver, setGameOver] = useState(false)

  const [sessionData, setSessionData] = useState([])
  const [levelFailures, setLevelFailures] = useState(0)

  const trialStartTime = useRef(null)
  const firstClickTime = useRef(null)
  const clickTimes = useRef([])
  const clearsUsed = useRef(0)
  const timerRef = useRef(null)

  const currentTrial = clinicalTrials[trialIndex]

  // Shuffle letters when trial changes
  useEffect(() => {
    if (!currentTrial) return

    const letters = currentTrial.word.split("")
    const shuffledLetters = [...letters].sort(() => Math.random() - 0.5)

    setShuffled(shuffledLetters)
    setSelected([])
    setTimeLeft(TRIAL_TIME)
    clearsUsed.current = 0
    clickTimes.current = []
    firstClickTime.current = null
    trialStartTime.current = Date.now()
    setGameOver(false)
  }, [trialIndex])

  // Timer
  useEffect(() => {
    if (gameOver) return

    if (timeLeft <= 0) {
      endTrial(true)
      return
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timerRef.current)
  }, [timeLeft, gameOver])

  const handleLetterClick = (letter) => {
    if (gameOver) return
    if (selected.length >= currentTrial.word.length) return

    const now = Date.now()

    if (!firstClickTime.current) {
      firstClickTime.current = now
    }

    clickTimes.current.push(now)

    setSelected((prev) => [...prev, letter])
  }

  const clearSelection = () => {
    if (gameOver) return
    clearsUsed.current += 1
    setSelected([])
  }

  // When input complete
  useEffect(() => {
    if (!currentTrial) return

    if (selected.length === currentTrial.word.length) {
      endTrial(false)
    }
  }, [selected])

  const endTrial = (timedOut) => {
    clearTimeout(timerRef.current)
    setGameOver(true)

    const responseTime = Date.now() - trialStartTime.current
    const answer = selected.join("")
    const correct = answer === currentTrial.word

    // Calculate inter-click intervals
    const intervals = clickTimes.current.map((time, index, arr) =>
      index === 0 ? time - trialStartTime.current : time - arr[index - 1]
    )

    const trialResult = {
      trialNumber: trialIndex + 1,
      level: currentTrial.level,
      word: currentTrial.word,
      wordLength: currentTrial.word.length,
      hint: currentTrial.hint,

      correct,
      timedOut,

      responseTime,
      firstClickLatency: firstClickTime.current
        ? firstClickTime.current - trialStartTime.current
        : null,

      interClickIntervals: intervals,
      totalClicks: clickTimes.current.length,
      clearsUsed: clearsUsed.current,

      timestamp: new Date().toISOString(),
    }

    setSessionData((prev) => [...prev, trialResult])

    // Failure tracking
    if (!correct) {
      setLevelFailures((prev) => prev + 1)
    } else {
      setLevelFailures(0)
    }

    setTimeout(() => {
      proceedToNextTrial(correct)
    }, 1500)
  }

  const proceedToNextTrial = (correct) => {
    const nextTrial = clinicalTrials[trialIndex + 1]

    // Stop rule: 3 failures in same level
    if (levelFailures >= MAX_FAILURES_PER_LEVEL - 1 && !correct) {
      finishAssessment()
      return
    }

    if (!nextTrial) {
      finishAssessment()
      return
    }

    // If next trial is new level, reset failure count
    if (nextTrial.level !== currentTrial.level) {
      setLevelFailures(0)
    }

    setTrialIndex((prev) => prev + 1)
  }

  const finishAssessment = () => {
    localStorage.setItem(
      "clinicalScrambleSession",
      JSON.stringify(sessionData, null, 2)
    )
    setGameOver(true)
    alert("ارزیابی به پایان رسید")
  }

  if (!currentTrial) return <div>پایان آزمون</div>

  const progressWidth = (timeLeft / TRIAL_TIME) * 100

  return (
    <div
      style={{
        direction: "rtl",
        textAlign: "center",
        padding: "40px",
        fontFamily: "sans-serif",
      }}
    >
      <h2>آزمون بازسازی کلمه</h2>
      <p>مرحله {currentTrial.level}</p>
      <p><b>{currentTrial.hint}</b></p>

      {/* Answer Boxes */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        {currentTrial.word.split("").map((_, i) => (
          <div
            key={i}
            style={{
              width: 60,
              height: 80,
              border: "2px solid #ccc",
              fontSize: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f5f5f5",
            }}
          >
            {selected[i] || ""}
          </div>
        ))}

        <button
          onClick={clearSelection}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Timer Bar */}
      <div
        style={{
          marginTop: 20,
          height: 10,
          background: "#ddd",
          width: "100%",
          maxWidth: 400,
          marginInline: "auto",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressWidth}%`,
            background: "orange",
            transition: "width 1s linear",
          }}
        />
      </div>

      {/* Letter Circle */}
      <div
        style={{
          marginTop: 40,
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: "2px solid #999",
          marginInline: "auto",
          position: "relative",
        }}
      >
        {shuffled.map((letter, index) => {
          const angle = (index / shuffled.length) * 2 * Math.PI
          const radius = 100
          const x = 150 + radius * Math.cos(angle)
          const y = 150 + radius * Math.sin(angle)

          return (
            <div
              key={index}
              onClick={() => handleLetterClick(letter)}
              style={{
                position: "absolute",
                left: x - 30,
                top: y - 30,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#f0e6d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                cursor: "pointer",
                border: "2px solid #aaa",
              }}
            >
              {letter}
            </div>
          )
        })}
      </div>
    </div>
  )
}