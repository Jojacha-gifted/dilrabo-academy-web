import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import avatarImg from './assets/avatar.jpg'
import './ChessCoachModal.css'

const MOVE_DELAY_MS = 500
const SEARCH_DEPTH = 2
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
}
const DEVELOPMENT_SQUARES = new Set(['c3', 'd3', 'e3', 'f3', 'c6', 'd6', 'e6', 'f6', 'd4', 'e4', 'd5', 'e5'])
const CENTER_SQUARES = new Set(['d4', 'e4', 'd5', 'e5'])

function createGame() {
  return new Chess()
}

function getOppositeColor(color) {
  return color === 'w' ? 'b' : 'w'
}

function findKingSquare(game, color) {
  const board = game.board()

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const piece = board[row][col]
      if (piece?.type === 'k' && piece.color === color) {
        return `${String.fromCharCode(97 + col)}${8 - row}`
      }
    }
  }

  return null
}

function getKingSafetyScore(game, color) {
  const kingSquare = findKingSquare(game, color)
  if (!kingSquare) return 0

  const attackers = game.attackers(kingSquare, getOppositeColor(color))
  if (!attackers.length) return 0

  return -260 - attackers.length * 70
}

function evaluateForBlack(game) {
  if (game.isCheckmate()) return game.turn() === 'w' ? 100000 : -100000
  if (game.isDraw()) return 0

  let score = 0
  const board = game.board()

  board.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      if (!piece) return

      const square = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`
      const value = PIECE_VALUES[piece.type] ?? 0
      const colorMultiplier = piece.color === 'b' ? 1 : -1

      score += value * colorMultiplier

      if (CENTER_SQUARES.has(square)) score += 18 * colorMultiplier
      if (DEVELOPMENT_SQUARES.has(square) && piece.type !== 'p') score += 10 * colorMultiplier
    })
  })

  score += getKingSafetyScore(game, 'b')
  score -= getKingSafetyScore(game, 'w')

  if (game.inCheck()) {
    score += game.turn() === 'w' ? 90 : -140
  }

  return score
}

function getMoveOrderingScore(move) {
  let score = 0

  if (move.captured) score += (PIECE_VALUES[move.captured] ?? 0) * 10 - (PIECE_VALUES[move.piece] ?? 0)
  if (move.promotion) score += PIECE_VALUES[move.promotion] ?? 0
  if (move.san.includes('+')) score += 80
  if (move.san.includes('#')) score += 100000
  if (CENTER_SQUARES.has(move.to)) score += 20
  if (DEVELOPMENT_SQUARES.has(move.to)) score += 8

  return score
}

function getOrderedMoves(game) {
  return game.moves({ verbose: true }).sort((a, b) => getMoveOrderingScore(b) - getMoveOrderingScore(a))
}

function minimax(game, depth, alpha, beta) {
  if (depth === 0 || game.isGameOver()) return evaluateForBlack(game)

  const moves = getOrderedMoves(game)
  const isBlackToMove = game.turn() === 'b'

  if (isBlackToMove) {
    let bestScore = -Infinity

    for (const move of moves) {
      const nextGame = new Chess(game.fen())
      nextGame.move(move)
      bestScore = Math.max(bestScore, minimax(nextGame, depth - 1, alpha, beta))
      alpha = Math.max(alpha, bestScore)
      if (beta <= alpha) break
    }

    return bestScore
  }

  let bestScore = Infinity

  for (const move of moves) {
    const nextGame = new Chess(game.fen())
    nextGame.move(move)
    bestScore = Math.min(bestScore, minimax(nextGame, depth - 1, alpha, beta))
    beta = Math.min(beta, bestScore)
    if (beta <= alpha) break
  }

  return bestScore
}

function chooseBestBotMove(game) {
  const legalMoves = getOrderedMoves(game)
  if (!legalMoves.length) return null

  let bestMove = legalMoves[0]
  let bestScore = -Infinity

  for (const move of legalMoves) {
    const nextGame = new Chess(game.fen())
    nextGame.move(move)
    const score = minimax(nextGame, SEARCH_DEPTH - 1, -Infinity, Infinity)

    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
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
  const [coachNote, setCoachNote] = useState('I will challenge you with legal, tactical moves. Use every move as practice.')
  const botMoveTimeoutRef = useRef(null)

  useEffect(() => {
    window.CoachChessModal = {
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      reset: () => resetGame(),
    }

    return () => {
      window.clearTimeout(botMoveTimeoutRef.current)
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
    window.clearTimeout(botMoveTimeoutRef.current)
    setGame(createGame())
    setIsThinking(false)
    setLastMove(null)
    setCoachNote('Fresh board. Control the center and develop your pieces with purpose.')
  }

  function makeBotMove(currentGame) {
    if (currentGame.isGameOver() || currentGame.turn() !== 'b') {
      setIsThinking(false)
      return
    }

    window.clearTimeout(botMoveTimeoutRef.current)
    botMoveTimeoutRef.current = window.setTimeout(() => {
      const botMove = chooseBestBotMove(currentGame)
      if (!botMove) {
        setIsThinking(false)
        return
      }

      const updatedGame = new Chess(currentGame.fen())
      updatedGame.move(botMove)
      setGame(updatedGame)
      setLastMove({ from: botMove.from, to: botMove.to })
      setCoachNote(botMove.captured
        ? `Coach Dilrabo chose ${botMove.san}, winning material on ${botMove.to}.`
        : `Coach Dilrabo played ${botMove.san}. Check the new threats before moving.`)
      setIsThinking(false)
    }, MOVE_DELAY_MS)
  }

  function onDrop({ sourceSquare, targetSquare }) {
    if (!sourceSquare || !targetSquare || isThinking || game.isGameOver() || game.turn() !== 'w') return false

    const movingPiece = game.get(sourceSquare)
    if (!movingPiece || movingPiece.color !== 'w') return false

    const nextGame = new Chess(game.fen())
    let move

    try {
      move = nextGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      })
    } catch {
      return false
    }

    if (!move) return false

    setGame(nextGame)
    setLastMove({ from: move.from, to: move.to })
    setCoachNote(move.captured
      ? `Good capture on ${move.to}. Now check whether the piece is defended.`
      : 'Good. Now anticipate the coach response before it happens.')

    if (!nextGame.isGameOver()) {
      setIsThinking(true)
      makeBotMove(nextGame)
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
                onPieceDrop: onDrop,
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
              <p>Legal move search with material scoring, check awareness, and shallow tactical planning.</p>
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