let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("rp_events")) || [];

const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

function renderCalendar() {
  calendar.innerHTML = "";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYear.textContent = currentDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric"
  });

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += "<div></div>";
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayBox = document.createElement("div");
    dayBox.className = "card";
    dayBox.innerHTML = `<strong>${day}</strong>`;

    events.filter(e => e.date === dateStr).forEach(ev => {
      const evDiv = document.createElement("div");
      evDiv.innerHTML = `🎯 ${ev.title}`;
      evDiv.style.cursor = "pointer";
      evDiv.onclick = () => showEvent(ev);
      dayBox.appendChild(evDiv);
    });

    calendar.appendChild(dayBox);
  }
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

function addEvent() {
  const date = document.getElementById("eventDate").value;
  const title = document.getElementById("eventTitle").value;
  const desc = document.getElementById("eventDesc").value;

  if (!date || !title) {
    alert("Date et titre obligatoires !");
    return;
  }

  events.push({ date, title, desc });
  localStorage.setItem("rp_events", JSON.stringify(events));
  renderCalendar();
}

function showEvent(event) {
  if (confirm(`${event.title}\n\n${event.desc}\n\nSupprimer cet événement ?`)) {
    events = events.filter(e => e !== event);
    localStorage.setItem("rp_events", JSON.stringify(events));
    renderCalendar();
  }
}

renderCalendar();
