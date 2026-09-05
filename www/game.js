const arena = document.querySelector('#arena');
const target = document.querySelector('#target');
const panel = document.querySelector('#startPanel');
const startButton = document.querySelector('#startButton');
const backButton = document.querySelector('#backButton');
const soundButton = document.querySelector('#soundButton');
const shopButton = document.querySelector('#shopButton'), shopPanel = document.querySelector('#shopPanel'), closeShopButton = document.querySelector('#closeShopButton'), shopGrid = document.querySelector('#shopGrid');
const scoreEl = document.querySelector('#score');
const timeEl = document.querySelector('#time');
const accuracyEl = document.querySelector('#accuracy');
const bestEl = document.querySelector('#best');
const coinsEl = document.querySelector('#coins');
const flash = document.querySelector('#flash');
const difficultyPicker = document.querySelector('#difficultyPicker');
const difficultyButtons = document.querySelectorAll('.difficulty-button');
const installHint = document.querySelector('#installHint');

let score = 0, shots = 0, hits = 0, time = 30, playing = false, timer, moveTimer, endTime;
let soundOn = true;
let level = 'easy';
let audioContext;
const levels = {
  easy: { startSize: 104, minSize: 70, interval: 1350, minInterval: 850, points: 10 },
  hard: { startSize: 82, minSize: 48, interval: 760, minInterval: 380, points: 20 },
  impossible: { startSize: 68, minSize: 40, interval: 590, minInterval: 300, points: 35 }
};
let best = Number(localStorage.getItem('targetRushBest')) || 0;
let coins = Number(localStorage.getItem('targetRushCoins')) || 0;
let ownedTargets = JSON.parse(localStorage.getItem('targetRushOwned') || '["classic"]');
let equippedTarget = localStorage.getItem('targetRushEquipped') || 'classic';
const targetPalettes = [
  ['classic','Classic Rush',0,'#ff4778','#350716'],
  ['ocean','Ocean Blue',150,'#247cff','#061d52'],['bubblegum','Bubblegum',150,'#ff72c6','#55103c'],
  ['ice','Ice Beam',200,'#55e7ff','#063b48'],['violet','Ultra Violet',200,'#a875ff','#271052'],
  ['lime','Laser Lime',150,'#c7ff4a','#304500'],['sunset','Sunset Orange',150,'#ff8a3d','#5a1c00'],
  ['ruby','Ruby Red',200,'#ff334f','#52000c'],['gold','Gold Rush',200,'#ffd84a','#544000'],
  ['mint','Mint Flash',150,'#55ffc2','#064634'],['coral','Coral Pop',150,'#ff776c','#511510'],
  ['indigo','Indigo Ink',200,'#5d5cff','#111054'],['aqua','Aqua Pulse',200,'#31ffd7','#004b42'],
  ['peach','Peach Punch',150,'#ffad82','#542615'],['lemon','Lemon Zap',150,'#f5ff52','#464900'],
  ['magenta','Mega Magenta',200,'#ff39dd','#530047'],['sky','Sky High',200,'#65bfff','#0c3452'],
  ['emerald','Emerald',150,'#25e688','#07472c'],['lavender','Lavender',150,'#c29cff','#352053'],
  ['fire','Fireball',200,'#ff542e','#571000'],['plasma','Plasma',200,'#d448ff','#3b0750'],
  ['turquoise','Turquoise',150,'#34d9cd','#07443f'],['rose','Electric Rose',150,'#ff5e9f','#55122f'],
  ['cobalt','Cobalt',200,'#356eff','#071c54'],['amber','Amber Glow',200,'#ffb52e','#533200'],
  ['jade','Jade Strike',150,'#43d17f','#0c4125'],['lilac','Lilac Dream',150,'#df82ff','#471456'],
  ['crimson','Crimson Heat',200,'#df2948','#4c0612'],['neon','Neon Yellow',200,'#eaff19','#414800'],
  ['lagoon','Blue Lagoon',150,'#24b7db','#073a49'],['salmon','Salmon Spark',150,'#ff806e','#501a13'],
  ['royal','Royal Purple',200,'#8454e8','#26104d'],['tangerine','Tangerine',200,'#ff7824','#552000'],
  ['spring','Spring Green',150,'#85f06a','#1c4812'],['orchid','Orchid',150,'#e55dcc','#4f0d43'],
  ['navy','Night Blue',200,'#4267b9','#0b1939'],['copper','Copper',200,'#d77b45','#47200b'],
  ['seafoam','Seafoam',150,'#75e6c5','#16473b'],['cherry','Cherry Bomb',150,'#f04470','#4d0920'],
  ['electric','Electric Blue',200,'#00aaff','#003651'],['grape','Grape Soda',200,'#aa55ee','#33104c'],
  ['apple','Green Apple',150,'#7ee12f','#214700'],['flamingo','Flamingo',150,'#ff8bb8','#501b31'],
  ['arctic','Arctic White',200,'#d8f7ff','#24505b'],['midnight','Midnight Glow',200,'#6370ff','#121748'],
  ['dragonfruit','Dragon Fruit',150,'#ff3f91','#57102f'],['moonlight','Moonlight',150,'#b9c8ff','#293357'],
  ['toxic','Toxic Green',200,'#9dff00','#2d4c00'],['blueberry','Blueberry',200,'#5353d9','#151542'],
  ['mango','Mango Blast',150,'#ffbd39','#563500'],['watermelon','Watermelon',150,'#ff526c','#0b4a32'],
  ['hologram','Hologram',200,'#66ffe3','#4c1760'],['meteor','Meteor',200,'#ff6438','#34125b'],
  ['candy','Cotton Candy',150,'#ff9fdb','#32698a'],['storm','Storm Cloud',150,'#8294ad','#253143'],
  ['phoenix','Phoenix',200,'#ff3b19','#ffd23f'],['alien','Alien Glow',200,'#6dff5a','#2c0752'],
  ['deepsea','Deep Sea',150,'#087dbd','#032b47'],['raspberry','Raspberry',150,'#e8297d','#490b2c'],
  ['prism','Prism Finale',200,'#7fffd4','#ff3cac']
];
const targetStyles = targetPalettes.map(([id,name,price,color,core]) => ({id,name,price,color,core}));
bestEl.textContent = best;
coinsEl.textContent = coins;
function applyTargetStyle(){ const s=targetStyles.find(x=>x.id===equippedTarget)||targetStyles[0]; target.style.setProperty('--target-color',s.color); target.style.setProperty('--target-core',s.core); }
function saveShop(){ localStorage.setItem('targetRushCoins',coins); localStorage.setItem('targetRushOwned',JSON.stringify(ownedTargets)); localStorage.setItem('targetRushEquipped',equippedTarget); coinsEl.textContent=coins; }
function renderShop(){ shopGrid.innerHTML=targetStyles.map(item=>{ const owned=ownedTargets.includes(item.id), equipped=equippedTarget===item.id; return `<button class="target-card ${equipped?'equipped':''}" data-target-id="${item.id}" ${!owned&&coins<item.price?'disabled':''}><span class="target-preview" style="--preview-color:${item.color};--preview-core:${item.core}"><i></i><i></i><i></i></span><strong>${item.name}</strong><small>${equipped?'Equipped':owned?'Equip':item.price+' coins'}</small></button>`; }).join(''); }
function openShop(){ if(playing)return; panel.hidden=true; shopPanel.hidden=false; renderShop(); }
function closeShop(){ shopPanel.hidden=true; panel.hidden=false; }

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
  endTime = Date.now() + time * 1000;
  panel.hidden = true; target.hidden = false; backButton.hidden = false;
  updateStats(); moveTarget();
  timer = setInterval(() => {
    time = Math.max(0, Math.ceil((endTime - Date.now()) / 1000)); updateStats();
    if (time <= 0) endGame();
  }, 250);
}

