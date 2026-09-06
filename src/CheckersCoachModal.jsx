import { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './ChessCoachModal.css'

export default function CheckersCoachModal() {
  const [isOpen, setIsOpen] = useState(false)

  // Attach a method to the window so the HTML button can open this modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.CheckersCoachModal = {
        open: () => setIsOpen(true)
      }
    }
    return () => {
      delete window.CheckersCoachModal
    }
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="coach-modal">
      <button 
        type="button" 
        className="coach-modal__backdrop"
        onClick={() => setIsOpen(false)}
        aria-label="Close checkers coach modal"
      />
      <div className="coach-modal__panel" style={{ maxWidth: '400px', height: 'auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <button 
          type="button" 
          className="coach-modal__close" 
          onClick={() => setIsOpen(false)}
          aria-label="Close"
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
        >
          &times;
        </button>

        <div style={{ fontSize: '3rem', color: '#a23e48', marginBottom: '1rem' }}>
          <i className="fa-solid fa-circle-dot"></i>
        </div>
        <h2>Play Checkers</h2>
        <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
          The Checkers Interface is coming soon!
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
          Stay tuned for competitive checkers coaching against Coach Dilrabo.
        </p>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{
            marginTop: '2rem',
            padding: '0.75rem 2rem',
            borderRadius: '999px',
            backgroundColor: '#1e2a44',
            color: '#fff',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('checkers-coach-root')

if (rootElement) {
  createRoot(rootElement).render(<CheckersCoachModal />)
}
