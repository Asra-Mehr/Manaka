'use client'

import { useState, useEffect } from 'react'

type Phase = 'show' | 'select' | 'done'

const MIN_LEVEL = 2
const MAX_LEVEL = 5
const TOTAL_ROUNDS = 6

function generateRandomSequence(length: number): number[] {
  const digits = [0,1,2,3,4,5,6,7,8,9]

  // Shuffle digits
  const shuffled = digits.sort(() => Math.random() - 0.5)

  // Take first "length" digits (guaranteed unique)
  return shuffled.slice(0, length)
}

export default function NumberSort() {
  const [phase, setPhase] = useState<Phase>('show')
  const [level, setLevel] = useState(MIN_LEVEL)
  const [round, setRound] = useState(1)

  const [sequence, setSequence] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Generate first sequence on client only
  useEffect(() => {
    setIsMounted(true)
    setSequence(generateRandomSequence(MIN_LEVEL))
  }, [])

  // =========================
  // SHOW PHASE
  // =========================
  useEffect(() => {
    if (!isMounted) return

    if (phase === 'show' && currentIndex < sequence.length) {
      const timer = setTimeout(() => {
        if (currentIndex + 1 === sequence.length) {
          setPhase('select')
        } else {
          setCurrentIndex((prev) => prev + 1)
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, phase, sequence.length, isMounted])

  if (!isMounted || sequence.length === 0) return null

  // =========================
  // HANDLE SELECT
  // =========================
  const handleSelect = (num: number) => {
    if (selectedNumbers.length < sequence.length) {
      setSelectedNumbers((prev) => [...prev, num])
    }
  }

  const handleConfirm = () => {
    const correct =
      JSON.stringify(selectedNumbers) === JSON.stringify(sequence)

    // Save silently to localStorage
    const previousData = JSON.parse(
      localStorage.getItem('numberSortResults') || '[]'
    )

    const newEntry = {
      round,
      level,
      sequence,
      answer: selectedNumbers,
      correct,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem(
      'numberSortResults',
      JSON.stringify([...previousData, newEntry])
    )

    nextRound(correct)
  }

  // =========================
  // NEXT ROUND (Adaptive)
  // =========================
  const nextRound = (wasCorrect: boolean) => {
    let newLevel = level

    if (wasCorrect && level < MAX_LEVEL) newLevel++
    if (!wasCorrect && level > MIN_LEVEL) newLevel--

    if (round >= TOTAL_ROUNDS) {
      setPhase('done')
      return
    }

    setRound((prev) => prev + 1)
    setLevel(newLevel)
    setSequence(generateRandomSequence(newLevel))
    setSelectedNumbers([])
    setCurrentIndex(0)
    setPhase('show')
  }

  // =========================
  // SHOW PHASE UI
  // =========================
  if (phase === 'show') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#f7fcff]">
        <h2 className="mb-4">
          دور {round} | سطح {level}
        </h2>

        <div className="bg-white p-10 rounded-xl shadow-md text-4xl font-bold">
          {sequence[currentIndex]}
        </div>
      </main>
    )
  }

  // =========================
  // SELECT PHASE UI
  // =========================
  if (phase === 'select') {
    const cards = [0,1,2,3,4,5,6,7,8,9]

    return (
      <main className="min-h-screen flex flex-col items-center bg-[#f7fcff] p-8">
        <h1 className="text-2xl mb-6">
          اعداد را به ترتیب انتخاب کنید
        </h1>

        <div
        className="flex flex-row gap-4 mb-6 min-h-[50px]"
        
      >
        {selectedNumbers.map((num, index) => (
          <div
            key={index}
            className="w-12 h-12 flex items-center justify-center border rounded text-xl bg-green-200"
          >
            {num}
          </div>
        ))}
      </div>

        <div className="grid grid-cols-5 gap-4 max-w-md">
          {cards.map((num) => (
            <button
              key={num}
              onClick={() => handleSelect(num)}
              className="border p-4 rounded text-xl hover:bg-gray-100"
            >
              {num}
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={selectedNumbers.length !== sequence.length}
          className={`mt-6 px-6 py-2 rounded text-white ${
            selectedNumbers.length === sequence.length
              ? 'bg-black'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          تایید
        </button>
      </main>
    )
  }

  // =========================
  // DONE PHASE
  // =========================
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f7fcff]">
      <h1 className="text-3xl font-bold">
        آزمون به پایان رسید
      </h1>
    </main>
  )
}