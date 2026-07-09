import { useEffect, useMemo, useRef, useState } from 'react'
import { ieltsExamParts } from './ieltsTestData.js'
import ResultScreen from './ResultScreen.jsx'
import { calculateCorrectCount, calculateListeningBand, getBandDescription, normalizeAnswer } from './ieltsScoring.js'

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

function getTotalQuestionCount(parts) {
  return parts.reduce((total, part) => total + getPartQuestions(part).length, 0)
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

function getChoiceLabel(option) {
  if (typeof option === 'object' && option !== null) return option.label ?? option.text ?? option.value ?? ''
  return String(option ?? '')
}

function getChoiceValue(option) {
  if (typeof option === 'object' && option !== null) return String(option.value ?? option.letter ?? option.label ?? option.text ?? '')

  const label = getChoiceLabel(option)
  const letterMatch = label.match(/^([A-Z])(?:[\s.)\-:]+|$)/i)
  return letterMatch ? letterMatch[1].toUpperCase() : label
}

function isSectionChoiceQuestion(question, section) {
  return getQuestionChoices(question, section).length > 0 && !Array.isArray(question.options)
}

function parseNoteChoices(note) {
  if (!note) return []

  return [...String(note).matchAll(/([A-Z])\s*:\s*([^,]+)/g)].map((match) => `${match[1]}. ${match[2].trim()}`)
}

function getSectionChoices(section) {
  if (Array.isArray(section.box)) return section.box
  if (Array.isArray(section.options)) return section.options
  return parseNoteChoices(section.note)
}

function shouldUseSectionChoices(question, section) {
  const sectionText = [...(section.instructions ?? []), section.note ?? ''].join(' ')
  return question.type === 'checkbox' || /choose|write the correct letter/i.test(sectionText)
}

function getQuestionChoices(question, section) {
  if (Array.isArray(question.options)) return question.options

  const sectionChoices = getSectionChoices(section)
  if (sectionChoices.length > 0 && shouldUseSectionChoices(question, section)) return sectionChoices

  return []
}

function SectionReference({ section }) {
  const choices = getSectionChoices(section)
  if (!choices.length) return null

  const title = section.box ? 'Opinion box' : 'Answer choices'

  return (
    <div className="listening-part-one__reference">
      <strong>{title}</strong>
      <ul>
        {choices.map((choice) => (
          <li key={getChoiceLabel(choice)}>{getChoiceLabel(choice)}</li>
        ))}
      </ul>
    </div>
  )
}

