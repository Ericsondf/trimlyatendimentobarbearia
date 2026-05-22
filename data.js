// ============================================================
//  TRIMLY — CONFIGURAÇÕES DA BARBEARIA
//  Edite este arquivo para personalizar seu negócio
// ============================================================

const CONFIG = {

  // --- DADOS DA BARBEARIA ---
  shop: {
    name: "Barbearia Isaías Sousa",
    whatsapp: "5511999999999",  // número com DDI, ex: 5511999999999
    instagram: "@isaiassousa.barber",
  },

  // --- SERVIÇOS ---
  // Adicione ou remova serviços aqui
  services: [
    { id: "corte",      name: "Corte",           price: 45,   duration: 30, icon: "✂️" },
    { id: "corte_barba",name: "Corte & Barba",   price: 65,   duration: 50, icon: "💈" },
    { id: "barba",      name: "Barba",            price: 30,   duration: 25, icon: "🪒" },
    { id: "sobrancelha",name: "Sobrancelha",      price: 15,   duration: 15, icon: "✨" },
    { id: "pigmentacao",name: "Pigmentação",      price: 80,   duration: 60, icon: "🎨" },
    { id: "plano",      name: "Plano Mensal",     price: 110,  duration: 30, icon: "👑", isMonthly: true },
  ],

  // --- PROFISSIONAIS ---
  barbers: [
    { id: "isaias",    name: "Isaías Sousa",    emoji: "💈", rating: "4.9" },
    { id: "jonathan",  name: "Jonathan Eduardo", emoji: "✂️", rating: "4.8" },
    { id: "qualquer",  name: "Qualquer",         emoji: "⭐", rating: "top" },
  ],

  // --- HORÁRIOS DE FUNCIONAMENTO ---
  // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  workdays: {
    0: false,   // Domingo — fechado
    1: { open: "09:00", close: "19:00" },
    2: { open: "09:00", close: "19:00" },
    3: { open: "09:00", close: "19:00" },
    4: { open: "09:00", close: "19:00" },
    5: { open: "09:00", close: "19:00" },
    6: { open: "09:00", close: "17:00" },
  },

  // Intervalo entre horários em minutos
  slotInterval: 30,

  // --- HORÁRIOS JÁ OCUPADOS (simulação) ---
  // Em produção real, isso viria de um banco de dados
  // Formato: "YYYY-MM-DD|barberId|HH:MM"
  bookedSlots: [
    "2026-05-22|isaias|09:00",
    "2026-05-22|isaias|09:30",
    "2026-05-22|isaias|10:00",
    "2026-05-22|jonathan|09:00",
    "2026-05-22|jonathan|10:30",
    "2026-05-23|isaias|09:00",
    "2026-05-23|isaias|09:30",
    "2026-05-23|isaias|11:00",
    "2026-05-23|jonathan|09:00",
    "2026-05-23|jonathan|09:30",
  ],

};

// Dias da semana em pt-BR
const DAYS_PT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const MONTHS_PT = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const MONTHS_FULL = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
