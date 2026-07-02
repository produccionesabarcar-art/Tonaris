'use strict';
/* ============================================================
   TONARIS — main.js
   Motor completo: Audio, Ejercicios, SM-2, Sheets, Fase 0
   Empresa: ABARCAR | Versión: 1.0.0
   Sin framework. Sin dependencias externas. Netlify safe.
   ============================================================ */

/* ============================================================
   SECCIÓN 1: CONSTANTES Y DATOS PEDAGÓGICOS
   Fuente de verdad del sistema ABARCAR — no modificar
   ============================================================ */

/**
 * @description Las 7 sílabas del sistema ABARCAR con todas sus propiedades.
 * Sistema cerrado — inmutable.
 */
const SYLLABLES = {
  ha: { id: 'ha', letter: 'Ha', grade: 'I', function: 'Tónica', word: 'Hogar', color: '#C8473A', feeling: 'Reposo, apertura, llegada.' },
  ki: { id: 'ki', letter: 'Ki', grade: 'II', function: 'Supertónica', word: 'Paso', color: '#E05C1A', feeling: 'Inestabilidad de tránsito.' },
  da: { id: 'da', letter: 'Da', grade: 'III', function: 'Mediante', word: 'Luz', color: '#D4A017', feeling: 'Claridad flotante.' },
  su: { id: 'su', letter: 'Su', grade: 'IV', function: 'Subdominante', word: 'Aire', color: '#2E8B4A', feeling: 'Expansión sin tensión.' },
  go: { id: 'go', letter: 'Go', grade: 'V', function: 'Dominante', word: 'Impulso', color: '#2D7DD2', feeling: 'Tensión dirigida hacia Ha.' },
  lu: { id: 'lu', letter: 'Lu', grade: 'VI', function: 'Rel. menor', word: 'Sueño', color: '#7B3FB5', feeling: 'Melancolía suave.' },
  za: { id: 'za', letter: 'Zá', grade: 'VII', function: 'Tensión esp.', word: 'Tensión', color: '#FF4B91', feeling: 'Urgencia máxima.' }
};

/** 
 * @description Orden del Círculo de Quintas y definiciones de notas enarmónicas.
 * Respetando la regla de no repetir letras en la misma escala diatónica.
 */
