import { motion } from 'framer-motion';
import { GamePiece } from './GamePiece';
import type { Cell } from '@/lib/othello';

interface BoardCellProps {
  cell: Cell;
  isValid: boolean;
  onClick: () => void;
  isNew: boolean;
}

export function BoardCell({ cell, isValid, onClick, isNew }: BoardCellProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={!isValid}
      whileHover={isValid ? { scale: 1.05 } : {}}
      whileTap={isValid ? { scale: 0.95 } : {}}
      className="relative aspect-square rounded-sm transition-colors"
      style={{
        backgroundColor: 'oklch(0.45 0.08 155)',
        border: '1px solid oklch(0.95 0.02 85)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
      }}
    >
      {cell && (
        <div className="absolute inset-2">
          <GamePiece player={cell} isNew={isNew} />
        </div>
      )}
      
      {isValid && !cell && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: 'oklch(0.65 0.15 75)',
              boxShadow: '0 0 12px oklch(0.65 0.15 75 / 0.6)'
            }}
          />
        </motion.div>
      )}
    </motion.button>
  );
}
