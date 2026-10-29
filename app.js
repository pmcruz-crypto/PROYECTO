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
    active: false,
    timerSeconds: 865, // 14 min 25 seg de muestra
    timerInterval: null,
    messages: [],
    notes: '',
    checkedCriteria: new Set()
  }
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

  // Inicializar temporizador de muestra
  updateTimerDisplay();
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
