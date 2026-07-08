import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DIAGNOSTIC_LENGTH,
  academicIndependencePaths,
  assessmentQuestionBanks,
  assessmentSubjects,
  generateBalancedQuiz,
  getAssessmentLevel,
} from './data/assessmentData.js'
import './ProgramDetailsModal.css'

const subjectKeys = ['english', 'math']

function ProgramDetailsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSubject, setActiveSubject] = useState(null)
  const [questions, setQuestions] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const activeSubjectConfig = activeSubject ? assessmentSubjects[activeSubject] : null

  const closeAssessmentModal = useCallback(() => {
    setActiveSubject(null)
    setQuestions([])
    setQuestionIndex(0)
    setAnswers([])
    setResult(null)
  }, [])

  const closeAllModals = useCallback(() => {
    setIsOpen(false)
    closeAssessmentModal()
  }, [closeAssessmentModal])

  useEffect(() => {
    window.ProgramDetailsModal = {
      open: () => setIsOpen(true),
      close: closeAllModals,
    }

    return () => {
      delete window.ProgramDetailsModal
    }
  }, [closeAllModals])

  useEffect(() => {
    if (!isOpen && !activeSubject) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (activeSubject) {
          closeAssessmentModal()
        } else {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, activeSubject, closeAssessmentModal])

  function startAssessment(subjectKey) {
    const subject = assessmentSubjects[subjectKey]
    const bank = assessmentQuestionBanks[subject.bankKey]
    const quiz = generateBalancedQuiz(bank)

    setQuestions(quiz)
    setAnswers(Array(quiz.length).fill(null))
    setQuestionIndex(0)
    setResult(null)
    setActiveSubject(subjectKey)
    setIsOpen(false)
  }

  function selectAnswer(optionIndex) {
    setAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers]
      nextAnswers[questionIndex] = optionIndex
      return nextAnswers
    })
  }

  function goToPreviousQuestion() {
    setQuestionIndex((currentIndex) => Math.max(currentIndex - 1, 0))
  }

  function goToNextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((currentIndex) => currentIndex + 1)
      return
    }

    submitAssessment()
  }

  function submitAssessment() {
    const correctCount = questions.reduce(
      (total, question, index) => total + Number(answers[index] === question.correct),
      0,
    )

    setResult({
      score: correctCount,
      level: getAssessmentLevel(correctCount),
    })
  }

  const activeQuestion = questions[questionIndex]
  const selectedAnswer = answers[questionIndex]
  const progressPercent = questions.length ? ((questionIndex + 1) / questions.length) * 100 : 0
  const canContinue = selectedAnswer !== null && selectedAnswer !== undefined
  const allQuestionsAnswered = useMemo(
    () => questions.length === DIAGNOSTIC_LENGTH && answers.every((answer) => answer !== null && answer !== undefined),
    [answers, questions.length],
  )

  return (
    <>
      {isOpen ? (
        <div className="program-details-modal" role="dialog" aria-modal="true" aria-labelledby="program-details-modal-title">
          <button className="program-details-modal__backdrop" type="button" aria-label="Close programme details" onClick={() => setIsOpen(false)} />
          <div className="program-details-modal__panel">
            <button className="program-details-modal__close" type="button" aria-label="Close programme details" onClick={() => setIsOpen(false)}>
              x
            </button>

            <div className="program-details-modal__header">
              <span>General English and Mathematics</span>
              <h2 id="program-details-modal-title">Choose your assessment path</h2>
              <p>
                Start with the area you want to measure first. Each diagnostic is designed to give a clear view of readiness and next steps.
              </p>
            </div>

            <div className="program-details-modal__grid">
              {subjectKeys.map((subjectKey) => {
                const choice = assessmentSubjects[subjectKey]

                return (
                  <article className="program-details-modal__card" key={subjectKey}>
                    <span>Interactive pathway</span>
                    <h3>{choice.label}</h3>
                    <p>{choice.description}</p>
                    <button className="program-details-modal__cta" type="button" onClick={() => startAssessment(subjectKey)}>
                      Start Assessment
                    </button>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      {activeSubject && activeSubjectConfig ? (
        <div className="assessment-flow-modal" role="dialog" aria-modal="true" aria-labelledby="assessment-flow-modal-title">
          <button className="assessment-flow-modal__backdrop" type="button" aria-label="Close assessment" onClick={closeAssessmentModal} />
          <div className="assessment-flow-modal__panel">
            <button className="assessment-flow-modal__close" type="button" aria-label="Close assessment" onClick={closeAssessmentModal}>
              x
            </button>

            {!result ? (
              <>
                <div className="assessment-flow-modal__header">
                  <span>{activeSubjectConfig.kicker}</span>
                  <h2 id="assessment-flow-modal-title">{activeSubjectConfig.label}</h2>
                  <p>Question {questionIndex + 1} of {questions.length}</p>
                  <div className="assessment-flow-modal__progressbar" aria-hidden="true">
                    <div style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="assessment-flow-modal__question">
                  <p>{activeQuestion?.prompt}</p>
                  <div className="assessment-flow-modal__options">
                    {activeQuestion?.options.map((option, optionIndex) => (
                      <button
                        className={selectedAnswer === optionIndex ? 'is-selected' : ''}
                        type="button"
                        key={option}
                        onClick={() => selectAnswer(optionIndex)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="assessment-flow-modal__footer">
                  <button type="button" onClick={goToPreviousQuestion} disabled={questionIndex === 0}>
                    Previous
                  </button>
                  <button type="button" onClick={goToNextQuestion} disabled={!canContinue || (questionIndex === questions.length - 1 && !allQuestionsAnswered)}>
                    {questionIndex === questions.length - 1 ? 'Submit Assessment' : 'Next'}
                  </button>
                </div>
              </>
            ) : (
              <div className="assessment-results-view">
                <span>Results</span>
                <h2>{activeSubjectConfig.label} complete</h2>
                <p className="assessment-results-view__score">{result.score}/{DIAGNOSTIC_LENGTH}</p>
                <p className="assessment-results-view__level">Determined Level: {result.level.label}</p>
                <p className="assessment-results-view__note">{result.level.note}</p>

                <section className="academic-independence-results">
                  <span>Academic independence</span>
                  <h3>Study paths your diagnostic can point toward.</h3>
                  <p>
                    These paths help us decide how much structure, modelling, and independent practice a learner needs after the diagnostic.
                  </p>
                  <div className="academic-independence-results__grid">
                    {academicIndependencePaths.map((path) => (
                      <article key={path.title}>
                        <strong>{path.title}</strong>
                        <p>{path.description}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <div className="assessment-flow-modal__footer assessment-flow-modal__footer--results">
                  <button type="button" onClick={() => startAssessment(activeSubject)}>
                    Retake Assessment
                  </button>
                  <button type="button" onClick={closeAssessmentModal}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}

const rootElement = document.getElementById('program-details-root')

if (rootElement) {
  createRoot(rootElement).render(<ProgramDetailsModal />)
}

export default ProgramDetailsModal