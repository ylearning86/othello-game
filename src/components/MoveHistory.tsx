import { ScrollArea } from './ui/scroll-area';
import { Circle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import type { Move } from '@/lib/othello';

interface MoveHistoryProps {
  moves: Move[];
  currentMoveIndex: number;
  onMoveClick: (index: number) => void;
  isReplayMode: boolean;
}

export function MoveHistory({ moves, currentMoveIndex, onMoveClick, isReplayMode }: MoveHistoryProps) {
  if (moves.length === 0) return null;

  const formatPosition = (row: number, col: number): string => {
    const columns = 'ABCDEFGH';
    return `${columns[col]}${row + 1}`;
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-medium">Move History</h2>
      <ScrollArea className="h-[280px] rounded-md border border-border p-3">
        <div className="space-y-1">
          {moves.map((move, index) => {
            const isActive = isReplayMode && index === currentMoveIndex;
            const isPast = isReplayMode && index < currentMoveIndex;
            const isFuture = isReplayMode && index > currentMoveIndex;
            
            return (
              <motion.button
                key={index}
                onClick={() => isReplayMode && onMoveClick(index)}
                disabled={!isReplayMode}
                className={`
                  w-full flex items-center justify-between p-2 rounded transition-all
                  ${isReplayMode ? 'cursor-pointer hover:bg-accent' : 'cursor-default'}
                  ${isActive ? 'bg-primary text-primary-foreground' : ''}
                  ${isPast ? 'opacity-60' : ''}
                  ${isFuture ? 'opacity-40' : ''}
                  ${!isReplayMode ? 'opacity-100' : ''}
                `}
                whileHover={isReplayMode ? { x: 4 } : {}}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-8 text-left">
                    {index + 1}.
                  </span>
                  <Circle
                    weight="fill"
                    size={16}
                    style={{
                      color: move.player === 'black' 
                        ? 'oklch(0.15 0 0)' 
                        : 'oklch(0.95 0 0)'
                    }}
                  />
                  <span className="font-medium">
                    {formatPosition(move.row, move.col)}
                  </span>
                  {move.flippedCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      +{move.flippedCount}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(move.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
