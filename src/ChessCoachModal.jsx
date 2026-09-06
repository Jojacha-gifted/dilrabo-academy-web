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

function getGameStatus(game, isThinking, profile, gameStatusReason, activeColor) {
  if (gameStatusReason === 'timeout_player') return 'Time out. You lost on time.'
  if (gameStatusReason === 'timeout_bot') return 'Time out. Coach Dilrabo lost on time.'
  if (game.isCheckmate()) return 'Checkmate. Game over.'
  if (isThinking) return `${profile.label} is studying the position...`
  if (game.isDraw()) return 'Draw. Strong resistance from both sides.'
  if (game.inCheck()) return game.turn() === activeColor ? 'You are in check. Find a calm response.' : 'Coach Dilrabo is in check.'
  return game.turn() === activeColor ? 'Your move. Look for checks, captures, and threats.' : `${profile.label} is ready to respond.`
}

const PlayerClock = ({ timeMs, label, isTurn }) => {
  if (timeMs === null) return null
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.4rem 0.75rem', background: isTurn ? '#a23e48' : '#e2e8f0',
      color: isTurn ? '#fff' : '#475569', borderRadius: '0.5rem',
      fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.4rem', marginTop: '0.4rem',
      transition: 'all 0.2s ease',
      boxShadow: isTurn ? '0 4px 12px rgba(162, 62, 72, 0.3)' : 'none',
      flexShrink: 0
    }}>
      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
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
  const [isEngineReady, setIsEngineReady] = useState(false)
  const [pendingPromotion, setPendingPromotion] = useState(null)

  const botMoveTimeoutRef = useRef(null)
  const engineRef = useRef(null)
  const requestRef = useRef(null)
  const previousTimeRef = useRef(null)
  const hasStartedOpeningMove = useRef(false)
  const resetGameRef = useRef(null)
  const moveTimeoutRef = useRef(null)
  
  const difficultyProfile = getDifficultyProfile(botDifficulty)

  const resetGame = useCallback(() => {
    window.clearTimeout(botMoveTimeoutRef.current)
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
    setGame(createGame())
    setIsThinking(false)
    setLastMove(null)
    setGameStatusReason(null)
    setPremoves([])
    setPendingPromotion(null)
    setIsGameStarted(false)
    hasStartedOpeningMove.current = false
    setCoachNote(`Fresh board. ${difficultyProfile.label} mode is active.`)
  }, [difficultyProfile.label])

  const startGame = useCallback(() => {
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
    setGame(createGame())
    setIsThinking(false)
    setLastMove(null)
    setCoachNote(`Fresh board. ${difficultyProfile.label} mode is active.`)
    setGameStatusReason(null)
    setPremoves([])
    hasStartedOpeningMove.current = false
    
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
    resetGameRef.current = resetGame
  }, [resetGame])

  useEffect(() => {
    engineRef.current = new Worker('/stockfish.js')
    
    engineRef.current.onmessage = (event) => {
      const msg = event.data
      if (typeof msg === 'string' && msg === 'uciok') {
        engineRef.current.postMessage('isready')
      }
      if (typeof msg === 'string' && msg === 'readyok') {
        setIsEngineReady(true)
      }
    }
    
    engineRef.current.postMessage('uci')

    window.CoachChessModal = {
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      reset: () => {
        if (resetGameRef.current) resetGameRef.current()
      },
    }

    return () => {
      window.clearTimeout(botMoveTimeoutRef.current)
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
      delete window.CoachChessModal
      if (engineRef.current) {
        engineRef.current.terminate()
      }
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

  // Bot opening move check
  useEffect(() => {
    if (isGameStarted && !hasStartedOpeningMove.current && game.fen() === createGame().fen() && activeColor === 'b' && game.turn() === 'w') {
      hasStartedOpeningMove.current = true
      setIsThinking(true)
      makeBotMove(game, botDifficulty)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameStarted, activeColor, game])

  // Timer loop
  const animate = useCallback(time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current
      if (isGameStarted && !game.isGameOver() && !gameStatusReason && playerTimeMs !== null && botTimeMs !== null && game.history().length > 0) {
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
        
        // Add a random artificial delay (400ms - 1200ms) to simulate human thinking.
        // This ensures the bot's clock decreases and gives the player time to premove.
        const delayMs = Math.floor(Math.random() * 800) + 400
        moveTimeoutRef.current = setTimeout(() => {
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
        }, delayMs)
      }
    }

    engineRef.current.postMessage(`position fen ${currentGame.fen()}`)
    engineRef.current.postMessage(`go depth ${activeProfile.searchDepth}`)
  }

  const executeMove = (sourceSquare, targetSquare, promotion = 'q') => {
    const nextGame = new Chess(game.fen())
    let move

    try {
      move = nextGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion,
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

  function onDrop(sourceSquare, targetSquare, piece) {
    // Handle react-chessboard v5 where onPieceDrop receives a single object argument
    if (typeof sourceSquare === 'object' && sourceSquare !== null) {
      targetSquare = sourceSquare.targetSquare
      piece = typeof sourceSquare.piece === 'string' ? sourceSquare.piece : sourceSquare.piece?.pieceType
      sourceSquare = sourceSquare.sourceSquare
    }

    if (game.isGameOver() || gameStatusReason || game.turn() !== activeColor || pendingPromotion) return false

    const movingPiece = game.get(sourceSquare)
    if (!movingPiece || movingPiece.color !== activeColor) return false

    // Handle castling by dragging King to Rook
    if (movingPiece.type === 'k') {
      if (sourceSquare === 'e1' && targetSquare === 'h1') targetSquare = 'g1'
      if (sourceSquare === 'e1' && targetSquare === 'a1') targetSquare = 'c1'
      if (sourceSquare === 'e8' && targetSquare === 'h8') targetSquare = 'g8'
      if (sourceSquare === 'e8' && targetSquare === 'a8') targetSquare = 'c8'
    }

    const moves = game.moves({ verbose: true });
    const isPromotion = moves.some(m => m.from === sourceSquare && m.to === targetSquare && m.promotion);

    if (isPromotion) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      return false; // Snap piece back temporarily while user selects promotion
    }

    return executeMove(sourceSquare, targetSquare)
  }

  const handlePremovesChange = (newPremoves) => {
    if (premoveSetting === 'single' && newPremoves.length > 1) {
      setPremoves([newPremoves[newPremoves.length - 1]])
    } else {
      setPremoves(newPremoves)
    }
  }

  const status = getGameStatus(game, isThinking, difficultyProfile, gameStatusReason, activeColor)
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
        <div className="coach-modal__panel" style={{ maxWidth: '540px', margin: 'auto', textAlign: 'center', padding: '1rem', height: 'auto', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <header className="coach-modal__header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '0.25rem' }}>
            <img className="coach-modal__avatar" src={avatarImg} alt="Coach Dilrabo" style={{ marginBottom: '0.25rem', width: '3.5rem', height: '3.5rem' }} />
            <h2 id="coach-modal-title" style={{ fontSize: '1.4rem', margin: '0.1rem 0' }}>Select Your Challenge</h2>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Choose your match parameters.</p>
          </header>

          <div style={{ flex: 1, minHeight: 0, margin: '0.5rem 0', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.15rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Play As</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.id)}
                      style={{
                        flex: 1, padding: '0.35rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem',
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
                <label htmlFor="time-select" style={{ display: 'block', marginBottom: '0.15rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Time Control</label>
                <select id="time-select" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}>
                  {Object.keys(TIME_CONTROLS).map(k => (
                    <option key={k} value={k}>{TIME_CONTROLS[k].label}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="premove-select" style={{ display: 'block', marginBottom: '0.15rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Premoves</label>
                <select id="premove-select" value={premoveSetting} onChange={(e) => setPremoveSetting(e.target.value)} style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}>
                  {PREMOVE_SETTINGS.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label htmlFor="difficulty-select" style={{ display: 'block', marginBottom: '0.15rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
              Select Difficulty Level
            </label>
            <select
              id="difficulty-select"
              value={botDifficulty}
              onChange={(e) => setBotDifficulty(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem',
                fontSize: '0.9rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                marginBottom: '0.25rem',
                cursor: 'pointer'
              }}
            >
              {DIFFICULTY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {DIFFICULTY_PROFILES[key].label}
                </option>
              ))}
            </select>
            <p style={{ color: '#666', fontSize: '0.8rem', minHeight: '2rem', margin: 0 }}>
              {DIFFICULTY_PROFILES[botDifficulty].description}
            </p>
          </div>

          <div className="coach-modal__actions" style={{ justifyContent: 'center', flexShrink: 0, marginTop: '0.25rem' }}>
            <button 
              type="button" 
              onClick={startGame} 
              disabled={!isEngineReady}
              style={{ backgroundColor: isEngineReady ? '#a23e48' : '#e2e8f0', color: isEngineReady ? '#fff' : '#64748b', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: isEngineReady ? 'pointer' : 'not-allowed', fontSize: '0.9rem', fontWeight: 'bold', transition: 'all 0.2s' }}
            >
              {isEngineReady ? 'Start Game' : 'Loading Engine...'}
            </button>
            <button type="button" onClick={() => setIsOpen(false)} style={{ backgroundColor: '#eee', color: '#333', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
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
            <div style={{ position: 'relative', borderRadius: '1.35rem', overflow: 'hidden', border: '1px solid rgba(30, 42, 68, 0.14)', boxShadow: '0 18px 45px rgba(30, 42, 68, 0.14)' }}>
              <Chessboard
                boardOrientation={activeColor === 'w' ? 'white' : 'black'}
                position={game.fen()}
                allowDragging={!game.isGameOver() && !gameStatusReason && !pendingPromotion}
                canDragPiece={({ piece }) => {
                  const p = typeof piece === 'string' ? piece : piece?.pieceType
                  return p?.charAt(0) === activeColor
                }}
                onPieceDrop={onDrop}
                squareStyles={squareStyles}
                lightSquareStyle={{ backgroundColor: '#f6f0e8' }}
                darkSquareStyle={{ backgroundColor: '#1e2a44' }}
                showAnimations={true}
                arePremovesAllowed={premoveSetting !== 'disabled'}
                premoves={premoves}
                onPremovesChange={handlePremovesChange}
                clearPremovesOnRightClick={true}
                options={{
                  boardOrientation: activeColor === 'w' ? 'white' : 'black',
                  position: game.fen(),
                  allowDragging: !game.isGameOver() && !gameStatusReason && !pendingPromotion,
                  canDragPiece: ({ piece }) => {
                    const p = typeof piece === 'string' ? piece : piece?.pieceType
                    return p?.charAt(0) === activeColor
                  },
                  onPieceDrop: onDrop,
                  squareStyles: squareStyles,
                  lightSquareStyle: { backgroundColor: '#f6f0e8' },
                  darkSquareStyle: { backgroundColor: '#1e2a44' },
                  showAnimations: true,
                  arePremovesAllowed: premoveSetting !== 'disabled',
                  premoves: premoveSetting !== 'disabled' ? premoves : [],
                  onPremovesChange: handlePremovesChange,
                  clearPremovesOnRightClick: true
                }}
              />
              {pendingPromotion && (
                <div className="promotion-modal-overlay">
                  <div className="promotion-modal-panel">
                    <div className="promotion-modal-title">Choose Promotion</div>
                    <div className="promotion-piece-container">
                      <div className="promotion-piece-btn" onClick={() => { executeMove(pendingPromotion.from, pendingPromotion.to, 'q'); setPendingPromotion(null); }}>
                        {activeColor === 'w' ? '♕' : '♛'}
                      </div>
                      <div className="promotion-piece-btn" onClick={() => { executeMove(pendingPromotion.from, pendingPromotion.to, 'r'); setPendingPromotion(null); }}>
                        {activeColor === 'w' ? '♖' : '♜'}
                      </div>
                      <div className="promotion-piece-btn" onClick={() => { executeMove(pendingPromotion.from, pendingPromotion.to, 'b'); setPendingPromotion(null); }}>
                        {activeColor === 'w' ? '♗' : '♝'}
                      </div>
                      <div className="promotion-piece-btn" onClick={() => { executeMove(pendingPromotion.from, pendingPromotion.to, 'n'); setPendingPromotion(null); }}>
                        {activeColor === 'w' ? '♘' : '♞'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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