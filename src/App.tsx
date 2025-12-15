import { useState, useEffect } from 'react';
import { BoardCell } from './components/BoardCell';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { ArrowClockwise, Circle, User, Robot } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKV } from '@github/spark/hooks';
import {
  createInitialState,
  makeMove,
  getValidMoves,
  getFlippedPieces,
  type GameState,
} from './lib/othello';
import { audioManager } from './lib/sounds';
import { getAIMove, type Difficulty } from './lib/ai';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';

type GameMode = 'pvp' | 'pve';

function App() {
  const [gameState, setGameState] = useKV<GameState>('othello-game', createInitialState());
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [gameMode, setGameMode] = useKV<GameMode>('othello-mode', 'pvp');
  const [difficulty, setDifficulty] = useKV<Difficulty>('othello-difficulty', 'medium');
  const [isAIThinking, setIsAIThinking] = useState(false);

  const currentState = gameState || createInitialState();
  const isAITurn = gameMode === 'pve' && currentState.currentPlayer === 'white' && !currentState.gameOver;

  useEffect(() => {
    setValidMoves(getValidMoves(currentState.board, currentState.currentPlayer));
  }, [currentState]);

  useEffect(() => {
    if (isAITurn && !isAIThinking) {
      setIsAIThinking(true);
      const currentDifficulty = difficulty || 'medium';
      const thinkingTime = currentDifficulty === 'easy' ? 300 : currentDifficulty === 'medium' ? 600 : 900;
      
      setTimeout(() => {
        const aiMove = getAIMove(currentState, currentDifficulty);
        if (aiMove) {
          const [row, col] = aiMove;
          handleMove(row, col);
        }
        setIsAIThinking(false);
      }, thinkingTime);
    }
  }, [isAITurn, isAIThinking, currentState, difficulty]);

  const handleMove = (row: number, col: number) => {
    const flippedCount = getFlippedPieces(currentState.board, row, col, currentState.currentPlayer).length;
    
    audioManager.placePiece();
    
    if (flippedCount > 0) {
      setTimeout(() => {
        audioManager.flipPieces(flippedCount);
      }, 100);
    }

    setLastMove([row, col]);
    const newState = makeMove(currentState, row, col);
    setGameState(newState);

    if (newState.gameOver) {
      setTimeout(() => {
        const playerWon = newState.winner === 'black' || newState.winner === 'white';
        audioManager.gameOver(playerWon);
      }, 300 + (flippedCount * 30));
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (isAITurn || isAIThinking) return;
    
    const isValid = validMoves.some(([r, c]) => r === row && c === col);
    if (!isValid || currentState.gameOver) {
      if (!currentState.gameOver) {
        audioManager.invalidMove();
      }
      return;
    }

    handleMove(row, col);
  };

  const handleReset = () => {
    audioManager.newGame();
    setGameState(createInitialState());
    setLastMove(null);
    setIsAIThinking(false);
  };

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    handleReset();
  };

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
  };

  const isValidCell = (row: number, col: number) =>
    validMoves.some(([r, c]) => r === row && c === col);

  const isNewPiece = (row: number, col: number) =>
    lastMove !== null && lastMove[0] === row && lastMove[1] === col;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-center mb-8 tracking-tight">
            Othello
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
          <Card className="p-6 md:p-8">
            <div
              className="grid grid-cols-8 gap-1 w-full max-w-[500px] mx-auto"
              style={{
                aspectRatio: '1/1',
                background: 'oklch(0.3 0.08 155)',
                padding: '12px',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                opacity: isAIThinking ? 0.7 : 1,
                pointerEvents: isAIThinking ? 'none' : 'auto',
                transition: 'opacity 0.3s'
              }}
            >
              {currentState.board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <BoardCell
                    key={`${rowIndex}-${colIndex}`}
                    cell={cell}
                    isValid={isValidCell(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    isNew={isNewPiece(rowIndex, colIndex)}
                  />
                ))
              )}
            </div>
            {isAIThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-4 text-muted-foreground flex items-center justify-center gap-2"
              >
                <Robot size={20} weight="fill" className="animate-pulse" />
                <span>AI is thinking...</span>
              </motion.div>
            )}
          </Card>

          <Card className="p-6 space-y-6 md:w-64">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-medium mb-3">Game Mode</h2>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={gameMode === 'pvp' ? 'default' : 'outline'}
                    onClick={() => handleModeChange('pvp')}
                    className="w-full"
                  >
                    <User className="mr-2" size={16} />
                    vs Player
                  </Button>
                  <Button
                    variant={gameMode === 'pve' ? 'default' : 'outline'}
                    onClick={() => handleModeChange('pve')}
                    className="w-full"
                  >
                    <Robot className="mr-2" size={16} />
                    vs AI
                  </Button>
                </div>
              </div>

              {gameMode === 'pve' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h2 className="text-xl font-medium mb-3">Difficulty</h2>
                  <Select value={difficulty || 'medium'} onValueChange={(value) => handleDifficultyChange(value as Difficulty)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              )}

              <div>
                <h2 className="text-xl font-medium mb-3">Current Turn</h2>
                <Badge
                  variant="outline"
                  className="text-base px-4 py-2 w-full justify-center"
                  style={{
                    backgroundColor: currentState.currentPlayer === 'black' 
                      ? 'oklch(0.15 0 0)' 
                      : 'oklch(0.95 0 0)',
                    color: currentState.currentPlayer === 'black' 
                      ? 'oklch(0.98 0 0)' 
                      : 'oklch(0.15 0 0)',
                    borderColor: 'oklch(0.65 0.15 75)',
                    borderWidth: '2px'
                  }}
                >
                  <Circle weight="fill" className="mr-2" />
                  {currentState.currentPlayer === 'black' ? 'Black' : 'White'}
                  {gameMode === 'pve' && currentState.currentPlayer === 'white' && ' (AI)'}
                </Badge>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-3">Score</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'oklch(0.15 0 0)' }}>
                    <div className="flex items-center gap-2">
                      <Circle weight="fill" className="text-white" />
                      <span className="font-medium text-white">
                        Black
                        {gameMode === 'pve' && ' (You)'}
                      </span>
                    </div>
                    <motion.span
                      key={currentState.blackScore}
                      initial={{ scale: 1.5, color: 'oklch(0.65 0.15 75)' }}
                      animate={{ scale: 1, color: 'oklch(0.98 0 0)' }}
                      className="text-xl font-bold text-white"
                    >
                      {currentState.blackScore}
                    </motion.span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'oklch(0.95 0 0)' }}>
                    <div className="flex items-center gap-2">
                      <Circle weight="fill" className="text-black" />
                      <span className="font-medium text-black">
                        White
                        {gameMode === 'pve' && ' (AI)'}
                      </span>
                    </div>
                    <motion.span
                      key={currentState.whiteScore}
                      initial={{ scale: 1.5, color: 'oklch(0.65 0.15 75)' }}
                      animate={{ scale: 1, color: 'oklch(0.15 0 0)' }}
                      className="text-xl font-bold text-black"
                    >
                      {currentState.whiteScore}
                    </motion.span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {currentState.gameOver && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-4 rounded-lg text-center"
                    style={{
                      backgroundColor: 'oklch(0.65 0.15 75)',
                      color: 'oklch(0.2 0 0)'
                    }}
                  >
                    <h3 className="font-bold text-lg mb-1">Game Over!</h3>
                    <p className="text-sm">
                      {currentState.winner === 'tie'
                        ? "It's a tie!"
                        : `${currentState.winner === 'black' ? 'Black' : 'White'} wins!`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleReset}
                className="w-full"
                size="lg"
              >
                <ArrowClockwise className="mr-2" size={20} />
                New Game
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;