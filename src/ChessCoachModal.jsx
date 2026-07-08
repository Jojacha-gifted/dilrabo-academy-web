import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import avatarImg from './assets/avatar.jpg'
import './ChessCoachModal.css'

const MOVE_DELAY_MS = 500
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
}
const DEVELOPMENT_SQUARES = new Set(['c3', 'd3', 'e3', 'f3', 'c6', 'd6', 'e6', 'f6', 'd4', 'e4', 'd5', 'e5'])

function createGame() {
  return new Chess()
}

function evaluateForBlack(game) {
  const board = game.board()
  let score = 0

  board.forEach((row) => {
    row.forEach((piece) => {
      if (!piece) return
      const value = PIECE_VALUES[piece.type] ?? 0
      score += piece.color === 'b' ? value : -value
    })
  })

  if (game.isCheckmate()) {
    score += game.turn() === 'w' ? 100000 : -100000
  } else if (game.inCheck()) {
    score += game.turn() === 'w' ? 35 : -35
  }

  return score
}

function scoreCoachMove(game, move) {
  const candidate = new Chess(game.fen())
  candidate.move(move)
  let score = evaluateForBlack(candidate)

  if (move.captured) score += (PIECE_VALUES[move.captured] ?? 0) * 0.35
  if (move.promotion) score += 160
  if (DEVELOPMENT_SQUARES.has(move.to)) score += 14
  if (move.san.includes('+')) score += 22
  if (move.san.includes('#')) score += 100000

  score += Math.random() * 28
  return score
}

function chooseCoachMove(game) {
  const moves = game.moves({ verbose: true })
  if (!moves.length) return null

  const rankedMoves = moves
    .map((move) => ({ move, score: scoreCoachMove(game, move) }))
    .sort((a, b) => b.score - a.score)

  const roll = Math.random()
  if (roll < 0.64) return rankedMoves[Math.floor(Math.random() * Math.min(3, rankedMoves.length))].move
  if (roll < 0.9) return rankedMoves[Math.floor(Math.random() * Math.min(7, rankedMoves.length))].move
  return moves[Math.floor(Math.random() * moves.length)]
}

function getGameStatus(game, isThinking) {
  if (isThinking) return 'Coach Dilrabo is studying the position...'
  if (game.isCheckmate()) return game.turn() === 'w' ? 'Checkmate. Coach Dilrabo wins this round.' : 'Checkmate. Excellent work, you won.'
  if (game.isDraw()) return 'Draw. Strong resistance from both sides.'
  if (game.inCheck()) return game.turn() === 'w' ? 'You are in check. Find a calm response.' : 'Coach Dilrabo is in check.'
  return game.turn() === 'w' ? 'Your move. Look for checks, captures, and threats.' : 'Coach Dilrabo is ready to respond.'
}

function CoachChessModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [game, setGame] = useState(() => createGame())
  const [isThinking, setIsThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [coachNote, setCoachNote] = useState('I will challenge you, but I will not play perfectly. Use every move as practice.')

  useEffect(() => {
    window.CoachChessModal = {
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      reset: () => resetGame(),
    }

    return () => {
      delete window.CoachChessModal
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

  function resetGame() {
    setGame(createGame())
    setIsThinking(false)
    setLastMove(null)
    setCoachNote('Fresh board. Control the center and develop your pieces with purpose.')
  }

  function makeCoachMove(currentGame) {
    window.setTimeout(() => {
      const coachMove = chooseCoachMove(currentGame)
      if (!coachMove) {
        setIsThinking(false)
        return
      }

      const updatedGame = new Chess(currentGame.fen())
      updatedGame.move(coachMove)
      setGame(updatedGame)
      setLastMove({ from: coachMove.from, to: coachMove.to })
      setCoachNote(coachMove.captured
        ? `Coach Dilrabo captured on ${coachMove.to}. What changed in the position?`
        : `Coach Dilrabo played ${coachMove.san}. Notice the new pressure before moving.`)
      setIsThinking(false)
    }, MOVE_DELAY_MS)
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    if (!targetSquare || isThinking || game.isGameOver() || game.turn() !== 'w') return false

    const movingPiece = game.get(sourceSquare)
    if (!movingPiece || movingPiece.color !== 'w') return false

    const nextGame = new Chess(game.fen())
    const move = nextGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    })

    if (!move) return false

    setGame(nextGame)
    setLastMove({ from: move.from, to: move.to })
    setCoachNote(move.captured
      ? `Good capture on ${move.to}. Now check whether the piece is defended.`
      : 'Good. Now anticipate the coach response before it happens.')

    if (!nextGame.isGameOver()) {
      setIsThinking(true)
      makeCoachMove(nextGame)
    }

    return true
  }

  const status = getGameStatus(game, isThinking)
  const squareStyles = useMemo(() => {
    if (!lastMove) return {}
    return {
      [lastMove.from]: { background: 'rgba(213, 182, 122, 0.42)' },
      [lastMove.to]: { background: 'rgba(162, 62, 72, 0.26)' },
    }
  }, [lastMove])

  if (!isOpen) return null

  return (
    <div className="coach-modal" role="dialog" aria-modal="true" aria-labelledby="coach-modal-title">
      <button className="coach-modal__backdrop" type="button" aria-label="Close coach chess modal" onClick={() => setIsOpen(false)} />
      <div className="coach-modal__panel">
        <header className="coach-modal__header">
          <img className="coach-modal__avatar" src={avatarImg} alt="Coach Dilrabo" />
          <div>
            <span className="coach-modal__eyebrow">Personal chess coach</span>
            <h2 id="coach-modal-title">Play Against Coach Dilrabo</h2>
            <p>Practice against a thoughtful opponent with a human-paced response.</p>
          </div>
          <button className="coach-modal__close" type="button" aria-label="Close coach chess modal" onClick={() => setIsOpen(false)}>
            x
          </button>
        </header>

        <div className="coach-modal__content">
          <div className="coach-modal__board-wrap">
            <Chessboard
              options={{
                position: game.fen(),
                boardOrientation: 'white',
                allowDragging: !isThinking && !game.isGameOver() && game.turn() === 'w',
                canDragPiece: ({ square }) => square ? game.get(square)?.color === 'w' : false,
                onPieceDrop,
                squareStyles,
                lightSquareStyle: { backgroundColor: '#f6f0e8' },
                darkSquareStyle: { backgroundColor: '#1e2a44' },
                showAnimations: true,
              }}
            />
          </div>

          <aside className="coach-modal__sidebar">
            <div className="coach-modal__status">
              <span>Status</span>
              <strong>{status}</strong>
            </div>
            <div className="coach-modal__note">
              <span>Coach note</span>
              <p>{coachNote}</p>
            </div>
            <div className="coach-modal__settings">
              <span>Difficulty</span>
              <strong>Student Challenge</strong>
              <p>Strong material awareness with occasional human mistakes.</p>
            </div>
            <div className="coach-modal__actions">
              <button type="button" onClick={resetGame}>New game</button>
              <button type="button" onClick={() => setIsOpen(false)}>Close</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('coach-chess-root')

if (rootElement) {
  createRoot(rootElement).render(<CoachChessModal />)
}
export default CoachChessModal
