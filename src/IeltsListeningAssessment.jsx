import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { part1Data } from './ieltsTestData.js'
import './IeltsListeningAssessment.css'

function getPartOneQuestions() {
  return (part1Data.sections ?? []).flatMap((section) => section.questions ?? [])
}

const PART_ONE_QUESTION_COUNT = getPartOneQuestions().length

function createPartOneAnswers() {
  return getPartOneQuestions().reduce((answers, question) => {
    answers[question.id] = ''
    return answers
  }, {})
}

function countAnswered(answers) {
  return Object.values(answers).filter((answer) => answer.trim().length > 0).length
}

export function ListeningPart1({ onSubmit }) {
  const sections = useMemo(() => part1Data.sections ?? [], [])
  const audioUrls = useMemo(() => (part1Data.audioUrls?.length ? part1Data.audioUrls : [part1Data.audioUrl]).filter(Boolean), [])
  const [answers, setAnswers] = useState(() => createPartOneAnswers())
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0)
  const audioRef = useRef(null)
  const answeredCount = countAnswered(answers)
  const isComplete = answeredCount === PART_ONE_QUESTION_COUNT
  const currentAudioUrl = audioUrls[currentAudioIndex] ?? ''

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentAudioUrl) return

    audio.load()
    audio.play().catch(() => {
      console.info('Browser blocked automatic IELTS audio playback until the user interacts with the player.')
    })
  }, [currentAudioUrl])

  function updateAnswer(questionId, value) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }))
  }

  function submitPartOne(event) {
    event.preventDefault()
    if (!isComplete) return

    console.log('IELTS Listening Part 1 answers:', answers)
    onSubmit?.(answers)
  }

  return (
    <form className="listening-part-one" onSubmit={submitPartOne}>
      <div className="listening-part-one__topline">
        <h3>Listening Part 1</h3>
        <strong>{answeredCount}/{PART_ONE_QUESTION_COUNT} answered</strong>
      </div>

      <div className="listening-part-one__audio">
        <div className="listening-part-one__audio-meta">
          <span>Part 1 audio</span>
          <strong>{part1Data.title ?? 'Listening Part 1 Audio'} - Segment {currentAudioIndex + 1} of {audioUrls.length}</strong>
        </div>
        {console.log('Audio URL:', currentAudioUrl)}
        <audio
          ref={audioRef}
          src={currentAudioUrl}
          controls
          autoPlay
          crossOrigin="anonymous"
          preload="metadata"
          onEnded={() => {
            if (currentAudioIndex < audioUrls.length - 1) {
              setCurrentAudioIndex((index) => index + 1)
            }
          }}
          onError={(e) => console.error('Audio Error:', e.target.error)}
        >
          Your browser does not support the audio element.
        </audio>
        <div className="listening-part-one__audio-actions" aria-label="Listening Part 1 audio segments">
          {audioUrls.map((audioUrl, index) => (
            <button
              className={index === currentAudioIndex ? 'is-active' : ''}
              type="button"
              key={audioUrl}
              onClick={() => setCurrentAudioIndex(index)}
            >
              Segment {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="listening-part-one__sections">
        {sections.map((section) => (
          <section className="listening-part-one__section" key={section.id}>
            <div className="listening-part-one__instructions">
              {(section.instructions ?? []).map((instruction) => (
                <p key={instruction}>{instruction}</p>
              ))}
            </div>

            <div className="listening-part-one__questions">
              {(section.questions ?? []).map((question) => (
                <label className="listening-part-one__question" key={question.id}>
                  <span>Q{question.id}</span>
                  <p>{question.text}</p>
                  <input
                    type="text"
                    value={answers[question.id] ?? ''}
                    onChange={(event) => updateAnswer(question.id, event.target.value)}
                    placeholder="Type your answer"
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="listening-part-one__actions">
        <button type="submit" disabled={!isComplete}>Submit Part 1</button>
      </div>
    </form>
  )
}

function IeltsListeningAssessment() {
  const [isOpen, setIsOpen] = useState(false)
  const [partOneResult, setPartOneResult] = useState(null)

  const resetAssessment = useCallback(() => {
    setPartOneResult(null)
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

  if (!isOpen) return null

  return (
    <div className="ielts-assessment" role="dialog" aria-modal="true" aria-labelledby="ielts-assessment-title">
      <button className="ielts-assessment__backdrop" type="button" aria-label="Close IELTS assessment" onClick={closeAssessment} />
      <div className="ielts-assessment__panel">
        <button className="ielts-assessment__close" type="button" aria-label="Close IELTS assessment" onClick={closeAssessment}>
          x
        </button>

        <header className="ielts-assessment__header">
          <span>Cambridge IELTS 21 Diagnostics</span>
          <h2 id="ielts-assessment-title">IELTS Listening Assessment</h2>
          <p>Complete Listening Part 1. The submit button unlocks only after all ten answers are filled.</p>
        </header>

        {partOneResult ? (
          <section className="ielts-assessment__complete">
            <span>Part 1 submitted</span>
            <h3>10/10</h3>
            <p>Your Part 1 responses have been saved in React state and logged to the console.</p>
            <div className="ielts-assessment__footer">
              <span>Listening Part 1</span>
              <div>
                <button type="button" onClick={resetAssessment}>Retake Part 1</button>
                <button type="button" onClick={closeAssessment}>Close</button>
              </div>
            </div>
          </section>
        ) : (
          <ListeningPart1 onSubmit={setPartOneResult} />
        )}
      </div>
    </div>
  )
}

const rootElement = document.getElementById('ielts-listening-assessment-root')

if (rootElement) {
  createRoot(rootElement).render(<IeltsListeningAssessment />)
}

export default IeltsListeningAssessment