const KEY_DEFINITIONS = {
  'C': { name: 'C', ratio: 1.0000, notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  'G': { name: 'G', ratio: 1.4983, notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'] },
  'D': { name: 'D', ratio: 1.1225, notes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] },
  'A': { name: 'A', ratio: 1.6818, notes: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'] },
  'E': { name: 'E', ratio: 1.2599, notes: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'] },
  'B': { name: 'B', ratio: 1.8877, notes: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'] },
  'F#': { name: 'F#', ratio: 1.4142, notes: ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'] },
  'Db': { name: 'Db', ratio: 1.0595, notes: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'] },
  'Ab': { name: 'Ab', ratio: 1.5874, notes: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'] },
  'Eb': { name: 'Eb', ratio: 1.1892, notes: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'] },
  'Bb': { name: 'Bb', ratio: 1.7818, notes: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'] },
  'F': { name: 'F', ratio: 1.3348, notes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'] }
};

/** @description El orden de las claves en el círculo de quintas (sentido horario) */
const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

/** @description Orden de la escala diatónica — siempre este orden */
const SCALE_ORDER = ['ha', 'ki', 'da', 'su', 'go', 'lu', 'za'];

/**
 * @description Frecuencias base de la escala diatónica mayor en Do (C4).
 * Cada entrada corresponde al grado diatónico en el mismo orden que SCALE_ORDER.
 * Para otras tonalidades se multiplica por el ratio correspondiente.
 */
const BASE_FREQS_C = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

/**
 * @description Ratios de transposición para las 12 tonalidades mayores.
 * Índice 0 = C, rotación diaria define cuál se usa.
 */
const TONALITY_RATIOS = [
  { name: 'Do', symbol: 'C', ratio: 1.0000 },
  { name: 'Sol', symbol: 'G', ratio: 1.4983 },
  { name: 'Re', symbol: 'D', ratio: 1.1225 },
  { name: 'La', symbol: 'A', ratio: 1.6818 },
  { name: 'Mi', symbol: 'E', ratio: 1.2599 },
  { name: 'Si', symbol: 'B', ratio: 1.8877 },
  { name: 'Fa#', symbol: 'F#', ratio: 1.4142 },
  { name: 'Reb', symbol: 'Db', ratio: 1.0595 },
  { name: 'Lab', symbol: 'Ab', ratio: 1.5874 },
  { name: 'Mib', symbol: 'Eb', ratio: 1.1892 },
  { name: 'Sib', symbol: 'Bb', ratio: 1.7818 },
  { name: 'Fa', symbol: 'F', ratio: 1.3348 }
];

/**
 * @description Los 16 viajes armónicos del sistema ABARCAR.
 * Ordenados de menor a mayor complejidad para progresión natural.
 */
const JOURNEYS = [
  { id: 'regreso', name: 'El Regreso', syls: ['ha', 'go', 'ha'], feeling: 'Energía directa. Sin duda. Como llegar corriendo a casa.' },
  { id: 'peso', name: 'El Peso', syls: ['go', 'ha'], feeling: 'Solo dos momentos. Empuje y hogar. Directo y profundo.' },
  { id: 'suspension', name: 'La Suspensión', syls: ['ha', 'su', 'go', 'ha'], feeling: 'Una pregunta que se responde sola. Abre, flota, empuja, llega.' },
  { id: 'claridad', name: 'La Claridad', syls: ['ha', 'da', 'ha'], feeling: 'Sale del hogar hacia la luz, regresa. El viaje más luminoso.' },
  { id: 'nostalgia', name: 'La Nostalgia', syls: ['lu', 'su', 'ha', 'go'], feeling: 'Empieza en sombra. Busca el hogar. Lo encuentra. Pero algo sigue tirando.' },
  { id: 'caida_dulce', name: 'La Caída Dulce', syls: ['lu', 'go', 'ha'], feeling: 'Comienza en sombra, empuja, llega al hogar. Suave por venir de lejos.' },
  { id: 'camino_pop', name: 'El Camino Pop', syls: ['ha', 'go', 'lu', 'su'], feeling: 'El viaje más recorrido. Sale del hogar, empuja, oscurece, expande.' },
  { id: 'viaje_emoc', name: 'El Viaje Emocional', syls: ['ha', 'lu', 'su', 'go'], feeling: 'Sale del hogar hacia la oscuridad, expande, empuja. Queda suspendido.' },
  { id: 'res_jazz', name: 'La Resolución Jazz', syls: ['ki', 'go', 'ha'], feeling: 'Un paso inseguro, un empuje, y llegada. La llegada se siente ganada.' },
  { id: 'ascenso', name: 'El Ascenso', syls: ['ha', 'su', 'lu', 'go'], feeling: 'La oscuridad aparece en el medio. El empuje final siente más urgente.' },
  { id: 'ansiedad', name: 'La Ansiedad', syls: ['za', 'ha'], feeling: 'Tensión máxima seguida de resolución. La llegada es alivio físico.' },
  { id: 'blues', name: 'El Blues', syls: ['ha', 'su', 'go'], feeling: 'Sale, expande, empuja. La resolución llega por acumulación de ciclos.' },
  { id: 'epica', name: 'La Épica', syls: ['lu', 'su', 'ha', 'go'], feeling: 'Igual a La Nostalgia en notas, diferente en intención. Más inevitable.' },
  { id: 'blues_largo', name: 'El Blues Largo', syls: ['ha', 'ha', 'su', 'su', 'ha', 'ha', 'go', 'su', 'ha', 'go'], feeling: 'El blues como respiración larga. Siente el peso de cada parada.' },
  { id: 'circulo', name: 'El Círculo Infinito', syls: ['ha', 'go', 'lu', 'da', 'su', 'ha', 'su', 'go'], feeling: 'Ocho puertas que dan a ocho puertas. El viaje que no cierra.' },
  { id: 'expansion', name: 'La Expansión', syls: ['ha', 'lu', 'su', 'go', 'ha'], feeling: 'Sale, oscurece, expande, empuja, regresa. Arco emocional cerrado.' }
];

/**
 * @description Los 16 niveles de Tonaris.
 * Cada nivel trabaja un viaje. El nombre se revela al completarlo.
 */
const LEVELS = [
  { id: 1, name: 'Puerta de Entrada', journey: 'regreso', why: 'La puerta más directa al hogar. Dos pasos: afuera y adentro.' },
  { id: 2, name: 'El Peso', journey: 'peso', why: 'Sin rodeos. Directo al centro. Solo lo esencial.' },
  { id: 3, name: 'Respiración', journey: 'suspension', why: 'Inhala, flota, exhala. El ciclo completo del aire.' },
  { id: 4, name: 'Primer Rayo', journey: 'claridad', why: 'Sale, toca la luz, regresa. El viaje más luminoso del sistema.' },
  { id: 5, name: 'Ventana de Noche', journey: 'nostalgia', why: 'Ves el hogar desde afuera. Lo encuentras. Pero algo sigue tirando.' },
  { id: 6, name: 'Algodón de Azúcar', journey: 'caida_dulce', why: 'Se deshace suavemente. Llega sin golpe. Dulce por venir de lejos.' },
  { id: 7, name: 'Carretera', journey: 'camino_pop', why: 'Kilómetros conocidos. La ruta que todos han recorrido alguna vez.' },
  { id: 8, name: 'Marea', journey: 'viaje_emoc', why: 'Sale del centro, va hacia adentro, se expande, empuja. No regresa.' },
  { id: 9, name: 'El Paso del Jazz', journey: 'res_jazz', why: 'Tres pasos elegantes. La llegada se siente ganada.' },
  { id: 10, name: 'Escalera de Humo', journey: 'ascenso', why: 'Sube, pero pasa por la oscuridad antes del empuje final.' },
  { id: 11, name: 'Nudo en la Garganta', journey: 'ansiedad', why: 'Tensión que no puede sostenerse. Tiene que resolver.' },
  { id: 12, name: 'Tormenta de Verano', journey: 'blues', why: 'Calor, tensión, descarga. Se repite hasta que pasa.' },
  { id: 13, name: 'Montaña Rusa', journey: 'epica', why: 'Inevitable. Más grande que tú. Te lleva aunque no quieras.' },
  { id: 14, name: 'Reloj de Arena', journey: 'blues_largo', why: 'Cada función dura el doble. El tiempo se siente en el cuerpo.' },
  { id: 15, name: 'Sin Fin', journey: 'circulo', why: 'Ocho puertas que dan a ocho puertas. El viaje que no cierra.' },
  { id: 16, name: 'Todo el Mapa', journey: 'expansion', why: 'Sale, recorre todo, regresa. El arco más completo del sistema.' }
];

/** @description URL del Google Apps Script — reemplazar con la URL real */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/REEMPLAZAR_CON_TU_URL/exec';

/** @description Tiempo máximo de sesión en segundos */
const SESSION_MAX_SECS = 5 * 60;

/** @description Tiempo mínimo de sesión en segundos */
const SESSION_MIN_SECS = 0;

/** @description Aciertos consecutivos necesarios para subir de nivel */
const LEVEL_UP_THRESHOLD = 5;

/* ============================================================
   SECCIÓN 2: REFERENCIAS AL DOM
   Obtenidas una sola vez al inicio — nunca en funciones internas
   ============================================================ */

/** @description Objeto que centraliza todas las referencias al DOM */
const DOM = {
  // Fondo ambiental
  ambient: document.getElementById('ambient'),

  // Header
  btnHdrScale: document.getElementById('btn-hdr-scale'),
  btnExScale: document.getElementById('btn-ex-play-scale'),
  exScaleChips: document.getElementById('ex-scale-chips'),
  hdrStreak: document.getElementById('hdr-streak'),
  streakVal: document.getElementById('streak-val'),

  // Timer
  timerBar: document.getElementById('timer-bar'),
  timerVal: document.getElementById('timer-val'),
  timerFill: document.getElementById('timer-fill'),

  // Toast
  toast: document.getElementById('toast'),

  // Pantallas
  screens: {
    landing: document.getElementById('screen-landing'),
    register: document.getElementById('screen-register'),
    login: document.getElementById('screen-login'),
    dash: document.getElementById('screen-dash'),
    warmup: document.getElementById('screen-warmup'),
    exercise: document.getElementById('screen-exercise'),
    end: document.getElementById('screen-end'),
    f0: document.getElementById('screen-f0'),
    levels: document.getElementById('screen-levels'),
    profile: document.getElementById('screen-profile'),
    leaderboard: document.getElementById('screen-leaderboard')
  },

  // Landing
  btnGoRegister: document.getElementById('btn-go-register'),
  btnGoLogin: document.getElementById('btn-go-login'),

  // Registro
  btnBackLanding: document.getElementById('btn-back-landing'),
  inputName: document.getElementById('input-name'),
  inputEmail: document.getElementById('input-email'),
  inputPassword: document.getElementById('input-password'),
  inputAlias: document.getElementById('input-alias'),
  passwordError: document.getElementById('password-error'),
  aliasError: document.getElementById('alias-error'),
  nameError: document.getElementById('name-error'),
  emailError: document.getElementById('email-error'),
  btnRegister: document.getElementById('btn-register'),

  // Login
  btnBackLogin: document.getElementById('btn-back-login'),
  inputLoginEmail: document.getElementById('input-login-email'),
  inputLoginPassword: document.getElementById('input-login-password'),
  loginEmailError: document.getElementById('login-email-error'),
  loginPasswordError: document.getElementById('login-password-error'),
  btnLogin: document.getElementById('btn-login'),
  linkLoginToRegister: document.getElementById('link-login-to-register'),

  // Dashboard
  dashName: document.getElementById('dash-name'),
  dashDate: document.getElementById('dash-date'),
  reminder: document.getElementById('reminder'),
  dashLevelName: document.getElementById('dash-level-name'),
  dashProgFill: document.getElementById('dash-prog-fill'),
  dashProgFrac: document.getElementById('dash-prog-frac'),
  sessBadge: document.getElementById('sess-badge'),
  dashTonality: document.getElementById('dash-tonality'),
  btnStartSession: document.getElementById('btn-start-session'),
  btnGoLevels: document.getElementById('btn-go-levels'),
  btnGoProfile: document.getElementById('btn-go-profile'),
  btnGoLeaderboard: document.getElementById('btn-go-leaderboard'),

  // Calentamiento
  scaleChips: document.getElementById('scale-chips'),
  dirUp: document.getElementById('dir-up'),
  dirDown: document.getElementById('dir-down'),
  btnPlayScale: document.getElementById('btn-play-scale'),
  btnWarmupReady: document.getElementById('btn-warmup-ready'),

  // Ejercicio
  exTypeLabel: document.getElementById('ex-type-label'),
  exNumLabel: document.getElementById('ex-num-label'),
  exDots: document.getElementById('ex-dots'),
  btnPlayEx: document.getElementById('btn-play-ex'),
  exInstruction: document.getElementById('ex-instruction'),
  btnRepeatEx: document.getElementById('btn-repeat-ex'),
  answerZone: document.getElementById('answer-zone'),
  feedbackZone: document.getElementById('feedback-zone'),
  btnNextEx: document.getElementById('btn-next-ex'),

  // Cierre
  endIcon: document.getElementById('end-icon'),
  endTitle: document.getElementById('end-title'),
  endSub: document.getElementById('end-sub'),
  endCorrect: document.getElementById('end-correct'),
  endAccuracy: document.getElementById('end-accuracy'),
  endStreak: document.getElementById('end-streak'),
  endTime: document.getElementById('end-time'),
  levelUpBanner: document.getElementById('level-up-banner'),
  levelUpName: document.getElementById('level-up-name'),
  levelUpWhy: document.getElementById('level-up-why'),
  btnNextTonality: document.getElementById('btn-next-tonality'),
  btnEndHome: document.getElementById('btn-end-home'),

  // Fase 0
  btnF0Back: document.getElementById('btn-f0-back'),
  f0Tabs: document.querySelectorAll('.f0-tab'),
  f0Panels: document.querySelectorAll('.f0-panel'),
  f0ChromaSelector: document.getElementById('f0-chromatic-selector'),
  f0IdentitiesGrid: document.getElementById('f0-circle-container'),
  f0JourneysGrid: document.getElementById('f0-journeys-grid'),
  idCards: document.querySelectorAll('.id-card'),
  sensationDot: document.getElementById('sensation-dot'),
  sensationText: document.getElementById('sensation-text'),
  waveContainer: document.getElementById('wave-container'),
  seqDisplay: document.getElementById('seq-display'),
  btnPlayTraj: document.getElementById('btn-play-traj'),
  trajBtns: document.querySelectorAll('.traj-btn'),
  f0Score: document.getElementById('f0-score'),
  streakDots: document.querySelectorAll('.streak-dot'),
  f0ProgTxt: document.getElementById('f0-prog-txt'),
  f0ProgFill: document.getElementById('f0-prog-fill'),
  btnF0Play: document.getElementById('btn-f0-play'),
  f0AnsGrid: document.getElementById('f0-ans-grid'),
  f0Feedback: document.getElementById('f0-feedback'),

  // Niveles
  levelsGrid: document.getElementById('levels-grid'),
  btnLevelsBack: document.getElementById('btn-levels-back'),

  // Perfil
  profName: document.getElementById('prof-name'),
  profSince: document.getElementById('prof-since'),
  profLevel: document.getElementById('prof-level'),
  profStreak: document.getElementById('prof-streak'),
  profSessions: document.getElementById('prof-sessions'),
  sessHistory: document.getElementById('sess-history'),
  btnProfileBack: document.getElementById('btn-profile-back'),
  btnLogout: document.getElementById('btn-logout'),

  // Leaderboard
  leaderboardBody: document.getElementById('leaderboard-body'),
  btnLeaderboardBack: document.getElementById('btn-leaderboard-back'),
  btnExitSession: document.getElementById('btn-exit-session')
};

/* ============================================================
   SECCIÓN 3: ESTADO DE LA APLICACIÓN
   Estado centralizado — sin variables globales sueltas
   ============================================================ */

/** @description Estado global de la aplicación */
const State = {
  /** Pantalla actual */
  screen: 'landing',

  /** Usuario registrado */
  user: null,

  /** Progreso del usuario */
  progress: null,

  /** Sesión activa */
  session: {
    active: false,
    startTime: null,
    timerID: null,
    exercises: [],   // Cola de ejercicios de la sesión
    currentIdx: 0,    // Índice del ejercicio actual
    correct: 0,    // Aciertos en la sesión
    total: 0,    // Total de ejercicios intentados
    tonality: null, // Tonalidad del día
    currentOrder: []   // Orden temporal para el ejercicio de viaje
  },

  /** Estado del ejercicio actual */
  exercise: {
    type: null,  // 'melodic' | 'harmonic' | 'journey'
    answer: null,  // Respuesta correcta
    answered: false, // Si ya respondió
    audioData: null   // Datos para reproducir
  },

  /** Estado de Fase 0 */
  f0: {
    score: 0,
    streak: 0,
    total: 0,
    maxTotal: 10,
    currentNote: null,
    answered: false,
    tonalityRatio: 1.0,
    rootNoteIdx: 0,
    rootKey: 'C',
    activeTraj: 'ha-go-ha'
  },

  /** Drag & Drop */
  drag: {
    chip: null,  // Elemento que se está arrastrando
    origin: null   // 'bank' o 'drop'
  }
};

/* ============================================================
   SECCIÓN 4: MOTOR DE AUDIO — Web Audio API
   Síntesis aditiva con armónicos — igual al HTML original
   Sin archivos externos — 100% Netlify safe
   ============================================================ */

/** @description Contexto de audio compartido */
let audioCtx = null;

/**
 * @description Obtiene o crea el AudioContext.
 * Debe llamarse después de un gesto del usuario (política de autoplay).
 * @returns {AudioContext}
 */
function getAudioCtx() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * @description Calcula las frecuencias de la escala diatónica mayor
 * para una tonalidad dada.
 * @param {number} ratio - Ratio de transposición de la tonalidad
 * @returns {number[]} - Array de 7 frecuencias en Hz
 */
function getScaleFreqs(ratio) {
  return BASE_FREQS_C.map(f => f * ratio);
}

/**
 * @description Sintetiza una nota con 5 armónicos — igual al HTML original.
 * Produce un timbre tipo piano sintético rico en armónicos.
 * @param {AudioContext} ctx - El AudioContext activo
 * @param {number} freq - Frecuencia en Hz
 * @param {number} startTime - Tiempo de inicio (ctx.currentTime)
 * @param {number} duration - Duración en segundos
 * @param {number} [gainLevel=0.18] - Volumen de la nota
 */
function playNote(ctx, freq, startTime, duration, gainLevel = 0.18) {
  // Harmónicos: fundamental + 4 armónicos con ganancia decreciente
  const harmonics = [
    { mult: 1, gain: 1.00 },
    { mult: 2, gain: 0.50 },
    { mult: 3, gain: 0.25 },
    { mult: 4, gain: 0.12 },
    { mult: 5, gain: 0.06 }
  ];

  // Ganancia maestra de la nota
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  // Envelope ADSR simplificado
  masterGain.gain.setValueAtTime(0, startTime);
  masterGain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.02);  // Attack
  masterGain.gain.setValueAtTime(gainLevel, startTime + 0.05);           // Decay start
  masterGain.gain.exponentialRampToValueAtTime(gainLevel * 0.7, startTime + 0.15); // Sustain
  masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);      // Release

  // Crear y conectar cada armónico
  harmonics.forEach(({ mult, gain }) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * mult, startTime);

    oscGain.gain.setValueAtTime(gain, startTime);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05); // Margen de release
  });
}

/**
 * @description Reproduce un acorde (múltiples notas simultáneas).
 * Usado en ejercicios armónicos.
 * @param {AudioContext} ctx - El AudioContext activo
 * @param {number[]} freqs - Array de frecuencias del acorde
 * @param {number} startTime - Tiempo de inicio
 * @param {number} duration - Duración
 */
function playChord(ctx, freqs, startTime, duration) {
  // Reducir la ganancia individual para evitar clipping al sumar
  const gainPerNote = 0.12 / freqs.length;
  freqs.forEach(freq => playNote(ctx, freq, startTime, duration, gainPerNote));
}

/**
 * @description Reproduce la escala diatónica ascendente y descendente
 * con animación sincronizada en los chips.
 * @param {number} ratio - Ratio de transposición de la tonalidad
 * @param {Function} [onNote] - Callback llamado con el índice de la nota activa
 * @returns {Promise<void>}
 */
function playScale(ratio, onNote) {
  const ctx = getAudioCtx();
  const freqs = getScaleFreqs(ratio);
  const noteDur = 0.55; // Duración por nota
  const noteGap = 0.60; // Intervalo entre notas
  const pauseTop = 0.30; // Pausa en la cima antes de descender

  // Secuencia: sube (0–7) + pausa + baja (7–0)
  const sequence = [];
  for (let i = 0; i < 8; i++)  sequence.push(i);       // Ascendente (incluye octava)
  sequence.push(-1);                                     // Pausa en la cima
  for (let i = 7; i >= 0; i--) sequence.push(i);        // Descendente

  let t = ctx.currentTime + 0.05; // Pequeño offset inicial

  sequence.forEach((idx, pos) => {
    if (idx === -1) {
      // Pausa en la cima — no suena nota pero hay delay
      t += pauseTop;
      return;
    }

    playNote(ctx, freqs[idx], t, noteDur);

    // Callback de animación usando setTimeout relativo
    const delay = (t - ctx.currentTime) * 1000;
    if (onNote) {
      setTimeout(() => onNote(idx, pos < 8 ? 'up' : 'down'), delay);
    }

    t += noteGap;
  });

  // Promesa que resuelve cuando termina la escala completa
  return new Promise(resolve => {
    const totalTime = (t - ctx.currentTime) * 1000;
    setTimeout(resolve, totalTime + 200);
  });
}

/**
 * @description Reproduce una nota aislada. Usado en ejercicios melódicos.
 * @param {number} freq - Frecuencia en Hz
 * @param {number} [duration=1.2] - Duración en segundos
 */
function playMelodicNote(freq, duration = 1.2) {
  const ctx = getAudioCtx();
  playNote(ctx, freq, ctx.currentTime + 0.05, duration, 0.22);
}

/**
 * @description Reproduce un acorde diatónico a partir de sus frecuencias.
 * Identifica la función tonal del acorde. Usado en ejercicios armónicos.
 * @param {number[]} chordFreqs - Frecuencias de las notas del acorde
 */
function playHarmonicChord(chordFreqs) {
  const ctx = getAudioCtx();
  playChord(ctx, chordFreqs, ctx.currentTime + 0.05, 1.8);
}

/**
 * @description Reproduce una progresión de viaje con acordes.
 * @param {string[]} sylIds - Array de IDs de sílabas del viaje
 * @param {number} ratio - Ratio de la tonalidad del día
 * @param {Function} [onChord] - Callback llamado con el índice del acorde activo
 * @returns {Promise<void>}
 */
function playJourney(sylIds, ratio, onChord) {
  const ctx = getAudioCtx();
  const freqs = getScaleFreqs(ratio);
  const chordDur = 1.6;
  const chordGap = 1.8;

  let t = ctx.currentTime + 0.05;

  sylIds.forEach((sylId, idx) => {
    const gradeIdx = SCALE_ORDER.indexOf(sylId); // 0=ha, 1=ki... 6=za
    const rootFreq = freqs[gradeIdx];
    const isMinor = sylId === 'lu'; // Solo el relativo menor

    // Construir las 3 notas del acorde desde la escala
    const thirdIdx = (gradeIdx + 2) % 7;
    const fifthIdx = (gradeIdx + 4) % 7;
    const chordFreqs = [
      rootFreq,
      freqs[thirdIdx],
      freqs[fifthIdx]
    ];

    // Reducir ganancia para el acorde
    const gPerNote = 0.11;
    chordFreqs.forEach(f => playNote(ctx, f, t, chordDur, gPerNote));

    // Callback de animación
    const delay = (t - ctx.currentTime) * 1000;
    if (onChord) setTimeout(() => onChord(idx), delay);

    t += chordGap;
  });

  return new Promise(resolve => {
    const totalTime = (t - ctx.currentTime) * 1000;
    setTimeout(resolve, totalTime + 200);
  });
}

/* ============================================================
   SECCIÓN 5: PERSISTENCIA — localStorage + Google Sheets
   ============================================================ */

/**
 * @description Lee el progreso del usuario desde localStorage.
 * @returns {Object|null}
 */
function loadProgress() {
  try {
    const raw = localStorage.getItem('tonaris_progress');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/**
 * @description Guarda el progreso del usuario en localStorage.
 * @param {Object} progress
 */
function saveProgress(progress) {
  try {
    localStorage.setItem('tonaris_progress', JSON.stringify(progress));
  } catch (e) {
    console.warn('Tonaris: no se pudo guardar en localStorage', e);
  }
}

/**
 * @description Crea un progreso inicial para un usuario nuevo.
 * @param {string} userId
 * @param {string} name
 * @returns {Object}
 */
function createInitialProgress(userId, name) {
  return {
    userId,
    name,
    createdAt: new Date().toISOString(),
    currentLevel: 1,
    currentStage: 1,
    tonalityIndex: 0,   // Índice en TONALITY_RATIOS — rota cada sesión
    streak: {
      current: 0,
      max: 0,
      lastSessionDate: null
    },
    journeyHistory: {},  // { journeyId: { attempts, successes, consecutiveSuccesses, lastSeen, sm2Interval } }
    sessionsSummary: [],  // Últimas 30 sesiones
    queue: []   // Cola de datos pendientes de enviar a Sheets
  };
}

/**
 * @description Actualiza la racha diaria del usuario.
 * @param {Object} progress - Progreso a mutar
 */
function updateStreak(progress) {
  const today = new Date().toDateString();
  const last = progress.streak.lastSessionDate;

  if (last !== today) {
    if (!last) {
      progress.streak.current = 1;
    } else {
      const lastDate = new Date(last);
      const todayDate = new Date(today);
      const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        progress.streak.current += 1;
      } else if (diffDays > 1) {
        progress.streak.current = 1;
      }
    }
    progress.streak.lastSessionDate = today;
  }

  if (progress.streak.current > progress.streak.max) {
    progress.streak.max = progress.streak.current;
  }
}

/**
 * @description Calcula el intervalo SM-2 actualizado.
 * Acierto → duplica (máx 30 días). Error → reinicia a 1.
 * @param {number} current - Intervalo actual en días
 * @param {boolean} success - Si fue acierto
 * @returns {number} - Nuevo intervalo
 */
function calcSM2Interval(current, success) {
  if (!success) return 1;
  return Math.min(current * 2, 30);
}

/**
 * @description Actualiza el historial SM-2 de un viaje.
 * @param {Object} progress
 * @param {string} journeyId
 * @param {boolean} success
 */
function updateJourneyHistory(progress, journeyId, success) {
  if (!progress.journeyHistory[journeyId]) {
    progress.journeyHistory[journeyId] = {
      attempts: 0, successes: 0,
      consecutiveSuccesses: 0,
      lastSeen: null, sm2Interval: 1
    };
  }
  const h = progress.journeyHistory[journeyId];
  h.attempts += 1;
  h.lastSeen = new Date().toDateString();

  if (success) {
    h.successes += 1;
    h.consecutiveSuccesses += 1;
    h.sm2Interval = calcSM2Interval(h.sm2Interval, true);
  } else {
    h.consecutiveSuccesses = 0;
    h.sm2Interval = 1;
  }
}

/**
 * @description Verifica si el usuario debe subir de nivel.
 * @param {Object} progress
 * @returns {boolean}
 */
function checkLevelUp(progress) {
  const level = LEVELS[progress.currentLevel - 1];
  if (!level) return false;
  const h = progress.journeyHistory[level.journey];
  if (!h) return false;
  return h.consecutiveSuccesses >= LEVEL_UP_THRESHOLD;
}

/**
 * @description Envía un registro a Google Sheets via Apps Script.
 * Con retry automático y cola local si falla.
 * @param {Object} data - Datos del ejercicio o registro
 * @param {number} [retries=3]
 */
async function sendToSheets(data, retries = 3) {
  if (APPS_SCRIPT_URL.includes('REEMPLAZAR')) return;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        // Usamos 'text/plain' y 'no-cors' para evitar el preflight de CORS.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      });
      return; // Con no-cors la respuesta es opaca, pero el envío se procesa en la hoja de cálculo.
    } catch (_) {
      // Error de red — espera exponencial
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 800));
      }
    }
  }
  // Si falla después de todos los reintentos — encolar localmente
  enqueueLocally(data);
}

/**
 * @description Agrega un registro a la cola local de reintentos.
 * @param {Object} data
 */
function enqueueLocally(data) {
  const prog = State.progress;
  if (!prog) return;
  if (!prog.queue) prog.queue = [];
  prog.queue.push({ data, ts: Date.now() });
  saveProgress(prog);
}

/**
 * @description Intenta enviar la cola local pendiente.
 */
async function flushQueue() {
  const prog = State.progress;
  if (!prog || !prog.queue || prog.queue.length === 0) return;
  const pending = [...prog.queue];
  prog.queue = [];
  saveProgress(prog);
  for (const item of pending) {
    await sendToSheets(item.data, 1); // Un solo intento por item en flush
  }
}

/**
 * @description Sanitiza un string para prevenir XSS.
 * @param {string} str
 * @returns {string}
 */
function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/* ============================================================
   SECCIÓN 6: NAVEGACIÓN — sistema de pantallas
   ============================================================ */

/**
 * @description Muestra una pantalla y oculta el resto.
 * @param {string} screenId - Clave del objeto DOM.screens
 */
function showScreen(screenId) {
  // Ocultar todas las pantallas
  Object.values(DOM.screens).forEach(el => {
    if (el) el.classList.remove('screen--active');
  });

  // Mostrar la pantalla solicitada
  const target = DOM.screens[screenId];
  if (target) {
    target.classList.add('screen--active');
    target.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // Mostrar / ocultar el timer de sesión
  DOM.timerBar.style.display = State.session.active ? 'flex' : 'none';

  State.screen = screenId;
}

/* ============================================================
   SECCIÓN 7: DASHBOARD
   ============================================================ */

/**
 * @description Calcula la tonalidad del día por rotación cíclica.
 * El índice rota cada vez que se inicia una sesión.
 * @returns {Object} - Objeto de TONALITY_RATIOS
 */
function getTonalityOfDay() {
  const idx = State.progress.tonalityIndex % TONALITY_RATIOS.length;
  return TONALITY_RATIOS[idx];
}

/**
 * @description Actualiza el dashboard con los datos del progreso actual.
 */
async function renderDashboard() {
  const prog = State.progress;
  const level = LEVELS[prog.currentLevel - 1];
  const tonality = getTonalityOfDay();
  const today = new Date().toDateString();

  // Saludo con nombre
  DOM.dashName.textContent = sanitize(prog.name);

  // Fecha
  DOM.dashDate.textContent = new Date().toLocaleDateString('es', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Nivel y progreso
  DOM.dashLevelName.textContent = level ? level.name : 'Completado';
  const pct = prog.currentLevel > 16 ? 100 : ((prog.currentLevel - 1) / 16) * 100;
  DOM.dashProgFill.style.width = pct + '%';
  DOM.dashProgFrac.textContent = `Nivel ${prog.currentLevel} / 16`;

  // Tonalidad oculta
  DOM.dashTonality.textContent = '████';

  // Badge de sesión
  const hasSession = prog.streak.lastSessionDate === today;
  DOM.sessBadge.textContent = hasSession ? 'Completada' : 'Pendiente';
  DOM.sessBadge.className = 'badge ' + (hasSession ? 'badge--done' : 'badge--pending');

  // Recordatorio
  DOM.reminder.style.display = hasSession ? 'none' : 'flex';

  // Racha en el header
  if (prog.streak.current > 0) {
    DOM.hdrStreak.style.display = 'flex';
    DOM.streakVal.textContent = prog.streak.current;
  }

  // Última sesión
  if (prog.sessionsSummary && prog.sessionsSummary.length > 0) {
    const last = prog.sessionsSummary[prog.sessionsSummary.length - 1];
    // Solo mostrar si no es de hoy
    if (last.date !== today) {
      // Se podría renderizar en el card — extendible
    }
  }

  // Enriquecer con datos reales de la API
  const user = apiGetCurrentUser();
  if (user) {
    try {
      const summary = await apiGetSummary(user.user_id);
      if (summary && summary.data) {
        const d = summary.data;
        if (d.total_sessions) {
          DOM.dashProgFrac.textContent = `${d.total_sessions} sesiones · Nivel ${prog.currentLevel} / 16`;
        }
        if (d.best_score) {
          DOM.streakVal.textContent = prog.streak.current;
        }
      }
    } catch (e) {
      // API falló — dashboard local sigue funcionando
    }
  }
}

/* ============================================================
   SECCIÓN 8: GENERACIÓN DE EJERCICIOS
   Los 3 tipos: melódico, armónico, viaje
   ============================================================ */

/**
 * @description Selecciona 4 opciones aleatorias de las 7 sílabas,
 * garantizando que la respuesta correcta esté incluida.
 * @param {string} correctId - ID de la sílaba correcta
 * @returns {string[]} - Array de 4 IDs de sílabas en orden aleatorio
 */
function pickOptions(correctId) {
  const others = SCALE_ORDER.filter(id => id !== correctId);
  // Mezclar y tomar 3 distractores
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const options = [correctId, ...others.slice(0, 3)];
  // Mezclar el array final
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

/**
 * @description Genera la cola de ejercicios para una sesión.
 * Mezcla los 3 tipos para cada tonalidad del día.
 * @returns {Object[]} - Array de ejercicios
 */
function generateSessionExercises(tonality) {
  const prog = State.progress;
  const level = LEVELS[Math.min(prog.currentLevel - 1, 15)];
  const journey = JOURNEYS.find(j => j.id === level.journey);
  const activeTonality = tonality || getTonalityOfDay();
  const freqs = getScaleFreqs(activeTonality.ratio);
  const exercises = [];

  // --- 4 ejercicios melódicos ---
  // Usar notas del viaje actual principalmente, completar con otras
  const melNotes = [...journey.syls].slice(0, 4);
  // Si tiene menos de 4 sílabas únicas, agregar más
  const uniqueSyls = [...new Set(journey.syls)];
  while (melNotes.length < 4) melNotes.push(uniqueSyls[melNotes.length % uniqueSyls.length]);

  melNotes.slice(0, 4).forEach(sylId => {
    const gradeIdx = SCALE_ORDER.indexOf(sylId);
    exercises.push({
      type: 'melodic',
      answer: sylId,
      freq: freqs[gradeIdx],
      options: pickOptions(sylId),
      journeyId: level.journey
    });
  });

  // --- 3 ejercicios armónicos ---
  // Seleccionar 3 sílabas aleatorias de las 7 posibles
  const harmSyls = [...SCALE_ORDER].sort(() => Math.random() - 0.5).slice(0, 3);
  harmSyls.forEach(sylId => {
    const gradeIdx = SCALE_ORDER.indexOf(sylId);
    const chordFreqs = [
      freqs[gradeIdx],
      freqs[(gradeIdx + 2) % 7],
      freqs[(gradeIdx + 4) % 7]
    ];
    exercises.push({
      type: 'harmonic',
      answer: sylId,
      chordFreqs,
      options: pickOptions(sylId),
      journeyId: level.journey
    });
  });

  // --- 3 ejercicios de viaje ---
  // Usar el viaje del nivel actual + repasos SM-2
  const repasoCandidates = Object.entries(prog.journeyHistory)
    .filter(([id, h]) => {
      const today = new Date();
      const lastDate = h.lastSeen ? new Date(h.lastSeen) : null;
      const daysSince = lastDate
        ? Math.round((today - lastDate) / (1000 * 60 * 60 * 24))
        : 999;
      return daysSince >= h.sm2Interval && id !== level.journey;
    })
    .map(([id]) => id)
    .slice(0, 2);

  // Viaje actual + 0-2 repasos
  const journeyIds = [level.journey, ...repasoCandidates].slice(0, 3);
  // Rellenar con el viaje actual si no hay suficientes repasos
  while (journeyIds.length < 3) journeyIds.push(level.journey);

  journeyIds.forEach(journeyId => {
    const j = JOURNEYS.find(jj => jj.id === journeyId);
    if (!j) return;
    // Crear chips del banco: sílabas únicas del viaje + 1-2 distractores
    const uniqSyls = [...new Set(j.syls)];
    const distractors = SCALE_ORDER
      .filter(s => !uniqSyls.includes(s))
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(2, 7 - uniqSyls.length));
    const bankSyls = [...uniqSyls, ...distractors]
      .sort(() => Math.random() - 0.5);

    exercises.push({
      type: 'journey',
      answer: j.syls,
      journeyId: j.id,
      name: j.name,
      feeling: j.feeling,
      bankSyls,
      ratio: activeTonality.ratio
    });
  });

  // Mezclar los ejercicios para que no vayan todos del mismo tipo seguidos
  for (let i = exercises.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [exercises[i], exercises[j]] = [exercises[j], exercises[i]];
  }

  return exercises;
}

/* ============================================================
   SECCIÓN 9: RENDERIZADO DE EJERCICIOS
   ============================================================ */

/**
 * @description Renderiza los dots de progreso de la sesión.
 */
function renderExDots() {
  const { exercises, currentIdx } = State.session;
  DOM.exDots.innerHTML = '';
  const batchStart = Math.floor(currentIdx / 10) * 10;
  const batchEnd = Math.min(batchStart + 10, exercises.length);
  for (let idx = batchStart; idx < batchEnd; idx++) {
    const dot = document.createElement('div');
    dot.className = 'ex-dot';
    dot.setAttribute('role', 'listitem');
    if (idx < currentIdx) dot.classList.add('done');
    else if (idx === currentIdx) dot.classList.add('current');
    DOM.exDots.appendChild(dot);
  }
}

/**
 * @description Carga y renderiza el ejercicio en el índice actual de la cola.
 */
function renderCurrentExercise() {
  const { exercises, currentIdx } = State.session;
  const ex = exercises[currentIdx];
  if (!ex) return;

  // Reset del estado del ejercicio
  State.exercise = { type: ex.type, answer: ex.answer, answered: false, audioData: ex };
  State.session.currentOrder = [];

  // Labels del header
  DOM.exTypeLabel.textContent = ex.type === 'melodic' ? 'Melódico' :
    ex.type === 'harmonic' ? 'Armónico' : 'Viaje';
  const exInBatch = (currentIdx % 10) + 1;
  const tonalityName = State.session.tonality ? State.session.tonality.name : 'Do';
  DOM.exNumLabel.textContent = `Ejercicio ${exInBatch} de 10 (Tonalidad: ${tonalityName}) | Total: ${currentIdx + 1}`;

  // Instrucción
  DOM.exInstruction.innerHTML = ex.type === 'melodic'
    ? 'Escucha la nota y <strong>selecciona</strong> qué sílaba es.'
    : ex.type === 'harmonic'
      ? 'Escucha el acorde y <strong>selecciona</strong> qué función tonal es.'
      : 'Escucha el viaje y <strong>presiona</strong> las sílabas en el orden correcto.';

  // Limpiar zonas de respuesta y feedback
  DOM.answerZone.innerHTML = '';
  DOM.feedbackZone.innerHTML = '';
  DOM.btnNextEx.style.display = 'none';

  // Renderizar según tipo
  if (ex.type === 'melodic') renderMelodicExercise(ex);
  else if (ex.type === 'harmonic') renderHarmonicExercise(ex);
  else renderJourneyExercise(ex);

  // Dots de progreso
  renderExDots();

  // Reproducir audio automáticamente después de 400ms
  setTimeout(() => playCurrentExerciseAudio(), 400);
}

/**
 * @description Reproduce el audio del ejercicio actual.
 */
function playCurrentExerciseAudio() {
  const ex = State.exercise.audioData;
  if (!ex) return;

  if (ex.type === 'melodic') {
    playMelodicNote(ex.freq);

  } else if (ex.type === 'harmonic') {
    playHarmonicChord(ex.chordFreqs);

  } else if (ex.type === 'journey') {
    // Reproducir el viaje con animación de chips en la drop zone
    playJourney(ex.answer, ex.ratio);
  }
}

/**
 * @description Renderiza el ejercicio melódico — grid 2x2 con 4 opciones.
 * @param {Object} ex - Datos del ejercicio
 */
function renderMelodicExercise(ex) {
  const grid = document.createElement('div');
  grid.className = 'mel-grid';

  ex.options.forEach(sylId => {
    const syl = SYLLABLES[sylId];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `syl-btn ${sylId}`;
    btn.dataset.ans = sylId;
    btn.setAttribute('aria-label', `${syl.letter} — ${syl.word}`);
    btn.innerHTML = `
      <span class="syl-btn__letter">${syl.letter}</span>
      <span class="syl-btn__word">${syl.word}</span>
    `;
    btn.addEventListener('click', () => handleMelodicAnswer(sylId, btn, grid));

    // Efecto de inundación de color al pasar el cursor
    btn.addEventListener('mouseenter', () => {
      if (!State.exercise.answered) setAmbient(sylId);
    });
    btn.addEventListener('mouseleave', () => {
      if (!State.exercise.answered) setAmbient(null);
    });

    grid.appendChild(btn);
  });

  DOM.answerZone.appendChild(grid);
}

/**
 * @description Maneja la respuesta del ejercicio melódico.
 * @param {string} selectedId - ID de la sílaba seleccionada
 * @param {HTMLElement} btn - Botón seleccionado
 * @param {HTMLElement} grid - Grid de botones
 */
function handleMelodicAnswer(selectedId, btn, grid) {
  if (State.exercise.answered) return;
  State.exercise.answered = true;

  const correct = selectedId === State.exercise.answer;

  // Marcar todos los botones
  grid.querySelectorAll('.syl-btn').forEach(b => {
    b.classList.add('disabled');
    if (b.dataset.ans === State.exercise.answer) b.classList.add('correct');
    else if (b.dataset.ans === selectedId && !correct) b.classList.add('wrong');
  });

  // Actualizar ambiente
  setAmbient(State.exercise.answer);

  // Mostrar feedback
  showFeedback(correct, SYLLABLES[State.exercise.answer]);

  // Registrar resultado
  recordExerciseResult(correct);
}

/**
 * @description Renderiza el ejercicio armónico — grid 2x2 con palabra núcleo.
 * @param {Object} ex
 */
function renderHarmonicExercise(ex) {
  const grid = document.createElement('div');
  grid.className = 'harm-grid';

  ex.options.forEach(sylId => {
    const syl = SYLLABLES[sylId];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `harm-btn ${sylId}`;
    btn.dataset.ans = sylId;
    btn.setAttribute('aria-label', `${syl.letter} — ${syl.word} — ${syl.function}`);
    btn.innerHTML = `
      <span class="harm-btn__letter">${syl.letter}</span>
      <span class="harm-btn__word">${syl.word}</span>
      <span class="harm-btn__fn">${syl.function}</span>
    `;
    btn.addEventListener('click', () => handleHarmonicAnswer(sylId, btn, grid));

    // Efecto de inundación de color al pasar el cursor
    btn.addEventListener('mouseenter', () => {
      if (!State.exercise.answered) setAmbient(sylId);
    });
    btn.addEventListener('mouseleave', () => {
      if (!State.exercise.answered) setAmbient(null);
    });

    grid.appendChild(btn);
  });

  DOM.answerZone.appendChild(grid);
}

/**
 * @description Maneja la respuesta del ejercicio armónico.
 * @param {string} selectedId
 * @param {HTMLElement} btn
 * @param {HTMLElement} grid
 */
function handleHarmonicAnswer(selectedId, btn, grid) {
  if (State.exercise.answered) return;
  State.exercise.answered = true;

  const correct = selectedId === State.exercise.answer;

  grid.querySelectorAll('.harm-btn').forEach(b => {
    b.classList.add('disabled');
    if (b.dataset.ans === State.exercise.answer) b.classList.add('correct');
    else if (b.dataset.ans === selectedId && !correct) b.classList.add('wrong');
  });

  setAmbient(State.exercise.answer);
  showFeedback(correct, SYLLABLES[State.exercise.answer]);
  recordExerciseResult(correct);
}

/**
 * @description Renderiza el ejercicio de viajes con drag & drop.
 * @param {Object} ex
 */
function renderJourneyExercise(ex) {
  const wrap = document.createElement('div');
  wrap.className = 'journey-ex';

  // Nombre e sensación del viaje
  wrap.innerHTML = `
    <div class="journey-name">
      <h3 class="journey-name__title">${sanitize(ex.name)}</h3>
      <p class="journey-name__feel">${sanitize(ex.feeling)}</p>
    </div>
  `;

  // Zona de respuesta (drop zone)
  const dropZone = document.createElement('div');
  dropZone.className = 'drop-zone';
  dropZone.id = 'drop-zone';
  dropZone.setAttribute('aria-label', 'Presiona las sílabas abajo en el orden correcto');
  dropZone.innerHTML = `<span class="drop-zone__hint">Presiona las sílabas abajo en orden</span>`;
  wrap.appendChild(dropZone);

  // Banco de chips
  const bank = document.createElement('div');
  bank.className = 'chips-bank';
  bank.id = 'chips-bank';
  bank.innerHTML = `<div class="chips-bank__lbl">Sílabas disponibles</div>`;

  // Permitir todas las sílabas para repetición libre
  SCALE_ORDER.forEach(sylId => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `drag-chip ${sylId}`;
    btn.textContent = SYLLABLES[sylId].letter;
    btn.onclick = () => addSylToJourney(sylId, dropZone, verifyBtn);
    bank.appendChild(btn);
  });

  wrap.appendChild(bank);

  // Botón de verificar
  const verifyBtn = document.createElement('button');
  verifyBtn.type = 'button';
  verifyBtn.className = 'verify-btn';
  verifyBtn.id = 'verify-journey';
  verifyBtn.disabled = true;
  verifyBtn.textContent = '✓  Verificar orden';
  verifyBtn.setAttribute('aria-label', 'Verificar el orden de las sílabas');
  wrap.appendChild(verifyBtn);

  DOM.answerZone.appendChild(wrap);

  // Inicializar lógica de ordenamiento
  initOrderingLogic(dropZone, verifyBtn, ex.answer);
}

/** @description Añade una sílaba al viaje actual al hacer clic */
function addSylToJourney(sylId, dropZone, verifyBtn) {
  if (State.exercise.answered) return;
  State.session.currentOrder.push(sylId);
  renderJourneyOrder(dropZone, verifyBtn);

  // Feedback sonoro
  const tonality = getTonalityOfDay();
  const freqs = getScaleFreqs(tonality.ratio);
  playMelodicNote(freqs[SCALE_ORDER.indexOf(sylId)], 0.5);
  setAmbient(sylId);
}

/** @description Renderiza los chips en la zona de respuesta */
function renderJourneyOrder(dropZone, verifyBtn) {
  dropZone.innerHTML = '';
  if (State.session.currentOrder.length === 0) {
    dropZone.innerHTML = `<span class="drop-zone__hint">Presiona las sílabas abajo en orden</span>`;
    verifyBtn.disabled = true;
    return;
  }
  State.session.currentOrder.forEach((sylId, idx) => {
    const chip = document.createElement('div');
    chip.className = `drag-chip in-drop ${sylId}`;
    chip.textContent = SYLLABLES[sylId].letter;
    chip.onclick = () => {
      if (State.exercise.answered) return;
      State.session.currentOrder.splice(idx, 1);
      renderJourneyOrder(dropZone, verifyBtn);
    };
    dropZone.appendChild(chip);
  });
  verifyBtn.disabled = false;
}

/** @description Lógica de verificación final */
function initOrderingLogic(dropZone, verifyBtn, answer) {
  verifyBtn.onclick = () => {
    if (State.exercise.answered) return;
    State.exercise.answered = true;
    const correct = JSON.stringify(State.session.currentOrder) === JSON.stringify(answer);
    dropZone.classList.add(correct ? 'drop-zone--correct' : 'drop-zone--wrong');
    setAmbient(answer[0]);
    showFeedback(correct, SYLLABLES[answer[0]], answer);
    recordExerciseResult(correct);
  };
}

/**
 * @description Muestra el feedback de respuesta correcta o incorrecta.
 * @param {boolean} correct
 * @param {Object} correctSyl - Objeto de la sílaba correcta
 * @param {string[]} [fullAnswer] - Para viajes, el array completo
 */
function showFeedback(correct, correctSyl, fullAnswer) {
  const title = correct ? '¡Correcto!' : 'Casi — sigue intentando';

  let text = '';
  if (correct) {
    text = `${correctSyl.letter} — ${correctSyl.word}. ${correctSyl.feeling}`;
  } else if (fullAnswer) {
    // Para viajes — mostrar el orden correcto
    text = `El orden correcto era: ${fullAnswer.map(id => SYLLABLES[id].letter).join(' → ')}`;
  } else {
    text = `Era ${correctSyl.letter} — ${correctSyl.word}. ${correctSyl.feeling}`;
  }

  DOM.feedbackZone.innerHTML = `
    <div class="feedback ${correct ? 'feedback--ok' : 'feedback--err'}">
      <span class="feedback__icon">${correct ? '✓' : '✗'}</span>
      <div class="feedback__body">
        <div class="feedback__title">${sanitize(title)}</div>
        <p class="feedback__text">${sanitize(text)}</p>
      </div>
    </div>
  `;

  if (correct) {
    setTimeout(() => advanceExercise(), 800);
  } else {
    DOM.btnNextEx.style.display = '';
  }
}

/**
 * @description Registra el resultado del ejercicio actual en el progreso
 * y lo envía a Google Sheets.
 * @param {boolean} correct
 */
function recordExerciseResult(correct) {
  const ex = State.exercise.audioData;
  const prog = State.progress;

  // Conteo de la sesión
  if (correct) State.session.correct++;
  State.session.total++;

  // Actualizar SM-2 del viaje involucrado
  if (ex.journeyId) {
    updateJourneyHistory(prog, ex.journeyId, correct);
  }

  // Guardar progreso
  saveProgress(prog);

  // Enviar a Sheets (asíncrono — no bloquea la UI)
  sendToSheets({
    action: 'log_exercise',
    userId: prog.userId,
    timestamp: new Date().toISOString(),
    tonality: getTonalityOfDay().symbol,
    journeyId: ex.journeyId || '',
    type: ex.type,
    level: prog.currentLevel,
    correct: correct,
    nAttempts: 1
  }).catch(() => { }); // Silenciar errores — ya maneja cola interna
}

/* ============================================================
   SECCIÓN 10: TIMER DE SESIÓN
   ============================================================ */

const SESSION_STORE_KEY = 'tonaris_active_session';

function saveActiveSession(endTimestamp) {
  const s = State.session;
  const data = {
    sessionId: s.sessionId,
    sessionEndTimestamp: endTimestamp,
    accumulatedScore: { correct: s.correct, total: s.total },
    sessionStatus: 'active'
  };
  localStorage.setItem(SESSION_STORE_KEY, JSON.stringify(data));
}

function clearActiveSession() {
  localStorage.removeItem(SESSION_STORE_KEY);
}

function loadActiveSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function startSessionTimer(sessionEndTimestamp) {
  // sessionEndTimestamp es el timestamp Unix (ms) en que termina la sesión
  // Si no se provee, crear uno nuevo a partir de ahora
  const endTs = sessionEndTimestamp || (Date.now() + SESSION_MAX_SECS * 1000);
  State.session.sessionEndTimestamp = endTs;
  State.session.startTime = endTs - SESSION_MAX_SECS * 1000; // retrocompatibilidad

  saveActiveSession(endTs);

  DOM.timerBar.style.display = 'flex';

  if (State.session.timerID) clearInterval(State.session.timerID);

  State.session.timerID = setInterval(() => {
    const remaining = Math.floor((endTs - Date.now()) / 1000);

    if (remaining <= 0) {
      clearInterval(State.session.timerID);
      State.session.timerID = null;
      clearActiveSession();
      endSession();
      showToast('¡Sesión completada! Revisa tu progreso en el ranking.', 4000);
      return;
    }

    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    DOM.timerVal.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    const pct = (remaining / SESSION_MAX_SECS) * 100;
    DOM.timerFill.style.width = pct + '%';

    const isEnd = remaining <= 60;
    DOM.timerVal.className = 'timer-bar__val' + (isEnd ? ' end' : '');
    DOM.timerFill.className = 'timer-fill' + (isEnd ? ' end' : '');
  }, 1000);
}

function stopSessionTimer() {
  if (State.session.timerID) {
    clearInterval(State.session.timerID);
    State.session.timerID = null;
  }
  clearActiveSession();
  DOM.timerBar.style.display = 'none';
}

/* ============================================================
   SECCIÓN 11: FLUJO DE SESIÓN
   ============================================================ */

/**
 * @description Inicia una nueva sesión de entrenamiento.
 */
function startSession() {
  const prog = State.progress;

  // Rotar tonalidad al inicio
  prog.tonalityIndex = (prog.tonalityIndex + 1) % TONALITY_RATIOS.length;
  saveProgress(prog);

  // Enviar cola pendiente antes de empezar
  flushQueue().catch(() => { });

  // Inicializar estado de sesión
  State.session.active = true;
  State.session.correct = 0;
  State.session.total = 0;
  State.session.sessionId = 'sess_' + Math.random().toString(36).slice(2, 10);
  State.session.tonality = getTonalityOfDay();
  State.session.exercises = generateSessionExercises(State.session.tonality);
  State.session.currentIdx = 0;

  const wPhase = document.querySelector('.warmup__phase');
  const wTitle = document.getElementById('warmup-title');
  const wSub = document.getElementById('warmup-sub');
  if (wPhase) wPhase.textContent = "Calentamiento";
  if (wTitle) wTitle.textContent = "Escucha la escala de hoy";
  if (wSub) wSub.textContent = "Ascendente y descendente. Siente dónde está el hogar (Ha).";

  showScreen('warmup');

  // Crear nueva sesión — nunca reutilizar sessionEndTimestamp existente
  startSessionTimer();
}

/**
 * @description Avanza al siguiente ejercicio o termina la sesión.
 */
function advanceExercise() {
  State.session.currentIdx++;

  if (State.session.currentIdx >= State.session.exercises.length) {
    // Rotar tonalidad automáticamente cada 10 ejercicios
    const prog = State.progress;
    prog.tonalityIndex = (prog.tonalityIndex + 1) % TONALITY_RATIOS.length;
    saveProgress(prog);

    const nextTonality = getTonalityOfDay();
    State.session.tonality = nextTonality;

    // Generar y agregar 10 nuevos ejercicios
    const newExs = generateSessionExercises(nextTonality);
    State.session.exercises.push(...newExs);

    // Cambiar textos del warmup para notificar el cambio
    const wPhase = document.querySelector('.warmup__phase');
    const wTitle = document.getElementById('warmup-title');
    const wSub = document.getElementById('warmup-sub');
    if (wPhase) wPhase.textContent = "Cambio de Tonalidad";
    if (wTitle) wTitle.textContent = `Nueva tonalidad: ${nextTonality.name} (${nextTonality.symbol})`;
    if (wSub) wSub.textContent = "Escucha la escala ascendente y descendente una vez antes de continuar.";

    // Mostrar warmup y sonar escala automáticamente
    showScreen('warmup');
    setTimeout(() => {
      runScaleAnimation(DOM.btnPlayScale, DOM.scaleChips);
    }, 500);
  } else {
    showScreen('exercise');
    renderCurrentExercise();
  }
}

/**
 * @description Termina la sesión y muestra el resumen.
 */
function endSession() {
  stopSessionTimer();
  State.session.active = false;

  const prog = State.progress;
  const total = State.session.total;
  const correct = State.session.correct;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const duration = State.session.startTime
    ? Math.round((Date.now() - State.session.startTime) / 60000)
    : 0;

  // Actualizar racha
  updateStreak(prog);

  // Verificar avance de nivel
  const didLevelUp = checkLevelUp(prog);
  if (didLevelUp && prog.currentLevel < 16) {
    prog.currentLevel++;
  }

  // Guardar resumen de sesión
  if (!prog.sessionsSummary) prog.sessionsSummary = [];
  prog.sessionsSummary.push({
    date: new Date().toDateString(),
    correct,
    total,
    accuracy,
    duration
  });
  // Mantener solo las últimas 30
  if (prog.sessionsSummary.length > 30) {
    prog.sessionsSummary = prog.sessionsSummary.slice(-30);
  }

  saveProgress(prog);

  // Enviar resumen a Sheets
  sendToSheets({
    action: 'log_session',
    userId: prog.userId,
    timestamp: new Date().toISOString(),
    tonality: getTonalityOfDay().symbol,
    level: prog.currentLevel,
    correct,
    total,
    accuracy,
    duration,
    streak: prog.streak.current
  }).catch(() => { });

  // Guardar sesión en PostgreSQL
  const apiUser = apiGetCurrentUser();
  if (apiUser) {
    apiSaveSession({
      session_id: String(Date.now()),
      userId: apiUser.user_id,
      tonality: getTonalityOfDay().symbol,
      correct,
      total,
      duration: Math.round(duration),
      accuracy
    }).catch(() => {});
  }

  // Actualizar pantalla de cierre
  DOM.endCorrect.textContent = `${correct}/${total}`;
  DOM.endAccuracy.textContent = accuracy + '%';
  DOM.endStreak.textContent = '🔥 ' + prog.streak.current;
  DOM.endTime.textContent = duration + ' min';

  // Mostrar banner de nivel si subió
  if (didLevelUp) {
    const newLevel = LEVELS[prog.currentLevel - 1];
    DOM.levelUpBanner.style.display = '';
    DOM.levelUpName.textContent = newLevel ? newLevel.name : '¡Completado!';
    DOM.levelUpWhy.textContent = newLevel ? newLevel.why : 'Has completado todos los niveles.';
  } else {
    DOM.levelUpBanner.style.display = 'none';
  }

  // Mostrar pantalla de cierre
  showScreen('end');
  if (duration >= 15) {
    updateLeaderboardScore(prog.name, prog.streak.current * 100 + (prog.sessionsSummary ? prog.sessionsSummary.length * 50 : 0));
  }
}

/**
 * @description Actualiza el puntaje de la tabla de clasificación y mantiene persistencia en localStorage.
 */
function updateLeaderboardScore(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem('tonaris_leaderboard') || '[]');
  // Intentar encontrar si ya existe el participante
  let userEntry = leaderboard.find(e => e.name.toLowerCase() === name.toLowerCase());
  if (userEntry) {
    if (score > userEntry.score) userEntry.score = score;
  } else {
    leaderboard.push({ name, score });
  }
  // Ordenar de mayor a menor y truncar a 100 mejores
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 100);
  localStorage.setItem('tonaris_leaderboard', JSON.stringify(leaderboard));
}

