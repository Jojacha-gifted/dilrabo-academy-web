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
  startTime: part.startTime ?? 0,
  endTime: part.endTime ?? null,
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

function getAnsweredInPart(part, answers) {
  return part.questions.filter((question) => isAnswered(answers[getQuestionKey(part, question)])).length
}

function isPartAnswered(part, answers) {
  return part.questions.length > 0 && getAnsweredInPart(part, answers) === part.questions.length
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

function getQuestionRangeLabel(part) {
  const firstQuestion = part.questions[0]
  const lastQuestion = part.questions.at(-1)

  if (!firstQuestion || !lastQuestion) return 'Questions pending'
  return `Questions ${firstQuestion.id}-${lastQuestion.id}`
}

function IeltsListeningAssessment() {
  const [isOpen, setIsOpen] = useState(false)
  const [partIndex, setPartIndex] = useState(0)
  const [answers, setAnswers] = useState(() => createInitialAnswers())
  const [isComplete, setIsComplete] = useState(false)
  const activePart = listeningParts[partIndex] ?? null
  const isCurrentPartComplete = activePart ? isPartAnswered(activePart, answers) : false
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

  function updateAnswer(part, renderedPartIndex, question, value) {
    setAnswers((currentAnswers) => {
      const nextAnswers = {
        ...currentAnswers,
        [getQuestionKey(part, question)]: value,
      }

      const isFinalPart = renderedPartIndex === TOTAL_PARTS - 1
      if (isFinalPart && isPartAnswered(part, nextAnswers)) {
        window.setTimeout(() => setIsComplete(true), 250)
      }

      return nextAnswers
    })
  }

  function goToNextPart() {
    if (!isCurrentPartComplete) return

    if (partIndex < TOTAL_PARTS - 1) {
      setPartIndex((currentIndex) => currentIndex + 1)
      return
    }

    setIsComplete(true)
  }

  function renderQuestionInput(part, renderedPartIndex, question) {
    const questionKey = getQuestionKey(part, question)
    const selectedAnswer = answers[questionKey] ?? ''

    if (question.type === 'multiple-choice' && Array.isArray(question.options)) {
      return (
        <div className="ielts-assessment__options">
          {question.options.map((option) => (
            <button
              className={selectedAnswer === option ? 'is-selected' : ''}
              type="button"
              key={option}
              onClick={() => updateAnswer(part, renderedPartIndex, question, option)}
            >
              {option}
            </button>
          ))}
        </div>
      )
    }

    return (
      <label className="ielts-assessment__text-answer">
        <span>{question.type ?? 'answer'}</span>
        <input
          type="text"
          value={selectedAnswer}
          onChange={(event) => updateAnswer(part, renderedPartIndex, question, event.target.value)}
          placeholder="Type your answer"
        />
      </label>
    )
  }

  if (!isOpen) return null

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
            {listeningParts.map((part, renderedPartIndex) => {
              const answeredInPart = getAnsweredInPart(part, answers)
              const isActive = renderedPartIndex === partIndex

              return (
                <section className="ielts-assessment__part-card" key={part.id} hidden={!isActive}>
                  <div className="ielts-assessment__part-heading">
                    <div>
                      <span>{getQuestionRangeLabel(part)}</span>
                      <h3>{part.label}</h3>
                    </div>
                    <strong>{answeredInPart}/{part.questions.length} answered</strong>
                  </div>

                  {isActive ? (
                    <AudioPlayer
                      src={part.audioUrl}
                      title={part.audioTitle}
                      startTime={part.startTime}
                      endTime={part.endTime}
                      onError={() => console.error(`IELTS Listening audio failed to load for ${part.label}: ${part.audioUrl}`)}
                    />
                  ) : null}

                  <div className="ielts-assessment__questions">
                    {part.questions.map((question) => (
                      <article className="ielts-assessment__question" key={question.id}>
                        <p><strong>Q{question.id}.</strong> {question.text}</p>
                        {renderQuestionInput(part, renderedPartIndex, question)}
                      </article>
                    ))}
                  </div>
                </section>
              )
            })}
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
          <span>{isComplete ? 'IELTS preparation pathway' : `Part ${Math.min(partIndex + 1, TOTAL_PARTS)} of ${TOTAL_PARTS}`}</span>
          <div>
            <button type="button" onClick={resetAssessment}>Reset</button>
            {!isComplete ? (
              <button type="button" onClick={goToNextPart} disabled={!isCurrentPartComplete}>
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