const storageKey = 'paradoxLabEvents';
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const defaultEvents = [
  {
    title: 'Weekly Investigation Session',
    type: 'Meeting',
    date: '2026-04-28',
    time: '18:00 – 20:00',
    location: 'Room 305, Science Building',
    registered: 24,
    description: 'Join us for our weekly deep dive into the Fermi Paradox. Bring your theories and evidence.'
  },
  {
    title: 'Guest Lecture: Dr. Sarah Chen',
    type: 'Lecture',
    date: '2026-05-02',
    time: '19:00 – 21:00',
    location: 'Main Auditorium',
    registered: 67,
    description: 'Renowned cryptographer discussing unsolved codes throughout history.'
  },
  {
    title: 'Case Presentation Competition',
    type: 'Competition',
    date: '2026-05-10',
    time: '14:00 – 17:00',
    location: 'Conference Hall B',
    registered: 45,
    description: 'Members present their research on assigned mysteries. Prizes for best presentations.'
  },
  {
    title: 'Collaborative Research Workshop',
    type: 'Workshop',
    date: '2026-05-15',
    time: '16:00 – 18:00',
    location: 'Research Lab 2',
    registered: 18,
    description: 'Small group session focusing on the Voynich Manuscript. Limited spots available.'
  }
];

const eventListNode = document.getElementById('eventList');
const calendarGrid = document.getElementById('calendarGrid');
const calendarMonthLabel = document.getElementById('calendarMonthLabel');
const todayEvents = document.getElementById('todayEvents');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

const titleInput = document.getElementById('eventTitle');
const typeInput = document.getElementById('eventType');
const dateInput = document.getElementById('eventDate');
const timeInput = document.getElementById('eventTime');
const locationInput = document.getElementById('eventLocation');
const registeredInput = document.getElementById('eventRegistered');
const descriptionInput = document.getElementById('eventDescription');
const addEventBtn = document.getElementById('addEventBtn');
const adminMessage = document.getElementById('adminMessage');

let events = [];
let viewDate = new Date();
viewDate.setDate(1);
let selectedDate = new Date();
selectedDate.setHours(0, 0, 0, 0);

function loadEvents() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored).map(event => ({ ...event }));
    }
  } catch (error) {
    console.warn('Could not parse stored events:', error);
  }
  return defaultEvents.map(event => ({ ...event }));
}

function saveEvents() {
  localStorage.setItem(storageKey, JSON.stringify(events));
}

function formatDateDisplay(dateString) {
  const date = new Date(dateString);
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function isSameDay(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
}

function renderEventCard(event) {
  return `
    <article class="event-card">
      <div class="event-tag">${event.type}</div>
      <h3>${event.title}</h3>
      <p>${event.description}</p>
      <div class="event-details">
        <span>${formatDateDisplay(event.date)}</span>
        <span>${event.time}</span>
        <span>${event.location}</span>
      </div>
      <div class="event-footer">
        <span>${event.registered} registered</span>
        <button class="btn primary small">Register for Event</button>
      </div>
    </article>
  `;
}

function renderEvents() {
  const sortedEvents = events.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  eventListNode.innerHTML = sortedEvents.length
    ? sortedEvents.map(renderEventCard).join('')
    : '<p class="empty-state">No events are scheduled yet. Add one with the admin manager.</p>';
}

function renderCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  calendarMonthLabel.textContent = `${monthNames[month]} ${year}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let html = '';
  dayNames.forEach(name => {
    html += `<div class="day-name">${name}</div>`;
  });

  for (let blank = 0; blank < firstDay; blank += 1) {
    html += '<div class="day empty"></div>';
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const isoDate = date.toISOString().slice(0, 10);
    const hasEvent = events.some(event => event.date === isoDate);
    const classes = ['day'];
    if (hasEvent) classes.push('day-event');
    if (isSameDay(date, today)) classes.push('day-current');
    if (isSameDay(date, selectedDate)) classes.push('day-active');
    html += `<div class="${classes.join(' ')}" data-date="${isoDate}">${day}</div>`;
  }

  calendarGrid.innerHTML = html;
  calendarGrid.style.opacity = '0';
  requestAnimationFrame(() => {
    calendarGrid.style.opacity = '1';
  });

  document.querySelectorAll('#calendarGrid .day:not(.empty)').forEach(cell => {
    cell.addEventListener('click', () => {
      selectedDate = new Date(cell.dataset.date);
      renderCalendar();
      renderMonthEvents();
    });
  });
}

function renderMonthEvents() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!monthEvents.length) {
    todayEvents.innerHTML = '<p class="empty-state">No events scheduled for this month.</p>';
    return;
  }

  todayEvents.innerHTML = monthEvents
    .map(event => `
      <div class="event-meta">
        <span class="meta-date">${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>${event.title}</span>
      </div>
    `)
    .join('');
}

function resetAdminForm() {
  titleInput.value = '';
  typeInput.value = '';
  dateInput.value = '';
  timeInput.value = '';
  locationInput.value = '';
  registeredInput.value = '';
  descriptionInput.value = '';
}

function showAdminMessage(message, success = true) {
  adminMessage.textContent = message;
  adminMessage.style.color = success ? '#aaa' : '#ff6b6b';
}

function addEvent() {
  const title = titleInput.value.trim();
  const type = typeInput.value.trim() || 'Event';
  const date = dateInput.value;
  const time = timeInput.value.trim() || 'TBA';
  const location = locationInput.value.trim() || 'TBA';
  const registered = Number(registeredInput.value || 0);
  const description = descriptionInput.value.trim() || 'No description provided.';

  if (!title || !date) {
    showAdminMessage('Please add at least a title and a date.', false);
    return;
  }

  events.push({ title, type, date, time, location, registered, description });
  saveEvents();
  renderCalendar();
  renderMonthEvents();
  renderEvents();
  resetAdminForm();
  showAdminMessage('Event saved. It now appears in the calendar and list.');
}

prevMonthBtn.addEventListener('click', () => {
  viewDate.setMonth(viewDate.getMonth() - 1);
  renderCalendar();
  renderMonthEvents();
});

nextMonthBtn.addEventListener('click', () => {
  viewDate.setMonth(viewDate.getMonth() + 1);
  renderCalendar();
  renderMonthEvents();
});

addEventBtn.addEventListener('click', addEvent);

window.addEventListener('DOMContentLoaded', () => {
  events = loadEvents();
  renderCalendar();
  renderMonthEvents();
  renderEvents();
});
