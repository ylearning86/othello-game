import { motion } from 'framer-motion';
import type { Player } from '@/lib/othello';

interface GamePieceProps {
  player: Player;
  isNew?: boolean;
}

export function GamePiece({ player, isNew = false }: GamePieceProps) {
  return (
    <motion.div
      initial={isNew ? { scale: 0, rotateY: 0 } : { rotateY: 0 }}
      animate={{ scale: 1, rotateY: player === 'black' ? 0 : 180 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="w-full h-full rounded-full relative"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backfaceVisibility: 'hidden',
          background: 'radial-gradient(circle at 35% 35%, oklch(0.25 0 0), oklch(0.1 0 0))',
          boxShadow: 'inset 0 -2px 4px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)'
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'radial-gradient(circle at 35% 35%, oklch(0.98 0 0), oklch(0.88 0 0))',
          boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.4)'
        }}
      />
    </motion.div>
  );
}
