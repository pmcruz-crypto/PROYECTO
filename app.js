// Controlador Principal de la Aplicación - PsicoSim IA

// Estado global de la aplicación
const AppState = {
  currentView: 'catalogo',
  activeCaseId: 'elena-morales',
  activeCase: null,
  aiSettings: {
    mode: 'autonomous', // 'autonomous' o 'gemini'
    geminiApiKey: ''
  },
  session: {
    active: true,
    timerSeconds: 865, // 14 min 25 seg de muestra
    timerInterval: null,
    rapport: 86,
    messages: [],
    notes: '',
    checkedCriteria: new Set()
  },
  recognition: null,
  isRecording: false
};

// Inicialización de la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  // Cargar configuración guardada de IA si existe
  const savedKey = localStorage.getItem('psicosim_gemini_key');
  const savedMode = localStorage.getItem('psicosim_ai_mode') || 'autonomous';
  AppState.aiSettings.geminiApiKey = savedKey || '';
  AppState.aiSettings.mode = savedMode;

  // Cargar caso inicial por defecto
  setInitialCase(AppState.activeCaseId);

  // Escuchar cambios de hash para navegación por URL / botón atrás
  window.addEventListener('hashchange', handleHashNavigation);

  // Inicializar navegación según el hash actual o 'catalogo'
  if (window.location.hash) {
    handleHashNavigation();
  } else {
    switchView('catalogo');
  }

  // Inicializar filtros del catálogo
  initCatalogFilters();

  // Inicializar eventos de chat y teclado
  initChatEvents();

  // Inicializar temporizador en vivo
  initSessionTimer();

  // Inicializar reconocimiento por voz
  initSpeechRecognition();

  // Inicializar autoguardado de notas clínicas
  initNotesAutosave();
});

// Función de navegación entre vistas
function switchView(viewName) {
  const validViews = ['catalogo', 'consulta', 'debriefing', 'progreso'];
  if (!validViews.includes(viewName)) viewName = 'catalogo';

  AppState.currentView = viewName;
  window.location.hash = viewName;

  // Ocultar todas las secciones y mostrar la activa
  validViews.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === viewName) {
        el.classList.remove('hidden');
        el.classList.add('flex');
      } else {
        el.classList.add('hidden');
        el.classList.remove('flex');
      }
    }
  });

  // Si se ingresa al debriefing, computar métricas y retroalimentación clínica
  if (viewName === 'debriefing') {
    updateDebriefingUI();
  }

  // Actualizar estilos activos en la barra de navegación superior (Desktop)
  document.querySelectorAll('header nav a[data-path]').forEach(link => {
    const path = link.getAttribute('data-path');
    if (path === viewName) {
      link.className = "px-space-md py-space-xs rounded-lg transition-all bg-surface-container text-primary font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.04)]";
      link.setAttribute('aria-current', 'page');
    } else {
      link.className = "px-space-md py-space-xs rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-all";
      link.removeAttribute('aria-current');
    }
  });

  // Actualizar estilos activos en el menú lateral (Desktop)
  document.querySelectorAll('aside nav a[data-path]').forEach(link => {
    const path = link.getAttribute('data-path');
    if (path === viewName) {
      link.className = "flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors bg-surface-container text-primary font-semibold shadow-xs";
      link.setAttribute('aria-current', 'page');
    } else {
      link.className = "flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors";
      link.removeAttribute('aria-current');
    }
  });

  // Actualizar estilos activos en la barra móvil inferior (Mobile Bottom Bar)
  document.querySelectorAll('#mobileBottomNav button[data-path]').forEach(btn => {
    const path = btn.getAttribute('data-path');
    const icon = btn.querySelector('.nav-icon');
    const label = btn.querySelector('.nav-label');
    if (path === viewName) {
      btn.className = "flex flex-col items-center justify-center flex-1 py-1 text-primary font-bold";
      if (icon) icon.classList.add('text-secondary', 'scale-110');
      if (label) label.classList.add('text-primary', 'font-bold');
    } else {
      btn.className = "flex flex-col items-center justify-center flex-1 py-1 text-on-surface-variant hover:text-on-surface";
      if (icon) icon.classList.remove('text-secondary', 'scale-110');
      if (label) label.classList.remove('text-primary', 'font-bold');
    }
  });

  // Desplazar suavemente hacia arriba
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Escuchar cambios de hash
function handleHashNavigation() {
  const hash = window.location.hash.replace('#', '');
  if (['catalogo', 'consulta', 'debriefing', 'progreso'].includes(hash)) {
    switchView(hash);
  }
}

// Establecer caso inicial
function setInitialCase(caseId) {
  const found = CLINICAL_CASES.find(c => c.id === caseId) || CLINICAL_CASES[0];
  AppState.activeCase = found;
  AppState.activeCaseId = found.id;
  updateActiveCaseUI(found);
}

