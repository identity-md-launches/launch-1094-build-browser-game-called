import "./style.css";
import { advance, createGame, flap, HEIGHT, resizeGame } from "./game.ts";
import { render } from "./art.ts";
import { readRecords, saveRecords } from "./storage.ts";

const icon = (name: string, className = "") => {
  const paths: Record<string, string> = {
    play: '<path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3h.01"/>',
    pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
    sound:
      '<path d="m11 5-6 4H2v6h3l6 4zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="m11 5-6 4H2v6h3l6 4zm5 4 6 6m0-6-6 6"/>',
    trophy:
      '<path d="M8 3h8v6a4 4 0 0 1-8 0zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 1v5m-4 3h8m-7-3h6"/>',
    jump: '<path d="M12 19V5m-5 5 5-5 5 5M5 19h14"/>',
    pipes: '<path d="M3 3h7v5H3zm1 5v5m5-5v5m5 3h7v5h-7zm1-3v3m5-3v3"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    repeat: '<path d="M4 11a8 8 0 1 1 2 6M4 5v6h6"/>',
  };
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? ""}</svg>`;
};

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <a class="skip-link" href="#game">Skip to game</a>
  <header class="site-header wrap">
    <a href="#" class="brand" aria-label="Flappy Pepe home"><img src="./frog.svg" alt="" width="38" height="38" /><span>flappy<span class="brand-light">pepe</span><span class="brand-dot">.</span></span></a>
    <div class="header-right"><span class="free-label"><span class="status-dot"></span> Free to play. Forever flappy.</span><button type="button" class="help-button" id="help">${icon("help")}<span>How to play</span></button></div>
  </header>
  <main class="wrap">
    <section class="hero" aria-labelledby="title">
      <p class="eyebrow"><span></span> A little game. A big leap.</p>
      <div class="title-row"><h1 id="title">Flappy <span>Pepe</span><svg class="title-spark" viewBox="0 0 42 48" aria-hidden="true"><path d="m8 25 12-6M25 7l-4 9m11 17-10-5" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></h1><span class="hero-note">feels good, man.<svg viewBox="0 0 65 32" aria-hidden="true"><path d="M60 3C43 31 14 28 3 12m0 0 1 13m-1-13 13 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span></div>
      <p class="hero-description">Small frog. Big dreams. Questionable flight skills.</p>
    </section>
    <section id="game" class="game-shell" aria-label="Flappy Pepe game" tabindex="-1">
      <div class="game-toolbar">
        <div class="stats"><div class="stat"><span class="stat-label">Score</span><strong id="score">00</strong></div><div class="stat best-stat"><span class="stat-label">${icon("trophy")} Personal best</span><strong id="best">00</strong></div><div class="stat runs-stat"><span class="stat-label">Flights</span><strong id="runs">00</strong></div></div>
        <div class="game-tools"><span class="mode-label"><span class="status-dot"></span> <span id="mode">Ready when you are</span></span><button type="button" id="sound" class="icon-button" aria-label="Sound" aria-pressed="false" title="Turn sound on">${icon("mute")}</button><button type="button" id="pause" class="icon-button" aria-label="Pause game" title="Pause game (P)" disabled>${icon("pause")}</button></div>
      </div>
      <div class="game-view" id="game-view">
        <canvas id="canvas" aria-hidden="true"></canvas>
        <button type="button" id="flap-control" class="flap-control" aria-label="Flap. Press Space, Arrow Up, or tap to fly. P or Escape to pause." disabled></button>
        <div id="overlay" class="game-overlay ready-overlay">
          <div class="overlay-content">
            <img class="mobile-frog" src="./frog.svg" alt="" width="66" height="66" />
            <span class="game-eyebrow" id="overlay-label">A fresh set of tiny wings</span>
            <h2 id="overlay-title">Ready to take a leap?</h2>
            <p id="overlay-description">Keep Pepe flying. Make it through the pipes.<br />Try not to get too attached.</p>
            <div id="results" class="results" hidden><div><span>Final score</span><strong id="final-score">0</strong></div><div><span>Personal best</span><strong id="final-best">0</strong></div></div>
            <button type="button" class="primary-button" id="start">${icon("play")}<span>Play now</span>${icon("arrow")}</button>
            <span class="play-caption" id="play-caption">No sign-up. Just one more try.</span>
          </div>
        </div>
        <span class="scene-caption" id="scene-caption" aria-hidden="true">PEPE'S FIRST FLIGHT CLUB</span>
      </div>
      <div class="game-bottom"><p class="controls-hint"><kbd>Space</kbd><span>or</span><kbd>↑</kbd><span class="desktop-hint">to flap</span><span class="hint-divider">/</span><span>Click or tap to fly</span></p><p class="bottom-note">Easy to play. Hard to put down.<span class="tiny-star" aria-hidden="true">✳</span></p></div>
    </section>
    <p class="sr-only" role="status" aria-live="polite" id="announcer"></p>
    <p class="storage-note" id="storage-note" hidden>Browser storage is unavailable. Your best and flights will last for this visit.</p>
    <section class="how-to" aria-label="Three tips for a better flight">
      <article class="tip"><div class="tip-icon">${icon("jump")}</div><div><h2><span>01</span> Find your rhythm</h2><p>Tap, click, or press Space. A little lift goes a long way.</p></div></article>
      <article class="tip"><div class="tip-icon">${icon("pipes")}</div><div><h2><span>02</span> Mind the gap</h2><p>Slip between the pipes. Each one cleared is one point.</p></div></article>
      <article class="tip"><div class="tip-icon">${icon("trophy")}</div><div><h2><span>03</span> One more try</h2><p>Chase your personal best. Great flights start with a few flops.</p></div></article>
    </section>
  </main>
  <footer class="site-footer wrap"><p>Made for the plot. Played for the score.</p><p><span class="footer-dot"></span> Stay green. Keep flapping.</p></footer>
  <dialog id="help-dialog" aria-labelledby="help-title"><div class="dialog-top"><span class="eyebrow">Flight school</span><button type="button" class="icon-button" id="close-help" aria-label="Close instructions">${icon("close")}</button></div><h2 id="help-title">A little lift. A little luck.</h2><p>Guide Pepe through the gaps. Clear a pipe to earn a point. Touch a pipe, the ground, or the top of the sky and your flight ends.</p><dl class="key-list"><div><dt>Flap</dt><dd><kbd>Space</kbd> <kbd>↑</kbd> or click / tap the game</dd></div><div><dt>Pause / resume</dt><dd><kbd>P</kbd> or <kbd>Esc</kbd></dd></div><div><dt>Start / replay</dt><dd>Select the green play button</dd></div></dl><p class="dialog-note">Your best score and completed flights stay in this browser. Sound starts off; switch it on with the speaker button.</p><button type="button" class="primary-button" id="got-it">Got it ${icon("arrow")}</button></dialog>
`;

