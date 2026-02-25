'use client'

import { useState } from 'react'
import questionsData from './questions.json'

export default function Questionnaire() {
  // Questions imported from JSON
  const questions = questionsData

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: any }>({})
  const [input, setInput] = useState('')

  const currentQuestion = questions[currentIndex]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentQuestion) return

    // Save answer
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: input
    }))

    setInput('')

    // Next question or finish
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      console.log('All answers:', { ...answers, [currentQuestion.id]: input })
      alert('پرسشنامه تمام شد!')
    }
  }

  // Finished
  if (!currentQuestion) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md text-right">
        <h2 className="text-lg font-bold mb-4">پرسشنامه کامل شد!</h2>
        <pre className="text-sm">{JSON.stringify(answers, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div className="w-180 h-180 m-auto bg-white p-6 rounded-xl pt-50 shadow-md text-right">

      <div>
        <div>
          <h2 className="text-lg font-bold mb-4">{currentQuestion.question}</h2>

    
        <form onSubmit={handleSubmit} className="space-y-4">
        {currentQuestion.type === 'text' || currentQuestion.type === 'number' ? (
          <input
            type={currentQuestion.type}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
        ) : currentQuestion.type === 'choice' && currentQuestion.options ? (
          <div className="flex flex-col gap-2">
            {currentQuestion.options.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={opt}
                  checked={input === opt}
                  onChange={(e) => setInput(e.target.value)}
                  required
                />
                {opt}
              </label>
            ))}
          </div>
        ) : null}

        <button className="w-full bg-black text-white py-2 rounded-lg">
          ثبت و سوال بعدی
        </button>
      </form>
        </div>
      
    </div>
      
    </div>
  )
}