// Actualizar elementos de la interfaz con los datos del caso activo
function updateActiveCaseUI(patient) {
  if (!patient) return;

  // Actualizar tarjeta del paciente activo en la barra lateral
  const sidebarName = document.getElementById('sidebarPatientName');
  const sidebarDiag = document.getElementById('sidebarPatientDiag');
  if (sidebarName) sidebarName.textContent = `${patient.name} (${patient.age}a)`;
  if (sidebarDiag) sidebarDiag.textContent = patient.diagnosticCode.split('·')[0].trim();

  // Actualizar encabezado del despacho de consulta
  const bannerAvatar = document.getElementById('consultationPatientAvatar');
  const bannerName = document.getElementById('consultationPatientName');
  const bannerAge = document.getElementById('consultationPatientAge');
  const bannerDiagBadge = document.getElementById('consultationDiagBadge');
  const bannerObsState = document.getElementById('consultationObsState');
  const roomAvatar = document.getElementById('consultationRoomAvatar');
  const roomSigns = document.getElementById('consultationRoomSigns');

  if (bannerAvatar) bannerAvatar.src = patient.avatar;
  if (bannerName) bannerName.textContent = patient.name;
  if (bannerAge) bannerAge.textContent = `(${patient.age} años)`;
  if (bannerDiagBadge) bannerDiagBadge.textContent = patient.diagnosticCode.split('·')[0].trim();
  if (bannerObsState) bannerObsState.textContent = patient.observationalState;
  if (roomAvatar) roomAvatar.src = patient.roomImage || patient.avatar;
  if (roomSigns) roomSigns.textContent = patient.nonVerbalSigns;

  // Actualizar debriefing paciente
  const debriefPatientName = document.getElementById('debriefPatientName');
  const debriefDiagTag = document.getElementById('debriefDiagTag');
  if (debriefPatientName) debriefPatientName.textContent = `${patient.name} (${patient.age} años)`;
  if (debriefDiagTag) debriefDiagTag.textContent = `${patient.diagnosticCode} · ${patient.diagnosticTitle}`;

  // Actualizar micro-indicadores
  const indAutonomic = document.getElementById('indAutonomic');
  const indDisposition = document.getElementById('indDisposition');
  const indLatency = document.getElementById('indLatency');
  if (indAutonomic) indAutonomic.textContent = patient.autonomicActivation || 'Media (50%)';
  if (indDisposition) indDisposition.textContent = patient.dialogueDisposition || 'Receptiva';
  if (indLatency) indLatency.textContent = patient.responseLatency || '1.5 seg';

  // Renderizar criterios DSM-5 específicos de este paciente
  renderPatientDsmCriteria(patient);
}

