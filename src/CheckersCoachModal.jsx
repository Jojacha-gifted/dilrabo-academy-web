import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import avatarImg from './assets/avatar.jpg'
import './ChessCoachModal.css' // We reuse the exact same CSS as Chess for UI consistency

// --- CHECKERS ENGINE LOGIC ---

const INITIAL_BOARD = [
  [null, 'b', null, 'b', null, 'b', null, 'b'],
  ['b', null, 'b', null, 'b', null, 'b', null],
  [null, 'b', null, 'b', null, 'b', null, 'b'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['w', null, 'w', null, 'w', null, 'w', null],
  [null, 'w', null, 'w', null, 'w', null, 'w'],
  ['w', null, 'w', null, 'w', null, 'w', null]
]

function cloneBoard(board) {
  return board.map(row => [...row])
}

function isValidSq(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getDirections(piece) {
  const isKing = piece === piece.toUpperCase();
  const player = piece.toLowerCase();
  const dirs = [];
  if (player === 'w' || isKing) dirs.push({ dr: -1, dc: -1 }, { dr: -1, dc: 1 });
  if (player === 'b' || isKing) dirs.push({ dr: 1, dc: -1 }, { dr: 1, dc: 1 });
  return dirs;
}

// Returns immediate valid steps for UI interacting
function getLegalNextSteps(board, player, lockedPiece = null) {
  let jumps = [];
  let simple = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (lockedPiece && (r !== lockedPiece.r || c !== lockedPiece.c)) continue;
      
      const piece = board[r][c];
      if (piece && piece.toLowerCase() === player) {
        const dirs = getDirections(piece);
        for(let d of dirs) {
           const jr = r + d.dr*2, jc = c + d.dc*2;
           const mr = r + d.dr, mc = c + d.dc;
           if (isValidSq(jr, jc)) {
              const mp = board[mr][mc];
              if (board[jr][jc] === null && mp && mp.toLowerCase() !== player) {
                 jumps.push({ type: 'jump', from: {r, c}, to: {r: jr, c: jc}, cap: {r: mr, c: mc} });
              }
           }
        }
        
        if (jumps.length === 0 && !lockedPiece) {
           for(let d of dirs) {
              const sr = r + d.dr, sc = c + d.dc;
              if (isValidSq(sr, sc) && board[sr][sc] === null) {
                 simple.push({ type: 'move', from: {r, c}, to: {r: sr, c: sc} });
              }
           }
        }
      }
    }
  }
  return jumps.length > 0 ? jumps : simple;
}

// Returns full turn paths for AI
function getAllLegalTurns(board, player) {
  const turns = [];
  
  function exploreJumps(curBoard, curR, curC, currentPath) {
    let hasFurtherJump = false;
    const piece = curBoard[curR][curC];
    const dirs = getDirections(piece);
    for (let d of dirs) {
       const jr = curR + d.dr*2, jc = curC + d.dc*2;
       const mr = curR + d.dr, mc = curC + d.dc;
       if (isValidSq(jr, jc) && curBoard[jr][jc] === null) {
          const mp = curBoard[mr][mc];
          if (mp && mp.toLowerCase() !== player) {
             hasFurtherJump = true;
             const nBoard = cloneBoard(curBoard);
             nBoard[curR][curC] = null;
             nBoard[mr][mc] = null;
             
             let promoted = false;
             let nPiece = piece;
             if (player === 'w' && jr === 0 && piece === 'w') { promoted = true; nPiece = 'W'; }
             if (player === 'b' && jr === 7 && piece === 'b') { promoted = true; nPiece = 'B'; }
             nBoard[jr][jc] = nPiece;
             
             const step = { from: {r: curR, c: curC}, to: {r: jr, c: jc}, cap: {r: mr, c: mc} };
             const nPath = [...currentPath, step];
             
             if (promoted) {
                turns.push({ board: nBoard, path: nPath });
             } else {
                exploreJumps(nBoard, jr, jc, nPath);
             }
          }
       }
    }
    if (!hasFurtherJump && currentPath.length > 0) {
       turns.push({ board: curBoard, path: currentPath });
    }
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.toLowerCase() === player) {
         exploreJumps(board, r, c, []);
      }
    }
  }
  
  if (turns.length > 0) return turns;
  
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.toLowerCase() === player) {
         const dirs = getDirections(p);
         for(let d of dirs) {
            const sr = r + d.dr, sc = c + d.dc;
            if (isValidSq(sr, sc) && board[sr][sc] === null) {
               const nBoard = cloneBoard(board);
               nBoard[r][c] = null;
               
               let promoted = false;
               let nPiece = p;
               if (player === 'w' && sr === 0 && p === 'w') { promoted = true; nPiece = 'W'; }
               if (player === 'b' && sr === 7 && p === 'b') { promoted = true; nPiece = 'B'; }
               nBoard[sr][sc] = nPiece;
               
               turns.push({ board: nBoard, path: [{ type: 'move', from: {r,c}, to: {r: sr, c: sc} }] });
            }
         }
      }
    }
  }
  return turns;
}

