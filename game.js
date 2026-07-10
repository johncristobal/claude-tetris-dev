'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const COLORS = [
  null,
  '#4dd0e1', // I - cyan
  '#ffd54f', // O - yellow
  '#ba68c8', // T - purple
  '#81c784', // S - green
  '#e57373', // Z - red
  '#90caf9', // J - pale blue
  '#ffb74d', // L - orange
];

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
];

const LINE_SCORES = [0, 100, 300, 500, 800];

const LEADERBOARD_KEY = 'tetris-leaderboard';
const STATS_KEY = 'tetris-stats';
const MAX_ENTRIES = 5;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('theme-toggle');
const leaderboardList = document.getElementById('leaderboard-list');
const bestComboEl = document.getElementById('best-combo');
const maxLinesEl = document.getElementById('max-lines');
const resetRecordsBtn = document.getElementById('reset-records-btn');
const nameEntry = document.getElementById('name-entry');
const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score-btn');
const gameoverBox = document.getElementById('gameover-box');
const pauseBox = document.getElementById('pause-box');
const pauseViewMain = document.getElementById('pause-view-main');
const pauseViewControls = document.getElementById('pause-view-controls');
const resumeBtn = document.getElementById('resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const showControlsBtn = document.getElementById('show-controls-btn');
const backBtn = document.getElementById('back-btn');
const startLevelSelect = document.getElementById('start-level-select');

let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId, combo, maxComboRun, startLevel;

function applyTheme(theme) {
  document.body.classList.toggle('light-theme', theme === 'light');
  localStorage.setItem('tetris-theme', theme);
}

applyTheme(localStorage.getItem('tetris-theme') === 'light' ? 'light' : 'dark');

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.contains('light-theme');
  applyTheme(isLight ? 'dark' : 'light');
});

function loadLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLeaderboardList(list) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
}

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || { bestCombo: 0, maxLines: 0 };
  } catch {
    return { bestCombo: 0, maxLines: 0 };
  }
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function qualifiesForLeaderboard(s) {
  const list = loadLeaderboard();
  return list.length < MAX_ENTRIES || s > list[list.length - 1].score;
}

function addLeaderboardEntry(name, s, l, c) {
  const list = loadLeaderboard();
  list.push({ name: name || 'AAA', score: s, lines: l, combo: c });
  list.sort((a, b) => b.score - a.score);
  list.length = Math.min(list.length, MAX_ENTRIES);
  saveLeaderboardList(list);
  return list;
}

function renderLeaderboard(highlightIndex) {
  const list = loadLeaderboard();
  leaderboardList.innerHTML = '';
  list.forEach((entry, i) => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} — ${entry.score.toLocaleString()}`;
    if (i === highlightIndex) li.classList.add('highlight');
    leaderboardList.appendChild(li);
  });
  const stats = loadStats();
  bestComboEl.textContent = stats.bestCombo;
  maxLinesEl.textContent = stats.maxLines;
}

resetRecordsBtn.addEventListener('click', () => {
  if (!confirm('¿Borrar todos los récords?')) return;
  localStorage.removeItem(LEADERBOARD_KEY);
  localStorage.removeItem(STATS_KEY);
  renderLeaderboard();
});

saveScoreBtn.addEventListener('click', () => {
  const name = playerNameInput.value.trim().slice(0, 10).toUpperCase() || 'AAA';
  const list = addLeaderboardEntry(name, score, lines, maxComboRun);
  const idx = list.findIndex(e => e.name === name && e.score === score && e.lines === lines && e.combo === maxComboRun);
  nameEntry.classList.add('hidden');
  renderLeaderboard(idx);
});

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPiece() {
  const type = Math.floor(Math.random() * 7) + 1;
  const shape = PIECES[type].map(row => [...row]);
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared) {
    lines += cleared;
    score += (LINE_SCORES[cleared] || 0) * level;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    updateHUD();
  }
  return cleared;
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  merge();
  const cleared = clearLines();
  combo = cleared > 0 ? combo + 1 : 0;
  maxComboRun = Math.max(maxComboRun, combo);
  spawn();
}

function spawn() {
  current = next;
  next = randomPiece();
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  const color = COLORS[colorIndex];
  context.globalAlpha = alpha ?? 1;
  context.fillStyle = color;
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  // highlight
  context.fillStyle = 'rgba(255,255,255,0.12)';
  context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
  context.globalAlpha = 1;
}

function drawGrid() {
  ctx.strokeStyle = '#22222e';
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // board
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  // ghost
  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);

  // current piece
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
}

function drawNext() {
  const NB = 30;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  pauseBox.classList.add('hidden');
  gameoverBox.classList.remove('hidden');
  overlayTitle.textContent = 'GAME OVER';
  overlayScore.textContent = `Puntuación: ${score.toLocaleString()}`;

  const stats = loadStats();
  stats.bestCombo = Math.max(stats.bestCombo, maxComboRun);
  stats.maxLines = Math.max(stats.maxLines, lines);
  saveStats(stats);

  if (qualifiesForLeaderboard(score)) {
    playerNameInput.value = '';
    nameEntry.classList.remove('hidden');
    overlay.classList.remove('hidden');
    renderLeaderboard();
    playerNameInput.focus();
  } else {
    nameEntry.classList.add('hidden');
    overlay.classList.remove('hidden');
    renderLeaderboard();
  }
}

function openPauseMenu() {
  gameoverBox.classList.add('hidden');
  pauseViewControls.classList.add('hidden');
  pauseViewMain.classList.remove('hidden');
  startLevelSelect.value = String(startLevel);
  pauseBox.classList.remove('hidden');
  overlay.classList.remove('hidden');
}

function closePauseMenu() {
  overlay.classList.add('hidden');
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (!paused) {
    closePauseMenu();
    lastTime = performance.now();
    loop(lastTime);
  } else {
    cancelAnimationFrame(animId);
    openPauseMenu();
  }
}

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  dropAccum += dt;
  if (dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      lockPiece();
    }
  }
  draw();
  animId = requestAnimationFrame(loop);
}

function init() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = startLevel || 1;
  paused = false;
  gameOver = false;
  combo = 0;
  maxComboRun = 0;
  dropInterval = Math.max(100, 1000 - (level - 1) * 90);
  dropAccum = 0;
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  nameEntry.classList.add('hidden');
  overlay.classList.add('hidden');
  renderLeaderboard();
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

resumeBtn.addEventListener('click', togglePause);

pauseRestartBtn.addEventListener('click', () => {
  closePauseMenu();
  init();
});

showControlsBtn.addEventListener('click', () => {
  pauseViewMain.classList.add('hidden');
  pauseViewControls.classList.remove('hidden');
});

backBtn.addEventListener('click', () => {
  pauseViewControls.classList.add('hidden');
  pauseViewMain.classList.remove('hidden');
});

startLevelSelect.addEventListener('change', () => {
  startLevel = Number(startLevelSelect.value);
});

document.addEventListener('keydown', e => {
  if (e.code === 'KeyP' || e.code === 'Escape') { togglePause(); return; }
  if (paused || gameOver) return;
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) current.x--;
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) current.x++;
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
});

playerNameInput.addEventListener('keydown', e => {
  e.stopPropagation();
  if (e.code === 'Enter') saveScoreBtn.click();
});

restartBtn.addEventListener('click', init);

startLevel = 1;

init();