function element<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}
const canvas = element<HTMLCanvasElement>("canvas");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("This browser does not support the game canvas.");
const context = ctx;
const view = element("game-view");
const overlay = element("overlay");
const startButton = element<HTMLButtonElement>("start");
const flapButton = element<HTMLButtonElement>("flap-control");
const pauseButton = element<HTMLButtonElement>("pause");
const soundButton = element<HTMLButtonElement>("sound");
const helpDialog = element<HTMLDialogElement>("help-dialog");
const media = window.matchMedia("(prefers-reduced-motion: reduce)");
const persistence = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
};
const records = readRecords(persistence);
let game = createGame(1000);
let audio: AudioContext | undefined;
let lastTime = 0;
let frame = 0;
let storageAvailable = true;

const format = (n: number) => String(n).padStart(2, "0");
function save() {
  storageAvailable = saveRecords(persistence, records);
  element("storage-note").hidden = storageAvailable;
}
function updateStats() {
  element("score").textContent = format(game.score);
  element("best").textContent = format(records.best);
  element("runs").textContent = format(records.runs);
}
function paint() {
  render(context, game, media.matches);
}
function sizeCanvas() {
  const bounds = view.getBoundingClientRect();
  const scale = bounds.height / HEIGHT;
  const width = bounds.width / scale;
  if (game.phase === "playing" && Math.abs(width - game.width) > 10) pause();
  resizeGame(game, width);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(bounds.width * dpr);
  canvas.height = Math.round(bounds.height * dpr);
  context.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  context.imageSmoothingEnabled = false;
  paint();
}
function unlockAudio() {
  if (!records.sound) return;
  try {
    audio ??= new AudioContext();
    void audio.resume().catch(() => {});
  } catch {
    /* Audio is optional; flight remains playable. */
  }
}
function tone(frequency: number, duration: number, finish = frequency) {
  if (!records.sound || !audio || audio.state !== "running") return;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    finish,
    audio.currentTime + duration,
  );
  gain.gain.setValueAtTime(0.035, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
}
function updateSound() {
  soundButton.setAttribute("aria-pressed", String(records.sound));
  soundButton.title = records.sound ? "Turn sound off" : "Turn sound on";
  soundButton.innerHTML = icon(records.sound ? "sound" : "mute");
}
function flightLoop(time: number) {
  if (game.phase !== "playing") return;
  const previousScore = game.score;
  advance(game, lastTime ? (time - lastTime) / 1000 : 1 / 60);
  lastTime = time;
  if (game.score !== previousScore) {
    updateStats();
    tone(660, 0.13, 880);
  }
  paint();
  // advance can change the phase to over.
  if ((game.phase as string) === "over") {
    finish();
    return;
  }
  frame = requestAnimationFrame(flightLoop);
}
function setPlaying() {
  overlay.hidden = true;
  element("scene-caption").hidden = true;
  flapButton.disabled = false;
  pauseButton.disabled = false;
  pauseButton.setAttribute("aria-label", "Pause game");
  pauseButton.title = "Pause game (P)";
  pauseButton.innerHTML = icon("pause");
  element("mode").textContent = "In the air";
  view.dataset.phase = "playing";
  flapButton.focus({ preventScroll: true });
  lastTime = 0;
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(flightLoop);
}
function start() {
  if (game.phase === "paused") {
    resume();
    return;
  }
  game = createGame(game.width);
  game.phase = "playing";
  flap(game);
  updateStats();
  unlockAudio();
  tone(400, 0.08, 600);
  setPlaying();
  element("announcer").textContent =
    "Flight started. Press Space or Arrow Up, click, or tap to flap. Press P to pause.";
}
function jump() {
  if (game.phase === "playing") {
    flap(game);
    tone(360, 0.07, 520);
  }
}
function pause() {
  if (game.phase !== "playing") return;
  game.phase = "paused";
  cancelAnimationFrame(frame);
  overlay.hidden = false;
  overlay.className = "game-overlay panel-overlay";
  element("overlay-label").textContent = "Take a breather";
  element("overlay-title").textContent = "Just hanging out.";
  element("overlay-description").textContent =
    "Your flight is right where you left it.";
  element("results").hidden = true;
  element("play-caption").textContent = "Press P or Escape to resume.";
  startButton.innerHTML = `${icon("play")}<span>Resume flight</span>${icon("arrow")}`;
  flapButton.disabled = true;
  pauseButton.setAttribute("aria-label", "Resume game");
  pauseButton.title = "Resume game (P)";
  pauseButton.innerHTML = icon("play");
  element("mode").textContent = "Taking a breather";
  view.dataset.phase = "paused";
  element("announcer").textContent = `Flight paused. Score ${game.score}.`;
  startButton.focus({ preventScroll: true });
  paint();
}
function resume() {
  if (game.phase !== "paused") return;
  game.phase = "playing";
  unlockAudio();
  setPlaying();
  element("announcer").textContent = "Flight resumed.";
}
function finish() {
  const newBest = game.score > records.best;
  records.best = Math.max(records.best, game.score);
  records.runs += 1;
  save();
  updateStats();
  tone(230, 0.25, 85);
  overlay.hidden = false;
  overlay.className = "game-overlay panel-overlay";
  element("overlay-label").textContent = newBest
    ? "A new personal best"
    : "A very respectable flop";
  element("overlay-title").textContent = newBest
    ? "Look at you fly."
    : "One more try?";
  element("overlay-description").textContent = game.score
    ? "Every flight has a landing. Some are just less graceful."
    : "A few little taps will keep you in the air. You’ve got this.";
  element("results").hidden = false;
  element("final-score").textContent = String(game.score);
  element("final-best").textContent = String(records.best);
  startButton.innerHTML = `${icon("repeat")}<span>Play again</span>${icon("arrow")}`;
  element("play-caption").textContent = newBest
    ? "Your best flight yet. Let’s see what’s next."
    : "Tiny wings. Unlimited second chances.";
  flapButton.disabled = true;
  pauseButton.disabled = true;
  element("mode").textContent = "Flight complete";
  view.dataset.phase = "over";
  element("announcer").textContent =
    `Flight complete. Final score ${game.score}. Personal best ${records.best}.${newBest ? " New personal best!" : ""}`;
  startButton.focus({ preventScroll: true });
}

