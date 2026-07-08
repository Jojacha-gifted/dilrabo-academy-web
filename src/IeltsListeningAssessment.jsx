import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import AudioPlayer from './components/AudioPlayer.jsx'
import { ieltsTest1 } from './ieltsTestData'
import './IeltsListeningAssessment.css'

const MODULE_TITLE = 'IELTS Listening Assessment'
const MODULE_KICKER = 'Cambridge IELTS 21 Diagnostics'
const NEXT_MODULES = ['Reading', 'Writing', 'Speaking']

const listeningParts = ieltsTest1.map((part, index) => ({
  id: `part-${part.part ?? index + 1}`,
  partNumber: part.part ?? index + 1,
  label: part.label ?? `Listening Part ${part.part ?? index + 1}`,
  audioUrl: part.audioUrl,
  audioTitle: part.audioTitle ?? `Cambridge IELTS 21 - Test 1 Listening Part ${part.part ?? index + 1}`,
  questions: Array.isArray(part.questions) ? part.questions : [],
}))

const TOTAL_PARTS = listeningParts.length
const TOTAL_QUESTIONS = listeningParts.reduce((total, part) => total + part.questions.length, 0)

function getQuestionKey(part, question) {
  return `${part.id}-${question.id}`
}

function createInitialAnswers() {
  return listeningParts.reduce((answers, part) => {
    part.questions.forEach((question) => {
      answers[getQuestionKey(part, question)] = ''
    })

    return answers
  }, {})
}

function normalizeAnswer(value) {
  return String(value ?? '').trim().toLowerCase()
}

function isAnswered(value) {
  return normalizeAnswer(value).length > 0
}

function countAnswered(answers) {
  return Object.values(answers).filter(isAnswered).length
}

function scoreAnswers(answers) {
  return listeningParts.reduce((score, part) => {
    return score + part.questions.reduce((partScore, question) => {
      if (question.answer === undefined || question.answer === null) return partScore

      const studentAnswer = answers[getQuestionKey(part, question)]
      if (!isAnswered(studentAnswer)) return partScore

      const expectedAnswer = Array.isArray(question.answer) ? question.answer : [question.answer]
      const isCorrect = expectedAnswer.some((answer) => normalizeAnswer(answer) === normalizeAnswer(studentAnswer))
      return partScore + Number(isCorrect)
    }, 0)
  }, 0)
}

