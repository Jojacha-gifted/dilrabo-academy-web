import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import avatarImg from './assets/avatar.jpg'
import './ChessCoachModal.css'

const DEFAULT_DIFFICULTY = 'tier_900'
const DIFFICULTY_PROFILES = {
  tier_100: { label: 'New to Chess (100)', description: 'Absolute beginner level.', searchDepth: 1, engineOptions: { 'Skill Level': 0, UCI_LimitStrength: false } },
  tier_400: { label: 'Beginner (400)', description: 'Basic understanding of the rules.', searchDepth: 1, engineOptions: { 'Skill Level': 1, UCI_LimitStrength: false } },
  tier_600: { label: 'Novice (600)', description: 'Learning basic tactics and opening principles.', searchDepth: 2, engineOptions: { 'Skill Level': 2, UCI_LimitStrength: false } },
  tier_900: { label: 'Intermediate (900)', description: 'Developing positional awareness.', searchDepth: 2, engineOptions: { 'Skill Level': 3, UCI_LimitStrength: false } },
  tier_1200: { label: 'Intermediate II (1200)', description: 'Solid club player level.', searchDepth: 3, engineOptions: { 'Skill Level': 4, UCI_LimitStrength: false } },
  tier_1600: { label: 'Advanced (1600)', description: 'Strong club player with advanced tactical vision.', searchDepth: 5, engineOptions: { UCI_Elo: 1600, UCI_LimitStrength: true } },
  tier_2000: { label: 'Expert (2000)', description: 'Candidate Master strength.', searchDepth: 8, engineOptions: { UCI_Elo: 2000, UCI_LimitStrength: true } },
  tier_2400: { label: 'Master (2400)', description: 'International Master strength.', searchDepth: 12, engineOptions: { UCI_Elo: 2400, UCI_LimitStrength: true } },
  tier_2800: { label: 'Grandmaster (2800)', description: 'Elite Grandmaster level.', searchDepth: 16, engineOptions: { UCI_Elo: 2800, UCI_LimitStrength: true } },
  tier_3200: { label: 'Maximum (3200)', description: 'Supercomputer level chess.', searchDepth: 20, engineOptions: { UCI_Elo: 3200, UCI_LimitStrength: true } },
}
const DIFFICULTY_KEYS = Object.keys(DIFFICULTY_PROFILES)

function createGame() {
  return new Chess()
}

