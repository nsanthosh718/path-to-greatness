import confetti from "canvas-confetti";

const KID_COLORS = ["#f472b6", "#38bdf8", "#fbbf24", "#4ade80", "#a78bfa"];

/** Small confetti pop at a screen pixel coordinate — e.g. where a kid tapped a chore. */
export function burstAt(clientX: number, clientY: number) {
  confetti({
    particleCount: 40,
    spread: 55,
    startVelocity: 28,
    gravity: 1.1,
    scalar: 0.9,
    colors: KID_COLORS,
    origin: {
      x: clientX / window.innerWidth,
      y: clientY / window.innerHeight,
    },
  });
}

/** Big celebration — both bottom corners — for "all chores done" or a reward redemption. */
export function bigCelebration() {
  const duration = 1400;
  const end = Date.now() + duration;

  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 65, origin: { x: 0, y: 1 }, colors: KID_COLORS });
    confetti({ particleCount: 6, angle: 120, spread: 65, origin: { x: 1, y: 1 }, colors: KID_COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  confetti({
    particleCount: 90,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.3 },
    colors: KID_COLORS,
  });
}
