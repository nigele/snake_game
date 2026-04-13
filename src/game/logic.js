import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DIRECTION_VECTORS,
  INITIAL_SNAKE,
  OPPOSITE_DIRECTIONS,
} from './constants'

export function spawnFood(snake, board = { width: BOARD_WIDTH, height: BOARD_HEIGHT }, rng = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.x}:${segment.y}`))
  const availableCells = []

  for (let y = 0; y < board.height; y += 1) {
    for (let x = 0; x < board.width; x += 1) {
      const key = `${x}:${y}`
      if (!occupied.has(key)) {
        availableCells.push({ x, y })
      }
    }
  }

  if (availableCells.length === 0) {
    return null
  }

  const index = Math.floor(rng() * availableCells.length)
  return availableCells[index]
}

export function createInitialState(rng = Math.random) {
  const snake = INITIAL_SNAKE.map((segment) => ({ ...segment }))

  return {
    snake,
    direction: 'right',
    queuedDirection: null,
    food: spawnFood(snake, undefined, rng),
    score: 0,
    status: 'running',
  }
}

export function queueDirection(state, nextDirection) {
  if (state.status === 'gameOver') {
    return state
  }

  if (!DIRECTION_VECTORS[nextDirection]) {
    return state
  }

  if (state.queuedDirection) {
    return state
  }

  if (OPPOSITE_DIRECTIONS[state.direction] === nextDirection) {
    return state
  }

  if (state.direction === nextDirection) {
    return state
  }

  return {
    ...state,
    queuedDirection: nextDirection,
  }
}

export function isOutOfBounds(position, board = { width: BOARD_WIDTH, height: BOARD_HEIGHT }) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= board.width ||
    position.y >= board.height
  )
}

export function isSelfCollision(head, snake) {
  return snake.some((segment) => segment.x === head.x && segment.y === head.y)
}

export function stepGame(state, rng = Math.random) {
  if (state.status !== 'running') {
    return state
  }

  const direction = state.queuedDirection ?? state.direction
  const vector = DIRECTION_VECTORS[direction]
  const nextHead = {
    x: state.snake[0].x + vector.x,
    y: state.snake[0].y + vector.y,
  }
  const ateFood = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y
  const nextSnake = ateFood
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)]

  if (isOutOfBounds(nextHead) || isSelfCollision(nextHead, nextSnake.slice(1))) {
    return {
      ...state,
      direction,
      queuedDirection: null,
      snake: nextSnake,
      status: 'gameOver',
    }
  }

  const nextFood = ateFood ? spawnFood(nextSnake, undefined, rng) : state.food

  return {
    ...state,
    snake: nextSnake,
    direction,
    queuedDirection: null,
    food: nextFood,
    score: ateFood ? state.score + 1 : state.score,
    status: ateFood && nextFood === null ? 'gameOver' : state.status,
  }
}

export function isRunning(state) {
  return state.status === 'running'
}

export function isPaused(state) {
  return state.status === 'paused'
}