/**
 * @description Renderiza el Top 100 del Leaderboard global.
 */
async function renderLeaderboard() {
  if (!DOM.leaderboardBody) return;
  DOM.leaderboardBody.innerHTML = '';

  let entries = [];

  try {
    const apiData = await apiGetLeaderboard();
    const list = apiData?.data || apiData;
    if (list && list.length > 0) {
      entries = list.map(entry => ({
        name: entry.alias || entry.name,
        score: parseInt(entry.avg_accuracy) || 0
      }));
    }
  } catch (e) {
    // API falló — fallback a localStorage
  }

  if (entries.length === 0) {
    let leaderboard = JSON.parse(localStorage.getItem('tonaris_leaderboard') || '[]');
    if (leaderboard.length === 0) {
      const defaultList = [
        { name: 'Mozart', score: 1500 },
        { name: 'Beethoven', score: 1400 },
        { name: 'Bach', score: 1300 },
        { name: 'Chopin', score: 1100 },
        { name: 'Debussy', score: 950 },
        { name: 'Ravel', score: 800 }
      ];
      if (State.progress) {
        defaultList.push({
          name: State.progress.name,
          score: State.progress.streak.current * 100 + (State.progress.sessionsSummary ? State.progress.sessionsSummary.length * 50 : 0)
        });
      }
      leaderboard = defaultList.sort((a, b) => b.score - a.score).slice(0, 100);
      localStorage.setItem('tonaris_leaderboard', JSON.stringify(leaderboard));
    }
    entries = leaderboard;
  }

  entries.forEach((entry, idx) => {
    const pos = idx + 1;
    let rankStyle = '';
    let medal = '';
    if (pos === 1) {
      rankStyle = 'background: rgba(212, 160, 23, 0.2); color: #D4A017; font-weight: bold;';
      medal = '🥇 ';
    } else if (pos === 2) {
      rankStyle = 'background: rgba(192, 192, 192, 0.2); color: #C0C0C0; font-weight: bold;';
      medal = '🥈 ';
    } else if (pos === 3) {
      rankStyle = 'background: rgba(205, 127, 50, 0.2); color: #CD7F32; font-weight: bold;';
      medal = '🥉 ';
    } else {
      rankStyle = 'color: var(--foreground);';
    }

    const tr = document.createElement('tr');
    tr.style.cssText = 'border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: var(--t-sm);';
    tr.innerHTML = `
      <td style="padding: var(--s2) var(--s3); ${rankStyle}">${medal}${pos}</td>
      <td style="padding: var(--s2) var(--s3);">${sanitize(entry.name)}</td>
      <td style="padding: var(--s2) var(--s3); text-align: right; font-weight: bold;">${entry.score} pts</td>
    `;
    DOM.leaderboardBody.appendChild(tr);
  });
}

