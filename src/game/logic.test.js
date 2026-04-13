import { describe, expect, it } from 'vitest'
import {
  createInitialState,
  queueDirection,
  spawnFood,
  stepGame,
} from './logic'

describe('snake logic', () => {
  it('moves one cell in the current direction', () => {
    const state = createInitialState(() => 0)

    const next = stepGame(state, () => 0)

    expect(next.snake[0]).toEqual({ x: 9, y: 8 })
    expect(next.snake).toHaveLength(3)
  })

  it('ignores reverse direction input', () => {
    const state = createInitialState(() => 0)

    const queued = queueDirection(state, 'left')

    expect(queued.queuedDirection).toBeNull()
  })

  it('grows and increments score after eating food', () => {
    const state = {
      snake: [
        { x: 4, y: 4 },
        { x: 3, y: 4 },
        { x: 2, y: 4 },
      ],
      direction: 'right',
      queuedDirection: null,
      food: { x: 5, y: 4 },
      score: 0,
      status: 'running',
    }

    const next = stepGame(state, () => 0)

    expect(next.snake[0]).toEqual({ x: 5, y: 4 })
    expect(next.snake).toHaveLength(4)
    expect(next.score).toBe(1)
    expect(next.food).not.toEqual({ x: 5, y: 4 })
  })

  it('ends the game when hitting a wall', () => {
    const state = {
      snake: [
        { x: 15, y: 5 },
        { x: 14, y: 5 },
        { x: 13, y: 5 },
      ],
      direction: 'right',
      queuedDirection: null,
      food: { x: 0, y: 0 },
      score: 3,
      status: 'running',
    }

    const next = stepGame(state, () => 0)

    expect(next.status).toBe('gameOver')
  })

  it('ends the game when colliding with itself', () => {
    const state = {
      snake: [
        { x: 4, y: 4 },
        { x: 5, y: 4 },
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
        { x: 3, y: 4 },
      ],
      direction: 'down',
      queuedDirection: 'right',
      food: { x: 0, y: 0 },
      score: 0,
      status: 'running',
    }

    const next = stepGame(state, () => 0)

    expect(next.status).toBe('gameOver')
  })

  it('spawns food only on empty cells', () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]

    const food = spawnFood(snake, { width: 3, height: 2 }, () => 0)

    expect(food).toEqual({ x: 0, y: 1 })
  })

  it('returns null when no food cells remain', () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]

    const food = spawnFood(snake, { width: 2, height: 2 }, () => 0)

    expect(food).toBeNull()
  })
})