function getDifficultyProfile(difficulty) {
  const key = DIFFICULTY_PROFILES[difficulty] ? difficulty : DEFAULT_DIFFICULTY
  return { ...DIFFICULTY_PROFILES[key], key }
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
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [game, setGame] = useState(() => createGame())
  const [botDifficulty, setBotDifficulty] = useState(DEFAULT_DIFFICULTY)
  const [isThinking, setIsThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [coachNote, setCoachNote] = useState('I will challenge you with legal, tactical moves. Use every move as practice.')
  const botMoveTimeoutRef = useRef(null)
  const engineRef = useRef(null)
  const difficultyProfile = getDifficultyProfile(botDifficulty)

  const resetGame = useCallback(() => {
    window.clearTimeout(botMoveTimeoutRef.current)
    setGame(createGame())
    setIsThinking(false)
    setLastMove(null)
    setIsGameStarted(false)
    setCoachNote(`Fresh board. ${difficultyProfile.label} mode is active.`)
  }, [difficultyProfile.label])

  useEffect(() => {
    engineRef.current = new Worker('/stockfish.js')
    engineRef.current.postMessage('uci')

    window.CoachChessModal = {
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      reset: () => resetGame(),
    }

    return () => {
      window.clearTimeout(botMoveTimeoutRef.current)
      delete window.CoachChessModal
      if (engineRef.current) {
        engineRef.current.terminate()
      }
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


  function makeBotMove(currentGame, selectedDifficulty = botDifficulty) {
    if (currentGame.isGameOver() || currentGame.turn() !== 'b') {
      setIsThinking(false)
      return
    }

    const activeProfile = getDifficultyProfile(selectedDifficulty)

    const options = activeProfile.engineOptions
    if (options.UCI_LimitStrength) {
      engineRef.current.postMessage('setoption name UCI_LimitStrength value true')
      engineRef.current.postMessage(`setoption name UCI_Elo value ${options.UCI_Elo}`)
    } else {
      engineRef.current.postMessage('setoption name UCI_LimitStrength value false')
      engineRef.current.postMessage(`setoption name Skill Level value ${options['Skill Level']}`)
    }

    engineRef.current.onmessage = (event) => {
      const line = event.data
      if (typeof line === 'string' && line.startsWith('bestmove')) {
        const moveStr = line.split(' ')[1]
        if (!moveStr || moveStr === '(none)') {
          setIsThinking(false)
          return
        }

        const from = moveStr.substring(0, 2)
        const to = moveStr.substring(2, 4)
        const promotion = moveStr.length > 4 ? moveStr[4] : undefined

        const updatedGame = new Chess(currentGame.fen())
        const move = updatedGame.move({ from, to, promotion })

        setGame(updatedGame)
        setLastMove({ from: move.from, to: move.to })
        setCoachNote(move.captured
          ? `${activeProfile.label} chose ${move.san}, winning material on ${move.to}.`
          : `${activeProfile.label} played ${move.san}. Check the new threats before moving.`)
        setIsThinking(false)
      }
    }

    engineRef.current.postMessage(`position fen ${currentGame.fen()}`)
    engineRef.current.postMessage(`go depth ${activeProfile.searchDepth}`)
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
      makeBotMove(nextGame, botDifficulty)
    }

    return true
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

  if (!isGameStarted) {
    return (
      <div className="coach-modal" role="dialog" aria-modal="true" aria-labelledby="coach-modal-title">
        <button className="coach-modal__backdrop" type="button" aria-label="Close coach chess modal" onClick={() => setIsOpen(false)} />
        <div className="coach-modal__panel" style={{ maxWidth: '500px', margin: '10vh auto', textAlign: 'center', padding: '2rem' }}>
          <header className="coach-modal__header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img className="coach-modal__avatar" src={avatarImg} alt="Coach Dilrabo" style={{ marginBottom: '1rem' }} />
            <h2 id="coach-modal-title">Select Your Challenge</h2>
            <p>Choose an opponent to begin the game.</p>
          </header>

          <div style={{ margin: '2rem 0', textAlign: 'left' }}>
            <label htmlFor="difficulty-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Select Difficulty Level
            </label>
            <select
              id="difficulty-select"
              value={botDifficulty}
              onChange={(e) => setBotDifficulty(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1.1rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                marginBottom: '1rem',
                cursor: 'pointer'
              }}
            >
              {DIFFICULTY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {DIFFICULTY_PROFILES[key].label}
                </option>
              ))}
            </select>
            <p style={{ color: '#666', fontSize: '0.95rem', minHeight: '3rem' }}>
              {DIFFICULTY_PROFILES[botDifficulty].description}
            </p>
          </div>

          <div className="coach-modal__actions" style={{ justifyContent: 'center' }}>
            <button type="button" onClick={() => setIsGameStarted(true)} style={{ backgroundColor: '#a23e48', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>Start Game</button>
            <button type="button" onClick={() => setIsOpen(false)} style={{ backgroundColor: '#eee', color: '#333', border: 'none', padding: '0.75rem 2rem', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

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

            <div className="coach-modal__settings">
              <span>Bot personality</span>
              <strong>{difficultyProfile.label}</strong>
              <p>{difficultyProfile.description}</p>
              <dl>
                <div>
                  <dt>Search</dt>
                  <dd>{difficultyProfile.searchDepth} ply</dd>
                </div>
                {difficultyProfile.engineOptions.UCI_Elo !== undefined && (
                  <div>
                    <dt>Target Elo</dt>
                    <dd>{difficultyProfile.engineOptions.UCI_Elo}</dd>
                  </div>
                )}
                {difficultyProfile.engineOptions['Skill Level'] !== undefined && (
                  <div>
                    <dt>Skill Level</dt>
                    <dd>{difficultyProfile.engineOptions['Skill Level']}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="coach-modal__note">
              <span>Coach note</span>
              <p>{coachNote}</p>
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