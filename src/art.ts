import { GAP, GROUND, HEIGHT, PIPE_WIDTH, type Game } from "./game.ts";

// Original pixel drawing. The scene uses physical coordinates, independent of text direction.
export const palette = {
  sky: "#dcebdc",
  cloud: "#f6f8e9",
  cloudShade: "#cbdccb",
  farHill: "#c0d7b9",
  hill: "#aecb9c",
  nearHill: "#9dbd85",
  ground: "#e9e4bd",
  groundShade: "#d5d1a6",
  grass: "#729752",
  outline: "#36543b",
  pipe: "#91b46a",
  pipeLight: "#afcc86",
  pipeShade: "#779e55",
};
const sprite = [
  "   ddddd   ddddd   ",
  "  dgggggd dgggggd  ",
  "  dgwwwwdddwwwwgd  ",
  " ddgwwkkg gwwkkgdd ",
  "dgggwwkkgggwwkkgggd",
  "dgggggggggggggggggd",
  "dgglllggggggggggggd",
  "dgggggggggggggggggd",
  " dggddddddddddddgd ",
  " dgggmmmmmmmmmmgd  ",
  "  ddggggggggggdd   ",
  "    dddddddddd     ",
  "      dbbbbdd      ",
  "    ddbbbbbbbdd    ",
  "   ddbbbbbbbbbdd   ",
];
const colors: Record<string, string> = {
  d: "#2c4834",
  g: "#729d4d",
  l: "#96bb64",
  w: "#f8f4df",
  k: "#263d2a",
  m: "#b77d56",
  b: "#678aa0",
};
export function drawFrog(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle = 0,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const pixel = size / 19;
  sprite.forEach((row, rowIndex) =>
    [...row].forEach((cell, column) => {
      if (colors[cell]) {
        ctx.fillStyle = colors[cell];
        ctx.fillRect(
          (column - 9.5) * pixel,
          (rowIndex - 7.5) * pixel,
          pixel + 0.1,
          pixel + 0.1,
        );
      }
    }),
  );
  ctx.restore();
}

function cloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = palette.cloudShade;
  ctx.fillRect(0, 19, 96, 16);
  ctx.fillRect(12, 8, 67, 27);
  ctx.fillRect(27, -2, 31, 35);
  ctx.fillStyle = palette.cloud;
  ctx.fillRect(0, 16, 94, 14);
  ctx.fillRect(12, 5, 65, 25);
  ctx.fillRect(27, -5, 31, 35);
  ctx.restore();
}
function hill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color: string,
) {
  ctx.fillStyle = color;
  const step = width / 10;
  for (let i = 0; i < 10; i++) {
    const rise = Math.sin(((i + 0.5) / 10) * Math.PI) * (GROUND - y);
    ctx.fillRect(
      x + i * step,
      GROUND - Math.round(rise / 12) * 12,
      step + 1,
      HEIGHT,
    );
  }
}
function pipe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  top: boolean,
) {
  const capY = top ? y + height - 23 : y;
  ctx.fillStyle = palette.outline;
  ctx.fillRect(x, y, PIPE_WIDTH, height);
  ctx.fillStyle = palette.pipe;
  ctx.fillRect(x + 3, y, PIPE_WIDTH - 6, height);
  ctx.fillStyle = palette.pipeLight;
  ctx.fillRect(x + 7, y, 10, height);
  ctx.fillStyle = palette.pipeShade;
  ctx.fillRect(x + PIPE_WIDTH - 13, y, 10, height);
  ctx.fillStyle = palette.outline;
  ctx.fillRect(x - 5, capY, PIPE_WIDTH + 10, 23);
  ctx.fillStyle = palette.pipe;
  ctx.fillRect(x - 2, capY + 3, PIPE_WIDTH + 4, 17);
  ctx.fillStyle = palette.pipeLight;
  ctx.fillRect(x + 2, capY + 4, PIPE_WIDTH - 4, 5);
  ctx.fillStyle = palette.pipeShade;
  ctx.fillRect(x + PIPE_WIDTH - 10, capY + 9, 10, 10);
}
function sparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.fillStyle = "#b99c44";
  ctx.fillRect(x - size, y - 2, size * 2 + 4, 4);
  ctx.fillRect(x, y - size - 2, 4, size * 2 + 4);
}

export function render(
  ctx: CanvasRenderingContext2D,
  game: Game,
  reducedMotion: boolean,
) {
  const w = game.width;
  ctx.fillStyle = palette.sky;
  ctx.fillRect(0, 0, w, HEIGHT);
  const drift = reducedMotion ? 0 : game.elapsed * 5;
  for (let i = 0; i < Math.ceil(w / 330) + 1; i++) {
    cloud(
      ctx,
      ((((i * 330 + 75 - drift) % (w + 170)) + w + 170) % (w + 170)) - 80,
      i % 2 ? 118 : 65,
      i % 2 ? 0.67 : 1,
    );
  }
  for (let i = -1; i < Math.ceil(w / 280) + 1; i++)
    hill(ctx, i * 280, 287 - (i % 2) * 34, 350, palette.farHill);
  for (let i = -1; i < Math.ceil(w / 370) + 1; i++)
    hill(ctx, i * 370 + 70, 342 + (i % 2) * 15, 280, palette.hill);
  if (game.phase === "ready") {
    const x = w < 600 ? w - 41 : w - 116;
    pipe(ctx, x, 0, 129, true);
    pipe(ctx, x, 304, GROUND - 304, false);
    if (w > 600) {
      ctx.save();
      ctx.strokeStyle = "#94b491";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 7]);
      ctx.beginPath();
      ctx.moveTo(w * 0.13, 260);
      ctx.bezierCurveTo(w * 0.18, 165, w * 0.26, 335, w * 0.34, 184);
      ctx.stroke();
      ctx.restore();
      drawFrog(ctx, w * 0.235, 213, 87, -0.12);
      sparkle(ctx, w * 0.19, 152, 5);
      sparkle(ctx, w * 0.29, 267, 4);
    }
  } else {
    for (const p of game.pipes) {
      pipe(ctx, p.x, 0, p.center - GAP / 2, true);
      pipe(ctx, p.x, p.center + GAP / 2, GROUND - p.center - GAP / 2, false);
    }
    drawFrog(
      ctx,
      game.x,
      game.y,
      43,
      reducedMotion ? 0 : Math.max(-0.25, Math.min(0.85, game.velocity / 650)),
    );
  }
  ctx.fillStyle = palette.outline;
  ctx.fillRect(0, GROUND, w, 3);
  ctx.fillStyle = palette.grass;
  ctx.fillRect(0, GROUND + 3, w, 8);
  ctx.fillStyle = palette.ground;
  ctx.fillRect(0, GROUND + 11, w, HEIGHT - GROUND);
  ctx.fillStyle = palette.groundShade;
  for (let i = 0; i < w / 25; i++) {
    ctx.fillRect(i * 25 + 5, GROUND + 19, 7, 3);
    ctx.fillRect(i * 25 + 16, GROUND + 33, 4, 3);
  }
  ctx.fillStyle = palette.nearHill;
  for (const x of [32, w - 184]) {
    ctx.fillRect(x, GROUND - 12, 5, 12);
    ctx.fillRect(x - 6, GROUND - 7, 6, 3);
    ctx.fillRect(x + 5, GROUND - 10, 7, 3);
  }
}