function QuestionInput({ part, section, question, value, onChange }) {
  const choices = getQuestionChoices(question, section)
  const usesSectionChoices = isSectionChoiceQuestion(question, section)

  if (usesSectionChoices && question.type !== 'checkbox') {
    return (
      <select
        aria-label={`Question ${question.id} answer`}
        className="listening-part-one__select"
        value={value ?? ''}
        onChange={(event) => onChange(question.id, event.target.value)}
      >
        <option value="">Choose a letter</option>
        {choices.map((choice) => {
          const choiceValue = getChoiceValue(choice)
          const choiceLabel = getChoiceLabel(choice)

          return (
            <option value={choiceValue} key={choiceLabel}>
              {choiceValue}
            </option>
          )
        })}
      </select>
    )
  }

  if (choices.length > 0) {
    const optionsClassName = usesSectionChoices
      ? 'ielts-assessment__options ielts-assessment__options--letters'
      : 'ielts-assessment__options'

    return (
      <div className={optionsClassName} role="group" aria-label={`Question ${question.id} options`}>
        {choices.map((choice) => {
          const choiceValue = getChoiceValue(choice)
          const choiceLabel = getChoiceLabel(choice)
          const displayLabel = usesSectionChoices ? choiceValue : choiceLabel
          const isSelected = value === choiceValue || value === choiceLabel

          return (
            <button
              aria-pressed={isSelected}
              className={isSelected ? 'is-selected' : ''}
              type="button"
              key={choiceLabel}
              onClick={() => onChange(question.id, choiceValue)}
            >
              {displayLabel}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <input
      aria-label={`Question ${question.id} answer`}
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
  const totalQuestionCount = useMemo(() => getTotalQuestionCount(examParts), [examParts])
  const [currentPart, setCurrentPart] = useState(() => examParts[0]?.part ?? 1)
  const [userAnswers, setUserAnswers] = useState(() => createInitialAnswers(examParts))
  const [transitionNotice, setTransitionNotice] = useState('')
  const [result, setResult] = useState(null)
  const formRef = useRef(null)
  const currentPartIndex = examParts.findIndex((part) => part.part === currentPart)
  const activePart = currentPartIndex >= 0 ? examParts[currentPartIndex] : null
  const nextPart = currentPartIndex >= 0 ? examParts[currentPartIndex + 1] : null
  const answeredInPart = activePart ? countAnsweredInPart(activePart, userAnswers) : 0
  const activePartQuestionCount = activePart ? getPartQuestions(activePart).length : 0
  const isPartComplete = activePartQuestionCount > 0 && answeredInPart === activePartQuestionCount

  useEffect(() => {
    if (!activePart) return

    formRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [activePart])

  function updateAnswer(questionId, value) {
    setUserAnswers((answers) => ({
      ...answers,
      [questionId]: value,
    }))
  }

  function resetExam() {
    setCurrentPart(examParts[0]?.part ?? 1)
    setUserAnswers(createInitialAnswers(examParts))
    setTransitionNotice('')
    setResult(null)
  }

  function submitExam() {
    const submittedAnswers = { ...userAnswers }
    const correctCount = calculateCorrectCount(submittedAnswers)
    const bandScore = calculateListeningBand(correctCount)
    const bandDescription = getBandDescription(bandScore)

    setTransitionNotice('')
    setResult({ correctCount, bandScore, bandDescription })
  }

  function submitCurrentPart(event) {
    event.preventDefault()
    if (!activePart || !isPartComplete) return

    if (nextPart) {
      setCurrentPart(nextPart.part)
      setTransitionNotice(`Part ${activePart.part} submitted. Part ${nextPart.part} is ready.`)
      return
    }

    submitExam()
  }

  if (result) {
    return (
      <ResultScreen
        correctCount={result.correctCount}
        totalQuestions={totalQuestionCount}
        bandScore={result.bandScore}
        bandDescription={result.bandDescription}
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
            <button type="button" onClick={() => setCurrentPart(examParts[0]?.part ?? 1)}>Back to Part 1</button>
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <form className="listening-part-one" ref={formRef} onSubmit={submitCurrentPart}>
      <div className="listening-part-one__topline">
        <h3>{activePart.title}</h3>
        <strong>Part {currentPartIndex + 1} of {examParts.length} | {answeredInPart}/{activePartQuestionCount} answered</strong>
      </div>

      {transitionNotice ? (
        <div className="listening-part-one__notice" role="status" aria-live="polite">
          {transitionNotice}
        </div>
      ) : null}

      <PartAudioPlayer key={activePart.id} part={activePart} />

      <div className="listening-part-one__sections">
        {activePart.sections.map((section) => (
          <section className="listening-part-one__section" key={section.id}>
            <div className="listening-part-one__instructions">
              {(section.instructions ?? []).map((instruction) => (
                <p key={instruction}>{instruction}</p>
              ))}
            </div>

            <SectionReference section={section} />

            <div className="listening-part-one__questions">
              {(section.questions ?? []).map((question) => {
                const hasChoices = getQuestionChoices(question, section).length > 0
                const usesSectionChoices = isSectionChoiceQuestion(question, section)

                return (
                  <div
                    className={`listening-part-one__question${hasChoices ? ' listening-part-one__question--choices' : ''}${usesSectionChoices ? ' listening-part-one__question--letter-choice' : ''}`}
                    key={question.id}
                  >
                    <span>Q{question.id}</span>
                    <p>{question.text}</p>
                    <QuestionInput
                      part={activePart}
                      section={section}
                      question={question}
                      value={userAnswers[question.id]}
                      onChange={updateAnswer}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="listening-part-one__actions">
        <button type="submit" disabled={!isPartComplete}>
          {nextPart ? `Submit Part ${activePart.part} and Continue to Part ${nextPart.part}` : 'Submit Final Part'}
        </button>
      </div>
    </form>
  )
}

export default IeltsExamContainer