import { CalendarManager } from './calendar.js';

const HABITS = [
  { id: "wake5", name: "Levantar 5-6am", emoji: "⏰" },
  { id: "meditate", name: "Meditación 15m", emoji: "🧘" },
  { id: "floor", name: "Ejercicio suelo 15m", emoji: "🏋️‍♂️" },
  { id: "dream", name: "Escribir vida soñada", emoji: "✍️" },
  { id: "bible", name: "Leer Biblia + pensar", emoji: "📖" },
  { id: "read", name: "Leer 30m (6-8 págs)", emoji: "📚" },
  { id: "audio", name: "Audio crecimiento 15m", emoji: "🎧" },
  { id: "sport", name: "Deporte / Gym", emoji: "🏃" },
  { id: "study", name: "Estudiar 45m", emoji: "🧠" },
  { id: "pray", name: "Agradecer y rezar", emoji: "🙏" },
  { id: "writeNight", name: "Escribir progreso noche", emoji: "📝" },
  { id: "content", name: "Crear contenido", emoji: "📱" },
  { id: "insta", name: "Registrar Instagram", emoji: "📸" },
  { id: "eat", name: "Comer sano", emoji: "🥗" },
  { id: "goals", name: "Escribir metas mañana", emoji: "🎯" }
];

const months = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const habitsGrid = document.getElementById('habitsGrid');
const calendarModal = document.getElementById('calendarModal');
const calendarManager = new CalendarManager();

let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();
let selectedHabit = null;

/* ---------------- MONTH ACCORDION ---------------- */
const monthAccordionBtn = document.getElementById('monthAccordionBtn');
const monthPanel = document.getElementById('monthPanel');

function renderMonths() {
  monthPanel.innerHTML = '';
  months.forEach((m, idx) => {
    const btn = document.createElement('button');
    btn.textContent = m;
    btn.addEventListener('click', () => {
      selectedMonth = idx;
      monthAccordionBtn.textContent = `${m} ▾`;
      monthPanel.classList.remove('show');
      refreshHabitProgress();
    });
    monthPanel.appendChild(btn);
  });
}
monthAccordionBtn.addEventListener('click', () => monthPanel.classList.toggle('show'));

/* ---------------- YEAR ACCORDION ---------------- */
const yearPanel = document.getElementById('yearPanel');
const yearAccordionBtn = document.getElementById('accordionBtn');
function renderYears() {
  yearPanel.innerHTML = '';
  for (let y = 2025; y <= 2035; y++) {
    const btn = document.createElement('button');
    btn.textContent = y;
    btn.addEventListener('click', () => {
      selectedYear = y;
      yearAccordionBtn.textContent = `${y} ▾`;
      yearPanel.classList.remove('show');
      refreshHabitProgress();
    });
    yearPanel.appendChild(btn);
  }
}
yearAccordionBtn.addEventListener('click', () => yearPanel.classList.toggle('show'));

/* ---------------- THEME TOGGLE ---------------- */
const themeToggle = document.getElementById('themeToggle');
function initTheme() {
  const mode = localStorage.getItem('ht_theme') || 'light';
  document.body.classList.toggle('dark', mode === 'dark');
  themeToggle.textContent = mode === 'dark' ? '☀️' : '🌙';
}
themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('ht_theme', isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
});

/* ---------------- HABITS ---------------- */
function createCircle(percent = 0, emoji = '🔆', label = 'Hábito') {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - percent / 100);
  return `
    <svg viewBox="0 0 100 100" class="progress-svg">
      <circle cx="50" cy="50" r="42" stroke="#333" stroke-width="12" fill="none" />
      <circle class="progress-arc" cx="50" cy="50" r="42"
        stroke="url(#grad1)" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" />
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="var(--accent1)" />
          <stop offset="100%" stop-color="var(--accent2)" />
        </linearGradient>
      </defs>
    </svg>
    <div class="circle-center">
      <div class="circle-emoji">${emoji}</div>
      <div class="circle-label">${label.length > 18 ? label.slice(0,18) + '…' : label}</div>
    </div>
  `;
}

function getProgress(habitId) {
  const key = `habit_${habitId}_${selectedYear}_${selectedMonth}`;
  const days = JSON.parse(localStorage.getItem(key) || '[]');
  const total = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  return Math.round((days.length / total) * 100);
}

function renderHabits() {
  habitsGrid.innerHTML = '';
  HABITS.forEach(h => {
    const card = document.createElement('div');
    card.className = 'habit-card';
    card.dataset.habitId = h.id;
    const circle = document.createElement('div');
    circle.className = 'habit-circle';
    const percent = getProgress(h.id);
    circle.innerHTML = createCircle(percent, h.emoji, h.name);
    card.appendChild(circle);
    card.addEventListener('click', () => openHabitModal(h));
    habitsGrid.appendChild(card);
  });
}

function refreshHabitProgress() {
  document.querySelectorAll('.habit-card').forEach(card => {
    const habitId = card.dataset.habitId;
    const percent = getProgress(habitId);
    const arc = card.querySelector('.progress-arc');
    const circumference = 2 * Math.PI * 42;
    const offset = circumference * (1 - percent / 100);
    arc.style.transition = 'stroke-dashoffset 1s ease';
    arc.style.strokeDashoffset = offset;
  });
}

/* ---------------- MODAL ---------------- */
const closeModal = document.getElementById('closeModal');
const saveDays = document.getElementById('saveDays');
const clearDays = document.getElementById('clearDays');

function openHabitModal(habit) {
  selectedHabit = habit;
  calendarModal.classList.remove('hidden');
  document.getElementById('modalHabitTitle').textContent = `${habit.emoji} ${habit.name}`;
  document.getElementById('modalHabitCircle').innerHTML = `<div class="mini-emoji">${habit.emoji}</div>`;
  calendarManager.init(habit.id, selectedMonth, selectedYear, updateModalProgress);
  calendarManager.renderDaysGrid(document.getElementById('daysGrid'));
  updateModalProgress(calendarManager.getProgress());
}

function updateModalProgress({ checkedCount, totalDays, percent }) {
  document.getElementById('modalProgressFill').style.width = `${percent}%`;
  document.getElementById('modalProgressText').textContent = `${percent}% — ${checkedCount} días`;
}

closeModal.addEventListener('click', () => calendarModal.classList.add('hidden'));
calendarModal.addEventListener('click', e => { if (e.target === calendarModal) calendarModal.classList.add('hidden'); });
clearDays.addEventListener('click', () => {
  calendarManager.clearAll();
  calendarManager.renderDaysGrid(document.getElementById('daysGrid'));
});
saveDays.addEventListener('click', () => {
  calendarManager.save();
  refreshHabitProgress();
  calendarModal.classList.add('hidden');
});

/* ---------------- INIT ---------------- */
function init() {
  renderMonths();
  renderYears();
  initTheme();
  renderHabits();
}
init();
