'use client'

import { useState, useEffect } from 'react'
import wordPairsData from './words.json'

type Phase = 'show' | 'quiz' | 'roundDone' | 'done'

const TOTAL_ROUNDS = 3

export default function WordPairsGame() {
  const [phase, setPhase] = useState<Phase>('show')
  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')

  const displayPairs = wordPairsData.slice(0, 6)

  // ======================
  // SHOW PHASE
  // ======================
  useEffect(() => {
    if (phase === 'show' && currentPairIndex < displayPairs.length) {
      const timer = setTimeout(() => {
        const nextIndex = currentPairIndex + 1
        setCurrentPairIndex(nextIndex)

        if (nextIndex === displayPairs.length) {
          setPhase('quiz')
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [currentPairIndex, phase, displayPairs.length])

  // ======================
  // HANDLE ANSWER
  // ======================
  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)

    if (answer === displayPairs[quizIndex].pair[1]) {
      setScore((prev) => prev + 1)
    }

    setTimeout(() => {
      if (quizIndex + 1 < displayPairs.length) {
        setQuizIndex((prev) => prev + 1)
        setSelectedAnswer('')
      } else {
        setPhase('roundDone')
      }
    }, 500)
  }

  // ======================
  // START NEXT ROUND
  // ======================
  const startNextRound = () => {
    const newTotal = totalScore + score
    setTotalScore(newTotal)

    if (round < TOTAL_ROUNDS) {
      setRound((prev) => prev + 1)
      setScore(0)
      setQuizIndex(0)
      setCurrentPairIndex(0)
      setSelectedAnswer('')
      setPhase('show')
    } else {
      setPhase('done')
    }
  }

  // ======================
  // SHOW PHASE
  // ======================
  if (phase === 'show') {
    if (currentPairIndex >= displayPairs.length) return null

    const pair = displayPairs[currentPairIndex].pair

    return (
      <main className="min-h-screen bg-[#f7fcff] flex flex-col items-center justify-center text-center text-right p-8">
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="mb-4 text-gray-500">دور {round} از {TOTAL_ROUNDS}</h2>
          <h1 className="text-2xl mb-4">{pair[0]}</h1>
          <h1 className="text-2xl mb-4">{pair[1]}</h1>
        </div>
        <p className="mt-6 text-gray-500">در حال نمایش جفت‌ها…</p>
      </main>
    )
  }

  // ======================
  // QUIZ PHASE
  // ======================
  if (phase === 'quiz') {
    const currentPair = displayPairs[quizIndex]
    const shuffledOptions = [...currentPair.options].sort(
      () => Math.random() - 0.5
    )

    return (
      <main className="min-h-screen bg-[#f7fcff] flex flex-col items-center text-right p-8">
        <h2 className="mb-4 text-gray-500">دور {round} از {TOTAL_ROUNDS}</h2>

        <h1 className="text-2xl mb-8">
          کلمه: {currentPair.pair[0]}
        </h1>

        <div className="grid grid-cols-4 gap-4 max-w-2xl">
          {shuffledOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className={`border p-4 rounded transition ${
                selectedAnswer === opt
                  ? opt === currentPair.pair[1]
                    ? 'bg-green-200'
                    : 'bg-red-200'
                  : 'hover:bg-gray-100'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <p className="mt-6">
          سوال {quizIndex + 1} از {displayPairs.length}
        </p>

        <p className="mt-2">
          امتیاز این دور: {score}
        </p>
      </main>
    )
  }

  // ======================
  // ROUND DONE
  // ======================
  if (phase === 'roundDone') {
    return (
      <main className="min-h-screen bg-[#f7fcff] flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-2xl font-bold mb-4">
          پایان دور {round}
        </h1>

        <p className="mb-6">
          امتیاز این دور: {score} از {displayPairs.length}
        </p>

        <button
          onClick={startNextRound}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
        >
          {round < TOTAL_ROUNDS ? 'شروع دور بعد' : 'مشاهده نتیجه نهایی'}
        </button>
      </main>
    )
  }

  // ======================
  // FINAL DONE
  // ======================
  return (
    <main className="min-h-screen bg-[#f7fcff] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold mb-6">پایان بازی!</h1>

      <p className="text-xl mb-4">
        مجموع امتیاز شما: {totalScore} از {displayPairs.length * TOTAL_ROUNDS}
      </p>

      <p>
        عملکرد در {TOTAL_ROUNDS} دور تکمیل شد.
      </p>
    </main>
  )
}