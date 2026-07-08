import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './ProgramDetailsModal.css'

const assessmentChoices = [
  {
    key: 'english',
    eyebrow: 'Interactive pathway',
    title: 'English confidence',
    description:
      'Launch a 30-question sequence that checks grammar, vocabulary awareness, and reading accuracy through multiple-choice questions.',
    href: './general-english-and-mathematics.html?action=general-assessment&subject=english',
  },
  {
    key: 'math',
    eyebrow: 'Interactive pathway',
    title: 'Mathematics readiness',
    description:
      'Open a 30-question sequence of algebra, geometry, arithmetic, and reasoning prompts to estimate mathematical control and response accuracy.',
    href: './general-english-and-mathematics.html?action=general-assessment&subject=math',
  },
]

function ProgramDetailsModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    window.ProgramDetailsModal = {
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }

    return () => {
      delete window.ProgramDetailsModal
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

  if (!isOpen) return null

  return (
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
          {assessmentChoices.map((choice) => (
            <article className="program-details-modal__card" key={choice.key}>
              <span>{choice.eyebrow}</span>
              <h3>{choice.title}</h3>
              <p>{choice.description}</p>
              <a className="program-details-modal__cta" href={choice.href}>
                Start Assessment
              </a>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('program-details-root')

if (rootElement) {
  createRoot(rootElement).render(<ProgramDetailsModal />)
}

export default ProgramDetailsModal