function evaluateBoard(board, botPlayer) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        const isBot = p.toLowerCase() === botPlayer;
        const val = (p === p.toUpperCase()) ? 3 : 1;
        let posBonus = 0;
        if (p === 'w') posBonus = (7 - r) * 0.1;
        if (p === 'b') posBonus = r * 0.1;
        const pieceScore = val + posBonus;
        score += isBot ? pieceScore : -pieceScore;
      }
    }
  }
  return score;
}

function minimax(board, depth, alpha, beta, maximizingPlayer, botPlayer) {
  const curPlayer = maximizingPlayer ? botPlayer : (botPlayer === 'w' ? 'b' : 'w');
  const turns = getAllLegalTurns(board, curPlayer);
  
  if (depth === 0 || turns.length === 0) {
    if (turns.length === 0) {
      return maximizingPlayer ? -1000 : 1000;
    }
    return evaluateBoard(board, botPlayer);
  }
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (let t of turns) {
      const ev = minimax(t.board, depth - 1, alpha, beta, false, botPlayer);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let t of turns) {
      const ev = minimax(t.board, depth - 1, alpha, beta, true, botPlayer);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestTurn(board, botPlayer, depth) {
  const turns = getAllLegalTurns(board, botPlayer);
  if (turns.length === 0) return null;
  if (turns.length === 1) return turns[0];
  
  let bestEval = -Infinity;
  let bestTurns = [];
  
  for (let t of turns) {
    const ev = minimax(t.board, depth - 1, -Infinity, Infinity, false, botPlayer);
    if (ev > bestEval) {
      bestEval = ev;
      bestTurns = [t];
    } else if (ev === bestEval) {
      bestTurns.push(t);
    }
  }
  return bestTurns[Math.floor(Math.random() * bestTurns.length)];
}

// --- COMPONENT ---

const DEFAULT_DIFFICULTY = 'tier_easy'
const DIFFICULTY_PROFILES = {
  tier_easy: { label: 'Beginner (Easy)', searchDepth: 2 },
  tier_medium: { label: 'Intermediate (Medium)', searchDepth: 4 },
  tier_hard: { label: 'Advanced (Hard)', searchDepth: 6 },
}

export default function CheckersCoachModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isGameStarted, setIsGameStarted] = useState(false)
  
  // Game Setup
  const [selectedColor, setSelectedColor] = useState('white') // white plays first usually, but standard checkers is black/red
  const [botDifficulty, setBotDifficulty] = useState(DEFAULT_DIFFICULTY)
  
  // Game State
  const [board, setBoard] = useState(INITIAL_BOARD)
  const [activeColor, setActiveColor] = useState('w') // Player's side
  const [turn, setTurn] = useState('w') // Current turn
  const [coachNote, setCoachNote] = useState('Welcome to Checkers. Set up your game.')
  const [isThinking, setIsThinking] = useState(false)
  const [gameStatusReason, setGameStatusReason] = useState(null)
  
  // Interaction State
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [lockedPiece, setLockedPiece] = useState(null) // for multi-jumps

  const moveTimeoutRef = useRef(null)

  const difficultyProfile = DIFFICULTY_PROFILES[botDifficulty]

  // Attach to window
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.CheckersCoachModal = { open: () => setIsOpen(true) }
    }
    return () => delete window.CheckersCoachModal
  }, [])

  // Lock scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => document.body.style.overflow = ''
  }, [isOpen])

  const startGame = useCallback((e) => {
    e.preventDefault()
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
    
    let color = selectedColor
    if (color === 'random') {
      color = Math.random() < 0.5 ? 'white' : 'black'
    }
    
    setActiveColor(color === 'white' ? 'w' : 'b')
    setBoard(cloneBoard(INITIAL_BOARD))
    setTurn('w')
    setLockedPiece(null)
    setSelectedSquare(null)
    setIsThinking(false)
    setGameStatusReason(null)
    setCoachNote(`Fresh board. ${difficultyProfile.label} mode is active.`)
    setIsGameStarted(true)
  }, [selectedColor, difficultyProfile.label])

  const resetGame = useCallback(() => {
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
    setIsGameStarted(false)
    setBoard(INITIAL_BOARD)
    setIsThinking(false)
  }, [])

  // Check for end of game
  useEffect(() => {
    if (!isGameStarted) return;
    const turns = getAllLegalTurns(board, turn);
    if (turns.length === 0) {
      setGameStatusReason(turn === activeColor ? 'loss' : 'win');
      setCoachNote(turn === activeColor ? 'Coach Dilrabo wins! You have no valid moves.' : 'You win! Coach Dilrabo has no valid moves.')
    }
  }, [board, turn, activeColor, isGameStarted])

  // Bot Turn Logic
  useEffect(() => {
    if (isGameStarted && turn !== activeColor && !gameStatusReason) {
      setIsThinking(true)
      const botPlayer = turn;
      
      const delayMs = Math.floor(Math.random() * 800) + 400
      moveTimeoutRef.current = setTimeout(() => {
        const bestTurn = getBestTurn(board, botPlayer, difficultyProfile.searchDepth)
        
        if (bestTurn) {
          setBoard(bestTurn.board)
          setTurn(botPlayer === 'w' ? 'b' : 'w')
          const isJump = bestTurn.path[0].cap !== undefined;
          setCoachNote(isJump ? `${difficultyProfile.label} jumped your piece.` : `${difficultyProfile.label} moved. Your turn.`)
        } else {
           setGameStatusReason('win')
        }
        setIsThinking(false)
      }, delayMs)
    }
  }, [turn, isGameStarted, activeColor, board, difficultyProfile, gameStatusReason])

  const handleSquareClick = (r, c) => {
    if (turn !== activeColor || isThinking || gameStatusReason) return;
    
    const steps = getLegalNextSteps(board, activeColor, lockedPiece);
    const piece = board[r][c];

    // If clicking on one of our own pieces, select it (if it has valid steps)
    if (piece && piece.toLowerCase() === activeColor && !lockedPiece) {
      if (steps.some(s => s.from.r === r && s.from.c === c)) {
        setSelectedSquare({r, c});
      } else {
        setSelectedSquare(null);
      }
      return;
    }

    // If a piece is selected, check if we clicked a valid destination
    if (selectedSquare) {
      const validStep = steps.find(s => 
        s.from.r === selectedSquare.r && 
        s.from.c === selectedSquare.c && 
        s.to.r === r && 
        s.to.c === c
      );

      if (validStep) {
        // Apply step
        const newBoard = cloneBoard(board);
        const p = newBoard[selectedSquare.r][selectedSquare.c];
        newBoard[selectedSquare.r][selectedSquare.c] = null;
        
        if (validStep.cap) {
          newBoard[validStep.cap.r][validStep.cap.c] = null;
        }

        let promoted = false;
        let nPiece = p;
        if (activeColor === 'w' && r === 0 && p === 'w') { promoted = true; nPiece = 'W'; }
        if (activeColor === 'b' && r === 7 && p === 'b') { promoted = true; nPiece = 'B'; }
        
        newBoard[r][c] = nPiece;
        setBoard(newBoard);

        // Check continuation
        if (validStep.type === 'jump' && !promoted) {
          const furtherSteps = getLegalNextSteps(newBoard, activeColor, {r, c});
          if (furtherSteps.length > 0 && furtherSteps[0].type === 'jump') {
            setLockedPiece({r, c});
            setSelectedSquare({r, c});
            setCoachNote("You must continue jumping!");
            return;
          }
        }

        // Turn ends
        setLockedPiece(null);
        setSelectedSquare(null);
        setTurn(activeColor === 'w' ? 'b' : 'w');
      }
    }
  }

  // --- Rendering Helpers ---
  const renderSquare = (r, c) => {
    // Determine visual orientation (player at bottom)
    const visualR = activeColor === 'b' ? 7 - r : r;
    const visualC = activeColor === 'b' ? 7 - c : c;
    
    const isDark = (visualR + visualC) % 2 === 1;
    const piece = board[visualR][visualC];
    
    // Check if this square is highlighted
    let isSelected = false;
    let isTarget = false;
    if (selectedSquare && selectedSquare.r === visualR && selectedSquare.c === visualC) isSelected = true;
    
    if (selectedSquare) {
      const steps = getLegalNextSteps(board, activeColor, lockedPiece);
      isTarget = steps.some(s => s.from.r === selectedSquare.r && s.from.c === selectedSquare.c && s.to.r === visualR && s.to.c === visualC);
    }

    const sqStyle = {
      backgroundColor: isDark ? '#1e2a44' : '#f6f0e8',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      cursor: (isTarget || (piece && piece.toLowerCase() === activeColor && !lockedPiece)) ? 'pointer' : 'default',
    }
    
    if (isSelected) sqStyle.backgroundColor = '#a23e48'; // Highlight selected
    else if (isTarget) {
       // Highlight potential move
       sqStyle.boxShadow = 'inset 0 0 0 4px rgba(162, 62, 72, 0.4)';
    }

    return (
      <div 
        key={`${r}-${c}`} 
        style={sqStyle}
        onClick={() => handleSquareClick(visualR, visualC)}
      >
        {piece && (
          <div style={{
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            backgroundColor: piece.toLowerCase() === 'w' ? '#f8fafc' : '#a23e48',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 -4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: piece.toLowerCase() === 'w' ? '#94a3b8' : '#fda4af',
            fontSize: 'clamp(1rem, 3vw, 1.5rem)'
          }}>
            {piece === piece.toUpperCase() && <i className="fa-solid fa-crown"></i>}
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="coach-modal">
      <button 
        type="button" 
        className="coach-modal__backdrop"
        onClick={() => setIsOpen(false)}
        aria-label="Close checkers coach modal"
      />
      <div className="coach-modal__panel">
        <header className="coach-modal__header">
          <img src={avatarImg} alt="Coach Dilrabo" className="coach-modal__avatar" />
          <div>
            <span className="coach-modal__eyebrow">Personal Checkers Coach</span>
            <h2 id="coach-modal-title">Play Against Coach Dilrabo</h2>
            <p>Practice against a smart opponent with a human-paced response.</p>
          </div>
          <button 
            type="button" 
            className="coach-modal__close" 
            onClick={() => setIsOpen(false)}
            aria-label="Close modal"
          >
            &times;
          </button>
        </header>

        <div className="coach-modal__content">
          <div className="coach-modal__board-wrap">
            {!isGameStarted ? (
              <form onSubmit={startGame} style={{ 
                background: '#fff', 
                padding: '2rem', 
                borderRadius: '1.35rem',
                border: '1px solid rgba(30, 42, 68, 0.1)',
                boxShadow: '0 12px 32px rgba(30, 42, 68, 0.06)'
              }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#1e2a44', fontSize: '1.4rem' }}>Setup Game</h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    I want to play as
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['white', 'random', 'black'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        style={{
                          flex: 1,
                          padding: '0.75rem 0',
                          border: `2px solid ${selectedColor === color ? '#a23e48' : 'rgba(30,42,68,0.1)'}`,
                          borderRadius: '0.75rem',
                          background: selectedColor === color ? 'rgba(162,62,72,0.05)' : '#fff',
                          color: selectedColor === color ? '#a23e48' : '#1e2a44',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Coach Difficulty
                  </label>
                  <select 
                    value={botDifficulty} 
                    onChange={e => setBotDifficulty(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      border: '1px solid rgba(30,42,68,0.16)',
                      borderRadius: '0.75rem',
                      background: '#f8fafc',
                      color: '#1e2a44',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    {Object.entries(DIFFICULTY_PROFILES).map(([key, profile]) => (
                      <option key={key} value={key}>{profile.label}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" style={{
                  width: '100%',
                  padding: '1rem',
                  background: '#a23e48',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(162,62,72,0.2)'
                }}>
                  Start Game
                </button>
              </form>
            ) : (
              <>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.4rem 0.75rem', background: turn !== activeColor ? '#a23e48' : '#e2e8f0',
                  color: turn !== activeColor ? '#fff' : '#475569', borderRadius: '0.5rem',
                  fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.4rem'
                }}>
                  <span>COACH DILRABO</span>
                </div>

                <div style={{ 
                  borderRadius: '1.35rem', 
                  overflow: 'hidden', 
                  border: '1px solid rgba(30, 42, 68, 0.14)', 
                  boxShadow: '0 18px 45px rgba(30, 42, 68, 0.14)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gridTemplateRows: 'repeat(8, 1fr)',
                  aspectRatio: '1 / 1',
                  width: '100%'
                }}>
                  {Array.from({ length: 64 }).map((_, i) => renderSquare(Math.floor(i / 8), i % 8))}
                </div>
                
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.4rem 0.75rem', background: turn === activeColor ? '#a23e48' : '#e2e8f0',
                  color: turn === activeColor ? '#fff' : '#475569', borderRadius: '0.5rem',
                  fontWeight: 'bold', fontSize: '1rem', marginTop: '0.4rem'
                }}>
                  <span>YOU</span>
                </div>
              </>
            )}
          </div>

          <aside className="coach-modal__sidebar">
            <div className="coach-modal__status" aria-live="polite">
              <span className="coach-modal__eyebrow">Status</span>
              <strong>
                {gameStatusReason === 'win' ? 'Coach Dilrabo wins!' :
                 gameStatusReason === 'loss' ? 'You win!' :
                 isThinking ? `${difficultyProfile.label} is studying the board...` :
                 turn === activeColor ? 'Your turn. Look for jumps.' : 
                 `${difficultyProfile.label} is ready to respond.`}
              </strong>
            </div>

            <div className="coach-modal__difficulty">
              <span className="coach-modal__eyebrow">Bot Personality</span>
              <strong>{difficultyProfile.label}</strong>
              <div className="coach-modal__settings">
                <dl>
                  <div>
                    <dt>Search</dt>
                    <dd>{difficultyProfile.searchDepth} ply</dd>
                  </div>
                  <div>
                    <dt>Rules</dt>
                    <dd>Mandatory Jumps</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="coach-modal__note">
              <span className="coach-modal__eyebrow">Coach Note</span>
              <p>{coachNote}</p>
            </div>
            
            <div className="coach-modal__actions">
              {isGameStarted && <button type="button" onClick={resetGame}>New game</button>}
              <button type="button" onClick={() => setIsOpen(false)}>Close</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('checkers-coach-root')

if (rootElement) {
  createRoot(rootElement).render(<CheckersCoachModal />)
}
