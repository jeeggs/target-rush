const arena = document.querySelector('#arena');
const target = document.querySelector('#target');
const panel = document.querySelector('#startPanel');
const startButton = document.querySelector('#startButton');
const soundButton = document.querySelector('#soundButton');
const scoreEl = document.querySelector('#score');
const timeEl = document.querySelector('#time');
const accuracyEl = document.querySelector('#accuracy');
const bestEl = document.querySelector('#best');
const flash = document.querySelector('#flash');
const difficultyPicker = document.querySelector('#difficultyPicker');
const difficultyButtons = document.querySelectorAll('.difficulty-button');
const installHint = document.querySelector('#installHint');

let score = 0, shots = 0, hits = 0, time = 30, playing = false, timer, moveTimer;
let soundOn = true;
let level = 'easy';
let audioContext;
const levels = {
  easy: { startSize: 104, minSize: 70, interval: 1350, minInterval: 850, points: 10 },
  hard: { startSize: 82, minSize: 48, interval: 760, minInterval: 380, points: 20 },
  impossible: { startSize: 64, minSize: 34, interval: 390, minInterval: 170, points: 35 }
};
let best = Number(localStorage.getItem('targetRushBest')) || 0;
bestEl.textContent = best;

function beep(frequency, duration = .06) {
  if (!soundOn) return;
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = frequency > 300 ? 'square' : 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(.12, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
}

function updateStats() {
  scoreEl.textContent = score;
  timeEl.textContent = time;
  accuracyEl.textContent = shots ? `${Math.round(hits / shots * 100)}%` : '—';
}

function moveTarget() {
  if (!playing) return;
  const settings = levels[level];
  const size = Math.max(settings.minSize, settings.startSize - hits * 1.2);
  const pad = size / 2 + 8;
  const x = pad + Math.random() * (arena.clientWidth - pad * 2);
  const y = pad + Math.random() * (arena.clientHeight - pad * 2);
  target.style.width = `${size}px`;
  target.style.height = `${size}px`;
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
  target.style.animation = 'none';
  requestAnimationFrame(() => target.style.animation = 'arrive .14s ease-out');
  clearTimeout(moveTimer);
  moveTimer = setTimeout(moveTarget, Math.max(settings.minInterval, settings.interval - hits * 10));
}

function showPoints(text, x, y, miss = false) {
  flash.textContent = text;
  flash.style.left = `${x}px`; flash.style.top = `${y}px`;
  flash.style.color = miss ? '#ff446d' : '#55e7ff';
  flash.classList.remove('show');
  void flash.offsetWidth;
  flash.classList.add('show');
}

function startGame() {
  clearInterval(timer); clearTimeout(moveTimer);
  score = shots = hits = 0; time = 30; playing = true;
  panel.hidden = true; target.hidden = false;
  updateStats(); moveTarget();
  timer = setInterval(() => {
    time--; updateStats();
    if (time <= 0) endGame();
  }, 1000);
}

function endGame() {
  playing = false; clearInterval(timer); clearTimeout(moveTimer); target.hidden = true;
  if (score > best) { best = score; localStorage.setItem('targetRushBest', best); }
  bestEl.textContent = best;
  document.querySelector('#panelTitle').textContent = `Final score: ${score}`;
  document.querySelector('#panelText').textContent = `${hits} hits • ${accuracyEl.textContent} accuracy`;
  difficultyPicker.hidden = false;
  startButton.textContent = 'Play Again'; panel.hidden = false; beep(180, .2);
}

target.addEventListener('pointerdown', event => {
  event.stopPropagation();
  if (!playing) return;
  const points = levels[level].points;
  shots++; hits++; score += points; updateStats(); beep(720 + hits * 10, .09);
  if ('vibrate' in navigator) navigator.vibrate(18);
  const rect = arena.getBoundingClientRect();
  showPoints(`+${points}`, event.clientX - rect.left, event.clientY - rect.top);
  moveTarget();
});

arena.addEventListener('pointerdown', event => {
  if (!playing) return;
  shots++; score = Math.max(0, score - 1); updateStats(); beep(110);
  const rect = arena.getBoundingClientRect();
  showPoints('-1', event.clientX - rect.left, event.clientY - rect.top, true);
});

startButton.addEventListener('click', startGame);
difficultyButtons.forEach(button => button.addEventListener('click', () => {
  level = button.dataset.level;
  difficultyButtons.forEach(choice => choice.classList.toggle('selected', choice === button));
  beep(level === 'easy' ? 380 : level === 'hard' ? 520 : 680, .05);
}));
soundButton.addEventListener('click', () => {
  soundOn = !soundOn; soundButton.textContent = `Sound: ${soundOn ? 'On' : 'Off'}`;
});
document.addEventListener('keydown', event => {
  if (event.code === 'Space' && !playing) { event.preventDefault(); startGame(); }
});

document.addEventListener('contextmenu', event => event.preventDefault());

// Home-screen launches hide Safari's address bar and feel like a normal app.
const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
if (standalone && installHint) installHint.textContent = 'Tap the target • 30 seconds • Good luck!';

// Stop iOS Safari from treating fast play gestures as page scrolling/zooming.
arena.addEventListener('touchmove', event => event.preventDefault(), { passive: false });
