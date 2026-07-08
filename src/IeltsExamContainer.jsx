import { useEffect, useMemo, useRef, useState } from 'react'
import { ieltsExamParts } from './ieltsTestData.js'
import ResultScreen from './ResultScreen.jsx'
import { calculateListeningBand, isAnswerCorrect, normalizeAnswer } from './ieltsScoring.js'

const TOTAL_EXAM_PARTS = 4
const TOTAL_EXAM_QUESTIONS = 40

function normalizePart(part, index) {
  if (!part) return null

  return {
    id: `part-${part.part ?? index + 1}`,
    part: part.part ?? index + 1,
    title: part.title ?? `Listening Part ${part.part ?? index + 1}`,
    audioUrls: (part.audioUrls?.length ? part.audioUrls : [part.audioUrl]).filter(Boolean),
    sections: part.sections ?? [],
  }
}

function getExamParts() {
  return ieltsExamParts
    .map((part, index) => normalizePart(part, index))
    .filter(Boolean)
    .sort((a, b) => a.part - b.part)
}

function getPartQuestions(part) {
  return (part?.sections ?? []).flatMap((section) => section.questions ?? [])
}

function createInitialAnswers(parts) {
  return parts.reduce((answers, part) => {
    getPartQuestions(part).forEach((question) => {
      answers[question.id] = ''
    })

    return answers
  }, {})
}

function countAnsweredInPart(part, userAnswers) {
  return getPartQuestions(part).filter((question) => normalizeAnswer(userAnswers[question.id]).length > 0).length
}

function countCorrectAnswers(parts, userAnswers) {
  return parts.reduce((total, part) => {
    return total + getPartQuestions(part).reduce((partTotal, question) => {
      return partTotal + Number(isAnswerCorrect(userAnswers[question.id], question.answer))
    }, 0)
  }, 0)
}

function QuestionInput({ part, question, value, onChange }) {
  if (question.type === 'multiple-choice' && Array.isArray(question.options)) {
    return (
      <div className="ielts-assessment__options">
        {question.options.map((option) => (
          <button
            className={value === option ? 'is-selected' : ''}
            type="button"
            key={option}
            onClick={() => onChange(question.id, option)}
          >
            {option}
          </button>
        ))}
      </div>
    )
  }

  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(event) => onChange(question.id, event.target.value)}
      placeholder={`Part ${part.part} answer`}
    />
  )
}

function PartAudioPlayer({ part }) {
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0)
  const audioRef = useRef(null)
  const currentAudioUrl = part.audioUrls[currentAudioIndex] ?? ''


  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentAudioUrl) return

    console.log('Audio URL:', currentAudioUrl)
    audio.load()
    audio.play().catch(() => {
      console.info('Browser blocked automatic IELTS audio playback until the user interacts with the player.')
    })
  }, [currentAudioUrl])

  if (!currentAudioUrl) {
    return (
      <div className="listening-part-one__audio">
        <div className="listening-part-one__audio-meta">
          <span>Part {part.part} audio</span>
          <strong>No audio URL configured for this part.</strong>
        </div>
      </div>
    )
  }

  return (
    <div className="listening-part-one__audio">
      <div className="listening-part-one__audio-meta">
        <span>Part {part.part} audio</span>
        <strong>{part.title} - Segment {currentAudioIndex + 1} of {part.audioUrls.length}</strong>
      </div>
      <audio
        ref={audioRef}
        src={currentAudioUrl}
        controls
        autoPlay
        crossOrigin="anonymous"
        preload="metadata"
        onEnded={() => {
          if (currentAudioIndex < part.audioUrls.length - 1) {
            setCurrentAudioIndex((index) => index + 1)
          }
        }}
        onError={(event) => console.error('Audio Error:', event.target.error)}
      >
        Your browser does not support the audio element.
      </audio>
      {part.audioUrls.length > 1 ? (
        <div className="listening-part-one__audio-actions" aria-label={`${part.title} audio segments`}>
          {part.audioUrls.map((audioUrl, index) => (
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
      ) : null}
    </div>
  )
}

function IeltsExamContainer({ onClose }) {
  const examParts = useMemo(() => getExamParts(), [])
  const [currentPart, setCurrentPart] = useState(1)
  const [userAnswers, setUserAnswers] = useState(() => createInitialAnswers(examParts))
  const [result, setResult] = useState(null)
  const activePart = examParts.find((part) => part.part === currentPart)
  const answeredInPart = activePart ? countAnsweredInPart(activePart, userAnswers) : 0
  const activePartQuestionCount = activePart ? getPartQuestions(activePart).length : 0
  const isPartComplete = activePartQuestionCount > 0 && answeredInPart === activePartQuestionCount

  function updateAnswer(questionId, value) {
    setUserAnswers((answers) => ({
      ...answers,
      [questionId]: value,
    }))
  }

  function resetExam() {
    setCurrentPart(1)
    setUserAnswers(createInitialAnswers(examParts))
    setResult(null)
  }

  function submitCurrentPart(event) {
    event.preventDefault()
    if (!activePart || !isPartComplete) return

    if (currentPart < TOTAL_EXAM_PARTS) {
      setCurrentPart((part) => part + 1)
      return
    }

    const correctCount = countCorrectAnswers(examParts, userAnswers)
    setResult({
      correctCount,
      bandScore: calculateListeningBand(correctCount),
    })
  }

  if (result) {
    return (
      <ResultScreen
        correctCount={result.correctCount}
        totalQuestions={TOTAL_EXAM_QUESTIONS}
        bandScore={result.bandScore}
        onRestart={resetExam}
        onClose={onClose}
      />
    )
  }

  if (!activePart) {
    return (
      <section className="ielts-assessment__complete">
        <span>Part {currentPart} missing</span>
        <h3>Data needed</h3>
        <p>Export data for Listening Part {currentPart} in ieltsTestData.js to continue the full four-part exam.</p>
        <div className="ielts-assessment__footer">
          <span>IELTS Listening</span>
          <div>
            <button type="button" onClick={() => setCurrentPart(1)}>Back to Part 1</button>
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <form className="listening-part-one" onSubmit={submitCurrentPart}>
      <div className="listening-part-one__topline">
        <h3>{activePart.title}</h3>
        <strong>{answeredInPart}/{activePartQuestionCount} answered</strong>
      </div>

      <PartAudioPlayer key={activePart.id} part={activePart} />

      <div className="listening-part-one__sections">
        {activePart.sections.map((section) => (
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
                  <QuestionInput
                    part={activePart}
                    question={question}
                    value={userAnswers[question.id]}
                    onChange={updateAnswer}
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="listening-part-one__actions">
        <button type="submit" disabled={!isPartComplete}>
          {currentPart < TOTAL_EXAM_PARTS ? `Submit Part ${currentPart} and Continue` : 'Submit Final Part'}
        </button>
      </div>
    </form>
  )
}

export default IeltsExamContainer