function IeltsListeningAssessment() {
  const [isOpen, setIsOpen] = useState(false)
  const [partIndex, setPartIndex] = useState(0)
  const [answers, setAnswers] = useState(() => createInitialAnswers())
  const [isComplete, setIsComplete] = useState(false)
  const activePart = listeningParts[partIndex] ?? listeningParts[0]
  const answeredInPart = activePart.questions.filter((question) => isAnswered(answers[getQuestionKey(activePart, question)])).length
  const isPartComplete = activePart.questions.length > 0 && answeredInPart === activePart.questions.length
  const answeredTotal = useMemo(() => countAnswered(answers), [answers])
  const score = useMemo(() => scoreAnswers(answers), [answers])
  const progressPercent = TOTAL_QUESTIONS ? Math.round((answeredTotal / TOTAL_QUESTIONS) * 100) : 0

  const resetAssessment = useCallback(() => {
    setPartIndex(0)
    setAnswers(createInitialAnswers())
    setIsComplete(false)
  }, [])

  useEffect(() => {
    window.IeltsListeningAssessment = {
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      reset: resetAssessment,
    }

    return () => {
      delete window.IeltsListeningAssessment
    }
  }, [resetAssessment])

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function closeAssessment() {
    setIsOpen(false)
  }

  function updateAnswer(part, question, value) {
    setAnswers((currentAnswers) => {
      const nextAnswers = {
        ...currentAnswers,
        [getQuestionKey(part, question)]: value,
      }

      const isFinalPart = partIndex === TOTAL_PARTS - 1
      const nextPartComplete = part.questions.every((partQuestion) => isAnswered(nextAnswers[getQuestionKey(part, partQuestion)]))

      if (isFinalPart && nextPartComplete) {
        window.setTimeout(() => setIsComplete(true), 250)
      }

      return nextAnswers
    })
  }

  function goToNextPart() {
    if (!isPartComplete) return

    if (partIndex < TOTAL_PARTS - 1) {
      setPartIndex((currentIndex) => currentIndex + 1)
      return
    }

    setIsComplete(true)
  }

  function renderQuestionInput(question) {
    const questionKey = getQuestionKey(activePart, question)
    const selectedAnswer = answers[questionKey] ?? ''

    if (question.type === 'multiple-choice' && Array.isArray(question.options)) {
      return (
        <div className="ielts-assessment__options">
          {question.options.map((option) => (
            <button
              className={selectedAnswer === option ? 'is-selected' : ''}
              type="button"
              key={option}
              onClick={() => updateAnswer(activePart, question, option)}
            >
              {option}
            </button>
          ))}
        </div>
      )
    }

    return (
      <label className="ielts-assessment__text-answer">
        <span>{question.type}</span>
        <input
          type="text"
          value={selectedAnswer}
          onChange={(event) => updateAnswer(activePart, question, event.target.value)}
          placeholder="Type your answer"
        />
      </label>
    )
  }

  if (!isOpen || !activePart) return null

  return (
    <div className="ielts-assessment" role="dialog" aria-modal="true" aria-labelledby="ielts-assessment-title">
      <button className="ielts-assessment__backdrop" type="button" aria-label="Close IELTS assessment" onClick={closeAssessment} />
      <div className="ielts-assessment__panel">
        <button className="ielts-assessment__close" type="button" aria-label="Close IELTS assessment" onClick={closeAssessment}>
          x
        </button>

        <header className="ielts-assessment__header">
          <span>{MODULE_KICKER}</span>
          <h2 id="ielts-assessment-title">{MODULE_TITLE}</h2>
          <p>
            Complete each listening part in order. The next part unlocks only after every answer in the current part is filled.
          </p>
        </header>

        <div className="ielts-assessment__steps" aria-label="IELTS Listening progress">
          {listeningParts.map((part, index) => (
            <div className="ielts-assessment__step" key={part.id}>
              <span className={index < partIndex || isComplete ? 'is-complete' : index === partIndex ? 'is-active' : ''}>{index + 1}</span>
              <strong>{part.label}</strong>
            </div>
          ))}
        </div>

        <div className="ielts-assessment__progress" aria-hidden="true">
          <div style={{ width: `${progressPercent}%` }} />
        </div>

        {!isComplete ? (
          <div className="ielts-assessment__body">
            <section className="ielts-assessment__part-card">
              <div className="ielts-assessment__part-heading">
                <div>
                  <span>Questions {activePart.questions[0]?.id ?? 1}-{activePart.questions.at(-1)?.id ?? activePart.questions.length}</span>
                  <h3>{activePart.label}</h3>
                </div>
                <strong>{answeredInPart}/{activePart.questions.length} answered</strong>
              </div>

              <AudioPlayer
                src={activePart.audioUrl}
                title={activePart.audioTitle}
                startTime={activePart.startTime ?? 0}
                endTime={activePart.endTime}
                onError={() => console.error(`IELTS Listening audio failed to load for ${activePart.label}: ${activePart.audioUrl}`)}
              />

              <div className="ielts-assessment__questions">
                {activePart.questions.map((question) => (
                  <article className="ielts-assessment__question" key={question.id}>
                    <p><strong>Q{question.id}.</strong> {question.text}</p>
                    {renderQuestionInput(question)}
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <section className="ielts-assessment__complete">
            <span>Listening complete</span>
            <h3>{score}/{TOTAL_QUESTIONS}</h3>
            <p>
              The listening assessment is complete. Continue into the next IELTS preparation modules without leaving this workflow.
            </p>
            <div className="ielts-assessment__module-grid">
              {NEXT_MODULES.map((moduleName) => (
                <article key={moduleName}>
                  <strong>{moduleName}</strong>
                  <p>{moduleName} preparation module ready to connect next.</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="ielts-assessment__footer">
          <span>{isComplete ? 'IELTS preparation pathway' : `Part ${partIndex + 1} of ${TOTAL_PARTS}`}</span>
          <div>
            <button type="button" onClick={resetAssessment}>Reset</button>
            {!isComplete ? (
              <button type="button" onClick={goToNextPart} disabled={!isPartComplete}>
                {partIndex === TOTAL_PARTS - 1 ? 'Finish Now' : 'Next Part'}
              </button>
            ) : (
              <button type="button" onClick={closeAssessment}>Close</button>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('ielts-listening-assessment-root')

if (rootElement) {
  createRoot(rootElement).render(<IeltsListeningAssessment />)
}

export default IeltsListeningAssessment