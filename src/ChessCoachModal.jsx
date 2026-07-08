import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import avatarImg from './assets/avatar.jpg'
import './ChessCoachModal.css'

const DEFAULT_DIFFICULTY = 'intermediate'
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
const OPENING_PREFERENCE_SQUARES = {
  beginner: new Set(['d5', 'e5']),
  intermediate: new Set(['c5', 'd5', 'e5', 'f5', 'c6', 'f6']),
  advanced: new Set(['c5', 'd5', 'e5', 'f5', 'c6', 'd6', 'e6', 'f6']),
  coach: new Set(['c5', 'd5', 'e5', 'f5', 'c6', 'd6', 'e6', 'f6', 'b4', 'g4']),
}
const DIFFICULTY_PROFILES = {
  beginner: {
    label: 'Beginner',
    description: 'Patient practice partner with visible mistakes and simple developing moves.',
    searchDepth: 1,
    errorProbability: 0.42,
    candidateWindow: 5,
    moveDelay: 650,
    personality: {
      aggression: 0.35,
      kingSafety: 0.95,
      centerControl: 0.7,
      openingPreference: 0.55,
    },
    engineOptions: {
      UCI_LimitStrength: true,
      UCI_Elo: 950,
      'Skill Level': 3,
    },
  },
  intermediate: {
    label: 'Intermediate',
    description: 'Balanced student challenge with tactical awareness and occasional human inaccuracies.',
    searchDepth: 2,
    errorProbability: 0.22,
    candidateWindow: 4,
    moveDelay: 500,
    personality: {
      aggression: 0.65,
      kingSafety: 1.1,
      centerControl: 1,
      openingPreference: 0.8,
    },
    engineOptions: {
      UCI_LimitStrength: true,
      UCI_Elo: 1350,
      'Skill Level': 8,
    },
  },
  advanced: {
    label: 'Advanced',
    description: 'Stronger calculation, fewer mistakes, and better material conversion.',
    searchDepth: 3,
    errorProbability: 0.08,
    candidateWindow: 3,
    moveDelay: 650,
    personality: {
      aggression: 0.9,
      kingSafety: 1.2,
      centerControl: 1.1,
      openingPreference: 0.95,
    },
    engineOptions: {
      UCI_LimitStrength: true,
      UCI_Elo: 1750,
      'Skill Level': 14,
    },
  },
  coach: {
    label: 'Coach Dilrabo',
    description: 'Maximum local strength with deeper search, tactical pressure, and no intentional errors.',
    searchDepth: 3,
    errorProbability: 0,
    candidateWindow: 1,
    moveDelay: 800,
    personality: {
      aggression: 1.2,
      kingSafety: 1.35,
      centerControl: 1.2,
      openingPreference: 1.1,
    },
    engineOptions: {
      UCI_LimitStrength: true,
      UCI_Elo: 2400,
      'Skill Level': 20,
    },
  },
}
const DIFFICULTY_KEYS = Object.keys(DIFFICULTY_PROFILES)

function createGame() {
  return new Chess()
}

function getDifficultyProfile(difficulty) {
  const key = DIFFICULTY_PROFILES[difficulty] ? difficulty : DEFAULT_DIFFICULTY
  return { ...DIFFICULTY_PROFILES[key], key }
}

