import confetti from "canvas-confetti";

export function fireConfetti(): void {
  confetti({
    particleCount: 200,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#ff4d8f", "#e8003a", "#ffb3c6", "#d4af37", "#ffd700"],
  });
}