/* ============================================================
   SECCIÓN 12: FASE 0 — DESPERTAR TONAL
   Preserva la lógica del HTML original
   ============================================================ */
/**
 * @description Renderiza el selector de 12 notas cromáticas para Fase 0.
 */
function renderF0ChromaticSelector() {
  if (!DOM.f0ChromaSelector) return;
  DOM.f0ChromaSelector.innerHTML = '';

  CIRCLE_OF_FIFTHS.forEach((key, idx) => {
    const keyData = KEY_DEFINITIONS[key];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chroma-btn ${key === State.f0.rootKey ? 'active' : ''}`;
    btn.textContent = keyData.name;
    // Calculamos el ángulo para el CSS (C arriba = -90deg o 270deg)
    btn.style.setProperty('--angle', `${(idx * 30) - 90}deg`);

    btn.onclick = () => {
      DOM.f0ChromaSelector.querySelectorAll('.chroma-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.f0.tonalityRatio = keyData.ratio;
      State.f0.rootKey = key;
      renderF0Identities();
      renderF0Journeys();
    };
    DOM.f0ChromaSelector.appendChild(btn);
  });
}

/**
 * @description Renderiza las 7 identidades con transporte.
 */
/**
 * @description Mapeo de notas en español e inglés a sus clases de tono (Pitch Classes 0-11).
 */
const SPANISH_NOTE_TO_PITCH = {
  'do': 0, 'c': 0,
  'sol': 7, 'g': 7,
  're': 2, 'd': 2,
  'la': 9, 'a': 9,
  'mi': 4, 'e': 4,
  'si': 11, 'b': 11,
  'solb/fa#': 6, 'fa#': 6, 'solb': 6, 'f#': 6, 'gb': 6,
  'reb': 1, 'do#': 1, 'db': 1, 'c#': 1,
  'lab': 8, 'sol#': 8, 'ab': 8, 'g#': 8,
  'mib': 3, 're#': 3, 'eb': 3, 'd#': 3,
  'sib': 10, 'la#': 10, 'bb': 10, 'a#': 10,
  'fa': 5, 'f': 5,
  // Relativos menores
  'lam': 9, 'am': 9,
  'mim': 4, 'em': 4,
  'sim': 11, 'bm': 11,
  'fa#m': 6, 'f#m': 6,
  'do#m': 1, 'c#m': 1,
  'sol#m': 8, 'g#m': 8,
  'mibm/re#m': 3, 'ebm/d#m': 3, 'mibm': 3, 're#m': 3, 'ebm': 3, 'd#m': 3,
  'sibm': 10, 'bbm': 10,
  'fam': 5, 'fm': 5,
  'dom': 0, 'cm': 0,
  'solm': 7, 'gm': 7,
  'rem': 2, 'dm': 2
};

/**
 * @description Mapeo de notas en el círculo a sus símbolos de clave en la aplicación.
 */
const SPANISH_TO_KEY_SYMBOL = {
  'do': 'C', 'sol': 'G', 're': 'D', 'la': 'A', 'mi': 'E', 'si': 'B',
  'solb/fa#': 'F#', 'reb': 'Db', 'lab': 'Ab', 'mib': 'Eb', 'sib': 'Bb', 'fa': 'F',
  'lam': 'C', 'mim': 'G', 'sim': 'D', 'fa#m': 'A', 'do#m': 'E', 'sol#m': 'B',
  'mibm/re#m': 'F#', 'sibm': 'Db', 'fam': 'Ab', 'dom': 'Eb', 'solm': 'Bb', 'rem': 'F'
};

const F0_SPANISH_MAJORS = ['Do', 'Sol', 'Re', 'La', 'Mi', 'Si', 'Solb/Fa#', 'Reb', 'Lab', 'Mib', 'Sib', 'Fa'];
const F0_SPANISH_MINORS = ['Lam', 'Mim', 'Sim', 'Fa#m', 'Do#m', 'Sol#m', 'Mibm/Re#m', 'Sibm', 'Fam', 'Dom', 'Solm', 'Rem'];
const F0_SIGNATURES = ['0', '1 ♯', '2 ♯', '3 ♯', '4 ♯', '5 ♯', '6♭/6♯', '5 ♭', '4 ♭', '3 ♭', '2 ♭', '1 ♭'];

/**
 * @description Genera un string de ruta SVG para una sección de anillo.
 */
function getArcPath(cx, cy, rIn, rOut, startAngleDeg, endAngleDeg) {
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;

  const x1 = cx + rOut * Math.cos(startRad);
  const y1 = cy + rOut * Math.sin(startRad);
  const x2 = cx + rOut * Math.cos(endRad);
  const y2 = cy + rOut * Math.sin(endRad);

  const x3 = cx + rIn * Math.cos(endRad);
  const y3 = cy + rIn * Math.sin(endRad);
  const x4 = cx + rIn * Math.cos(startRad);
  const y4 = cy + rIn * Math.sin(startRad);

  const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? 0 : 1;

  return `M ${x1} ${y1} ` +
    `A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${x2} ${y2} ` +
    `L ${x3} ${y3} ` +
    `A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${x4} ${y4} ` +
    `Z`;
}

/**
 * @description Renderiza el Círculo de Quintas interactivo SVG.
 */
function renderF0Identities() {
  if (!DOM.f0IdentitiesGrid) return;
  DOM.f0IdentitiesGrid.innerHTML = '';

  const cx = 220;
  const cy = 220;
  const rOutMajor = 195;
  const rInMajor = 142;
  const rOutMinor = 142;
  const rInMinor = 90;

  const activeKey = State.f0.rootKey;
  const activeNotes = KEY_DEFINITIONS[activeKey].notes;
  const activePitchClasses = activeNotes.map(n => SPANISH_NOTE_TO_PITCH[n.toLowerCase()]);
  const activeKeyPitch = SPANISH_NOTE_TO_PITCH[activeKey.toLowerCase()];

  // Crear SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 440 440');
  svg.setAttribute('class', 'circle-svg');

  // Loop de 12 sectores
  for (let i = 0; i < 12; i++) {
    // Ángulo en grados. C (Do) está a las 12 (North = -90 grados)
    const angleCenter = -90 + i * 30;
    const startAngle = angleCenter - 15;
    const endAngle = angleCenter + 15;

    const majorNote = F0_SPANISH_MAJORS[i];
    const majorPitch = SPANISH_NOTE_TO_PITCH[majorNote.toLowerCase()];
    const minorNote = F0_SPANISH_MINORS[i];
    const minorPitch = SPANISH_NOTE_TO_PITCH[minorNote.toLowerCase()];

    // Índices funcionales
    const majorIdx = activePitchClasses.indexOf(majorPitch);
    const minorIdx = activePitchClasses.indexOf(minorPitch);

    const isMajorRoot = (SPANISH_TO_KEY_SYMBOL[majorNote.toLowerCase()] === activeKey);

    // --- ANILLO MAYOR (EXTERIOR) ---
    const majorPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    majorPath.setAttribute('d', getArcPath(cx, cy, rInMajor, rOutMajor, startAngle, endAngle));
    let majorClass = 'circle-sector';
    const majorSyl = majorIdx !== -1 ? SCALE_ORDER[majorIdx] : null;
    if (majorSyl) majorClass += ` deg-${majorSyl}`;
    if (isMajorRoot) majorClass += ' active-root';
    majorPath.setAttribute('class', majorClass);

    // --- ANILLO MENOR (INTERIOR) ---
    const minorPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    minorPath.setAttribute('d', getArcPath(cx, cy, rInMinor, rOutMinor, startAngle, endAngle));
    let minorClass = 'circle-sector';
    const minorSyl = minorIdx !== -1 ? SCALE_ORDER[minorIdx] : null;
    if (minorSyl) minorClass += ` deg-${minorSyl}`;
    minorPath.setAttribute('class', minorClass);

    // --- TEXTOS MAYOR Y MENOR ---
    const radCenter = (angleCenter * Math.PI) / 180;

    const rTextMajor = (rOutMajor + rInMajor) / 2;
    const txMajor = cx + rTextMajor * Math.cos(radCenter);
    const tyMajor = cy + rTextMajor * Math.sin(radCenter);

    const textMajor = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textMajor.setAttribute('x', txMajor);
    textMajor.setAttribute('y', tyMajor);
    textMajor.setAttribute('class', 'circle-text');
    textMajor.textContent = majorNote;

    const rTextMinor = (rOutMinor + rInMinor) / 2;
    const txMinor = cx + rTextMinor * Math.cos(radCenter);
    const tyMinor = cy + rTextMinor * Math.sin(radCenter);

    const textMinor = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textMinor.setAttribute('x', txMinor);
    textMinor.setAttribute('y', tyMinor);
    textMinor.setAttribute('class', 'circle-text minor');
    textMinor.textContent = minorNote;

    // --- ARMADURA / SIGNO (EXTERIOR) ---
    const rTextSig = 214;
    const txSig = cx + rTextSig * Math.cos(radCenter);
    const tySig = cy + rTextSig * Math.sin(radCenter);

    const textSig = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textSig.setAttribute('x', txSig);
    textSig.setAttribute('y', tySig);
    textSig.setAttribute('class', 'circle-text signature');
    textSig.textContent = F0_SIGNATURES[i];

    // --- EVENTOS INTERACTIVOS ---
    const setupEvents = (element, noteName, pitch, sylId, isMajor) => {
      // Un solo click: reproducir nota y mostrar descripción
      element.onclick = () => {
        const diff = (pitch - activeKeyPitch) % 12;
        const steps = diff < 0 ? diff + 12 : diff;
        const freq = 261.63 * Math.pow(2, steps / 12) * State.f0.tonalityRatio;

        playF0Note(freq, sylId || null);

        if (sylId) {
          const syl = SYLLABLES[sylId];
          DOM.sensationText.innerHTML = `<strong>${syl.letter} (${syl.word}) — Grado ${syl.grade}</strong>: ${syl.feeling}`;
          DOM.sensationDot.className = `sensation-dot ${sylId}`;
        } else {
          DOM.sensationText.innerHTML = `<strong>${noteName}</strong>: Fuera de la escala activa (${activeKey} Mayor).`;
          DOM.sensationDot.className = 'sensation-dot';
        }
      };

      // Doble click: cambiar la tonalidad activa de Fase 0
      element.ondblclick = (e) => {
        e.stopPropagation();
        const newKey = SPANISH_TO_KEY_SYMBOL[noteName.toLowerCase()];
        if (newKey && newKey !== State.f0.rootKey) {
          State.f0.rootKey = newKey;
          State.f0.tonalityRatio = KEY_DEFINITIONS[newKey].ratio;
          renderF0Identities();
          renderF0Journeys();
          showToast(`Tonalidad cambiada a ${newKey} Mayor`);
        }
      };

      // Hover
      element.onmouseenter = () => {
        if (sylId) setAmbient(sylId);
      };
      element.onmouseleave = () => {
        setAmbient(null);
      };
    };

    setupEvents(majorPath, majorNote, majorPitch, majorSyl, true);
    setupEvents(minorPath, minorNote, minorPitch, minorSyl, false);

    // Agregar al SVG
    svg.appendChild(majorPath);
    svg.appendChild(minorPath);
    svg.appendChild(textMajor);
    svg.appendChild(textMinor);
    svg.appendChild(textSig);
  }

  DOM.f0IdentitiesGrid.appendChild(svg);
}

/**
 * @description Renderiza los 16 viajes para Fase 0.
 */
function renderF0Journeys() {
  if (!DOM.f0JourneysGrid) return;
  DOM.f0JourneysGrid.innerHTML = '';
  JOURNEYS.forEach(journey => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'traj-btn';
    btn.innerHTML = `
      <span class="traj-btn__lbl">${journey.name}</span>
      <span class="traj-btn__seq">${journey.syls.map(s => SYLLABLES[s].letter).join('→')}</span>
    `;
    btn.onclick = () => {
      const ratio = State.f0.tonalityRatio;
      playJourney(journey.syls, ratio, (idx) => {
        setAmbient(journey.syls[idx]);
      });
    };
    DOM.f0JourneysGrid.appendChild(btn);
  });
}

function initWaveBars() {
}

/** @description Referencia al intervalo de animación de onda */
let waveAnimID = null;

/**
 * @description Anima las barras de onda mientras suena una nota.
 * @param {string} sylId - ID de la sílaba activa
 */
function animateWave(sylId) {
  stopWave();
  const bars = DOM.waveContainer.querySelectorAll('.wave-bar');
  waveAnimID = setInterval(() => {
    bars.forEach(bar => {
      const h = 5 + Math.random() * 28;
      bar.style.height = h + 'px';
      bar.className = `wave-bar active ${sylId}`;
    });
  }, 80);
}

/**
 * @description Detiene la animación de onda y resetea las barras.
 */
function stopWave() {
  if (waveAnimID) { clearInterval(waveAnimID); waveAnimID = null; }
  DOM.waveContainer.querySelectorAll('.wave-bar').forEach(bar => {
    bar.style.height = '5px';
    bar.className = 'wave-bar';
  });
}

/**
 * @description Reproduce una nota en la Fase 0 con animación de onda.
 * @param {number} freq - Frecuencia en Hz
 * @param {string} sylId - ID de la sílaba
 * @param {number} [duration=1.2]
 */
function playF0Note(freq, sylId, duration = 1.2) {
  playMelodicNote(freq, duration);
  setAmbient(sylId);
  animateWave(sylId);
  setTimeout(stopWave, duration * 1000 + 100);
}

/**
 * @description Trayectorias de la Fase 0 con sus notas.
 */
const F0_TRAJECTORIES = {
  'ha-go-ha': [
    { syl: 'ha', freq: 261.63 },
    { syl: 'go', freq: 392.00 },
    { syl: 'ha', freq: 261.63 }
  ],
  'ha-za-ha': [
    { syl: 'ha', freq: 261.63 },
    { syl: 'za', freq: 493.88 },
    { syl: 'ha', freq: 261.63 }
  ],
  'ha-go-za-ha': [
    { syl: 'ha', freq: 261.63 },
    { syl: 'go', freq: 392.00 },
    { syl: 'za', freq: 493.88 },
    { syl: 'ha', freq: 261.63 }
  ]
};

/**
 * @description Renderiza la secuencia visual del viaje seleccionado.
 * @param {string} trajId
 */
function renderSeqDisplay(trajId) {
  const traj = F0_TRAJECTORIES[trajId];
  if (!traj || !DOM.seqDisplay) return;

  DOM.seqDisplay.innerHTML = '';
  traj.forEach((note, idx) => {
    if (idx > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'seq-arrow';
      arrow.textContent = '→';
      DOM.seqDisplay.appendChild(arrow);
    }
    const noteEl = document.createElement('div');
    noteEl.className = `seq-note ${note.syl}`;
    noteEl.dataset.idx = idx;
    noteEl.innerHTML = `
      <span class="seq-grade">${SYLLABLES[note.syl].grade}</span>
      <span class="seq-syl">${SYLLABLES[note.syl].letter}</span>
      <span class="seq-lbl">${SYLLABLES[note.syl].word}</span>
    `;
    DOM.seqDisplay.appendChild(noteEl);
  });
}

/**
 * @description Reproduce el viaje seleccionado en la Fase 0 con animación.
 * @param {string} trajId
 */
async function playF0Trajectory(trajId) {
  const traj = F0_TRAJECTORIES[trajId];
  if (!traj) return;

  const noteEls = DOM.seqDisplay ? DOM.seqDisplay.querySelectorAll('.seq-note') : [];
  const ctx = getAudioCtx();
  let t = ctx.currentTime + 0.05;
  const noteDur = 0.9;
  const noteGap = 1.1;

  traj.forEach((note, idx) => {
    playNote(ctx, note.freq, t, noteDur);

    const delay = (t - ctx.currentTime) * 1000;
    setTimeout(() => {
      // Quitar 'playing' de todas las notas
      noteEls.forEach(el => el.classList.remove('playing'));
      // Marcar la actual
      if (noteEls[idx]) noteEls[idx].classList.add('playing');
      setAmbient(note.syl);
    }, delay);

    // Marcar como 'played' después de que termine
    setTimeout(() => {
      if (noteEls[idx]) {
        noteEls[idx].classList.remove('playing');
        noteEls[idx].classList.add('played');
      }
    }, delay + noteDur * 1000 + 100);

    t += noteGap;
  });

  // Resetear después de terminar
  return new Promise(resolve => {
    const total = (t - ctx.currentTime) * 1000;
    setTimeout(() => {
      noteEls.forEach(el => el.classList.remove('playing', 'played'));
      resolve();
    }, total + 300);
  });
}

/** @description Nota correcta para el ejercicio de identificación de la Fase 0 */
let f0CorrectNote = null;

/**
 * @description Genera un nuevo ejercicio de identificación para la Fase 0.
 */
function generateF0Question() {
  const options = ['ha', 'go', 'za'];
  const idx = Math.floor(Math.random() * options.length);
  f0CorrectNote = options[idx];
  State.f0.currentNote = f0CorrectNote;
  State.f0.answered = false;

  // Resetear botones de respuesta
  if (DOM.f0AnsGrid) {
    DOM.f0AnsGrid.querySelectorAll('.ans-btn').forEach(btn => {
      btn.disabled = false;
      btn.className = `ans-btn ${btn.dataset.ans}`;
    });
  }

  // Limpiar feedback
  if (DOM.f0Feedback) DOM.f0Feedback.innerHTML = '';

  // Reproducir la nota automáticamente
  const freqMap = { ha: 261.63, go: 392.00, za: 493.88 };
  setTimeout(() => playF0Note(freqMap[f0CorrectNote], f0CorrectNote), 300);
}

/**
 * @description Maneja la respuesta del ejercicio de identificación Fase 0.
 * @param {string} selectedId
 */
function handleF0Answer(selectedId) {
  if (State.f0.answered) return;
  State.f0.answered = true;

  const correct = selectedId === f0CorrectNote;
  State.f0.total++;

  if (correct) {
    State.f0.score++;
    State.f0.streak++;
  } else {
    State.f0.streak = 0;
  }

  // Actualizar score
  if (DOM.f0Score) DOM.f0Score.textContent = State.f0.score;

  // Actualizar streak dots
  if (DOM.streakDots) {
    DOM.streakDots.forEach((dot, idx) => {
      dot.className = 'streak-dot' + (idx < State.f0.streak ? ' on' : '');
    });
  }

  // Actualizar progress strip
  const pct = (State.f0.total / State.f0.maxTotal) * 100;
  if (DOM.f0ProgFill) DOM.f0ProgFill.style.width = Math.min(pct, 100) + '%';
  if (DOM.f0ProgTxt) DOM.f0ProgTxt.textContent = `${State.f0.total} / ${State.f0.maxTotal}`;

  // Feedback en botones
  if (DOM.f0AnsGrid) {
    DOM.f0AnsGrid.querySelectorAll('.ans-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.ans === f0CorrectNote) {
        // Clase de correcto según sílaba
        const colorClass = f0CorrectNote === 'ha' ? 'correct' : f0CorrectNote === 'go' ? 'correct-go' : 'correct-za';
        btn.classList.add(colorClass);
      } else if (btn.dataset.ans === selectedId && !correct) {
        btn.classList.add('wrong', 'shake');
      }
    });
  }

  // Feedback texto
  if (DOM.f0Feedback) {
    DOM.f0Feedback.innerHTML = `
      <div class="feedback ${correct ? 'feedback--ok' : 'feedback--err'}" style="margin-top:var(--s4);">
        <span class="feedback__icon">${correct ? '✓' : '✗'}</span>
        <div class="feedback__body">
          <div class="feedback__title">${correct ? '¡Correcto!' : 'Era ' + SYLLABLES[f0CorrectNote].letter}</div>
          <p class="feedback__text">${SYLLABLES[f0CorrectNote].feeling}</p>
        </div>
      </div>
    `;
  }

  // Siguiente pregunta automáticamente si no llegó al máximo
  if (State.f0.total < State.f0.maxTotal) {
    setTimeout(generateF0Question, 1800);
  } else {
    // Completó el ejercicio de Fase 0
    setTimeout(() => showToast(`¡Completaste la Fase 0! Puntaje: ${State.f0.score}/${State.f0.maxTotal}`, 3000), 500);
    // Resetear para nueva ronda
    setTimeout(() => {
      State.f0.total = 0;
      State.f0.score = 0;
      State.f0.streak = 0;
      if (DOM.f0ProgFill) DOM.f0ProgFill.style.width = '0%';
      if (DOM.f0ProgTxt) DOM.f0ProgTxt.textContent = '0 / 10';
      if (DOM.f0Score) DOM.f0Score.textContent = '0';
      generateF0Question();
    }, 3500);
  }
}

/* ============================================================
   SECCIÓN 13: EXPLORADOR DE NIVELES
   ============================================================ */

/**
 * @description Renderiza el grid de los 16 niveles.
 */
function renderLevels() {
  const prog = State.progress;
  DOM.levelsGrid.innerHTML = '';

  LEVELS.forEach(level => {
    const journey = JOURNEYS.find(j => j.id === level.journey);
    const isComplete = level.id < prog.currentLevel;
    const isCurrent = level.id === prog.currentLevel;
    const isLocked = level.id > prog.currentLevel;

    const card = document.createElement('div');
    card.className = 'level-card' +
      (isComplete ? ' level-card--completed' : '') +
      (isCurrent ? ' level-card--current' : '') +
      (isLocked ? ' level-card--locked' : '');
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `Nivel ${level.id}: ${level.name}`);

    let chipsHtml = '';
    if ((isComplete || isCurrent) && journey) {
      // Mostrar chips del viaje en niveles completados o el actual
      const uniqueSyls = [...new Set(journey.syls)].slice(0, 5);
      chipsHtml = `<div class="level-card__chips">
        ${uniqueSyls.map(s => `<div class="mini-chip mini-chip--${s}">${SYLLABLES[s].letter}</div>`).join('')}
      </div>`;
    }

    card.innerHTML = `
      <div class="level-card__num">${String(level.id).padStart(2, '0')}</div>
      <div class="level-card__name">${sanitize(level.name)}</div>
      ${chipsHtml}
      <div class="level-card__status">
        ${isComplete ? '✓ Completado' : isCurrent ? '► En progreso' : '🔒 Bloqueado'}
      </div>
    `;

    // Interacción ambiental
    card.addEventListener('mouseenter', () => {
      if (!isLocked && journey) {
        setAmbient(journey.syls[0]); // Inunda con el color de la primera nota del viaje
      }
    });

    card.addEventListener('mouseleave', () => {
      setAmbient(null);
    });

    if (!isLocked) {
      card.addEventListener('click', () => {
        // Opcional: Permitir repetir niveles completados
      });
    }

    DOM.levelsGrid.appendChild(card);
  });
}

/* ============================================================
   SECCIÓN 14: PERFIL DE USUARIO
   ============================================================ */

/**
 * @description Renderiza la pantalla de perfil con el progreso actual.
 */
function renderProfile() {
  const prog = State.progress;
  if (!prog) return;

  DOM.profName.textContent = sanitize(prog.name);
  DOM.profSince.textContent = `En Tonaris desde: ${new Date(prog.createdAt).toLocaleDateString('es')}`;
  DOM.profLevel.textContent = prog.currentLevel;
  DOM.profStreak.textContent = prog.streak.current;
  DOM.profSessions.textContent = prog.sessionsSummary ? prog.sessionsSummary.length : 0;

  // Historial de sesiones
  if (prog.sessionsSummary && prog.sessionsSummary.length > 0) {
    const rows = [...prog.sessionsSummary].reverse().slice(0, 10);
    DOM.sessHistory.innerHTML = rows.map(s => `
      <div class="sess-row">
        <span class="sess-row__date">${s.date}</span>
        <div class="sess-row__stats">
          <span><strong>${s.correct}/${s.total}</strong></span>
          <span>${s.accuracy}%</span>
          <span>${s.duration}min</span>
        </div>
      </div>
    `).join('');
  } else {
    DOM.sessHistory.innerHTML = `<p style="font-size:var(--t-sm);color:var(--subtle);font-style:italic;">Aún no hay sesiones completadas.</p>`;
  }
}

/* ============================================================
   SECCIÓN 15: AMBIENTE VISUAL
   ============================================================ */

/**
 * @description Actualiza el fondo ambiental según la sílaba activa.
 * @param {string} sylId - ID de la sílaba
 */
function setAmbient(sylId) {
  if (!DOM.ambient) return;
  // Quitar todas las clases de color
  DOM.ambient.className = 'ambient';
  if (sylId) {
    DOM.ambient.classList.add(`${sylId}-active`);
  }
}

/* ============================================================
   SECCIÓN 15b: INTERACCIÓN DEL ÁREA DE REFERENCIA
   Clic simple → nota del grado | Doble clic → acorde diatónico
   ============================================================ */

/**
 * @description Reproduce la nota individual del grado seleccionado
 * dentro de la tonalidad activa en la sesión actual.
 * @param {string} sylId - ID de la sílaba (ha, ki, da, su, go, lu, za)
 */
function playReferenceNote(sylId) {
  const ratio = State.session.tonality ? State.session.tonality.ratio : 1.0;
  const freqs = getScaleFreqs(ratio);
  const gradeIdx = SCALE_ORDER.indexOf(sylId);
  if (gradeIdx === -1) return;
  playMelodicNote(freqs[gradeIdx], 1.1);
  setAmbient(sylId);
}

/**
 * @description Construye y reproduce el acorde diatónico construido
 * sobre el grado indicado dentro de la escala mayor activa.
 *
 * La calidad (mayor/menor/disminuido) surge naturalmente de los
 * intervalos diatónicos: se usan los grados N, N+2, N+4 de la escala.
 * En Do Mayor:
 *   I  (ha) → C-E-G  Mayor
 *   II (ki) → D-F-A  Menor
 *   III(da) → E-G-B  Menor
 *   IV (su) → F-A-C  Mayor
 *   V  (go) → G-B-D  Mayor
 *   VI (lu) → A-C-E  Menor
 *   VII(za) → B-D-F  Disminuido
 *
 * @param {string} sylId - ID de la sílaba
 */
function playReferenceDiatonicChord(sylId) {
  const ratio = State.session.tonality ? State.session.tonality.ratio : 1.0;
  const freqs = getScaleFreqs(ratio);
  const gradeIdx = SCALE_ORDER.indexOf(sylId);
  if (gradeIdx === -1) return;

  const rootFreq = freqs[gradeIdx];
  const thirdFreq = freqs[(gradeIdx + 2) % 7];
  const fifthFreq = freqs[(gradeIdx + 4) % 7];

  const ctx = getAudioCtx();
  const chordFreqs = [rootFreq, thirdFreq, fifthFreq];
  playChord(ctx, chordFreqs, ctx.currentTime + 0.05, 1.8);
  setAmbient(sylId);
}

/**
 * @description Adjunta los listeners de clic simple y doble clic
 * a todos los chips del área de referencia (#ex-scale-chips).
 *
 * Usa un timer de 260ms para discriminar entre ambos eventos:
 * - Clic simple → espera el timer y reproduce la nota
 * - Doble clic  → cancela el timer y reproduce el acorde diatónico
 */
function initReferenceChipsInteraction() {
  const container = DOM.exScaleChips;
  if (!container) return;

  container.querySelectorAll('.scale-syl').forEach(chip => {
    const sylId = chip.dataset.syl;
    if (!sylId || !SYLLABLES[sylId]) return;

    let singleClickTimer = null;

    // Estilo visual: indicar que son interactivos
    chip.style.cursor = 'pointer';
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('role', 'button');
    chip.setAttribute(
      'aria-label',
      `${SYLLABLES[sylId].letter} — clic para nota, doble clic para acorde`
    );

    // Clic simple: reproducir solo la nota del grado
    chip.addEventListener('click', (e) => {
      // Ignorar si viene justo después de un dblclick
      if (singleClickTimer) return;
      singleClickTimer = setTimeout(() => {
        singleClickTimer = null;
        // Solo reproducir si hay una sesión activa
        if (!State.session.tonality) return;
        playReferenceNote(sylId);
        // Pulso visual breve
        chip.classList.add('ref-chip--active');
        setTimeout(() => chip.classList.remove('ref-chip--active'), 400);
      }, 260);
    });

    // Doble clic: cancelar la nota simple y reproducir el acorde diatónico
    chip.addEventListener('dblclick', (e) => {
      if (singleClickTimer) {
        clearTimeout(singleClickTimer);
        singleClickTimer = null;
      }
      if (!State.session.tonality) return;
      playReferenceDiatonicChord(sylId);
      // Pulso visual diferenciado para acorde
      chip.classList.add('ref-chip--chord');
      setTimeout(() => chip.classList.remove('ref-chip--chord'), 700);
    });

    // Hover: ambiente visual
    chip.addEventListener('mouseenter', () => setAmbient(sylId));
    chip.addEventListener('mouseleave', () => setAmbient(null));

    // Accesibilidad: activar con teclado (Enter = nota, Space = acorde)
    chip.addEventListener('keydown', (e) => {
      if (!State.session.tonality) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        playReferenceNote(sylId);
      } else if (e.key === ' ') {
        e.preventDefault();
        playReferenceDiatonicChord(sylId);
      }
    });
  });
}

/* ============================================================
   SECCIÓN 16: UTILIDADES DE UI
   ============================================================ */

/**
 * @description Muestra un toast de notificación temporal.
 * @param {string} msg - Mensaje a mostrar
 * @param {number} [duration=2500] - Duración en ms
 */
function showToast(msg, duration = 2500) {
  DOM.toast.textContent = msg;
  DOM.toast.classList.add('show');
  setTimeout(() => DOM.toast.classList.remove('show'), duration);
}

/* ============================================================
   SECCIÓN 17: REGISTRO DE USUARIO
   ============================================================ */

/**
 * @description Valida y procesa el formulario de registro.
 */
async function handleRegister() {
  const name = DOM.inputName.value.trim();
  const email = DOM.inputEmail.value.trim();
  const password = DOM.inputPassword.value.trim();
  const alias = DOM.inputAlias.value.trim().toUpperCase();
  let hasError = false;

  // Validar nombre
  if (!name || name.length < 2) {
    DOM.nameError.textContent = 'El nombre debe tener al menos 2 caracteres.';
    DOM.nameError.classList.add('field__error--show');
    DOM.inputName.classList.add('field__input--err');
    hasError = true;
  } else {
    DOM.nameError.classList.remove('field__error--show');
    DOM.inputName.classList.remove('field__input--err');
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    DOM.emailError.textContent = 'Ingresa un email válido.';
    DOM.emailError.classList.add('field__error--show');
    DOM.inputEmail.classList.add('field__input--err');
    hasError = true;
  } else {
    DOM.emailError.classList.remove('field__error--show');
    DOM.inputEmail.classList.remove('field__input--err');
  }

  // Validar password
  if (!password || password.length < 6) {
    DOM.passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    DOM.passwordError.classList.add('field__error--show');
    DOM.inputPassword.classList.add('field__input--err');
    hasError = true;
  } else {
    DOM.passwordError.classList.remove('field__error--show');
    DOM.inputPassword.classList.remove('field__input--err');
  }

  if (hasError) return;

  // Deshabilitar botón durante el envío
  DOM.btnRegister.classList.add('btn--loading');
  DOM.btnRegister.textContent = 'Guardando...';

  // Generar user_id único
  const userId = 'usr_' + Math.random().toString(36).slice(2, 10);

  // Crear progreso inicial
  const progress = createInitialProgress(userId, name);
  State.progress = progress;
  saveProgress(progress);

  // Enviar registro a Google Sheets
  await sendToSheets({
    action: 'register',
    userId,
    nombre: name,
    email: email,
    idioma: navigator.language.slice(0, 2) || 'es',
    timestamp: new Date().toISOString()
  }).catch(() => {
    // Si falla el registro en Sheets, continuar igual — ya está en localStorage
  });

  // Registrar en API Tonaris
  const registerResult = await apiRegister(userId, name, email, password, alias);
  if (registerResult?.error) {
    DOM.btnRegister.classList.remove('btn--loading');
    DOM.btnRegister.textContent = 'Comenzar mi entrenamiento';
    if (registerResult.error.includes('registrado')) {
      DOM.emailError.textContent = 'Este correo ya está registrado. Inicia sesión.';
      DOM.emailError.classList.add('field__error--show');
      DOM.inputEmail.classList.add('field__input--err');
    }
    return;
  }
  // Login automático tras registro
  await apiLogin(email, password).catch(() => {});

  // Ir al dashboard
  DOM.btnRegister.classList.remove('btn--loading');
  DOM.btnRegister.textContent = 'Comenzar mi entrenamiento';

  State.user = { userId, name, email };
  updateLeaderboardScore(name, 0);
  renderDashboard();
  showScreen('dash');
  showToast(`¡Bienvenido, ${name}!`);
}

/**
 * @description Procesa el formulario de inicio de sesión.
 */
async function handleLogin() {
  const email = DOM.inputLoginEmail.value.trim();
  const password = DOM.inputLoginPassword.value.trim();
  DOM.loginEmailError.classList.remove('field__error--show');
  DOM.loginPasswordError.classList.remove('field__error--show');
  DOM.inputLoginEmail.classList.remove('field__input--err');
  DOM.inputLoginPassword.classList.remove('field__input--err');

  if (!email) {
    DOM.loginEmailError.textContent = 'Ingresa tu email.';
    DOM.loginEmailError.classList.add('field__error--show');
    DOM.inputLoginEmail.classList.add('field__input--err');
    return;
  }
  if (!password || password.length < 6) {
    DOM.loginPasswordError.textContent = 'Contraseña incorrecta.';
    DOM.loginPasswordError.classList.add('field__error--show');
    DOM.inputLoginPassword.classList.add('field__input--err');
    return;
  }

  DOM.btnLogin.classList.add('btn--loading');
  DOM.btnLogin.textContent = 'Entrando...';

  const result = await apiLogin(email, password);

  DOM.btnLogin.classList.remove('btn--loading');
  DOM.btnLogin.textContent = 'Entrar';

  if (result?.token) {
    const savedProgress = loadProgress();
    if (savedProgress) {
      State.progress = savedProgress;
      State.user = { userId: savedProgress.userId, name: savedProgress.name };
    } else {
      State.progress = createInitialProgress(result.user?.user_id || '', result.user?.name || '');
      saveProgress(State.progress);
      State.user = { userId: result.user.user_id, name: result.user.name };
    }
    renderDashboard();
    showScreen('dash');
    showToast(`Bienvenido de nuevo, ${State.user.name}!`);
  } else {
    const msg = result?.error || 'Error de conexión con el servidor.';
    DOM.loginEmailError.textContent = msg;
    DOM.loginEmailError.classList.add('field__error--show');
    DOM.inputLoginEmail.classList.add('field__input--err');
  }
}

/* ============================================================
   SECCIÓN 18: INICIALIZACIÓN Y EVENT LISTENERS
   ============================================================ */

/**
 * @description Configura todos los event listeners de la aplicación.
 * Se llama una sola vez al cargar.
 */
function initEventListeners() {

  // --- LANDING ---
  if (DOM.btnGoRegister) DOM.btnGoRegister.addEventListener('click', () => showScreen('register'));
  if (DOM.btnGoLogin) DOM.btnGoLogin.addEventListener('click', () => showScreen('login'));

  // --- REGISTRO ---
  if (DOM.btnBackLanding) DOM.btnBackLanding.addEventListener('click', () => showScreen('landing'));
  if (DOM.btnRegister) DOM.btnRegister.addEventListener('click', handleRegister);

  // Registro con Enter en los inputs
  [DOM.inputName, DOM.inputEmail].forEach(input => {
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleRegister();
      });
    }
  });

  // --- LOGIN ---
  if (DOM.btnBackLogin) DOM.btnBackLogin.addEventListener('click', () => showScreen('landing'));
  if (DOM.btnLogin) DOM.btnLogin.addEventListener('click', handleLogin);
  if (DOM.linkLoginToRegister) DOM.linkLoginToRegister.addEventListener('click', e => {
    e.preventDefault();
    showScreen('register');
  });

  // Login con Enter en los inputs
  [DOM.inputLoginEmail, DOM.inputLoginPassword].forEach(input => {
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleLogin();
      });
    }
  });

  // --- DASHBOARD ---
  if (DOM.btnGoLevels) DOM.btnGoLevels.addEventListener('click', () => { renderLevels(); showScreen('levels'); });
  if (DOM.btnGoProfile) DOM.btnGoProfile.addEventListener('click', () => { renderProfile(); showScreen('profile'); });
  if (DOM.btnGoF0) DOM.btnGoF0.addEventListener('click', () => showScreen('f0'));
  if (DOM.btnStartSession) DOM.btnStartSession.addEventListener('click', () => startSession());

  // --- GESTIÓN DE ESCALAS ---
  if (DOM.btnPlayScale) DOM.btnPlayScale.addEventListener('click', () => runScaleAnimation(DOM.btnPlayScale, DOM.scaleChips));
  if (DOM.btnHdrScale) {
    DOM.btnHdrScale.addEventListener('click', () => {
      const activeChips = (DOM.exScaleChips && State.screen === 'exercise') ? DOM.exScaleChips : DOM.scaleChips;
      runScaleAnimation(DOM.btnHdrScale, activeChips);
    });
  }
  if (DOM.btnExScale) DOM.btnExScale.addEventListener('click', () => runScaleAnimation(DOM.btnExScale, DOM.exScaleChips));

  // --- REFERENCIA TONAL INTERACTIVA ---
  // Clic simple → nota | Doble clic → acorde diatónico
  initReferenceChipsInteraction();

  if (DOM.btnWarmupReady) {
    DOM.btnWarmupReady.addEventListener('click', () => {
      showScreen('exercise');
      renderCurrentExercise();
    });
  }

  // --- EJERCICIOS ---
  DOM.btnRepeatEx.addEventListener('click', () => playCurrentExerciseAudio());
  DOM.btnNextEx.addEventListener('click', () => advanceExercise());

  // --- CIERRE Y NAVEGACIÓN ---
  DOM.btnNextTonality.addEventListener('click', () => startSession());
  const handleExitSession = () => {
    if (State.session.active) {
      if (!confirm("¿Seguro que deseas salir de la sesión?")) {
        return false;
      }
      // Conservar progreso, racha y estadísticas correspondientes de la sesión parcial
      endSession();
    }
    renderDashboard();
    showScreen('dash');
    return true;
  };
  DOM.btnEndHome.addEventListener('click', handleExitSession);
  if (DOM.btnExitSession) DOM.btnExitSession.addEventListener('click', handleExitSession);
  DOM.btnF0Back.addEventListener('click', () => showScreen('dash'));
  DOM.btnLevelsBack.addEventListener('click', () => showScreen('dash'));
  DOM.btnProfileBack.addEventListener('click', () => showScreen('dash'));
  DOM.btnLeaderboardBack.addEventListener('click', () => showScreen('dash'));
  DOM.btnGoLeaderboard.addEventListener('click', () => { renderLeaderboard(); showScreen('leaderboard'); });

  // Tabs Fase 0
  DOM.f0Tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      DOM.f0Tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      DOM.f0Panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(`tab-${tab.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });

  DOM.btnLogout.addEventListener('click', () => {
    if (confirm('¿Cerrar sesión? Se borrará tu progreso local.')) {
      localStorage.removeItem('tonaris_progress');
      State.progress = null; State.user = null;
      showScreen('landing'); showToast('Sesión cerrada.');
    }
  });
}

/**
 * @description Función unificada para animar escalas.
 */
async function runScaleAnimation(triggerBtn, chipsContainer) {
  if (!chipsContainer) return;
  getAudioCtx();
  if (triggerBtn) triggerBtn.disabled = true;
  const tonality = State.progress ? getTonalityOfDay() : { ratio: 1.0 };
  const chips = chipsContainer.querySelectorAll('.scale-syl');
  chips.forEach(c => c.classList.remove('active', 'inactive'));

  await playScale(tonality.ratio, (noteIdx, direction) => {
    chips.forEach(c => c.classList.remove('active', 'inactive'));
    chips.forEach(c => c.classList.add('inactive'));
    if (chips[noteIdx]) {
      chips[noteIdx].classList.remove('inactive');
      chips[noteIdx].classList.add('active');
    }
    if (DOM.dirUp && DOM.dirDown) {
      DOM.dirUp.classList.toggle('active', direction === 'up');
      DOM.dirDown.classList.toggle('active', direction === 'down');
    }
    setAmbient(noteIdx === 7 ? 'ha' : SCALE_ORDER[noteIdx]);
  });

  chips.forEach(c => c.classList.remove('active', 'inactive'));
  if (DOM.dirUp) DOM.dirUp.classList.remove('active');
  if (DOM.dirDown) DOM.dirDown.classList.remove('active');
  setAmbient(null);
  if (triggerBtn) triggerBtn.disabled = false;
}

/**
 * @description Inicializa la aplicación.
 * Punto de entrada principal — se llama al cargar el DOM.
 */
function init() {
  // Verificar soporte de Web Audio API
  if (!window.AudioContext && !window.webkitAudioContext) {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;padding:2rem;text-align:center;">
        <div>
          <h2 style="font-family:serif;margin-bottom:1rem;">Tonaris necesita Web Audio API</h2>
          <p style="color:#888;">Por favor usa Chrome, Firefox, Safari 14+ o Edge 90+</p>
        </div>
      </div>
    `;
    return;
  }

  // Inicializar barras de onda de la Fase 0
  initWaveBars();

  // Inicializar contenidos de Fase 0
  renderF0ChromaticSelector();
  renderF0Identities();
  renderF0Journeys();

  // Configurar todos los event listeners
  initEventListeners();

  // Verificar si ya hay un usuario registrado
  const savedProgress = loadProgress();

  if (savedProgress) {
    State.progress = savedProgress;
    State.user = { userId: savedProgress.userId, name: savedProgress.name };

    flushQueue().catch(() => { });

    if (savedProgress.streak && savedProgress.streak.current > 0) {
      DOM.hdrStreak.style.display = 'flex';
      DOM.streakVal.textContent = savedProgress.streak.current;
    }

    // Reanudar sesión activa si existe (timestamp real)
    const stored = loadActiveSession();
    if (stored && stored.sessionStatus === 'active' && stored.sessionEndTimestamp) {
      const remaining = Math.floor((stored.sessionEndTimestamp - Date.now()) / 1000);
      if (remaining > 0) {
        // Sesión aún válida — reanudar sin reiniciar
        State.session.active = true;
        State.session.sessionId = stored.sessionId;
        State.session.correct = (stored.accumulatedScore && stored.accumulatedScore.correct) || 0;
        State.session.total = (stored.accumulatedScore && stored.accumulatedScore.total) || 0;
        State.session.tonality = getTonalityOfDay();
        if (!State.session.exercises || State.session.exercises.length === 0) {
          State.session.exercises = generateSessionExercises(State.session.tonality);
          State.session.currentIdx = 0;
        }
        renderDashboard();
        showScreen('dash');
        // Reanudar timer con el sessionEndTimestamp original
        startSessionTimer(stored.sessionEndTimestamp);
        return;
      } else {
        // Sesión expirada mientras estaba fuera
        clearActiveSession();
      }
    }

    renderDashboard();
    showScreen('dash');
  } else {
    showScreen('landing');
  }
}

/* ============================================================
   SECCIÓN 19: ARRANQUE
   Esperar a que el DOM esté listo antes de inicializar
   ============================================================ */

// DOMContentLoaded garantiza que todos los elementos existen
// antes de que intentemos referenciarlos
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // El DOM ya está listo (script al final del body)
  init();
}