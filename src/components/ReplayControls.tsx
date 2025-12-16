import { Button } from './ui/button';
import { Slider } from './ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  CaretLeft,
  CaretRight,
  ArrowCounterClockwise
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReplayControlsProps {
  isReplayMode: boolean;
  isPlaying: boolean;
  currentMoveIndex: number;
  totalMoves: number;
  onToggleReplay: () => void;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
  onSliderChange: (value: number[]) => void;
  disabled?: boolean;
}

export function ReplayControls({
  isReplayMode,
  isPlaying,
  currentMoveIndex,
  totalMoves,
  onToggleReplay,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onGoToStart,
  onGoToEnd,
  onSliderChange,
  disabled = false
}: ReplayControlsProps) {
  if (totalMoves === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">リプレイ</h2>
        <Button
          variant={isReplayMode ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleReplay}
          disabled={disabled}
        >
          <ArrowCounterClockwise className="mr-2" size={16} />
          {isReplayMode ? '終了' : '開始'}
        </Button>
      </div>

      <AnimatePresence>
        {isReplayMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{currentMoveIndex + 1}手目 / {totalMoves}手</span>
              </div>
              <Slider
                value={[currentMoveIndex]}
                onValueChange={onSliderChange}
                max={totalMoves - 1}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onGoToStart}
                disabled={currentMoveIndex === 0}
                title="最初へ"
              >
                <SkipBack size={20} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onStepBackward}
                disabled={currentMoveIndex === 0}
                title="前の手"
              >
                <CaretLeft size={20} />
              </Button>
              <Button
                variant="default"
                size="icon"
                onClick={onPlayPause}
                className="w-12 h-12"
                title={isPlaying ? '一時停止' : '再生'}
              >
                {isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onStepForward}
                disabled={currentMoveIndex >= totalMoves - 1}
                title="次の手"
              >
                <CaretRight size={20} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onGoToEnd}
                disabled={currentMoveIndex >= totalMoves - 1}
                title="最後へ"
              >
                <SkipForward size={20} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
