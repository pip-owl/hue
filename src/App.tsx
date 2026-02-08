import { useState, useEffect, useMemo } from 'react'
import './App.css'

interface Guess {
  r: number
  g: number
  b: number
  delta: number
}

function getDailyColor(): { r: number; g: number; b: number } {
  const today = new Date().toDateString()
  let hash = 0
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i)
    hash = hash & hash
  }
  const r = Math.abs(hash % 256)
  const g = Math.abs((hash >> 8) % 256)
  const b = Math.abs((hash >> 16) % 256)
  return { r, g, b }
}

function calculateDelta(guess: { r: number; g: number; b: number }, target: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(guess.r - target.r, 2) +
    Math.pow(guess.g - target.g, 2) +
    Math.pow(guess.b - target.b, 2)
  )
}

function getHint(guess: { r: number; g: number; b: number }, target: { r: number; g: number; b: number }): string {
  const hints: string[] = []
  if (guess.r < target.r) hints.push('+red')
  else if (guess.r > target.r) hints.push('-red')
  if (guess.g < target.g) hints.push('+green')
  else if (guess.g > target.g) hints.push('-green')
  if (guess.b < target.b) hints.push('+blue')
  else if (guess.b > target.b) hints.push('-blue')
  return hints.length > 0 ? hints.join(' ') : 'Perfect!'
}

function getTileClass(delta: number): string {
  if (delta === 0) return 'correct'
  if (delta < 40) return 'close'
  return 'far'
}

export default function App() {
  const target = useMemo(() => getDailyColor(), [])
  const [r, setR] = useState(128)
  const [g, setG] = useState(128)
  const [b, setB] = useState(128)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [showTarget, setShowTarget] = useState(true)
  const [hardMode, setHardMode] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (hardMode && guesses.length === 0) {
      const timer = setTimeout(() => setShowTarget(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [hardMode, guesses.length])

  const handleGuess = () => {
    if (gameOver) return
    const guess = { r, g, b }
    const delta = calculateDelta(guess, target)
    const newGuesses = [...guesses, { ...guess, delta }]
    setGuesses(newGuesses)

    if (delta === 0) {
      setWon(true)
      setGameOver(true)
      setShowTarget(true)
    } else if (newGuesses.length >= 5) {
      setGameOver(true)
      setShowTarget(true)
    }
  }

  const handleShare = () => {
    const dayNum = Math.floor(Date.now() / 86400000) % 1000
    let grid = ''
    for (let i = 0; i < 5; i++) {
      if (i < guesses.length) {
        const d = guesses[i].delta
        if (d === 0) grid += '🟩'
        else if (d < 40) grid += '🟨'
        else grid += '⬛'
      } else {
        grid += '⬜'
      }
    }
    const text = `HUE #${dayNum} ${won ? guesses.length : 'X'}/5\n${grid}`
    navigator.clipboard.writeText(text)
    setToast('Copied to clipboard!')
    setTimeout(() => setToast(''), 2000)
  }

  const currentDelta = calculateDelta({ r, g, b }, target)
  const hint = getHint({ r, g, b }, target)

  // Generate empty rows for the grid
  const emptyRows = 5 - guesses.length - (gameOver ? 0 : 1)

  return (
    <div className="app">
      <header>
        <div>
          <h1>HUE</h1>
        </div>
        <button 
          className={`hard-mode-btn ${hardMode ? 'active' : ''}`}
          onClick={() => {
            if (guesses.length === 0) {
              setHardMode(!hardMode)
              if (!hardMode) setShowTarget(true)
            }
          }}
          disabled={guesses.length > 0}
        >
          HARD
        </button>
      </header>

      <div className="game-container">
        {/* Target Color Display */}
        <div className="target-display">
          <p>Target</p>
          <div 
            className={`target-color-box ${!showTarget && !gameOver ? 'hidden' : ''}`}
            style={{
              backgroundColor: showTarget || gameOver
                ? `rgb(${target.r}, ${target.g}, ${target.b})`
                : undefined
            }}
          >
            {!showTarget && !gameOver && '?'}
          </div>
        </div>

        {/* Previous Guesses Grid */}
        {guesses.length > 0 && (
          <div className="guesses-container">
            {guesses.map((g, i) => (
              <div key={i} className="guess-row">
                <div className={`guess-tile ${getTileClass(g.delta)}`}>
                  <div 
                    className="color-preview"
                    style={{ backgroundColor: `rgb(${g.r}, ${g.g}, ${g.b})` }}
                  />
                </div>
                <div className="guess-tile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{Math.round(g.delta)}</span>
                </div>
                <div className="guess-tile" style={{ fontSize: '10px' }}>
                  <div>R{g.r}</div>
                  <div>G{g.g}</div>
                  <div>B{g.b}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Guess Preview */}
        {!gameOver && (
          <div className="current-guess">
            <div className="current-tile">
              <div 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: `rgb(${r}, ${g}, ${b})`,
                  borderRadius: '2px'
                }} 
              />
            </div>
            <div className="current-tile">
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{Math.round(currentDelta)}</span>
            </div>
            <div className="current-tile" style={{ fontSize: '10px' }}>
              <div>R{r}</div>
              <div>G{g}</div>
              <div>B{b}</div>
            </div>
          </div>
        )}

        {/* Empty placeholder rows */}
        {!gameOver && Array.from({ length: emptyRows }).map((_, i) => (
          <div key={`empty-${i}`} className="guess-row" style={{ opacity: 0.3 }}>
            <div className="guess-tile"></div>
            <div className="guess-tile"></div>
            <div className="guess-tile"></div>
          </div>
        ))}

        {/* Controls */}
        {!gameOver && (
          <>
            <div className="controls">
              <div className="slider-group">
                <div className="slider-label">
                  <span style={{ color: '#ff6b6b' }}>RED</span>
                  <span>{r}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={r}
                  onChange={(e) => setR(Number(e.target.value))}
                  className="slider red"
                />
              </div>
              <div className="slider-group">
                <div className="slider-label">
                  <span style={{ color: '#4ade80' }}>GREEN</span>
                  <span>{g}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={g}
                  onChange={(e) => setG(Number(e.target.value))}
                  className="slider green"
                />
              </div>
              <div className="slider-group">
                <div className="slider-label">
                  <span style={{ color: '#60a5fa' }}>BLUE</span>
                  <span>{b}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={b}
                  onChange={(e) => setB(Number(e.target.value))}
                  className="slider blue"
                />
              </div>
            </div>

            <div className="hint">
              <p>{hint}</p>
            </div>

            <button onClick={handleGuess} className="guess-btn">
              {guesses.length === 0 ? 'Enter' : `Guess ${guesses.length + 1}/5`}
            </button>
          </>
        )}
      </div>

      {/* Result Modal */}
      {gameOver && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{won ? '🎉 Splendid!' : '😅 So close!'}</h2>
            <div 
              className="target-reveal"
              style={{ backgroundColor: `rgb(${target.r}, ${target.g}, ${target.b})` }}
            />
            <p>
              {won 
                ? `You got it in ${guesses.length} guess${guesses.length > 1 ? 'es' : ''}!` 
                : `The color was RGB(${target.r}, ${target.g}, ${target.b})`
              }
            </p>
            <button onClick={handleShare} className="share-btn">
              Share
            </button>
            <p style={{ fontSize: '12px', color: '#565758' }}>
              Next HUE at midnight UTC
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
