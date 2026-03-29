const MODES  = { pomo: 25 * 60, short: 5 * 60, long: 15 * 60 };
const COLORS = { pomo: '#e8d5b0', short: '#4a8c6a', long: '#5a7aaa' };
const C = 628.3;

let mode          = 'pomo';
let timeLeft      = MODES.pomo;
let totalTime     = MODES.pomo;
let running       = false;
let interval      = null;
let completedPomos = 0;
let totalFocused  = 0;
let streak        = 0;
let sessionNum    = 1;


document.addEventListener('DOMContentLoaded', () => {
  const ring = document.getElementById('ring');
  ring.style.stroke = COLORS.pomo;
  updateDisplay();
  updateRing(1);
  updateStats();
  updateDots();
});

function ring() {
  return document.getElementById('ring');
}

function setMode(m) {
  mode      = m;
  totalTime = MODES[m];
  timeLeft  = totalTime;
  running   = false;
  clearInterval(interval);

  document.querySelectorAll('.mode-btn').forEach((b, i) => {
    b.classList.toggle('active', ['pomo', 'short', 'long'][i] === m);
  });

  document.getElementById('start-btn').textContent = 'Start';
  ring().style.stroke = COLORS[m];
  updateDisplay();
  updateRing(1);
}

function toggleTimer() {
  if (running) {
    running = false;
    clearInterval(interval);
    document.getElementById('start-btn').textContent = 'Resume';
  } else {
    running = true;
    document.getElementById('start-btn').textContent = 'Pause';
    interval = setInterval(tick, 1000);
  }
}

function tick() {
  if (timeLeft <= 0) {
    clearInterval(interval);
    running = false;
    document.getElementById('start-btn').textContent = 'Start';

    if (mode === 'pomo') {
      completedPomos++;
      totalFocused += 25;
      streak++;
      updateStats();
      updateDots();
      notify('Focus session complete! Take a break.');
      sessionNum++;
      document.getElementById('session-info').textContent = 'Session ' + sessionNum;
    } else {
      notify('Break over! Time to focus.');
    }
    return;
  }

  timeLeft--;
  updateDisplay();
  updateRing(timeLeft / totalTime);
}

function resetTimer() {
  clearInterval(interval);
  running  = false;
  timeLeft = totalTime;
  document.getElementById('start-btn').textContent = 'Start';
  updateDisplay();
  updateRing(1);
}

function skipSession() {
  clearInterval(interval);
  running  = false;
  streak   = 0;
  timeLeft = 0;   
  updateDisplay();
  updateRing(0);
  updateStats();
}

function updateDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  document.getElementById('time').textContent =
    String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function updateRing(frac) {
  ring().style.strokeDashoffset = C * (1 - frac);
}


function updateStats() {
  const doneEl   = document.getElementById('stat-done');
  const focusEl  = document.getElementById('stat-focus');
  const streakEl = document.getElementById('stat-streak');
  if (doneEl)   doneEl.textContent   = completedPomos;
  if (focusEl)  focusEl.textContent  = totalFocused + 'm';
  if (streakEl) streakEl.textContent = streak;
}

function updateDots() {
  const cycle = completedPomos % 4;
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('d' + i);
    if (dot) {
      dot.classList.toggle(
        'filled',
        i < cycle || (cycle === 0 && completedPomos > 0)
      );
    }
  }
}

function notify(msg) {
  const bar = document.getElementById('notif');
  bar.textContent = msg;
  bar.style.display = 'block';
  setTimeout(() => { bar.style.display = 'none'; }, 4000);

  if (Notification.permission === 'granted') {
    new Notification('Pomodoro Timer', { body: msg });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

function addTask() {
  const input = document.getElementById('task-input');
  const text  = input.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  li.className = 'task-item';
  li.innerHTML = `
    <div class="task-check" onclick="toggleTask(this)"></div>
    <span class="task-text">${text}</span>
    <button class="task-del" onclick="this.closest('li').remove()">×</button>
  `;
  document.getElementById('task-list').appendChild(li);
  input.value = '';
}

function toggleTask(el) {
  el.classList.toggle('done');
  el.nextElementSibling.classList.toggle('done');
}
