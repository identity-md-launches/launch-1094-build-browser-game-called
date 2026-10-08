import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  advance,
  flap,
  resizeGame,
  GROUND,
  GAP,
  RADIUS,
  PIPE_WIDTH,
} from "../src/game.ts";
import { readRecords, saveRecords, STORAGE_KEY } from "../src/storage.ts";

const playing = (width = 900) => {
  const game = createGame(width, () => 0.5);
  game.phase = "playing";
  return game;
};
test("a fresh flight is ready at zero, with a reachable first gap", () => {
  const game = createGame(320);
  assert.equal(game.phase, "ready");
  assert.equal(game.score, 0);
  assert.ok(game.pipes[0].x - game.x > 300);
  assert.ok(Math.abs(game.y - game.pipes[0].center) < GAP / 2 - RADIUS);
});
test("flapping supplies lift and gravity brings Pepe back down", () => {
  const game = playing();
  flap(game);
  const start = game.y;
  advance(game, 1 / 60);
  assert.ok(game.y < start);
  for (let i = 0; i < 30; i++) advance(game, 1 / 60);
  assert.ok(game.velocity > 0);
});
test("both world edges end the run", () => {
  for (const y of [RADIUS - 1, GROUND - RADIUS + 1]) {
    const game = playing();
    game.y = y;
    advance(game, 0);
    assert.equal(game.phase, "over");
    assert.equal(game.score, 0);
  }
});
test("pipe collision ends the run; the middle of the gap is safe", () => {
  for (const [offset, phase] of [
    [0, "playing"],
    [-GAP / 2, "over"],
    [GAP / 2, "over"],
  ]) {
    const game = playing();
    game.pipes = [{ x: game.x - 10, center: 220, scored: false }];
    game.y = 220 + offset;
    advance(game, 0);
    assert.equal(game.phase, phase);
  }
});
test("a cleared pipe earns exactly one point, including the trailing hitbox", () => {
  const game = playing();
  game.y = 220;
  game.pipes = [
    { x: game.x - PIPE_WIDTH - RADIUS + 1, center: 220, scored: false },
  ];
  advance(game, 0);
  assert.equal(game.score, 0);
  advance(game, 1 / 60);
  assert.equal(game.score, 1);
  advance(game, 1 / 60);
  assert.equal(game.score, 1);
});
test("ready, paused and ended games do not advance or accept a flap", () => {
  for (const phase of ["ready", "paused", "over"]) {
    const game = playing();
    game.phase = phase;
    const snapshot = structuredClone(game);
    advance(game, 1);
    flap(game);
    assert.deepEqual(game, snapshot);
  }
});
test("stalled frames are capped to prevent teleporting", () => {
  const a = playing();
  const b = structuredClone(a);
  advance(a, 40);
  advance(b, 1 / 30);
  assert.deepEqual(a, b);
});
test("resize preserves pipe distances and the current score", () => {
  const game = playing();
  game.score = 7;
  const gap = game.pipes[0].x - game.x;
  resizeGame(game, 320);
  assert.equal(game.width, 320);
  assert.equal(game.score, 7);
  assert.equal(game.pipes[0].x - game.x, gap);
});
test("a deterministic controller can clear ten pipes at mobile and desktop widths", () => {
  for (const width of [320, 1100]) {
    let seed = 13;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const game = createGame(width, random);
    game.phase = "playing";
    flap(game);
    for (
      let frame = 0;
      frame < 1800 && game.phase === "playing" && game.score < 10;
      frame++
    ) {
      const next = game.pipes.find(
        (pipe) => pipe.x + PIPE_WIDTH >= game.x - RADIUS,
      );
      if (next && game.y > next.center + 22 && game.velocity > 0) flap(game);
      advance(game, 1 / 60, random);
    }
    assert.equal(game.score, 10, `width ${width}, phase ${game.phase}`);
    assert.equal(game.phase, "playing");
  }
});
test("a replay is independent of the completed game", () => {
  const old = playing();
  old.phase = "over";
  old.score = 12;
  const game = createGame(old.width);
  assert.equal(game.score, 0);
  assert.equal(game.phase, "ready");
  assert.equal(old.score, 12);
});
test("records round trip and persist the sound preference", () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key),
    setItem: (key, value) => data.set(key, value),
  };
  const records = { best: 12, runs: 24, sound: true };
  assert.equal(saveRecords(storage, records), true);
  assert.deepEqual(readRecords(storage), records);
  assert.ok(data.has(STORAGE_KEY));
});
test("invalid or unavailable storage cannot prevent play", () => {
  const defaults = { best: 0, runs: 0, sound: false };
  for (const raw of [
    "{broken",
    "null",
    '{"best":-1,"runs":"4","sound":"yes"}',
    '{"best":1e99,"runs":0.5}',
  ]) {
    assert.deepEqual(readRecords({ getItem: () => raw }), defaults);
  }
  assert.deepEqual(
    readRecords({
      getItem: () => {
        throw new Error("denied");
      },
    }),
    defaults,
  );
  assert.equal(
    saveRecords(
      {
        setItem: () => {
          throw new Error("quota");
        },
      },
      defaults,
    ),
    false,
  );
});
