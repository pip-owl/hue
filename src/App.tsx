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
  if (guess.r < target.r) hints.push('more red')
  else if (guess.r > target.r) hints.push('less red')
  if (guess.g < target.g) hints.push('more green')
  else if (guess.g > target.g) hints.push('less green')
  if (guess.b < target.b) hints.push('more blue')
  else if (guess.b > target.b) hints.push('less blue')
  return hints.length > 0 ? hints.join(', ') : 'perfect!'
}

function getEmoji(delta: number): string {
  if (delta === 0) return '🟩'
  if (delta < 30) return '🟨'
  if (delta < 80) return '🟧'
  return '⬛'
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

  useEffect(() => {
    if (hardMode) {
      const timer = setTimeout(() => setShowTarget(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [hardMode])

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
    const grid = guesses.map(g => getEmoji(g.delta)).join('')
    const text = `HUE #${dayNum} ${won ? guesses.length : 'X'}/5\n${grid}\n`
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const currentDelta = calculateDelta({ r, g, b }, target)
  const hint = getHint({ r, g, b }, target)

  return (
    <div className="app">
      <header>
        <h1>HUE</h1>
        <p>Guess the daily color</p>
        <label className="hard-mode">
          <input
            type="checkbox"
            checked={hardMode}
            onChange={(e) => {
              setHardMode(e.target.checked)
              if (e.target.checked) setShowTarget(true)
            }}
            disabled={guesses.length > 0}
          />
          Hard mode (3s peek)
        </label>
      </header>

      <div className="game">
        <div className="target-section">
          <p>Target Color</p>
          <div
            className="color-box target"
            style={{
              backgroundColor: showTarget || gameOver
                ? `rgb(${target.r}, ${target.g}, ${target.b})`
                : '#333'
            }}
          >
            {!showTarget && !gameOver && '?'}
          </div>
          {gameOver && (
            <p className="target-values">
              RGB({target.r}, {target.g}, {target.b})
            </p>
          )}
        </div>

        <div className="guess-section">
          <p>Your Guess</p>
          <div
            className="color-box guess"
            style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
          />
          <p className="guess-values">RGB({r}, {g}, {b})</p>
        </div>

        <div className="sliders">
          <div className="slider-group">
            <label style={{ color: '#ff4444' }}>R {r}</label>
            <input
              type="range"
              min="0"
              max="255"
              value={r}
              onChange={(e) => setR(Number(e.target.value))}
              disabled={gameOver}
              className="slider red"
            />
          </div>
          <div className="slider-group">
            <label style={{ color: '#44ff44' }}>G {g}</label>
            <input
              type="range"
              min="0"
              max="255"
              value={g}
              onChange={(e) => setG(Number(e.target.value))}
              disabled={gameOver}
              className="slider green"
            />
          </div>
          <div className="slider-group">
            <label style={{ color: '#4444ff' }}>B {b}</label>
            <input
              type="range"
              min="0"
              max="255"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              disabled={gameOver}
              className="slider blue"
            />
          </div>
        </div>

        {!gameOver && (
          <div className="hint">
            <p>Hint: {hint}</p>
            <p className="delta">Distance: {Math.round(currentDelta)}</p>
          </div>
        )}

        <button
          onClick={handleGuess}
          disabled={gameOver}
          className="guess-btn"
        >
          {guesses.length === 0 ? 'Make Guess' : `Guess ${guesses.length + 1}/5`}
        </button>

        {guesses.length > 0 && (
          <div className="history">
            <p>Previous Guesses</p>
            {guesses.map((g, i) => (
              <div key={i} className="guess-row">
                <span
                  className="mini-color"
                  style={{ backgroundColor: `rgb(${g.r}, ${g.g}, ${g.b})` }}
                />
                <span className="guess-text">
                  RGB({g.r}, {g.g}, {g.b}) {getEmoji(g.delta)} {Math.round(g.delta)}
                </span>
              </div>
            ))}
          </div>
        )}

        {gameOver && (
          <div className="result">
            {won ? (
              <h2>🎉 You got it in {guesses.length + 1}!</h2>
            ) : (
              <h2>😅 The color was RGB({target.r}, {target.g}, {target.b})</h2>
            )}
            <button onClick={handleShare} className="share-btn">
              Share Results
            </button>
            <p className="new-game">New color at midnight UTC</p>
          </div>
        )}
      </div>
    </div>
  )
}
