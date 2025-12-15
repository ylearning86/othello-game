class AudioManager {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  private playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.2) {
    frequencies.forEach(freq => this.playTone(freq, duration, type, volume));
  }

  placePiece() {
    this.playTone(440, 0.1, 'sine', 0.25);
  }

  flipPieces(count: number) {
    const baseFreq = 523.25;
    const interval = 30;
    
    for (let i = 0; i < Math.min(count, 8); i++) {
      setTimeout(() => {
        this.playTone(baseFreq + (i * 50), 0.08, 'triangle', 0.15);
      }, i * interval);
    }
  }

  gameOver(isWin: boolean) {
    if (isWin) {
      const melody = [523.25, 659.25, 783.99, 1046.50];
      melody.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.3, 'sine', 0.2);
        }, i * 150);
      });
    } else {
      this.playChord([261.63, 329.63, 392.00], 0.6, 'sine', 0.15);
    }
  }

  newGame() {
    this.playChord([392.00, 493.88, 587.33], 0.2, 'sine', 0.2);
  }

  invalidMove() {
    this.playTone(200, 0.1, 'square', 0.15);
  }
}

export const audioManager = new AudioManager();
