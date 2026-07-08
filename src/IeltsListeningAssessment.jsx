import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import AudioPlayer from './components/AudioPlayer.jsx'
import assessmentConfig from './data/ieltsListeningAssessment.json'
import './IeltsListeningAssessment.css'

const TOTAL_PARTS = assessmentConfig.parts.length
const TOTAL_QUESTIONS = assessmentConfig.parts.reduce((total, part) => total + part.questions.length, 0)

function createInitialAnswers() {
  return assessmentConfig.parts.reduce((answers, part) => {
    answers[part.id] = Array(part.questions.length).fill(null)
    return answers
  }, {})
}

function countAnswered(answers) {
  return assessmentConfig.parts.reduce(
    (total, part) => total + (answers[part.id] ?? []).filter((answer) => answer !== null && answer !== undefined).length,
    0,
  )
}

function scoreAnswers(answers) {
  return assessmentConfig.parts.reduce((score, part) => {
    return score + part.questions.reduce((partScore, question, index) => {
      return partScore + Number((answers[part.id] ?? [])[index] === question.correct)
    }, 0)
  }, 0)
}

function IeltsListeningAssessment() {
  const [isOpen, setIsOpen] = useState(false)
  const [partIndex, setPartIndex] = useState(0)
  const [answers, setAnswers] = useState(() => createInitialAnswers())
  const [isComplete, setIsComplete] = useState(false)
  const activePart = assessmentConfig.parts[partIndex]
  const activeAnswers = answers[activePart.id] ?? []
  const answeredInPart = activeAnswers.filter((answer) => answer !== null && answer !== undefined).length
  const isPartComplete = answeredInPart === activePart.questions.length
  const answeredTotal = useMemo(() => countAnswered(answers), [answers])
  const score = useMemo(() => scoreAnswers(answers), [answers])
  const progressPercent = Math.round((answeredTotal / TOTAL_QUESTIONS) * 100)

  useEffect(() => {
    window.IeltsListeningAssessment = {
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      reset: resetAssessment,
    }

    return () => {
      delete window.IeltsListeningAssessment
    }
  }, [])

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

  function resetAssessment() {
    setPartIndex(0)
    setAnswers(createInitialAnswers())
    setIsComplete(false)
  }

  function closeAssessment() {
    setIsOpen(false)
  }

  function selectAnswer(questionIndex, optionIndex) {
    setAnswers((currentAnswers) => {
      const nextPartAnswers = [...(currentAnswers[activePart.id] ?? [])]
      nextPartAnswers[questionIndex] = optionIndex

      if (partIndex === TOTAL_PARTS - 1 && nextPartAnswers.every((answer) => answer !== null && answer !== undefined)) {
        window.setTimeout(() => setIsComplete(true), 250)
      }

      return {
        ...currentAnswers,
        [activePart.id]: nextPartAnswers,
      }
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

  if (!isOpen) return null

  return (
    <div className="ielts-assessment" role="dialog" aria-modal="true" aria-labelledby="ielts-assessment-title">
      <button className="ielts-assessment__backdrop" type="button" aria-label="Close IELTS assessment" onClick={closeAssessment} />
      <div className="ielts-assessment__panel">
        <button className="ielts-assessment__close" type="button" aria-label="Close IELTS assessment" onClick={closeAssessment}>
          x
        </button>

        <header className="ielts-assessment__header">
          <span>{assessmentConfig.kicker}</span>
          <h2 id="ielts-assessment-title">{assessmentConfig.title}</h2>
          <p>
            Complete four listening parts. Each part has 10 questions and unlocks the next section only after all answers are selected.
          </p>
        </header>

        <div className="ielts-assessment__steps" aria-label="IELTS Listening progress">
          {assessmentConfig.parts.map((part, index) => (
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
                  <span>{activePart.questionRange}</span>
                  <h3>{activePart.label}</h3>
                </div>
                <strong>{answeredInPart}/{activePart.questions.length} answered</strong>
              </div>

              <AudioPlayer
                src={activePart.audio.url}
                title={activePart.audio.title}
                startTime={activePart.audio.startTime ?? 0}
                endTime={activePart.audio.endTime}
              />

              <div className="ielts-assessment__questions">
                {activePart.questions.map((question, questionIndex) => (
                  <article className="ielts-assessment__question" key={question.id}>
                    <p><strong>Q{question.number}.</strong> {question.prompt}</p>
                    <div className="ielts-assessment__options">
                      {question.options.map((option, optionIndex) => (
                        <button
                          className={activeAnswers[questionIndex] === optionIndex ? 'is-selected' : ''}
                          type="button"
                          key={option}
                          onClick={() => selectAnswer(questionIndex, optionIndex)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
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
              {assessmentConfig.nextModules.map((moduleName) => (
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