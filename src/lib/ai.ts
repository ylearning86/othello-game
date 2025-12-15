import type { Board, Player, GameState } from './othello';
import { getValidMoves, getFlippedPieces, countPieces } from './othello';

export type Difficulty = 'easy' | 'medium' | 'hard';

const CORNER_POSITIONS: [number, number][] = [
  [0, 0], [0, 7], [7, 0], [7, 7]
];

const EDGE_POSITIONS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6],
  [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
  [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]
];

const DANGER_POSITIONS: [number, number][] = [
  [0, 1], [1, 0], [1, 1],
  [0, 6], [1, 6], [1, 7],
  [6, 0], [6, 1], [7, 1],
  [6, 6], [6, 7], [7, 6]
];

function evaluatePosition(board: Board, player: Player): number {
  const opponent: Player = player === 'black' ? 'white' : 'black';
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      if (cell === player) {
        if (CORNER_POSITIONS.some(([r, c]) => r === row && c === col)) {
          score += 100;
        } else if (DANGER_POSITIONS.some(([r, c]) => r === row && c === col)) {
          score -= 20;
        } else if (EDGE_POSITIONS.some(([r, c]) => r === row && c === col)) {
          score += 10;
        } else {
          score += 1;
        }
      } else if (cell === opponent) {
        if (CORNER_POSITIONS.some(([r, c]) => r === row && c === col)) {
          score -= 100;
        } else if (DANGER_POSITIONS.some(([r, c]) => r === row && c === col)) {
          score += 20;
        } else if (EDGE_POSITIONS.some(([r, c]) => r === row && c === col)) {
          score -= 10;
        } else {
          score -= 1;
        }
      }
    }
  }

  const playerMoves = getValidMoves(board, player).length;
  const opponentMoves = getValidMoves(board, opponent).length;
  score += (playerMoves - opponentMoves) * 5;

  return score;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  player: Player
): number {
  const opponent: Player = player === 'black' ? 'white' : 'black';
  
  if (depth === 0) {
    return evaluatePosition(board, player);
  }

  const currentPlayer = maximizingPlayer ? player : opponent;
  const moves = getValidMoves(board, currentPlayer);

  if (moves.length === 0) {
    const otherPlayerMoves = getValidMoves(board, maximizingPlayer ? opponent : player);
    if (otherPlayerMoves.length === 0) {
      const { black, white } = countPieces(board);
      const score = player === 'black' ? black - white : white - black;
      return score * 1000;
    }
    return minimax(board, depth - 1, alpha, beta, !maximizingPlayer, player);
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const [row, col] of moves) {
      const newBoard = applyMove(board, row, col, currentPlayer);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, player);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const [row, col] of moves) {
      const newBoard = applyMove(board, row, col, currentPlayer);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, player);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function applyMove(board: Board, row: number, col: number, player: Player): Board {
  const newBoard = board.map(row => [...row]);
  const flipped = getFlippedPieces(board, row, col, player);
  
  newBoard[row][col] = player;
  for (const [r, c] of flipped) {
    newBoard[r][c] = player;
  }
  
  return newBoard;
}

function getEasyMove(validMoves: [number, number][]): [number, number] {
  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

function getMediumMove(
  board: Board,
  validMoves: [number, number][],
  player: Player
): [number, number] {
  for (const [row, col] of validMoves) {
    if (CORNER_POSITIONS.some(([r, c]) => r === row && c === col)) {
      return [row, col];
    }
  }

  const safeMoves = validMoves.filter(
    ([row, col]) => !DANGER_POSITIONS.some(([r, c]) => r === row && c === col)
  );

  if (safeMoves.length > 0) {
    let bestMove = safeMoves[0];
    let maxFlips = getFlippedPieces(board, safeMoves[0][0], safeMoves[0][1], player).length;

    for (const [row, col] of safeMoves) {
      const flips = getFlippedPieces(board, row, col, player).length;
      if (flips > maxFlips) {
        maxFlips = flips;
        bestMove = [row, col];
      }
    }
    return bestMove;
  }

  return validMoves[0];
}

function getHardMove(
  board: Board,
  validMoves: [number, number][],
  player: Player
): [number, number] {
  for (const [row, col] of validMoves) {
    if (CORNER_POSITIONS.some(([r, c]) => r === row && c === col)) {
      return [row, col];
    }
  }

  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  for (const [row, col] of validMoves) {
    const newBoard = applyMove(board, row, col, player);
    const score = minimax(newBoard, 4, -Infinity, Infinity, false, player);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = [row, col];
    }
  }

  return bestMove;
}

export function getAIMove(
  state: GameState,
  difficulty: Difficulty
): [number, number] | null {
  const validMoves = getValidMoves(state.board, state.currentPlayer);
  
  if (validMoves.length === 0) return null;

  switch (difficulty) {
    case 'easy':
      return getEasyMove(validMoves);
    case 'medium':
      return getMediumMove(state.board, validMoves, state.currentPlayer);
    case 'hard':
      return getHardMove(state.board, validMoves, state.currentPlayer);
  }
}
