export type Player = 'black' | 'white';
export type Cell = Player | null;
export type Board = Cell[][];

export interface Move {
  row: number;
  col: number;
  player: Player;
  timestamp: number;
  flippedCount: number;
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  blackScore: number;
  whiteScore: number;
  gameOver: boolean;
  winner: Player | 'tie' | null;
  moveHistory: Move[];
}

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';
  return board;
}

export function createInitialState(): GameState {
  const board = createInitialBoard();
  return {
    board,
    currentPlayer: 'black',
    blackScore: 2,
    whiteScore: 2,
    gameOver: false,
    winner: null,
    moveHistory: []
  };
}

function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function getFlippedPieces(
  board: Board,
  row: number,
  col: number,
  player: Player
): [number, number][] {
  if (board[row][col] !== null) return [];

  const opponent: Player = player === 'black' ? 'white' : 'black';
  const flipped: [number, number][] = [];

  for (const [dx, dy] of DIRECTIONS) {
    const tempFlipped: [number, number][] = [];
    let r = row + dx;
    let c = col + dy;

    while (isValidPosition(r, c) && board[r][c] === opponent) {
      tempFlipped.push([r, c]);
      r += dx;
      c += dy;
    }

    if (isValidPosition(r, c) && board[r][c] === player && tempFlipped.length > 0) {
      flipped.push(...tempFlipped);
    }
  }

  return flipped;
}

export function isValidMove(board: Board, row: number, col: number, player: Player): boolean {
  return getFlippedPieces(board, row, col, player).length > 0;
}

export function getValidMoves(board: Board, player: Player): [number, number][] {
  const validMoves: [number, number][] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isValidMove(board, row, col, player)) {
        validMoves.push([row, col]);
      }
    }
  }
  return validMoves;
}

export function makeMove(state: GameState, row: number, col: number): GameState {
  const flipped = getFlippedPieces(state.board, row, col, state.currentPlayer);
  
  if (flipped.length === 0) return state;

  const newBoard = state.board.map(row => [...row]);
  newBoard[row][col] = state.currentPlayer;
  
  for (const [r, c] of flipped) {
    newBoard[r][c] = state.currentPlayer;
  }

  const nextPlayer: Player = state.currentPlayer === 'black' ? 'white' : 'black';
  
  const hasNextPlayerMoves = getValidMoves(newBoard, nextPlayer).length > 0;
  const hasCurrentPlayerMoves = getValidMoves(newBoard, state.currentPlayer).length > 0;
  
  let finalPlayer = nextPlayer;
  if (!hasNextPlayerMoves && hasCurrentPlayerMoves) {
    finalPlayer = state.currentPlayer;
  }
  
  const gameOver = !hasNextPlayerMoves && !hasCurrentPlayerMoves;
  
  const { black, white } = countPieces(newBoard);
  
  let winner: Player | 'tie' | null = null;
  if (gameOver) {
    if (black > white) winner = 'black';
    else if (white > black) winner = 'white';
    else winner = 'tie';
  }

  const move: Move = {
    row,
    col,
    player: state.currentPlayer,
    timestamp: Date.now(),
    flippedCount: flipped.length
  };

  return {
    board: newBoard,
    currentPlayer: finalPlayer,
    blackScore: black,
    whiteScore: white,
    gameOver,
    winner,
    moveHistory: [...state.moveHistory, move]
  };
}

export function replayMovesToIndex(moves: Move[], targetIndex: number): GameState {
  let state = createInitialState();
  
  for (let i = 0; i <= targetIndex && i < moves.length; i++) {
    const move = moves[i];
    state = makeMove(state, move.row, move.col);
  }
  
  return state;
}

export function countPieces(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === 'black') black++;
      if (board[row][col] === 'white') white++;
    }
  }
  
  return { black, white };
}