startButton.addEventListener("click", start);
flapButton.addEventListener("pointerdown", (event) => {
  if (event.isPrimary && event.button === 0) {
    event.preventDefault();
    flapButton.focus({ preventScroll: true });
    jump();
  }
});
// Native keyboard activation produces a click with detail 0. Pointer activation is above.
flapButton.addEventListener("click", (event) => {
  if (event.detail === 0) jump();
});
pauseButton.addEventListener("click", () =>
  game.phase === "paused" ? resume() : pause(),
);
soundButton.addEventListener("click", () => {
  records.sound = !records.sound;
  updateSound();
  unlockAudio();
  tone(520, 0.08, 700);
  save();
});
element("help").addEventListener("click", () => {
  pause();
  helpDialog.showModal();
});
element("close-help").addEventListener("click", () => helpDialog.close());
element("got-it").addEventListener("click", () => helpDialog.close());
helpDialog.addEventListener("close", () => {
  element("help").focus({ preventScroll: true });
});
helpDialog.addEventListener("click", (event) => {
  if (event.target === helpDialog) {
    const rect = helpDialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      helpDialog.close();
  }
});
document.addEventListener("keydown", (event) => {
  if (
    helpDialog.open ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.repeat
  )
    return;
  if (
    (event.key.toLowerCase() === "p" || event.key === "Escape") &&
    (game.phase === "playing" || game.phase === "paused")
  ) {
    event.preventDefault();
    game.phase === "paused" ? resume() : pause();
  } else if (
    game.phase === "playing" &&
    (event.key === "ArrowUp" ||
      (event.code === "Space" && event.target === document.body))
  ) {
    event.preventDefault();
    jump();
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
media.addEventListener("change", paint);
new ResizeObserver(sizeCanvas).observe(view);
view.dataset.phase = "ready";
updateStats();
updateSound();
save();
sizeCanvas();
