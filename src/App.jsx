import { useEffect, useMemo, useState } from 'react'
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  CELL_COUNT,
  TICK_MS,
} from './game/constants'
import {
  createInitialState,
  isPaused,
  isRunning,
  queueDirection,
  stepGame,
} from './game/logic'

const KEY_TO_DIRECTION = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  a: 'left',
  A: 'left',
  s: 'down',
  S: 'down',
  d: 'right',
  D: 'right',
}

function App() {
  const [gameState, setGameState] = useState(() => createInitialState())

  useEffect(() => {
    const handleKeyDown = (event) => {
      const nextDirection = KEY_TO_DIRECTION[event.key]

      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault()
        setGameState((current) => {
          if (current.status === 'gameOver') {
            return createInitialState()
          }

          if (isPaused(current)) {
            return { ...current, status: 'running' }
          }

          return { ...current, status: 'paused' }
        })
        return
      }

      if (!nextDirection) {
        return
      }

      event.preventDefault()
      setGameState((current) => queueDirection(current, nextDirection))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!isRunning(gameState)) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setGameState((current) => stepGame(current))
    }, TICK_MS)

    return () => window.clearInterval(timer)
  }, [gameState.status])

  const occupiedCells = useMemo(() => {
    const cells = new Set(gameState.snake.map((segment) => `${segment.x}:${segment.y}`))
    return cells
  }, [gameState.snake])

  const statusText =
    gameState.status === 'gameOver'
      ? 'Game over'
      : gameState.status === 'paused'
        ? 'Paused'
        : 'Running'
  const pauseButtonLabel =
    gameState.status === 'gameOver'
      ? 'Restart'
      : isPaused(gameState)
        ? 'Resume'
        : 'Pause'

  return (
    <main className="app-shell">
      <section className="game-card" aria-label="Classic Snake game">
        <header className="game-header">
          <div>
            <p className="eyebrow">Classic Snake</p>
            <h1>Keep moving, keep growing.</h1>
          </div>
          <div className="score-panel" aria-live="polite">
            <span>Score</span>
            <strong>{gameState.score}</strong>
          </div>
        </header>

        <div className="toolbar">
          <span className={`status-chip status-${gameState.status}`}>{statusText}</span>
          <div className="toolbar-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setGameState((current) =>
                  current.status === 'gameOver'
                    ? createInitialState()
                    : {
                        ...current,
                        status: isPaused(current) ? 'running' : 'paused',
                      },
                )
              }
            >
              {pauseButtonLabel}
            </button>
            <button type="button" className="primary-button" onClick={() => setGameState(createInitialState())}>
              Restart
            </button>
          </div>
        </div>

        {gameState.status === 'gameOver' ? (
          <p className="message-banner">
            {gameState.food === null ? 'Board cleared. Restart to play again.' : 'The snake crashed. Restart to play again.'}
          </p>
        ) : null}

        <div
          className="board"
          role="img"
          aria-label={`Snake board ${BOARD_WIDTH} by ${BOARD_HEIGHT}. Status ${statusText}.`}
          style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}
        >
          {Array.from({ length: CELL_COUNT }, (_, index) => {
            const x = index % BOARD_WIDTH
            const y = Math.floor(index / BOARD_WIDTH)
            const key = `${x}:${y}`
            const isFood = gameState.food && gameState.food.x === x && gameState.food.y === y
            const isHead = gameState.snake[0].x === x && gameState.snake[0].y === y
            const isBody = occupiedCells.has(key)

            let className = 'cell'
            if (isBody) {
              className += isHead ? ' snake-head' : ' snake-body'
            }
            if (isFood) {
              className += ' food'
            }

            return <div key={key} className={className} />
          })}
        </div>

        <div className="controls">
          <button type="button" onClick={() => setGameState((current) => queueDirection(current, 'up'))}>
            Up
          </button>
          <div className="controls-row">
            <button type="button" onClick={() => setGameState((current) => queueDirection(current, 'left'))}>
              Left
            </button>
            <button type="button" onClick={() => setGameState((current) => queueDirection(current, 'down'))}>
              Down
            </button>
            <button type="button" onClick={() => setGameState((current) => queueDirection(current, 'right'))}>
              Right
            </button>
          </div>
        </div>

        <p className="help-text">
          Use arrow keys or WASD to steer. Press space to pause or resume.
        </p>
      </section>
    </main>
  )
}

export default App