function endGame() {
  playing = false; clearInterval(timer); clearTimeout(moveTimer); target.hidden = true;
  backButton.hidden = true;
  if (score > best) { best = score; localStorage.setItem('targetRushBest', best); }
  bestEl.textContent = best;
  coins += score; saveShop();
  document.querySelector('#panelTitle').textContent = `Final score: ${score}`;
  document.querySelector('#panelText').textContent = `${hits} hits • ${accuracyEl.textContent} accuracy • +${score} coins`;
  difficultyPicker.hidden = false;
  startButton.textContent = 'Play Again'; panel.hidden = false; beep(180, .2);
}

function returnToLevelPicker() {
  playing = false; clearInterval(timer); clearTimeout(moveTimer);
  target.hidden = true; backButton.hidden = true;
  document.querySelector('#panelTitle').textContent = 'Choose another level.';
  document.querySelector('#panelText').textContent = 'Pick a difficulty when you are ready to play again.';
  difficultyPicker.hidden = false;
  startButton.textContent = 'Start Game'; panel.hidden = false;
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
shopButton.addEventListener('click', openShop);
closeShopButton.addEventListener('click', closeShop);
shopGrid.addEventListener('click', event => { const card=event.target.closest('[data-target-id]'); if(!card)return; const item=targetStyles.find(x=>x.id===card.dataset.targetId); if(!ownedTargets.includes(item.id)){ if(coins<item.price)return; coins-=item.price; ownedTargets.push(item.id); } equippedTarget=item.id; saveShop(); applyTargetStyle(); renderShop(); beep(620,.1); });
backButton.addEventListener('click', returnToLevelPicker);
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

// End cleanly if the deadline passes while a phone call or app switch hides the game.
document.addEventListener('visibilitychange', () => {
  if (playing && !document.hidden && Date.now() >= endTime) endGame();
});

// Home-screen launches hide Safari's address bar and feel like a normal app.
const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
if (standalone && installHint) installHint.textContent = 'Tap the target • 30 seconds • Good luck!';

// Stop iOS Safari from treating fast play gestures as page scrolling/zooming.
arena.addEventListener('touchmove', event => event.preventDefault(), { passive: false });
applyTargetStyle();

