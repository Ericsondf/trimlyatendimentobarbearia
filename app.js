// ============================================================
//  TRIMLY — LÓGICA PRINCIPAL DO APP
// ============================================================

const state = {
  step: 0,
  name: "",
  selectedServices: [],
  selectedBarber: null,
  selectedDate: null,
  selectedTime: null,
};

// --- DOM REFS ---
const $messages  = document.getElementById("messages");
const $inputArea = document.getElementById("input-area");
const $chatArea  = document.getElementById("chat-area");

// --- BOOT ---
window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash");
    splash.classList.add("out");
    setTimeout(() => {
      splash.style.display = "none";
      document.getElementById("app").classList.remove("hidden");
      startChat();
    }, 500);
  }, 1900);
});

// --- HELPERS ---
function scrollBottom() {
  setTimeout(() => $chatArea.scrollTo({ top: $chatArea.scrollHeight, behavior: "smooth" }), 80);
}

function addBotMsg(html, delay = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      const typingId = "typing-" + Date.now();
      const typingEl = document.createElement("div");
      typingEl.id = typingId;
      typingEl.className = "msg bot";
      typingEl.innerHTML = `
        <div class="msg-avatar">
          <svg viewBox="0 0 56 56" fill="none"><rect width="56" height="56" rx="14" fill="#5B4FD8"/>
          <path d="M16 14 L40 42" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M40 14 L16 42" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="16" cy="14" r="5" fill="white"/><circle cx="40" cy="14" r="5" fill="white"/>
          <circle cx="16" cy="42" r="3.5" fill="rgba(255,255,255,0.5)"/>
          <circle cx="40" cy="42" r="3.5" fill="rgba(255,255,255,0.5)"/></svg>
        </div>
        <div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
      $messages.appendChild(typingEl);
      scrollBottom();

      setTimeout(() => {
        const el = document.getElementById(typingId);
        if (el) {
          el.querySelector(".msg-bubble").innerHTML = html;
          scrollBottom();
        }
        resolve();
      }, 900);
    }, delay);
  });
}

function addUserMsg(text) {
  const el = document.createElement("div");
  el.className = "msg user";
  el.innerHTML = `<div class="msg-bubble">${text}</div>`;
  $messages.appendChild(el);
  scrollBottom();
}

function setInput(html) {
  $inputArea.innerHTML = html;
  scrollBottom();
}

function formatMoney(val) {
  return val === 0 ? "Grátis" : `R$ ${val.toFixed(2).replace(".", ",")}`;
}

function getDates(count = 14) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < count + 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    if (CONFIG.workdays[dow]) dates.push(new Date(d));
    if (dates.length >= count) break;
  }
  return dates;
}

function generateSlots(dateObj, barberId) {
  const dow = dateObj.getDay();
  const wday = CONFIG.workdays[dow];
  if (!wday) return [];

  const dateStr = dateObj.toISOString().split("T")[0];
  const [openH, openM] = wday.open.split(":").map(Number);
  const [closeH, closeM] = wday.close.split(":").map(Number);
  const startMin = openH * 60 + openM;
  const endMin   = closeH * 60 + closeM;
  const slots = [];

  const now = new Date();
  const isToday = dateStr === now.toISOString().split("T")[0];
  const nowMin  = now.getHours() * 60 + now.getMinutes() + 30;

  for (let m = startMin; m < endMin; m += CONFIG.slotInterval) {
    const h = String(Math.floor(m / 60)).padStart(2, "0");
    const min = String(m % 60).padStart(2, "0");
    const timeStr = `${h}:${min}`;

    if (isToday && m <= nowMin) { slots.push({ time: timeStr, taken: true }); continue; }

    const barberIds = barberId === "qualquer"
      ? CONFIG.barbers.filter(b => b.id !== "qualquer").map(b => b.id)
      : [barberId];

    const allTaken = barberIds.every(bid =>
      CONFIG.bookedSlots.includes(`${dateStr}|${bid}|${timeStr}`)
    );
    slots.push({ time: timeStr, taken: allTaken });
  }
  return slots;
}

function progressBar(step) {
  const total = 4;
  const steps = ["Nome", "Serviço", "Horário", "Confirmar"];
  const stepsHtml = Array.from({ length: total }, (_, i) =>
    `<div class="progress-step${i < step ? " done" : ""}"></div>`
  ).join("");
  return `<div class="progress-wrap">
    <div class="progress-steps">${stepsHtml}</div>
    <div class="progress-label">Etapa <strong>${step} de ${total}</strong> — ${steps[step - 1] || ""}</div>
  </div>`;
}

// ============================================================
//  FLUXO
// ============================================================

async function startChat() {
  await addBotMsg(`Olá! Sou a <strong style="color:#a393f5">Trim</strong>, assistente da <strong>Barbearia Isaías Sousa</strong>. 👋`);
  await addBotMsg(`Vou te ajudar a marcar seu horário em menos de 1 minuto.<br><br>Qual é o seu <strong>nome completo</strong>?`, 400);
  showNameInput();
}

function showNameInput() {
  setInput(`
    <div class="text-input-wrap">
      <input id="name-inp" class="text-input" type="text" placeholder="Seu nome e sobrenome…" autocomplete="name" />
      <button class="send-btn" onclick="submitName()">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  `);
  setTimeout(() => document.getElementById("name-inp")?.focus(), 100);
  document.getElementById("name-inp")?.addEventListener("keydown", e => {
    if (e.key === "Enter") submitName();
  });
}

async function submitName() {
  const val = document.getElementById("name-inp")?.value.trim();
  if (!val || val.length < 3) {
    document.getElementById("name-inp").style.borderColor = "#ef4444";
    return;
  }
  state.name = val;
  setInput("");
  addUserMsg(val);
  await addBotMsg(`Prazer, <strong>${val.split(" ")[0]}</strong>! 😊`, 300);
  await addBotMsg(`Qual serviço você quer hoje?`, 500);
  showServicesInput();
}

function showServicesInput() {
  const cards = CONFIG.services.map(s => `
    <div class="service-card" data-id="${s.id}" onclick="toggleService('${s.id}', this)">
      <div class="svc-check">
        <svg viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M2 6l3 3 5-5"/></svg>
      </div>
      <div class="svc-icon-wrap">${s.icon}</div>
      <div class="svc-name">${s.name}</div>
      <div class="svc-price">${s.isMonthly ? `R$ ${s.price}/mês` : formatMoney(s.price)}</div>
      <div class="svc-time">${s.duration} min</div>
    </div>
  `).join("");

  setInput(`
    ${progressBar(2)}
    <div class="section-label">Selecione os serviços:</div>
    <div class="services-grid">${cards}</div>
    <div class="scroll-hint">↕ selecione um ou mais</div>
    <button class="btn-primary" id="svc-btn" onclick="submitServices()" disabled>Continuar →</button>
  `);
}

function toggleService(id, el) {
  el.classList.toggle("selected");
  const sel = document.querySelectorAll(".service-card.selected");
  document.getElementById("svc-btn").disabled = sel.length === 0;
}

async function submitServices() {
  const sel = document.querySelectorAll(".service-card.selected");
  if (!sel.length) return;
  state.selectedServices = Array.from(sel).map(el => el.dataset.id);
  const names = state.selectedServices.map(id => CONFIG.services.find(s => s.id === id)?.name).join(", ");
  setInput("");
  addUserMsg(names);
  await addBotMsg(`Ótimo! Agora escolha o barbeiro 💈`, 300);
  showBarbersInput();
}

function showBarbersInput() {
  const cards = CONFIG.barbers.map(b => `
    <div class="barber-card" data-id="${b.id}" onclick="selectBarber('${b.id}', this)">
      <div class="barber-photo">${b.emoji}</div>
      <div class="barber-name">${b.name}</div>
      <div class="barber-rating">⭐ ${b.rating}</div>
    </div>
  `).join("");

  setInput(`
    ${progressBar(3)}
    <div class="section-label">Escolha o profissional:</div>
    <div class="barbers-grid">${cards}</div>
    <div class="scroll-hint">← arraste para ver mais</div>
    <button class="btn-primary" id="barber-btn" onclick="submitBarber()" disabled>Continuar →</button>
  `);
}

function selectBarber(id, el) {
  document.querySelectorAll(".barber-card").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");
  state.selectedBarber = id;
  document.getElementById("barber-btn").disabled = false;
}

async function submitBarber() {
  if (!state.selectedBarber) return;
  const b = CONFIG.barbers.find(b => b.id === state.selectedBarber);
  setInput("");
  addUserMsg(b.name);
  await addBotMsg(`Perfeito! Escolha o dia e horário ⏰`, 300);
  showCalendarInput();
}

function showCalendarInput() {
  const dates = getDates(14);
  const dayCards = dates.map(d => {
    const dow = d.getDay();
    const slots = generateSlots(d, state.selectedBarber);
    const hasOpen = slots.some(s => !s.taken);
    const dateStr = d.toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    const isToday = dateStr === today;

    return `<div class="day-card${!hasOpen ? " disabled" : ""}" data-date="${dateStr}"
      onclick="${hasOpen ? `selectDate('${dateStr}', this)` : ""}">
      <div class="day-name">${DAYS_PT[dow]}</div>
      <div class="day-num">${d.getDate()}</div>
      <div class="day-mo">${MONTHS_PT[d.getMonth()]}</div>
      ${isToday ? `<div class="day-badge">hoje</div>` : ""}
    </div>`;
  }).join("");

  setInput(`
    ${progressBar(3)}
    <div class="section-header">
      <div class="section-label" style="margin:0">Escolha o dia:</div>
      <div class="scroll-hint" style="margin:0">← arraste →</div>
    </div>
    <div class="calendar-scroll">${dayCards}</div>
    <div id="slots-area"></div>
    <button class="btn-primary" id="date-btn" onclick="submitDateTime()" disabled>Confirmar horário →</button>
  `);
}

function selectDate(dateStr, el) {
  document.querySelectorAll(".day-card").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");
  state.selectedDate = dateStr;
  state.selectedTime = null;
  document.getElementById("date-btn").disabled = true;
  renderTimeSlots(dateStr);
}

function renderTimeSlots(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const slots = generateSlots(d, state.selectedBarber);
  const slotsArea = document.getElementById("slots-area");

  if (slots.every(s => s.taken)) {
    slotsArea.innerHTML = `<div class="no-slots">😔 Todos os horários deste dia estão ocupados.<br>Escolha outro dia.</div>`;
    return;
  }

  const slotHtml = slots.map(s =>
    `<div class="time-slot${s.taken ? " taken" : ""}" onclick="${s.taken ? "" : `selectTime('${s.time}', this)`}">${s.time}</div>`
  ).join("");

  slotsArea.innerHTML = `
    <div class="section-label" style="margin-top:14px">Horários disponíveis:</div>
    <div class="times-grid">${slotHtml}</div>
  `;
}

function selectTime(time, el) {
  document.querySelectorAll(".time-slot:not(.taken)").forEach(s => s.classList.remove("selected"));
  el.classList.add("selected");
  state.selectedTime = time;
  document.getElementById("date-btn").disabled = false;
}

async function submitDateTime() {
  if (!state.selectedDate || !state.selectedTime) return;
  const d = new Date(state.selectedDate + "T12:00:00");
  const dow = d.getDay();
  const label = `${DAYS_PT[dow]}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()]} às ${state.selectedTime}`;
  setInput("");
  addUserMsg(label);
  await addBotMsg(`Quase lá! Confirme os detalhes do agendamento ✅`, 300);
  showConfirmInput();
}

function showConfirmInput() {
  const services = state.selectedServices.map(id => CONFIG.services.find(s => s.id === id));
  const barber = CONFIG.barbers.find(b => b.id === state.selectedBarber);
  const d = new Date(state.selectedDate + "T12:00:00");
  const dow = d.getDay();
  const dateLabel = `${DAYS_PT[dow]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()]}`;

  const totalPrice = services.reduce((acc, s) => acc + (s?.price || 0), 0);
  const totalDuration = services.reduce((acc, s) => acc + (s?.duration || 0), 0);
  const serviceNames = services.map(s => s?.name).join(" + ");

  setInput(`
    ${progressBar(4)}
    <div class="confirm-card">
      <div class="confirm-header">
        <div class="confirm-header-icon">💈</div>
        <div>
          <div class="confirm-header-text">Resumo do Agendamento</div>
          <div class="confirm-header-sub">Revise antes de confirmar</div>
        </div>
      </div>
      <div class="confirm-row"><span class="confirm-label">Cliente</span><span class="confirm-value">${state.name}</span></div>
      <div class="confirm-row"><span class="confirm-label">Serviço</span><span class="confirm-value">${serviceNames}</span></div>
      <div class="confirm-row"><span class="confirm-label">Barbeiro</span><span class="confirm-value">${barber.name}</span></div>
      <div class="confirm-row"><span class="confirm-label">Data</span><span class="confirm-value">${dateLabel}</span></div>
      <div class="confirm-row"><span class="confirm-label">Horário</span><span class="confirm-value">${state.selectedTime}</span></div>
      <div class="confirm-row"><span class="confirm-label">Duração</span><span class="confirm-value">${totalDuration} min</span></div>
      <div class="confirm-row">
        <span class="confirm-label" style="font-weight:500;color:var(--text)">Total</span>
        <span class="confirm-total">${formatMoney(totalPrice)}</span>
      </div>
    </div>
    <button class="btn-primary" onclick="submitConfirm()">✅ Confirmar Agendamento</button>
  `);
}

async function submitConfirm() {
  const services = state.selectedServices.map(id => CONFIG.services.find(s => s.id === id));
  const barber = CONFIG.barbers.find(b => b.id === state.selectedBarber);
  const d = new Date(state.selectedDate + "T12:00:00");
  const dow = d.getDay();
  const dateLabel = `${DAYS_PT[dow]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()]}`;
  const totalPrice = services.reduce((acc, s) => acc + (s?.price || 0), 0);
  const serviceNames = services.map(s => s?.name).join(" + ");

  setInput("");
  addUserMsg("Confirmar agendamento");

  // Adiciona ao booked (simulação local)
  services.forEach(s => {
    CONFIG.bookedSlots.push(`${state.selectedDate}|${state.selectedBarber}|${state.selectedTime}`);
  });

  await addBotMsg(`Processando seu agendamento… ⏳`, 300);

  await addBotMsg(`
    <div class="success-view">
      <div class="success-circle">
        <svg viewBox="0 0 32 32" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 16l7 7 13-13"/>
        </svg>
      </div>
      <div class="success-title">Agendado! 🎉</div>
      <div class="success-sub">
        <strong>${state.name.split(" ")[0]}</strong>, seu horário está confirmado!<br>
        ${dateLabel} às ${state.selectedTime}
      </div>
      <div class="reminder-box">
        <div class="reminder-icon">🔔</div>
        <div class="reminder-text">Salve esse horário na sua agenda e chegue <strong>5 minutinhos antes</strong> para garantir o melhor atendimento.</div>
      </div>
    </div>
  `, 700);

  // WhatsApp CTA
  const waMsgRaw = `Olá! Acabei de agendar pelo Trimly:\n👤 ${state.name}\n💈 ${serviceNames}\n✂️ ${barber.name}\n📅 ${dateLabel} às ${state.selectedTime}\n💰 ${formatMoney(totalPrice)}`;
  const waMsg = encodeURIComponent(waMsgRaw);
  const waUrl = `https://wa.me/${CONFIG.shop.whatsapp}?text=${waMsg}`;

  setTimeout(() => {
    setInput(`
      <div class="share-row">
        <button class="btn-secondary" onclick="resetChat()">Novo agendamento</button>
        <a href="${waUrl}" target="_blank" style="flex:1;text-decoration:none">
          <button class="btn-primary" style="background:#25D366">💬 Confirmar no WhatsApp</button>
        </a>
      </div>
    `);
  }, 1800);
}

function resetChat() {
  state.step = 0;
  state.name = "";
  state.selectedServices = [];
  state.selectedBarber = null;
  state.selectedDate = null;
  state.selectedTime = null;
  $messages.innerHTML = "";
  setInput("");
  setTimeout(startChat, 200);
}