function getFullMoveNumber(game) {
  return Number(game.fen().split(' ')[5]) || 1
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

function evaluateForBlack(game, profile) {
  if (game.isCheckmate()) return game.turn() === 'w' ? 100000 : -100000
  if (game.isDraw()) return 0

  let score = 0
  const board = game.board()
  const personality = profile.personality

  board.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      if (!piece) return

      const square = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`
      const value = PIECE_VALUES[piece.type] ?? 0
      const colorMultiplier = piece.color === 'b' ? 1 : -1

      score += value * colorMultiplier

      if (CENTER_SQUARES.has(square)) score += 18 * personality.centerControl * colorMultiplier
      if (DEVELOPMENT_SQUARES.has(square) && piece.type !== 'p') score += 10 * colorMultiplier
    })
  })

  score += getKingSafetyScore(game, 'b') * personality.kingSafety
  score -= getKingSafetyScore(game, 'w') * personality.kingSafety

  if (game.inCheck()) {
    score += game.turn() === 'w' ? 90 * personality.aggression : -180 * personality.kingSafety
  }

  return score
}

function getMoveOrderingScore(move, profile, fullMoveNumber) {
  let score = 0
  const personality = profile.personality
  const openingSquares = OPENING_PREFERENCE_SQUARES[profile.key] ?? OPENING_PREFERENCE_SQUARES[DEFAULT_DIFFICULTY]

  if (move.captured) score += ((PIECE_VALUES[move.captured] ?? 0) * 10 - (PIECE_VALUES[move.piece] ?? 0)) * personality.aggression
  if (move.promotion) score += PIECE_VALUES[move.promotion] ?? 0
  if (move.san.includes('+')) score += 80 * personality.aggression
  if (move.san.includes('#')) score += 100000
  if (CENTER_SQUARES.has(move.to)) score += 20 * personality.centerControl
  if (DEVELOPMENT_SQUARES.has(move.to)) score += 8
  if (fullMoveNumber <= 8 && openingSquares.has(move.to)) score += 22 * personality.openingPreference

  return score
}

function getOrderedMoves(game, profile) {
  return game
    .moves({ verbose: true })
    .sort((a, b) => getMoveOrderingScore(b, profile, getFullMoveNumber(game)) - getMoveOrderingScore(a, profile, getFullMoveNumber(game)))
}

function minimax(game, depth, alpha, beta, profile) {
  if (depth === 0 || game.isGameOver()) return evaluateForBlack(game, profile)

  const moves = getOrderedMoves(game, profile)
  const isBlackToMove = game.turn() === 'b'

  if (isBlackToMove) {
    let bestScore = -Infinity

    for (const move of moves) {
      const nextGame = new Chess(game.fen())
      nextGame.move(move)
      bestScore = Math.max(bestScore, minimax(nextGame, depth - 1, alpha, beta, profile))
      alpha = Math.max(alpha, bestScore)
      if (beta <= alpha) break
    }

    return bestScore
  }

  let bestScore = Infinity

  for (const move of moves) {
    const nextGame = new Chess(game.fen())
    nextGame.move(move)
    bestScore = Math.min(bestScore, minimax(nextGame, depth - 1, alpha, beta, profile))
    beta = Math.min(beta, bestScore)
    if (beta <= alpha) break
  }

  return bestScore
}

function scoreBotMoves(game, profile) {
  return getOrderedMoves(game, profile)
    .map((move) => {
      const nextGame = new Chess(game.fen())
      nextGame.move(move)
      const score = minimax(nextGame, profile.searchDepth - 1, -Infinity, Infinity, profile)

      return {
        move,
        score: score + getMoveOrderingScore(move, profile, getFullMoveNumber(game)) * 0.18,
      }
    })
    .sort((a, b) => b.score - a.score)
}

function chooseHumanLikeMistake(scoredMoves, profile) {
  const weakerMoves = scoredMoves.slice(1, profile.candidateWindow + 1)
  if (!weakerMoves.length) return scoredMoves[0]?.move ?? null

  const chosenIndex = Math.floor(Math.random() * weakerMoves.length)
  return weakerMoves[chosenIndex].move
}

function chooseBotMove(game, difficulty) {
  const profile = getDifficultyProfile(difficulty)
  const scoredMoves = scoreBotMoves(game, profile)
  if (!scoredMoves.length) return null

  const mustHandleCheck = game.inCheck()
  const shouldMakeMistake = !mustHandleCheck && Math.random() < profile.errorProbability

  if (shouldMakeMistake) {
    return chooseHumanLikeMistake(scoredMoves, profile)
  }

  return scoredMoves[0].move
}

function getGameStatus(game, isThinking, profile) {
  if (isThinking) return `${profile.label} is studying the position...`
  if (game.isCheckmate()) return game.turn() === 'w' ? 'Checkmate. Coach Dilrabo wins this round.' : 'Checkmate. Excellent work, you won.'
  if (game.isDraw()) return 'Draw. Strong resistance from both sides.'
  if (game.inCheck()) return game.turn() === 'w' ? 'You are in check. Find a calm response.' : 'Coach Dilrabo is in check.'
  return game.turn() === 'w' ? 'Your move. Look for checks, captures, and threats.' : `${profile.label} is ready to respond.`
}

function CoachChessModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [game, setGame] = useState(() => createGame())
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY)
  const [isThinking, setIsThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [coachNote, setCoachNote] = useState('I will challenge you with legal, tactical moves. Use every move as practice.')
  const botMoveTimeoutRef = useRef(null)
  const difficultyProfile = getDifficultyProfile(difficulty)

  const resetGame = useCallback(() => {
    window.clearTimeout(botMoveTimeoutRef.current)
    setGame(createGame())
    setIsThinking(false)
    setLastMove(null)
    setCoachNote(`Fresh board. ${difficultyProfile.label} mode is active.`)
  }, [difficultyProfile.label])

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
  }, [resetGame])

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


  function makeBotMove(currentGame, selectedDifficulty = difficulty) {
    if (currentGame.isGameOver() || currentGame.turn() !== 'b') {
      setIsThinking(false)
      return
    }

    const activeProfile = getDifficultyProfile(selectedDifficulty)

    window.clearTimeout(botMoveTimeoutRef.current)
    botMoveTimeoutRef.current = window.setTimeout(() => {
      const botMove = chooseBotMove(currentGame, selectedDifficulty)
      if (!botMove) {
        setIsThinking(false)
        return
      }

      const updatedGame = new Chess(currentGame.fen())
      updatedGame.move(botMove)
      setGame(updatedGame)
      setLastMove({ from: botMove.from, to: botMove.to })
      setCoachNote(botMove.captured
        ? `${activeProfile.label} chose ${botMove.san}, winning material on ${botMove.to}.`
        : `${activeProfile.label} played ${botMove.san}. Check the new threats before moving.`)
      setIsThinking(false)
    }, activeProfile.moveDelay)
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
      makeBotMove(nextGame, difficulty)
    }

    return true
  }

  function handleDifficultyChange(event) {
    const nextDifficulty = event.target.value
    const nextProfile = getDifficultyProfile(nextDifficulty)

    setDifficulty(nextDifficulty)
    setCoachNote(`${nextProfile.label} mode selected. The next coach move will use its depth, delay, and mistake profile.`)
  }

  const status = getGameStatus(game, isThinking, difficultyProfile)
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
                canDragPiece: ({ piece }) => game.turn() === 'w' && piece?.pieceType?.startsWith('w'),
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

            <label className="coach-modal__difficulty" htmlFor="coach-difficulty">
              <span>Difficulty</span>
              <select id="coach-difficulty" value={difficulty} onChange={handleDifficultyChange} disabled={isThinking}>
                {DIFFICULTY_KEYS.map((difficultyKey) => (
                  <option key={difficultyKey} value={difficultyKey}>
                    {DIFFICULTY_PROFILES[difficultyKey].label}
                  </option>
                ))}
              </select>
            </label>

            <div className="coach-modal__note">
              <span>Coach note</span>
              <p>{coachNote}</p>
            </div>
            <div className="coach-modal__settings">
              <span>Bot personality</span>
              <strong>{difficultyProfile.label}</strong>
              <p>{difficultyProfile.description}</p>
              <dl>
                <div>
                  <dt>Search</dt>
                  <dd>{difficultyProfile.searchDepth} ply</dd>
                </div>
                <div>
                  <dt>Error rate</dt>
                  <dd>{Math.round(difficultyProfile.errorProbability * 100)}%</dd>
                </div>
                <div>
                  <dt>Delay</dt>
                  <dd>{difficultyProfile.moveDelay}ms</dd>
                </div>
                <div>
                  <dt>UCI Skill</dt>
                  <dd>{difficultyProfile.engineOptions['Skill Level']}</dd>
                </div>
              </dl>
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