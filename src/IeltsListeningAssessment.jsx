import { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import IeltsExamContainer from './IeltsExamContainer.jsx'
import './IeltsListeningAssessment.css'

function IeltsListeningAssessment() {
  const [isOpen, setIsOpen] = useState(false)

  const closeAssessment = useCallback(() => {
    setIsOpen(false)
  }, [])

  useEffect(() => {
    window.IeltsListeningAssessment = {
      open: () => setIsOpen(true),
      close: closeAssessment,
    }

    return () => {
      delete window.IeltsListeningAssessment
    }
  }, [closeAssessment])

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeAssessment()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeAssessment])

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
          <p>Complete all four listening parts in sequence. Your answers stay saved as you move through the exam.</p>
        </header>

        <IeltsExamContainer onClose={closeAssessment} />
      </div>
    </div>
  )
}

const rootElement = document.getElementById('ielts-listening-assessment-root')

if (rootElement) {
  createRoot(rootElement).render(<IeltsListeningAssessment />)
}

export default IeltsListeningAssessment