// Renderizar lista interactiva de criterios DSM-5
function renderPatientDsmCriteria(patient) {
  const container = document.getElementById('tabContentSymptoms');
  if (!container || !patient.dsmCriteria) return;

  const countChecked = patient.dsmCriteria.filter(c => c.checked).length;
  const total = patient.dsmCriteria.length;

  container.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="font-label-sm text-[11px] text-on-surface-variant uppercase font-medium">Criterios Cotejados</span>
      <span class="font-label-sm text-xs text-primary font-semibold" id="dsmCountBadge">${countChecked} de ${total} marcados</span>
    </div>
    <div class="flex flex-col gap-space-xs text-left">
      ${patient.dsmCriteria.map((crit, idx) => `
        <label class="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
          <input type="checkbox" ${crit.checked ? 'checked' : ''} onchange="toggleCriterion('${patient.id}', ${idx})" class="mt-0.5 rounded text-secondary focus:ring-secondary accent-secondary w-4 h-4"/>
          <div class="flex flex-col">
            <span class="font-label-md text-xs font-semibold text-primary">${crit.label}</span>
            <span class="font-body-sm text-[11px] text-on-surface-variant">${crit.desc}</span>
          </div>
        </label>
      `).join('')}
    </div>
  `;
}

function toggleCriterion(patientId, index) {
  const p = CLINICAL_CASES.find(c => c.id === patientId);
  if (p && p.dsmCriteria && p.dsmCriteria[index]) {
    p.dsmCriteria[index].checked = !p.dsmCriteria[index].checked;
    const badge = document.getElementById('dsmCountBadge');
    if (badge) {
      const count = p.dsmCriteria.filter(c => c.checked).length;
      badge.textContent = `${count} de ${p.dsmCriteria.length} marcados`;
    }
  }
}

// Abrir ficha clínica por ID de caso o parámetros
function openPatientDossierById(caseId) {
  const patient = CLINICAL_CASES.find(c => c.id === caseId) || CLINICAL_CASES[0];
  openPatientDossier(patient.name, patient.age, patient.diagnosticTitle, patient.summaryNotes, patient.id);
}

// Abrir ficha clínica de derivación (Dossier Modal)
function openPatientDossier(name, age, diagnostic, notes, caseId) {
  const modal = document.getElementById('dossierModal');
  const modalName = document.getElementById('modalPatientName');
  const modalDiagnostic = document.getElementById('modalDiagnostic');
  const modalAge = document.getElementById('modalAge');
  const modalNotes = document.getElementById('modalNotes');
  const modalLaunchBtn = document.getElementById('modalLaunchBtn');

  if (modalName) modalName.textContent = name;
  if (modalDiagnostic) modalDiagnostic.textContent = diagnostic;
  if (modalAge) modalAge.textContent = `${age} años`;
  if (modalNotes) modalNotes.textContent = notes;

  if (modalLaunchBtn) {
    modalLaunchBtn.onclick = () => {
      closeDossierModal();
      launchSimulation(caseId || name);
    };
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

// Cerrar ficha clínica
function closeDossierModal() {
  const modal = document.getElementById('dossierModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Iniciar simulación de un caso desde el catálogo
function launchSimulation(caseIdentifier) {
  let targetCase = CLINICAL_CASES.find(c => c.id === caseIdentifier || c.name.toLowerCase() === caseIdentifier.toLowerCase());
  if (!targetCase) targetCase = CLINICAL_CASES[0];

  AppState.activeCase = targetCase;
  AppState.activeCaseId = targetCase.id;
  updateActiveCaseUI(targetCase);

  // Inicializar o adaptar el chat al paciente seleccionado
  setupInitialChatForPatient(targetCase);

  // Navegar a la sala de consulta
  switchView('consulta');
}

// Adaptar o iniciar el diálogo con el paciente seleccionado
function setupInitialChatForPatient(patient) {
  const feed = document.getElementById('transcriptFeed');
  if (!feed) return;

  // Si ya tenemos mensajes guardados para este paciente, podemos mantenerlos;
  // de lo contrario, creamos el diálogo inicial de bienvenida adecuado
  feed.innerHTML = `
    <!-- Turno 1: Terapeuta (Paula Cruz) -->
    <div class="flex flex-col items-end gap-1 pl-space-md md:pl-space-lg">
      <div class="flex items-center gap-space-xs">
        <span class="font-label-sm text-[11px] text-on-surface-variant">10:01</span>
        <span class="font-label-sm text-xs font-semibold text-primary">Paula Cruz (Terapeuta)</span>
      </div>
      <div class="bg-surface-container-high text-on-surface p-space-md rounded-xl rounded-tr-none shadow-sm max-w-xl text-left">
        <p class="font-body-md text-sm md:text-body-md leading-relaxed">
          Hola ${patient.name.split(' ')[0]}, bienvenido/a. Tómate el tiempo que necesites. Cuéntame qué te ha motivado a venir a consulta hoy.
        </p>
        <div class="mt-space-xs pt-space-xs flex items-center justify-between text-on-surface-variant border-t border-surface-variant/40">
          <span class="font-label-sm text-[11px] flex items-center gap-1 text-secondary font-medium">
            <span class="material-symbols-outlined text-[13px]">psychology</span>
            Intervención: Pregunta Abierta de Encuadre
          </span>
          <span class="font-label-sm text-[11px]">Rapport +5%</span>
        </div>
      </div>
    </div>

    <!-- Turno 2: Paciente Virtual -->
    <div class="flex flex-col items-start gap-1 pr-space-md md:pr-space-lg">
      <div class="flex items-center gap-space-xs">
        <span class="font-label-sm text-xs font-semibold text-primary">${patient.name} (IA)</span>
        <span class="font-label-sm text-[11px] text-on-surface-variant">10:02</span>
      </div>
      <div class="bg-surface-container-low text-on-surface p-space-md rounded-xl rounded-tl-none shadow-sm max-w-xl border-l-4 border-l-secondary">
        <p class="font-body-md text-sm md:text-body-md leading-relaxed">
          Gracias... la verdad es que ${patient.quote.replace(/[«»]/g, '')}
        </p>
        <div class="mt-space-xs pt-space-xs flex items-center gap-space-xs flex-wrap">
          <span class="px-space-xs py-0.5 rounded font-label-sm text-[10px] bg-surface-container text-on-surface-variant font-medium">${patient.diagnosticCode.split('·')[0].trim()}</span>
          <span class="px-space-xs py-0.5 rounded font-label-sm text-[10px] bg-secondary-container text-on-secondary-container font-semibold">Resistencia: ${patient.resistance}</span>
        </div>
      </div>
    </div>
  `;
}

// Conmutar pestañas del cuaderno de campo (Notas vs Síntomas)
function switchTab(tabName) {
  const btnNotes = document.getElementById('tabBtnNotes');
  const btnSymptoms = document.getElementById('tabBtnSymptoms');
  const contentNotes = document.getElementById('tabContentNotes');
  const contentSymptoms = document.getElementById('tabContentSymptoms');

  if (tabName === 'notes') {
    if (btnNotes) btnNotes.className = "flex-1 py-1.5 px-space-sm rounded-md font-label-md text-label-md font-semibold bg-surface-container-lowest text-primary shadow-xs transition-all cursor-pointer text-center";
    if (btnSymptoms) btnSymptoms.className = "flex-1 py-1.5 px-space-sm rounded-md font-label-md text-label-md font-semibold text-on-surface-variant hover:text-on-surface transition-all cursor-pointer text-center";
    if (contentNotes) contentNotes.classList.remove('hidden');
    if (contentSymptoms) contentSymptoms.classList.add('hidden');
  } else {
    if (btnNotes) btnNotes.className = "flex-1 py-1.5 px-space-sm rounded-md font-label-md text-label-md font-semibold text-on-surface-variant hover:text-on-surface transition-all cursor-pointer text-center";
    if (btnSymptoms) btnSymptoms.className = "flex-1 py-1.5 px-space-sm rounded-md font-label-md text-label-md font-semibold bg-surface-container-lowest text-primary shadow-xs transition-all cursor-pointer text-center";
    if (contentNotes) contentNotes.classList.add('hidden');
    if (contentSymptoms) contentSymptoms.classList.remove('hidden');
  }
}

// Actualizar cronómetro en pantalla
function updateTimerDisplay() {
  const timerEl = document.getElementById('sessionTimer');
  if (!timerEl) return;
  const mins = Math.floor(AppState.session.timerSeconds / 60);
  const secs = AppState.session.timerSeconds % 60;
  timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Modal de Guía de Entrevista
function openInterviewGuideModal() {
  const modal = document.getElementById('guideModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeInterviewGuideModal() {
  const modal = document.getElementById('guideModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Modal de Ajustes de IA
function openAISettingsModal() {
  const modal = document.getElementById('aiSettingsModal');
  const inputKey = document.getElementById('geminiApiKeyInput');
  const radioAutonomous = document.getElementById('radioAutonomous');
  const radioGemini = document.getElementById('radioGemini');

  if (inputKey) inputKey.value = AppState.aiSettings.geminiApiKey;
  if (AppState.aiSettings.mode === 'gemini') {
    if (radioGemini) radioGemini.checked = true;
  } else {
    if (radioAutonomous) radioAutonomous.checked = true;
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeAISettingsModal() {
  const modal = document.getElementById('aiSettingsModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function saveAISettings() {
  const radioGemini = document.getElementById('radioGemini');
  const inputKey = document.getElementById('geminiApiKeyInput');

  const mode = radioGemini && radioGemini.checked ? 'gemini' : 'autonomous';
  const apiKey = inputKey ? inputKey.value.trim() : '';

  AppState.aiSettings.mode = mode;
  AppState.aiSettings.geminiApiKey = apiKey;

  localStorage.setItem('psicosim_ai_mode', mode);
  localStorage.setItem('psicosim_gemini_key', apiKey);

  // Actualizar badge de estado
  const engineBadge = document.getElementById('aiEngineBadge');
  if (engineBadge) {
    engineBadge.textContent = mode === 'gemini' ? 'Gemini 1.5' : 'v2.4 IA';
  }

  closeAISettingsModal();
}

// Filtros y búsqueda en catálogo
function initCatalogFilters() {
  const searchInput = document.getElementById('caseSearchInput');
  const cases = Array.from(document.querySelectorAll('.case-card'));
  const countDisplay = document.getElementById('visibleCount');
  const emptyState = document.getElementById('noCasesFound');
  const resetBtn = document.getElementById('resetFiltersBtn');

  if (!searchInput || cases.length === 0) return;

  let currentFilters = {
    category: 'all',
    difficulty: 'all',
    competency: 'all',
    query: ''
  };

  function applyFilters() {
    let visibleCount = 0;

    cases.forEach(card => {
      const cat = card.getAttribute('data-category') || '';
      const diff = card.getAttribute('data-difficulty') || '';
      const comp = card.getAttribute('data-competency') || '';
      const text = (card.getAttribute('data-text') || '').toLowerCase();

      const matchCat = currentFilters.category === 'all' || cat === currentFilters.category;
      const matchDiff = currentFilters.difficulty === 'all' || diff === currentFilters.difficulty;
      const matchComp = currentFilters.competency === 'all' || comp.includes(currentFilters.competency);
      const matchQuery = !currentFilters.query || text.includes(currentFilters.query.toLowerCase());

      if (matchCat && matchDiff && matchComp && matchQuery) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countDisplay) countDisplay.textContent = visibleCount;
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
      } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
      }
    }
  }

  function setupChipGroup(containerId, filterKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const chips = container.querySelectorAll('.filter-chip');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => {
          c.classList.remove('bg-primary', 'text-on-primary', 'active');
          c.classList.add('bg-surface-container-lowest', 'text-on-surface-variant');
        });

        chip.classList.add('bg-primary', 'text-on-primary', 'active');
        chip.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant');

        currentFilters[filterKey] = chip.getAttribute('data-val');
        applyFilters();
      });
    });
  }

  setupChipGroup('filterCategory', 'category');
  setupChipGroup('filterDifficulty', 'difficulty');
  setupChipGroup('filterCompetency', 'competency');

  searchInput.addEventListener('input', (e) => {
    currentFilters.query = e.target.value.trim();
    applyFilters();
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', resetAllFilters);
  }

  window.resetAllFilters = function() {
    currentFilters = { category: 'all', difficulty: 'all', competency: 'all', query: '' };
    searchInput.value = '';

    document.querySelectorAll('.filter-chip').forEach(chip => {
      if (chip.getAttribute('data-val') === 'all') {
        chip.classList.add('bg-primary', 'text-on-primary', 'active');
        chip.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant');
      } else {
        chip.classList.remove('bg-primary', 'text-on-primary', 'active');
        chip.classList.add('bg-surface-container-lowest', 'text-on-surface-variant');
      }
    });

    applyFilters();
  };
}

// Utilidades rápidas de la sala de simulación
function insertPrompt(text) {
  const input = document.getElementById('clinicianInput');
  if (input) {
    input.value = text;
    input.focus();
  }
}

function clearInput() {
  const input = document.getElementById('clinicianInput');
  if (input) {
    input.value = '';
    input.focus();
  }
}

// Inicializar eventos del chat interactivo
function initChatEvents() {
  const input = document.getElementById('clinicianInput');
  const sendBtn = document.getElementById('sendBtn');

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendIntervention();
      }
    });
  }

  if (sendBtn) {
    sendBtn.onclick = () => sendIntervention();
  }
}

// Transmitir intervención del estudiante al paciente simulado
async function sendIntervention() {
  const input = document.getElementById('clinicianInput');
  const feed = document.getElementById('transcriptFeed');
  const sendBtn = document.getElementById('sendBtn');
  if (!input || !feed) return;

  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

  const patient = AppState.activeCase || CLINICAL_CASES[0];
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Desactivar temporalmente botón y limpiar campo
  input.value = '';
  input.disabled = true;
  if (sendBtn) sendBtn.disabled = true;

  // Analizar intervención del estudiante
  const analysis = ClinicalSimulator.analyzeTraineeQuestion(text);

  // 1. Renderizar turno del terapeuta
  const traineeBubble = document.createElement('div');
  traineeBubble.className = "flex flex-col items-end gap-1 pl-space-md md:pl-space-lg animate-in fade-in duration-200";
  traineeBubble.innerHTML = `
    <div class="flex items-center gap-space-xs">
      <span class="font-label-sm text-[11px] text-on-surface-variant">${timeStr}</span>
      <span class="font-label-sm text-xs font-semibold text-primary">Paula Cruz (Terapeuta)</span>
    </div>
    <div class="bg-surface-container-high text-on-surface p-space-md rounded-xl rounded-tr-none shadow-sm max-w-xl text-left">
      <p class="font-body-md text-sm md:text-body-md leading-relaxed">${escapeHtml(text)}</p>
      <div class="mt-space-xs pt-space-xs flex items-center justify-between text-on-surface-variant border-t border-surface-variant/40">
        <span class="font-label-sm text-[11px] flex items-center gap-1 ${analysis.isLeading ? 'text-error font-semibold' : 'text-secondary font-medium'}">
          <span class="material-symbols-outlined text-[13px]">${analysis.isLeading ? 'report' : 'psychology'}</span>
          ${analysis.interventionType}
        </span>
        <span class="font-label-sm text-[11px] font-semibold ${analysis.rapportDelta >= 0 ? 'text-secondary' : 'text-error'}">
          Rapport ${analysis.rapportDelta >= 0 ? '+' : ''}${analysis.rapportDelta}%
        </span>
      </div>
    </div>
  `;
  feed.appendChild(traineeBubble);
  feed.scrollTop = feed.scrollHeight;

  // 2. Mostrar indicador de que el paciente está procesando
  const typingIndicator = document.createElement('div');
  typingIndicator.id = "patientTypingIndicator";
  typingIndicator.className = "flex flex-col items-start gap-1 pr-space-md animate-in fade-in duration-150";
  typingIndicator.innerHTML = `
    <div class="flex items-center gap-space-xs">
      <span class="font-label-sm text-xs font-semibold text-primary">${patient.name}</span>
      <span class="font-label-sm text-[11px] text-secondary flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
        formulando respuesta...
      </span>
    </div>
    <div class="bg-surface-container-low text-on-surface-variant px-space-md py-space-sm rounded-xl rounded-tl-none text-xs flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style="animation-delay: 0ms"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style="animation-delay: 150ms"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style="animation-delay: 300ms"></span>
    </div>
  `;
  feed.appendChild(typingIndicator);
  feed.scrollTop = feed.scrollHeight;

  // 3. Generar respuesta (Modo Gemini si tiene clave o Modo Inteligente Autónomo)
  let responseData;
  try {
    if (AppState.aiSettings.mode === 'gemini' && AppState.aiSettings.geminiApiKey) {
      responseData = await ClinicalSimulator.generateGeminiResponse(patient, text, AppState.session.messages, AppState.aiSettings.geminiApiKey);
    } else {
      // Breve pausa para realismo de respuesta clínica
      await new Promise(r => setTimeout(r, 700));
      responseData = ClinicalSimulator.generateAutonomousResponse(patient, text, AppState.session.messages.length);
    }
  } catch (err) {
    console.warn("Fallo en Gemini, recurriendo a simulación autónoma:", err);
    await new Promise(r => setTimeout(r, 500));
    responseData = ClinicalSimulator.generateAutonomousResponse(patient, text, AppState.session.messages.length);
  }

  // Quitar indicador de escritura
  const indicatorEl = document.getElementById("patientTypingIndicator");
  if (indicatorEl) indicatorEl.remove();

  // 4. Renderizar respuesta del paciente virtual
  const patientBubble = document.createElement('div');
  patientBubble.className = "flex flex-col items-start gap-1 pr-space-md md:pr-space-lg animate-in fade-in duration-200";
  patientBubble.innerHTML = `
    <div class="flex items-center gap-space-xs">
      <span class="font-label-sm text-xs font-semibold text-primary">${patient.name} (IA)</span>
      <span class="font-label-sm text-[11px] text-on-surface-variant">${timeStr}</span>
      <button onclick="playPatientVoice(this)" data-speech="${escapeHtml(responseData.reply)}" class="ml-1 text-secondary hover:text-primary transition-colors cursor-pointer" title="Escuchar respuesta por voz">
        <span class="material-symbols-outlined text-[15px]">volume_up</span>
      </button>
    </div>
    <div class="bg-surface-container-low text-on-surface p-space-md rounded-xl rounded-tl-none shadow-sm max-w-xl border-l-4 border-l-secondary">
      <p class="font-body-md text-sm md:text-body-md leading-relaxed">${escapeHtml(responseData.reply)}</p>
      <div class="mt-space-xs pt-space-xs flex items-center gap-space-xs flex-wrap">
        <span class="px-space-xs py-0.5 rounded font-label-sm text-[10px] bg-surface-container-highest text-on-surface">${patient.diagnosticCode.split('·')[0].trim()}</span>
        <span class="px-space-xs py-0.5 rounded font-label-sm text-[10px] ${analysis.isLeading ? 'bg-error-container text-on-error-container font-semibold' : 'bg-surface-container text-on-surface-variant'}">
          ${responseData.signs ? responseData.signs.split(';')[0] : 'Expresión observada'}
        </span>
      </div>
    </div>
  `;
  feed.appendChild(patientBubble);
  feed.scrollTop = feed.scrollHeight;

  // Actualizar comunicación no verbal en la sala
  if (responseData.signs) {
    const signsEl = document.getElementById('consultationRoomSigns');
    if (signsEl) {
      signsEl.innerHTML = `<span class="font-semibold text-primary">Signos observados:</span> ${escapeHtml(responseData.signs)}`;
    }
  }

  // Actualizar Alianza Terapéutica & Rapport
  updateRapportScore(analysis.rapportDelta);

  // Guardar en el historial de sesión para el Debriefing
  AppState.session.messages.push({
    sender: 'trainee',
    text: text,
    time: timeStr,
    analysis: analysis
  });
  AppState.session.messages.push({
    sender: 'patient',
    text: responseData.reply,
    time: timeStr,
    signs: responseData.signs
  });

  // Habilitar de nuevo los campos
  input.disabled = false;
  if (sendBtn) sendBtn.disabled = false;
  input.focus();
}

// Actualizar porcentaje y barra de Rapport
function updateRapportScore(delta) {
  AppState.session.rapport = Math.min(100, Math.max(20, AppState.session.rapport + delta));
  const textEl = document.getElementById('rapportPercentText');
  const barEl = document.getElementById('rapportProgressBar');

  let label = "Fuerte";
  if (AppState.session.rapport >= 85) label = "Sintonía Óptima";
  else if (AppState.session.rapport >= 70) label = "Fuerte / Receptivo";
  else if (AppState.session.rapport >= 50) label = "Moderada";
  else label = "Tensa / Cautelosa";

  if (textEl) textEl.textContent = `${AppState.session.rapport}% · ${label}`;
  if (barEl) {
    barEl.style.width = `${AppState.session.rapport}%`;
    if (AppState.session.rapport < 50) {
      barEl.className = "h-full bg-error rounded-full transition-all duration-500 ease-out";
    } else {
      barEl.className = "h-full bg-secondary rounded-full transition-all duration-500 ease-out";
    }
  }
}

// Reproducir voz del paciente
function playPatientVoice(btn) {
  const text = btn.getAttribute('data-speech');
  if (text && typeof ClinicalSimulator !== 'undefined') {
    ClinicalSimulator.speak(text);
  }
}

// Inicializar temporizador de la sesión
function initSessionTimer() {
  if (AppState.session.timerInterval) clearInterval(AppState.session.timerInterval);
  AppState.session.timerInterval = setInterval(() => {
    AppState.session.timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

// Reconocimiento de voz para dictar preguntas
function initSpeechRecognition() {
  const micBtn = document.getElementById('micBtn');
  if (!micBtn) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.title = "Reconocimiento de voz no soportado en este navegador";
    return;
  }

  const rec = new SpeechRecognition();
  rec.lang = 'es-ES';
  rec.continuous = false;
  rec.interimResults = false;

  rec.onstart = () => {
    AppState.isRecording = true;
    micBtn.classList.add('bg-error/20', 'text-error');
  };

  rec.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('clinicianInput');
    if (input) {
      input.value = (input.value + ' ' + transcript).trim();
      input.focus();
    }
  };

  rec.onerror = (e) => {
    console.warn("Speech recognition error:", e);
    AppState.isRecording = false;
    micBtn.classList.remove('bg-error/20', 'text-error');
  };

  rec.onend = () => {
    AppState.isRecording = false;
    micBtn.classList.remove('bg-error/20', 'text-error');
  };

  AppState.recognition = rec;
  micBtn.onclick = toggleSpeechRecognition;
}

function toggleSpeechRecognition() {
  if (!AppState.recognition) return;
  if (AppState.isRecording) {
    AppState.recognition.stop();
  } else {
    AppState.recognition.start();
  }
}

// Autoguardado de notas clínicas en localStorage
function initNotesAutosave() {
  const notesTextarea = document.querySelector('#tabContentNotes textarea');
  if (!notesTextarea) return;

  const saved = localStorage.getItem('psicosim_notes_' + AppState.activeCaseId);
  if (saved) {
    notesTextarea.value = saved;
  }

  notesTextarea.addEventListener('input', () => {
    localStorage.setItem('psicosim_notes_' + AppState.activeCaseId, notesTextarea.value);
  });
}

// Utilidad para escapar texto HTML
function escapeHtml(string) {
  const div = document.createElement('div');
  div.innerText = string;
  return div.innerHTML;
}

// Actualizar auditoría pedagógica y debriefing con métricas de la sesión
function updateDebriefingUI() {
  const patient = AppState.activeCase || CLINICAL_CASES[0];
  
  // Encabezados
  const nameEl = document.getElementById('debriefPatientName');
  const tagEl = document.getElementById('debriefDiagTag');
  const durEl = document.getElementById('debriefDuration');
  const turnsCountEl = document.getElementById('debriefTurnsCount');

  if (nameEl) nameEl.textContent = `${patient.name} (${patient.age} años)`;
  if (tagEl) tagEl.textContent = `${patient.diagnosticCode} · ${patient.diagnosticTitle}`;
  const mins = Math.max(1, Math.round(AppState.session.timerSeconds / 60));
  if (durEl) durEl.textContent = `${mins} minutos`;

  // Filtrar intervenciones del estudiante
  const traineeMessages = AppState.session.messages.filter(m => m.sender === 'trainee');
  const totalTurns = traineeMessages.length;
  if (turnsCountEl) turnsCountEl.textContent = `${totalTurns > 0 ? totalTurns * 2 : 4} turnos registrados`;

  // Métricas
  let openRatio = 78;
  let closedRatio = 22;
  let empathyScore = 92;
  let leadingCount = 1;
  let rapportScore = AppState.session.rapport || 88;

  if (totalTurns > 0) {
    const openCount = traineeMessages.filter(m => m.analysis?.isOpen).length;
    openRatio = Math.round((openCount / totalTurns) * 100);
    closedRatio = 100 - openRatio;

    const empCount = traineeMessages.filter(m => m.analysis?.isEmpathetic || m.analysis?.isParaphrase).length;
    empathyScore = Math.min(100, Math.max(35, Math.round((empCount / totalTurns) * 65 + 35)));

    leadingCount = traineeMessages.filter(m => m.analysis?.isLeading).length;
  }

  // Actualizar KPI 1: Preguntas Abiertas vs Cerradas
  const openText = document.getElementById('debriefOpenRatioText');
  const closedText = document.getElementById('debriefClosedRatioText');
  const openBar = document.getElementById('debriefOpenBar');
  const closedBar = document.getElementById('debriefClosedBar');
  if (openText) openText.innerHTML = `${openRatio}% <span class="text-on-surface-variant font-label-md text-sm font-normal">Abiertas</span>`;
  if (closedText) closedText.textContent = `${closedRatio}% Preguntas Cerradas`;
  if (openBar) openBar.style.width = `${openRatio}%`;
  if (closedBar) closedBar.style.width = `${closedRatio}%`;

  // Actualizar KPI 2: Empatía
  const empScoreEl = document.getElementById('debriefEmpathyScore');
  const empBarEl = document.getElementById('debriefEmpathyBar');
  const empBadgeEl = document.getElementById('debriefEmpathyBadge');
  if (empScoreEl) empScoreEl.textContent = empathyScore;
  if (empBarEl) empBarEl.style.width = `${empathyScore}%`;
  if (empBadgeEl) {
    if (empathyScore >= 80) empBadgeEl.textContent = "Sobresaliente";
    else if (empathyScore >= 60) empBadgeEl.textContent = "Adecuado";
    else empBadgeEl.textContent = "A Desarrollar";
  }

  // Actualizar KPI 3: Preguntas Sesgadas / Inductivas
  const leadCountEl = document.getElementById('debriefLeadingCount');
  const leadBarEl = document.getElementById('debriefLeadingBar');
  const leadBadgeEl = document.getElementById('debriefLeadingBadge');
  const leadDescEl = document.getElementById('debriefLeadingDesc');
  if (leadCountEl) leadCountEl.textContent = leadingCount;
  if (leadBarEl) leadBarEl.style.width = `${Math.min(100, leadingCount * 25)}%`;
  if (leadBadgeEl) {
    leadBadgeEl.textContent = leadingCount === 0 ? "Riesgo Nulo" : (leadingCount === 1 ? "Riesgo Bajo" : "Atención Pedagógica");
    leadBadgeEl.className = leadingCount === 0 ? "ml-auto px-space-xs py-0.5 rounded-full font-label-sm text-[10px] bg-secondary-fixed text-on-secondary-fixed font-semibold" : "ml-auto px-space-xs py-0.5 rounded-full font-label-sm text-[10px] bg-surface-container-high text-on-surface-variant font-semibold";
  }
  if (leadDescEl) {
    leadDescEl.textContent = leadingCount === 0 
      ? "Excelente formulación neutral sin preguntas dirigidas."
      : `${leadingCount} formulación(es) sugestiva(s) detectada(s).`;
  }

  // Actualizar KPI 4: Alianza / Rapport
  const rapScoreEl = document.getElementById('debriefRapportScore');
  const rapBarEl = document.getElementById('debriefRapportBar');
  const rapBadgeEl = document.getElementById('debriefRapportBadge');
  if (rapScoreEl) rapScoreEl.textContent = rapportScore;
  if (rapBarEl) rapBarEl.style.width = `${rapportScore}%`;
  if (rapBadgeEl) {
    rapBadgeEl.textContent = rapportScore >= 80 ? "Alta Cohesión" : (rapportScore >= 60 ? "Cohesión Media" : "Reserva");
  }

  // Renderizar desglose cualitativo turno por turno
  const qualitativeFeed = document.getElementById('debriefQualitativeFeed');
  if (!qualitativeFeed) return;

  if (totalTurns === 0) {
    // Renderizar casos modelo formativos de muestra
    qualitativeFeed.innerHTML = `
      <div class="p-space-md rounded-xl bg-surface-container-lowest border border-secondary/30 shadow-sm flex flex-col gap-space-sm relative overflow-hidden">
        <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
        <div class="flex flex-wrap items-center justify-between gap-space-xs pl-space-xs">
          <span class="font-label-sm text-xs font-bold text-secondary uppercase tracking-wider">Intervención Modelo · Validación Afectiva</span>
          <span class="px-space-sm py-0.5 rounded-full font-label-sm text-xs bg-secondary-fixed text-on-secondary-fixed font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">check_circle</span> Fortaleza
          </span>
        </div>
        <p class="font-body-md text-sm md:text-body-md text-on-surface pl-space-xs font-medium">
          «Entiendo que esa sensación debe ser agotadora y frustrante para ti, ${patient.name.split(' ')[0]}, especialmente al no encontrar tregua...»
        </p>
        <div class="mt-space-xs p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm">
          <span class="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">school</span>
          <p class="font-body-sm text-xs text-on-surface-variant">
            <strong>Fortaleza pedagógica:</strong> Validar el malestar subjetivo antes de indagar datos cronológicos o somáticos desescala la activación defensiva del paciente y afianza la alianza de trabajo.
          </p>
        </div>
      </div>

      <div class="p-space-md rounded-xl bg-surface-container-lowest border border-error/30 shadow-sm flex flex-col gap-space-sm relative overflow-hidden">
        <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
        <div class="flex flex-wrap items-center justify-between gap-space-xs pl-space-xs">
          <span class="font-label-sm text-xs font-bold text-error uppercase tracking-wider">Intervención de Alerta · Pregunta Inductiva (Sesgo)</span>
          <span class="px-space-sm py-0.5 rounded-full font-label-sm text-xs bg-error-container text-on-error-container font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">report</span> Sesgo a Evitar
          </span>
        </div>
        <p class="font-body-md text-sm md:text-body-md text-on-surface pl-space-xs font-medium">
          «¿Verdad que sientes que vas a perder el control en cualquier momento?»
        </p>
        <div class="mt-space-xs p-space-sm rounded-lg bg-error-container/30 flex items-start gap-space-sm">
          <span class="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">tips_and_updates</span>
          <div class="flex flex-col gap-1">
            <p class="font-body-sm text-xs text-on-surface">
              <strong>Oportunidad de aprendizaje:</strong> La fórmula «¿Verdad que...?» induce la respuesta del paciente e introduce un sesgo de confirmación que contamina la exploración semiológica.
            </p>
            <div class="p-space-xs px-space-sm rounded bg-surface-container-lowest font-body-sm text-xs text-primary flex items-baseline gap-space-xs">
              <span class="font-label-sm text-[11px] font-bold text-secondary uppercase shrink-0">Alternativa Sugerida:</span>
              <span class="italic">«¿Qué pensamientos específicos experimentas en tu mente cuando te asalta esa sensación?»</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // Renderizar las preguntas reales formuladas en la sesión
    qualitativeFeed.innerHTML = traineeMessages.map((msg, idx) => {
      const isLead = msg.analysis?.isLeading;
      const isEmp = msg.analysis?.isEmpathetic || msg.analysis?.isParaphrase;
      const borderCol = isLead ? 'border-error/30' : (isEmp ? 'border-secondary/30' : 'border-surface-container');
      const barCol = isLead ? 'bg-error' : (isEmp ? 'bg-secondary' : 'bg-primary-fixed-dim');
      const badgeBg = isLead ? 'bg-error-container text-on-error-container' : (isEmp ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container text-primary');

      return `
        <div class="p-space-md rounded-xl bg-surface-container-lowest border ${borderCol} shadow-sm flex flex-col gap-space-sm relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1.5 ${barCol}"></div>
          <div class="flex flex-wrap items-center justify-between gap-space-xs pl-space-xs">
            <span class="font-label-sm text-xs font-bold ${isLead ? 'text-error' : (isEmp ? 'text-secondary' : 'text-primary')} uppercase tracking-wider">
              Turno #${(idx + 1) * 2 - 1} · Tu Intervención
            </span>
            <span class="px-space-sm py-0.5 rounded-full font-label-sm text-xs ${badgeBg} font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">${isLead ? 'report' : (isEmp ? 'favorite' : 'psychology')}</span>
              ${msg.analysis?.interventionType || 'Intervención Clínica'}
            </span>
          </div>
          <p class="font-body-md text-sm md:text-body-md text-on-surface pl-space-xs font-medium">
            «${escapeHtml(msg.text)}»
          </p>
          ${isLead ? `
            <div class="mt-space-xs p-space-sm rounded-lg bg-error-container/30 flex items-start gap-space-sm">
              <span class="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">tips_and_updates</span>
              <div class="flex flex-col gap-1">
                <p class="font-body-sm text-xs text-on-surface">
                  <strong>Oportunidad de mejora:</strong> Se detectó una formulación potencialmente inductiva o sugestiva. Evita fórmulas afirmativas que dirijan la respuesta del paciente.
                </p>
                <div class="p-space-xs px-space-sm rounded bg-surface-container-lowest font-body-sm text-xs text-primary flex items-baseline gap-space-xs">
                  <span class="font-label-sm text-[11px] font-bold text-secondary uppercase shrink-0">Alternativa Sugerida:</span>
                  <span class="italic">«¿De qué manera describirías lo que te ocurre en esa situación con tus propias palabras?»</span>
                </div>
              </div>
            </div>
          ` : (isEmp ? `
            <div class="mt-space-xs p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm">
              <span class="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">check_circle</span>
              <p class="font-body-sm text-xs text-on-surface-variant">
                <strong>Fortaleza clínica:</strong> Excelente validación empática del contenido afectivo. Ayudó a consolidar la alianza terapéutica y favoreció la apertura del paciente.
              </p>
            </div>
          ` : `
            <div class="mt-space-xs p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm">
              <span class="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">school</span>
              <p class="font-body-sm text-xs text-on-surface-variant">
                <strong>Técnica exploratoria:</strong> Indagación semiológica adecuada. Procura mantener el equilibrio entre explorar hechos objetivos y acoger la emoción sentida.
              </p>
            </div>
          `)}
        </div>
      `;
    }).join('');
  }

  // Comentario del supervisor docente adaptativo
  const commentEl = document.getElementById('debriefSupervisorComment');
  if (commentEl) {
    if (leadingCount === 0 && empathyScore >= 80) {
      commentEl.textContent = `Sobresaliente desempeño en la entrevista con ${patient.name}. La estudiante demostró alta sensibilidad empática, excelente contención del motivo de consulta y formuló preguntas limpias de sesgo inductivo. Nivel recomendable para avance a prácticas de complejidad intermedia.`;
    } else if (leadingCount > 0) {
      commentEl.textContent = `Buen ritmo general en la sesión con ${patient.name}. Se observa calidez y esfuerzo por acoger el malestar. Se recomienda especial atención a las preguntas que incluyen juicios o confirmaciones anticipadas para no sesgar el reporte clínico.`;
    } else {
      commentEl.textContent = `Encuadre inicial adecuado con ${patient.name}. Se sugiere profundizar en la validación afectiva previa a la exploración fáctica de síntomas, permitiendo mayor tiempo para que el paciente elabore su discurso.`;
    }
  }
}

