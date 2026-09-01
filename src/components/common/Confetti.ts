import confetti from 'canvas-confetti';

export function triggerStreakConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#10b981', '#06b6d4', '#8b5cf6'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#f59e0b', '#ec4899', '#10b981'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export function triggerSubtlePop(x?: number, y?: number) {
  confetti({
    particleCount: 25,
    spread: 40,
    origin: x && y ? { x: x / window.innerWidth, y: y / window.innerHeight } : { y: 0.8 },
    colors: ['#10b981', '#34d399', '#6ee7b7'],
    startVelocity: 15,
    ticks: 40,
    zIndex: 9999,
  });
}
