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

const TIME_CONTROLS = {
  bullet_1_0: { label: 'Bullet 1 min', baseMs: 60000, incMs: 0 },
  bullet_1_1: { label: 'Bullet 1|1', baseMs: 60000, incMs: 1000 },
  bullet_2_1: { label: 'Bullet 2|1', baseMs: 120000, incMs: 1000 },
  blitz_3_0: { label: 'Blitz 3 min', baseMs: 180000, incMs: 0 },
  blitz_3_2: { label: 'Blitz 3|2', baseMs: 180000, incMs: 2000 },
  blitz_5_0: { label: 'Blitz 5 min', baseMs: 300000, incMs: 0 },
  rapid_10_0: { label: 'Rapid 10 min', baseMs: 600000, incMs: 0 },
  rapid_15_10: { label: 'Rapid 15|10', baseMs: 900000, incMs: 10000 },
  rapid_30_0: { label: 'Rapid 30 min', baseMs: 1800000, incMs: 0 },
  untimed: { label: 'Untimed', baseMs: null, incMs: 0 },
}
const DEFAULT_TIME_CONTROL = 'untimed'

const COLORS = [
  { id: 'white', label: 'White' },
  { id: 'random', label: 'Random' },
  { id: 'black', label: 'Black' }
]
const DEFAULT_COLOR = 'random'

const PREMOVE_SETTINGS = [
  { id: 'single', label: 'Single' },
  { id: 'multiple', label: 'Multiple' },
  { id: 'disabled', label: 'Disabled' }
]
const DEFAULT_PREMOVE = 'single'

function createGame() {
  return new Chess()
}

function getDifficultyProfile(difficulty) {
  const key = DIFFICULTY_PROFILES[difficulty] ? difficulty : DEFAULT_DIFFICULTY
  return { ...DIFFICULTY_PROFILES[key], key }
}

function formatTime(ms) {
  if (ms === null) return '--:--'
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function getGameStatus(game, isThinking, profile, gameStatusReason) {
  if (gameStatusReason === 'timeout_player') return 'Checkmate. You ran out of time.'
  if (gameStatusReason === 'timeout_bot') return 'Victory. Coach Dilrabo ran out of time.'
  if (isThinking) return `${profile.label} is studying the position...`
  if (game.isCheckmate()) return game.turn() === 'w' ? 'Checkmate. Coach Dilrabo wins this round.' : 'Checkmate. Excellent work, you won.'
  if (game.isDraw()) return 'Draw. Strong resistance from both sides.'
  if (game.inCheck()) return game.turn() === 'w' ? 'You are in check. Find a calm response.' : 'Coach Dilrabo is in check.'
  return game.turn() === 'w' ? 'Your move. Look for checks, captures, and threats.' : `${profile.label} is ready to respond.`
}

const PlayerClock = ({ timeMs, label, isTurn }) => {
  if (timeMs === null) return null
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.5rem 1rem', background: isTurn ? '#a23e48' : '#e2e8f0',
      color: isTurn ? '#fff' : '#475569', borderRadius: '0.5rem',
      fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem', marginTop: '0.5rem',
      transition: 'all 0.2s ease',
      boxShadow: isTurn ? '0 4px 12px rgba(162, 62, 72, 0.3)' : 'none'
    }}>
      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeMs)}</span>
    </div>
  )
}

function CoachChessModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [game, setGame] = useState(() => createGame())
  const [botDifficulty, setBotDifficulty] = useState(DEFAULT_DIFFICULTY)
  const [isThinking, setIsThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [coachNote, setCoachNote] = useState('I will challenge you with legal, tactical moves. Use every move as practice.')
  
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR)
  const [activeColor, setActiveColor] = useState('w')
  
  const [selectedTime, setSelectedTime] = useState(DEFAULT_TIME_CONTROL)
  const [playerTimeMs, setPlayerTimeMs] = useState(null)
  const [botTimeMs, setBotTimeMs] = useState(null)
  const [gameStatusReason, setGameStatusReason] = useState(null)
  
  const [premoveSetting, setPremoveSetting] = useState(DEFAULT_PREMOVE)
  const [premoves, setPremoves] = useState([])

  const botMoveTimeoutRef = useRef(null)
  const engineRef = useRef(null)
  const requestRef = useRef(null)
  const previousTimeRef = useRef(null)
  
  const difficultyProfile = getDifficultyProfile(botDifficulty)

  const resetGame = useCallback(() => {
    window.clearTimeout(botMoveTimeoutRef.current)
    setGame(createGame())
    setIsThinking(false)
    setLastMove(null)
    setGameStatusReason(null)
    setPremoves([])
    setIsGameStarted(false)
    setCoachNote(`Fresh board. ${difficultyProfile.label} mode is active.`)
  }, [difficultyProfile.label])

  const startGame = useCallback(() => {
    window.clearTimeout(botMoveTimeoutRef.current)
    setGame(createGame())
    setIsThinking(false)
    setLastMove(null)
    setCoachNote(`Fresh board. ${difficultyProfile.label} mode is active.`)
    setGameStatusReason(null)
    setPremoves([])
    
    let color = selectedColor
    if (color === 'random') {
      color = Math.random() < 0.5 ? 'white' : 'black'
    }
    setActiveColor(color === 'white' ? 'w' : 'b')
    
    const timeProfile = TIME_CONTROLS[selectedTime]
    setPlayerTimeMs(timeProfile.baseMs)
    setBotTimeMs(timeProfile.baseMs)
    
    setIsGameStarted(true)
  }, [difficultyProfile.label, selectedColor, selectedTime])

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

  // Bot opening move check
  useEffect(() => {
    if (isGameStarted && game.fen() === createGame().fen() && activeColor === 'b' && game.turn() === 'w') {
      setIsThinking(true)
      makeBotMove(game, botDifficulty)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameStarted, activeColor])

  // Timer loop
  const animate = useCallback(time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current
      if (isGameStarted && !game.isGameOver() && !gameStatusReason && playerTimeMs !== null && botTimeMs !== null) {
        if (game.turn() === activeColor) {
           setPlayerTimeMs(prev => Math.max(0, prev - deltaTime))
        } else {
           setBotTimeMs(prev => Math.max(0, prev - deltaTime))
        }
      }
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }, [isGameStarted, game, activeColor, gameStatusReason, playerTimeMs, botTimeMs])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [animate])

  // Timeout logic
  useEffect(() => {
    if (playerTimeMs === 0) setGameStatusReason('timeout_player')
    if (botTimeMs === 0) setGameStatusReason('timeout_bot')
  }, [playerTimeMs, botTimeMs])

  function makeBotMove(currentGame, selectedDifficulty = botDifficulty) {
    if (currentGame.isGameOver() || currentGame.turn() === activeColor) {
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
        
        const timeProfile = TIME_CONTROLS[selectedTime]
        if (timeProfile && timeProfile.baseMs !== null && timeProfile.incMs > 0) {
          setBotTimeMs(prev => prev + timeProfile.incMs)
        }

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

  function onDrop(sourceSquare, targetSquare) {
    if (typeof sourceSquare === 'object') {
       targetSquare = sourceSquare.targetSquare
       sourceSquare = sourceSquare.sourceSquare
    }
    
    if (!sourceSquare || !targetSquare || game.isGameOver() || gameStatusReason || game.turn() !== activeColor) return false

    const movingPiece = game.get(sourceSquare)
    if (!movingPiece || movingPiece.color !== activeColor) return false

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
      const timeProfile = TIME_CONTROLS[selectedTime]
      if (timeProfile && timeProfile.baseMs !== null && timeProfile.incMs > 0) {
        setPlayerTimeMs(prev => prev + timeProfile.incMs)
      }
      makeBotMove(nextGame, botDifficulty)
    }

    return true
  }

  const handlePremovesChange = (newPremoves) => {
    if (premoveSetting === 'single' && newPremoves.length > 1) {
      setPremoves([newPremoves[newPremoves.length - 1]])
    } else {
      setPremoves(newPremoves)
    }
  }

  const status = getGameStatus(game, isThinking, difficultyProfile, gameStatusReason)
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
            <p>Choose your match parameters.</p>
          </header>

          <div style={{ margin: '2rem 0', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Play As</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.id)}
                      style={{
                        flex: 1, padding: '0.5rem', borderRadius: '4px', cursor: 'pointer',
                        border: selectedColor === c.id ? '2px solid #a23e48' : '1px solid #ccc',
                        background: selectedColor === c.id ? 'rgba(162, 62, 72, 0.1)' : '#fff'
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="time-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Time Control</label>
                <select id="time-select" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                  {Object.keys(TIME_CONTROLS).map(k => (
                    <option key={k} value={k}>{TIME_CONTROLS[k].label}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="premove-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Premoves</label>
                <select id="premove-select" value={premoveSetting} onChange={(e) => setPremoveSetting(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                  {PREMOVE_SETTINGS.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

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
            <button type="button" onClick={startGame} style={{ backgroundColor: '#a23e48', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>Start Game</button>
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
            <PlayerClock timeMs={botTimeMs} label="Coach Dilrabo" isTurn={game.turn() !== activeColor && !game.isGameOver() && !gameStatusReason} />
            <div style={{ borderRadius: '1.35rem', overflow: 'hidden', border: '1px solid rgba(30, 42, 68, 0.14)', boxShadow: '0 18px 45px rgba(30, 42, 68, 0.14)' }}>
              <Chessboard
                boardOrientation={activeColor === 'w' ? 'white' : 'black'}
                position={game.fen()}
                allowDragging={!game.isGameOver() && !gameStatusReason}
                canDragPiece={({ piece }) => piece?.charAt(0) === activeColor}
                onPieceDrop={onDrop}
                squareStyles={squareStyles}
                lightSquareStyle={{ backgroundColor: '#f6f0e8' }}
                darkSquareStyle={{ backgroundColor: '#1e2a44' }}
                showAnimations={true}
                arePremovesAllowed={premoveSetting !== 'disabled'}
                premoves={premoves}
                onPremovesChange={handlePremovesChange}
                clearPremovesOnRightClick={true}
              />
            </div>
            <PlayerClock timeMs={playerTimeMs} label="You" isTurn={game.turn() === activeColor && !game.isGameOver() && !gameStatusReason} />
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