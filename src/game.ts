export const HEIGHT = 460;
export const GROUND = 414;
export const PIPE_WIDTH = 68;
export const GAP = 160;
export const RADIUS = 15;
export const SPEED = 148;
export const SPACING = 265;
export type Phase = "ready" | "playing" | "paused" | "over";
export type Pipe = { x: number; center: number; scored: boolean };
export type Game = {
  width: number;
  x: number;
  y: number;
  velocity: number;
  score: number;
  elapsed: number;
  phase: Phase;
  pipes: Pipe[];
};

export function createGame(
  width: number,
  random: () => number = Math.random,
): Game {
  const x = Math.min(width * 0.25, 240);
  const pipes = Array.from(
    { length: Math.ceil(width / SPACING) + 1 },
    (_, i) => ({
      x: x + 345 + i * SPACING,
      center: i === 0 ? 218 : 132 + random() * 145,
      scored: false,
    }),
  );
  return {
    width,
    x,
    y: 215,
    velocity: 0,
    score: 0,
    elapsed: 0,
    phase: "ready",
    pipes,
  };
}

export function flap(game: Game) {
  if (game.phase === "playing") game.velocity = -355;
}

export function advance(
  game: Game,
  delta: number,
  random: () => number = Math.random,
) {
  if (game.phase !== "playing") return;
  // Bound the step so a stalled/background frame cannot jump through a pipe.
  const dt = Math.min(Math.max(delta, 0), 1 / 30);
  game.elapsed += dt;
  game.velocity += 1080 * dt;
  game.y += game.velocity * dt;
  for (const pipe of game.pipes) pipe.x -= SPEED * dt;

  const hitEdge = game.y - RADIUS <= 0 || game.y + RADIUS >= GROUND;
  const hitPipe = game.pipes.some((pipe) => {
    const closestX = Math.max(pipe.x, Math.min(game.x, pipe.x + PIPE_WIDTH));
    const horizontal = Math.abs(game.x - closestX);
    if (horizontal >= RADIUS) return false;
    const reach = Math.sqrt(RADIUS ** 2 - horizontal ** 2);
    return (
      game.y - reach <= pipe.center - GAP / 2 ||
      game.y + reach >= pipe.center + GAP / 2
    );
  });
  if (hitEdge || hitPipe) {
    game.phase = "over";
    return;
  }
  for (const pipe of game.pipes) {
    if (!pipe.scored && pipe.x + PIPE_WIDTH < game.x - RADIUS) {
      pipe.scored = true;
      game.score += 1;
    }
  }
  game.pipes = game.pipes.filter((pipe) => pipe.x > -PIPE_WIDTH);
  const last = game.pipes.at(-1);
  if (!last || last.x < game.width + SPACING) {
    game.pipes.push({
      x: last ? last.x + SPACING : game.width + SPACING,
      center: 132 + random() * 145,
      scored: false,
    });
  }
}

export function resizeGame(game: Game, width: number) {
  const x = Math.min(width * 0.25, 240);
  const shift = x - game.x;
  game.pipes.forEach((pipe) => {
    pipe.x += shift;
  });
  game.x = x;
  game.width = width;
}
