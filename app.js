/**
 * DevRoadmap & Project Tracker - Activity Tree & Project View
 * Inspired by executive workflow dashboard with interactive sliders, notes and review logs
 */

const STORAGE_KEY = 'dev_roadmap_projects_tree_v1';

// Initial template project matching the user's screenshot
const INITIAL_PROJECTS = [
  {
    id: 'proj-demo-1',
    title: 'Proyecto de Automatización y BI',
    description: 'Implementación de diagnóstico de fuentes y desarrollo de flujos automatizados.',
    complexity: 'alta', // baja | media | alta | muy_alta
    revisionFrequency: 'Semanal',
    estimatedHours: 80,
    deadline: '2026-11-30',
    reviews: [
      { id: 'rev-1', date: '2026-10-15', text: 'Revisión inicial completada. Se detectaron fuentes pendientes de validación.' }
    ],
    activities: [
      {
        id: 'act-1',
        title: 'Diagnóstico de fuentes',
        role: 'Analista BI',
        dueDate: '2026-10-15',
        status: 'atrasado', // atrasado | ejecucion | completado | por_iniciar
        progress: 30,
        notes: [
          { id: 'n-1', date: '2026-10-14', text: 'Pendiente acceso a la base de datos de producción.' }
        ]
      },
      {
        id: 'act-2',
        title: 'Desarrollo de automatización',
        role: 'Desarrollador',
        dueDate: '2026-11-20',
        status: 'ejecucion',
        progress: 0,
        notes: []
      }
    ]
  }
];

// App State
let projects = [];
let activeProjectId = null;

// Status styling and text dictionary
const STATUS_CONFIG = {
  atrasado: {
    label: 'Atrasado',
    className: 'badge-status-atrasado'
  },
  ejecucion: {
    label: 'En ejecución',
    className: 'badge-status-ejecucion'
  },
  completado: {
    label: 'Completado',
    className: 'badge-status-completado'
  },
  por_iniciar: {
    label: 'Por iniciar',
    className: 'badge-status-por_iniciar'
  }
};

const COMPLEXITY_LABELS = {
  baja: '🟢 Baja',
  media: '🔵 Media',
  alta: '🟠 Alta',
  muy_alta: '🔴 Muy Alta'
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  initEventListeners();
  renderApp();
});

function loadProjects() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      projects = JSON.parse(saved);
    } catch (e) {
      console.error('Error loading projects', e);
      projects = JSON.parse(JSON.stringify(INITIAL_PROJECTS));
      saveProjects();
    }
  } else {
    // Start with the template matching the screenshot
    projects = JSON.parse(JSON.stringify(INITIAL_PROJECTS));
    saveProjects();
  }

  if (projects.length > 0) {
    activeProjectId = projects[0].id;
  } else {
    activeProjectId = null;
  }
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function getActiveProject() {
  if (!activeProjectId) return null;
  return projects.find(p => p.id === activeProjectId) || null;
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function initEventListeners() {
  // Project selector change
  const projectSelector = document.getElementById('projectSelector');
  projectSelector.addEventListener('change', (e) => {
    activeProjectId = e.target.value;
    renderApp();
  });

  // Top header button
  document.getElementById('btnOpenNewProjectModal').addEventListener('click', () => openProjectModal(null));
  document.getElementById('btnExportData').addEventListener('click', exportDataJSON);

  // Project Toolbar Buttons
  document.getElementById('btnOpenAddActivityModal').addEventListener('click', () => openActivityModal(null));
  document.getElementById('btnOpenSeguimientoModal').addEventListener('click', openSeguimientoModal);
  document.getElementById('btnOpenResumenModal').addEventListener('click', openResumenModal);
  document.getElementById('btnOpenEditProjectModal').addEventListener('click', () => {
    const current = getActiveProject();
    if (current) openProjectModal(current.id);
  });
  document.getElementById('btnDeleteCurrentProject').addEventListener('click', deleteCurrentProject);

  // Modals close buttons
  document.getElementById('btnCloseActivityModal').addEventListener('click', closeActivityModal);
  document.getElementById('btnCancelActivityModal').addEventListener('click', closeActivityModal);
  document.getElementById('activityForm').addEventListener('submit', handleActivityFormSubmit);

  document.getElementById('formActivityProgress').addEventListener('input', (e) => {
    document.getElementById('formActivityProgressDisplay').textContent = `${e.target.value}%`;
  });

  document.getElementById('btnCloseProjectModal').addEventListener('click', closeProjectModal);
  document.getElementById('btnCancelProjectModal').addEventListener('click', closeProjectModal);
  document.getElementById('projectForm').addEventListener('submit', handleProjectFormSubmit);

  document.getElementById('btnCloseResumenModal').addEventListener('click', closeResumenModal);
  document.getElementById('btnCloseResumenModalBottom').addEventListener('click', closeResumenModal);

  document.getElementById('btnCloseSeguimientoModal').addEventListener('click', closeSeguimientoModal);
  document.getElementById('btnCloseSeguimientoModalBottom').addEventListener('click', closeSeguimientoModal);
  document.getElementById('newReviewForm').addEventListener('submit', handleAddReviewSubmit);
}

// ==========================================
// RENDER ENGINE
// ==========================================
function renderApp() {
  updateProjectSelector();

  const currentProject = getActiveProject();
  const projectSection = document.getElementById('projectSection');
  const welcomeSection = document.getElementById('welcomeNoProjectSection');

  if (!currentProject) {
    projectSection.classList.add('hidden');
    welcomeSection.classList.remove('hidden');
    document.getElementById('activeProjectSummary').textContent = 'No hay proyectos creados aún';
    return;
  }

  welcomeSection.classList.add('hidden');
  projectSection.classList.remove('hidden');

  // Update summary in header
  const compLabel = COMPLEXITY_LABELS[currentProject.complexity] || 'Media';
  const hours = currentProject.estimatedHours ? `${currentProject.estimatedHours}h est.` : 'Horas no esp.';
  const freq = currentProject.revisionFrequency || 'Semanal';
  const overallProgress = calculateProjectProgress(currentProject);

  document.getElementById('activeProjectSummary').innerHTML = `
    Complejidad: <span class="text-white font-medium">${compLabel}</span> | 
    Revisión: <span class="text-white font-medium">${freq}</span> | 
    Tiempos: <span class="text-white font-medium">${hours}</span> | 
    Avance: <span class="text-cyan-400 font-bold">${overallProgress}%</span>
  `;

  // Render activities
  renderActivities(currentProject);

  // Reinitialize icons
  lucide.createIcons();
}

function updateProjectSelector() {
  const selector = document.getElementById('projectSelector');
  selector.innerHTML = '';

  if (projects.length === 0) {
    selector.innerHTML = '<option value="">Sin proyectos</option>';
    return;
  }

  projects.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.title;
    if (p.id === activeProjectId) {
      option.selected = true;
    }
    selector.appendChild(option);
  });
}

function calculateProjectProgress(project) {
  if (!project.activities || project.activities.length === 0) return 0;
  const total = project.activities.reduce((acc, act) => acc + (Number(act.progress) || 0), 0);
  return Math.round(total / project.activities.length);
}

// ==========================================
// RENDER ACTIVITIES (SCREENSHOT ALIGNED)
// ==========================================
function renderActivities(project) {
  const container = document.getElementById('activitiesContainer');
  const noNotice = document.getElementById('noActivitiesNotice');

  const activities = project.activities || [];

  if (activities.length === 0) {
    container.innerHTML = '';
    noNotice.classList.remove('hidden');
    return;
  }

  noNotice.classList.add('hidden');

  container.innerHTML = activities.map(act => {
    const statusCfg = STATUS_CONFIG[act.status] || STATUS_CONFIG.ejecucion;
    const notesCount = act.notes ? act.notes.length : 0;
    const dueDateText = act.dueDate ? `Vence ${act.dueDate}` : 'Sin fecha';
    const roleText = act.role || 'Responsable';

    return `
      <div class="relative group" id="activity-wrapper-${act.id}">
        
        <!-- Branch connector curve to left timeline -->
        <div class="branch-connector"></div>

        <!-- Main Activity Card (Light background matching screenshot) -->
        <div class="activity-card bg-activityBg rounded-xl p-3 sm:p-3.5 shadow-md border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-activityText">
          
          <!-- Left info section -->
          <div class="flex items-start gap-2.5 flex-1 min-w-0">
            <!-- Corner arrow icon ↳ -->
            <div class="text-cyanAction mt-0.5 text-lg font-black leading-none select-none">
              ↳
            </div>
            
            <div class="min-w-0 flex-1">
              <h3 class="text-sm sm:text-base font-extrabold text-activityText tracking-tight truncate leading-snug">
                ${escapeHtml(act.title)}
              </h3>
              
              <!-- Subtitle metadata -->
              <div class="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 font-medium mt-0.5">
                <span>${escapeHtml(roleText)}</span>
                <span>·</span>
                <span>${dueDateText}</span>
                <span>·</span>
                <!-- Status Badge -->
                <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusCfg.className}">
                  ${statusCfg.label}
                </span>
              </div>
            </div>
          </div>

          <!-- Right controls section (Progress, Slider, Notes, Edit, Delete) -->
          <div class="flex items-center gap-2 sm:gap-3 justify-end flex-wrap">
            
            <!-- Percentage Display -->
            <span class="text-xs sm:text-sm font-black text-activityText min-w-[34px] text-right" id="progress-val-${act.id}">
              ${act.progress}%
            </span>

            <!-- Mini Progress Bar -->
            <div class="w-12 sm:w-16 bg-slate-300/80 h-2 rounded-full overflow-hidden">
              <div 
                id="mini-bar-${act.id}"
                class="h-2 rounded-full transition-all duration-150 ${getProgressFill(act.progress)}" 
                style="width: ${act.progress}%"
              ></div>
            </div>

            <!-- Interactive Slider (Drag to adjust %) -->
            <input 
              type="range" 
              min="0" 
              max="100" 
              value="${act.progress}" 
              class="activity-slider"
              oninput="handleSliderChange('${act.id}', this.value)"
              title="Desliza para ajustar el progreso en vivo"
            >

            <!-- Notas (X) ▾ Dropdown Toggle -->
            <button 
              onclick="toggleNotesDrawer('${act.id}')" 
              class="px-2.5 py-1.5 bg-navyButton hover:bg-navyButtonHover text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm transition"
              title="Ver o agregar notas y revisiones"
            >
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              <span>Notas (${notesCount})</span>
              <i data-lucide="chevron-down" class="w-3 h-3 ml-0.5 transition-transform" id="caret-${act.id}"></i>
            </button>

            <!-- Editar Button -->
            <button 
              onclick="openActivityModal('${act.id}')" 
              class="px-3 py-1.5 bg-navyButton hover:bg-navyButtonHover text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              Editar
            </button>

            <!-- Quitar Button -->
            <button 
              onclick="deleteActivity('${act.id}')" 
              class="px-3 py-1.5 bg-navyButton hover:bg-rose-900 text-slate-200 hover:text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              Quitar
            </button>
          </div>
        </div>

        <!-- Inline Notes & Revision Drawer (Expandable) -->
        <div id="notes-drawer-${act.id}" class="hidden mt-2 ml-4 p-3.5 bg-navyCard border border-navyBorder rounded-xl shadow-lg animate-fadeIn text-xs text-slate-200">
          <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-navyBorder">
            <span class="font-bold text-cyan-400 flex items-center gap-1">
              <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
              Notas de Revisión y Observaciones
            </span>
            <span class="text-[10px] text-slate-400">Actividad: ${escapeHtml(act.title)}</span>
          </div>

          <!-- Existing notes list -->
          <div class="space-y-1.5 mb-3 max-h-36 overflow-y-auto" id="notes-list-${act.id}">
            ${renderActivityNotesList(act)}
          </div>

          <!-- Quick Note Form -->
          <div class="flex gap-2">
            <input 
              type="text" 
              id="new-note-input-${act.id}" 
              placeholder="Escribe una observación o avance..." 
              class="flex-1 bg-navyBg border border-navyBorder text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
              onkeydown="if(event.key==='Enter'){ addActivityNote('${act.id}'); }"
            >
            <button 
              type="button" 
              onclick="addActivityNote('${act.id}')" 
              class="px-3 py-1.5 bg-cyanAction hover:bg-cyanActionHover text-white font-bold text-xs rounded-lg transition"
            >
              Agregar
            </button>
          </div>
        </div>

      </div>
    `;
  }).join('');
}

function getProgressFill(pct) {
  if (pct >= 100) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-gradient-to-r from-cyan-500 to-emerald-400';
  if (pct > 0) return 'bg-cyan-500';
  return 'bg-slate-400';
}

function renderActivityNotesList(act) {
  if (!act.notes || act.notes.length === 0) {
    return '<p class="text-[11px] text-slate-400 italic">No hay notas registradas para esta actividad.</p>';
  }
  return act.notes.map(n => `
    <div class="bg-navyBg/80 p-2 rounded-lg border border-navyBorder/80 flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <p class="text-xs text-slate-200">${escapeHtml(n.text)}</p>
        <span class="text-[10px] text-slate-400 mt-0.5 block">${n.date}</span>
      </div>
      <button onclick="deleteActivityNote('${act.id}', '${n.id}')" title="Eliminar nota" class="text-slate-500 hover:text-rose-400 p-0.5">
        <i data-lucide="trash" class="w-3 h-3"></i>
      </button>
    </div>
  `).join('');
}

// ==========================================
// INTERACTIVE SLIDER LOGIC
// ==========================================
function handleSliderChange(activityId, value) {
  const current = getActiveProject();
  if (!current) return;

  const activity = current.activities.find(a => a.id === activityId);
  if (!activity) return;

  const numVal = Number(value);
  activity.progress = numVal;

  // Auto-update status if reached 100%
  if (numVal === 100) {
    activity.status = 'completado';
  } else if (activity.status === 'completado' && numVal < 100) {
    activity.status = 'ejecucion';
  } else if (activity.status === 'por_iniciar' && numVal > 0) {
    activity.status = 'ejecucion';
  }

  // Update UI values instantly without full re-render for smooth 60fps drag
  const displayVal = document.getElementById(`progress-val-${activityId}`);
  if (displayVal) displayVal.textContent = `${numVal}%`;

  const miniBar = document.getElementById(`mini-bar-${activityId}`);
  if (miniBar) {
    miniBar.style.width = `${numVal}%`;
    miniBar.className = `h-2 rounded-full transition-all duration-150 ${getProgressFill(numVal)}`;
  }

  // Update overall project progress in header
  const overall = calculateProjectProgress(current);
  const summaryEl = document.getElementById('activeProjectSummary');
  if (summaryEl) {
    const compLabel = COMPLEXITY_LABELS[current.complexity] || 'Media';
    const hours = current.estimatedHours ? `${current.estimatedHours}h est.` : 'Horas no esp.';
    const freq = current.revisionFrequency || 'Semanal';
    summaryEl.innerHTML = `
      Complejidad: <span class="text-white font-medium">${compLabel}</span> | 
      Revisión: <span class="text-white font-medium">${freq}</span> | 
      Tiempos: <span class="text-white font-medium">${hours}</span> | 
      Avance: <span class="text-cyan-400 font-bold">${overall}%</span>
    `;
  }

  saveProjects();
}

// ==========================================
// NOTES DRAWER ACTIONS
// ==========================================
function toggleNotesDrawer(activityId) {
  const drawer = document.getElementById(`notes-drawer-${activityId}`);
  const caret = document.getElementById(`caret-${activityId}`);
  if (!drawer) return;

  if (drawer.classList.contains('hidden')) {
    drawer.classList.remove('hidden');
    if (caret) caret.classList.add('rotate-180');
  } else {
    drawer.classList.add('hidden');
    if (caret) caret.classList.remove('rotate-180');
  }
}

function addActivityNote(activityId) {
  const input = document.getElementById(`new-note-input-${activityId}`);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const current = getActiveProject();
  if (!current) return;

  const activity = current.activities.find(a => a.id === activityId);
  if (!activity) return;

  if (!activity.notes) activity.notes = [];

  activity.notes.push({
    id: `note-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    text
  });

  input.value = '';
  saveProjects();
  renderApp();
  showToast('Nota registrada');

  // Keep drawer open
  setTimeout(() => {
    const drawer = document.getElementById(`notes-drawer-${activityId}`);
    if (drawer) drawer.classList.remove('hidden');
  }, 10);
}

function deleteActivityNote(activityId, noteId) {
  const current = getActiveProject();
  if (!current) return;

  const activity = current.activities.find(a => a.id === activityId);
  if (!activity || !activity.notes) return;

  activity.notes = activity.notes.filter(n => n.id !== noteId);
  saveProjects();
  renderApp();
  showToast('Nota eliminada');

  setTimeout(() => {
    const drawer = document.getElementById(`notes-drawer-${activityId}`);
    if (drawer) drawer.classList.remove('hidden');
  }, 10);
}

// ==========================================
// MODAL: ADD / EDIT ACTIVITY
// ==========================================
function openActivityModal(activityId = null) {
  const modal = document.getElementById('activityModal');
  const titleEl = document.getElementById('activityModalTitle');
  const subEl = document.getElementById('activityModalSubtitle');
  const form = document.getElementById('activityForm');

  const current = getActiveProject();
  if (!current) {
    alert('Primero crea o selecciona un proyecto');
    return;
  }

  if (activityId) {
    const act = current.activities.find(a => a.id === activityId);
    if (!act) return;

    titleEl.textContent = 'Editar actividad';
    subEl.textContent = `Modificando: ${act.title}`;
    document.getElementById('formActivityId').value = act.id;
    document.getElementById('formActivityTitle').value = act.title;
    document.getElementById('formActivityRole').value = act.role || '';
    document.getElementById('formActivityDueDate').value = act.dueDate || '';
    document.getElementById('formActivityStatus').value = act.status || 'ejecucion';
    document.getElementById('formActivityProgress').value = act.progress || 0;
    document.getElementById('formActivityProgressDisplay').textContent = `${act.progress || 0}%`;
    document.getElementById('formActivityNote').value = '';
  } else {
    titleEl.textContent = 'Agregar actividad';
    subEl.textContent = `Proyecto: ${current.title}`;
    form.reset();
    document.getElementById('formActivityId').value = '';
    document.getElementById('formActivityStatus').value = 'ejecucion';
    document.getElementById('formActivityProgress').value = 0;
    document.getElementById('formActivityProgressDisplay').textContent = '0%';
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeActivityModal() {
  document.getElementById('activityModal').classList.add('hidden');
}

function handleActivityFormSubmit(e) {
  e.preventDefault();

  const current = getActiveProject();
  if (!current) return;

  const id = document.getElementById('formActivityId').value;
  const title = document.getElementById('formActivityTitle').value.trim();
  const role = document.getElementById('formActivityRole').value.trim() || 'Responsable';
  const dueDate = document.getElementById('formActivityDueDate').value;
  const status = document.getElementById('formActivityStatus').value;
  const progress = Number(document.getElementById('formActivityProgress').value) || 0;
  const noteText = document.getElementById('formActivityNote').value.trim();

  if (id) {
    // Edit existing activity
    const act = current.activities.find(a => a.id === id);
    if (act) {
      act.title = title;
      act.role = role;
      act.dueDate = dueDate;
      act.status = status;
      act.progress = progress;
      if (noteText) {
        if (!act.notes) act.notes = [];
        act.notes.push({
          id: `n-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          text: noteText
        });
      }
    }
    showToast('Actividad actualizada');
  } else {
    // Add new activity
    const newAct = {
      id: `act-${Date.now()}`,
      title,
      role,
      dueDate,
      status,
      progress,
      notes: noteText ? [{ id: `n-${Date.now()}`, date: new Date().toISOString().slice(0, 10), text: noteText }] : []
    };
    if (!current.activities) current.activities = [];
    current.activities.push(newAct);
    showToast('Actividad agregada con éxito');
  }

  saveProjects();
  closeActivityModal();
  renderApp();
}

function deleteActivity(activityId) {
  const current = getActiveProject();
  if (!current) return;

  const act = current.activities.find(a => a.id === activityId);
  if (!act) return;

  if (confirm(`¿Deseas quitar la actividad "${act.title}"?`)) {
    current.activities = current.activities.filter(a => a.id !== activityId);
    saveProjects();
    renderApp();
    showToast('Actividad eliminada');
  }
}

// ==========================================
// MODAL: PROJECT CREATION & EDITING
// ==========================================
function openProjectModal(projectId = null) {
  const modal = document.getElementById('projectModal');
  const titleEl = document.getElementById('projectModalTitle');
  const form = document.getElementById('projectForm');

  if (projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    titleEl.textContent = 'Editar Proyecto';
    document.getElementById('formProjectId').value = proj.id;
    document.getElementById('formProjectTitle').value = proj.title;
    document.getElementById('formProjectDesc').value = proj.description || '';
    document.getElementById('formProjectComplexity').value = proj.complexity || 'media';
    document.getElementById('formProjectFrequency').value = proj.revisionFrequency || 'Semanal';
    document.getElementById('formProjectHours').value = proj.estimatedHours || 40;
    document.getElementById('formProjectDeadline').value = proj.deadline || '';
  } else {
    titleEl.textContent = 'Nuevo Proyecto';
    form.reset();
    document.getElementById('formProjectId').value = '';
    document.getElementById('formProjectComplexity').value = 'alta';
    document.getElementById('formProjectFrequency').value = 'Semanal';
    document.getElementById('formProjectHours').value = 60;
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeProjectModal() {
  document.getElementById('projectModal').classList.add('hidden');
}

function handleProjectFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('formProjectId').value;
  const title = document.getElementById('formProjectTitle').value.trim();
  const description = document.getElementById('formProjectDesc').value.trim();
  const complexity = document.getElementById('formProjectComplexity').value;
  const revisionFrequency = document.getElementById('formProjectFrequency').value;
  const estimatedHours = Number(document.getElementById('formProjectHours').value) || 0;
  const deadline = document.getElementById('formProjectDeadline').value;

  if (id) {
    const proj = projects.find(p => p.id === id);
    if (proj) {
      proj.title = title;
      proj.description = description;
      proj.complexity = complexity;
      proj.revisionFrequency = revisionFrequency;
      proj.estimatedHours = estimatedHours;
      proj.deadline = deadline;
    }
    showToast('Proyecto actualizado');
  } else {
    const newProj = {
      id: `proj-${Date.now()}`,
      title,
      description,
      complexity,
      revisionFrequency,
      estimatedHours,
      deadline,
      reviews: [],
      activities: []
    };
    projects.push(newProj);
    activeProjectId = newProj.id;
    showToast('Proyecto creado con éxito');
  }

  saveProjects();
  closeProjectModal();
  renderApp();
}

function deleteCurrentProject() {
  const current = getActiveProject();
  if (!current) return;

  if (confirm(`¿Estás seguro de eliminar el proyecto "${current.title}" y todas sus actividades?`)) {
    projects = projects.filter(p => p.id !== current.id);
    activeProjectId = projects.length > 0 ? projects[0].id : null;
    saveProjects();
    renderApp();
    showToast('Proyecto eliminado');
  }
}

// ==========================================
// MODAL: RESUMEN GERENCIAL
// ==========================================
function openResumenModal() {
  const current = getActiveProject();
  if (!current) return;

  document.getElementById('resumenProjectName').textContent = current.title;

  const activities = current.activities || [];
  const total = activities.length;
  const running = activities.filter(a => a.status === 'ejecucion').length;
  const late = activities.filter(a => a.status === 'atrasado').length;
  const completed = activities.filter(a => a.status === 'completado').length;
  const overall = calculateProjectProgress(current);

  document.getElementById('resumenProgressPct').textContent = `${overall}%`;
  document.getElementById('resumenProgressBar').style.width = `${overall}%`;

  document.getElementById('resumenTotalActivities').textContent = total;
  document.getElementById('resumenRunningActivities').textContent = running;
  document.getElementById('resumenLateActivities').textContent = late;
  document.getElementById('resumenCompletedActivities').textContent = completed;

  // Health text
  const healthEl = document.getElementById('resumenHealthText');
  if (late > 0) {
    healthEl.innerHTML = `<span class="text-rose-400 font-bold">⚠️ Atención:</span> Hay ${late} actividad(es) atrasada(s). Se recomienda revisar bloqueos.`;
  } else if (overall === 100) {
    healthEl.innerHTML = `<span class="text-emerald-400 font-bold">🎉 Proyecto Completado:</span> Todas las actividades han alcanzado el 100%.`;
  } else {
    healthEl.innerHTML = `<span class="text-cyan-400 font-bold">✔️ En orden:</span> Proyecto en ejecución con cronograma al día.`;
  }

  document.getElementById('resumenComplexity').textContent = COMPLEXITY_LABELS[current.complexity] || 'Media';
  document.getElementById('resumenFrequency').textContent = current.revisionFrequency || 'Semanal';
  document.getElementById('resumenHours').textContent = current.estimatedHours ? `${current.estimatedHours} horas` : 'No asignado';
  document.getElementById('resumenDeadline').textContent = current.deadline || 'Sin fecha fija';

  document.getElementById('resumenModal').classList.remove('hidden');
  lucide.createIcons();
}

function closeResumenModal() {
  document.getElementById('resumenModal').classList.add('hidden');
}

// ==========================================
// MODAL: SEGUIMIENTO & BITÁCORA
// ==========================================
function openSeguimientoModal() {
  const current = getActiveProject();
  if (!current) return;

  document.getElementById('seguimientoProjectName').textContent = `Proyecto: ${current.title}`;
  renderSeguimientoTimeline(current);

  document.getElementById('seguimientoModal').classList.remove('hidden');
  lucide.createIcons();
}

function closeSeguimientoModal() {
  document.getElementById('seguimientoModal').classList.add('hidden');
}

function renderSeguimientoTimeline(project) {
  const container = document.getElementById('seguimientoTimeline');
  const reviews = project.reviews || [];

  if (reviews.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-400 italic">No hay revisiones de seguimiento registradas aún.</p>';
    return;
  }

  container.innerHTML = reviews.slice().reverse().map(rev => `
    <div class="bg-navyBg p-3 rounded-xl border border-navyBorder flex items-start justify-between gap-3">
      <div>
        <p class="text-xs text-slate-200">${escapeHtml(rev.text)}</p>
        <span class="text-[10px] text-cyan-400 font-semibold mt-1 block">📅 ${rev.date}</span>
      </div>
      <button onclick="deleteReview('${rev.id}')" title="Eliminar registro" class="text-slate-500 hover:text-rose-400 p-1">
        <i data-lucide="trash" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  `).join('');

  lucide.createIcons();
}

function handleAddReviewSubmit(e) {
  e.preventDefault();
  const current = getActiveProject();
  if (!current) return;

  const text = document.getElementById('seguimientoNoteText').value.trim();
  if (!text) return;

  if (!current.reviews) current.reviews = [];

  current.reviews.push({
    id: `rev-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    text
  });

  document.getElementById('seguimientoNoteText').value = '';
  saveProjects();
  renderSeguimientoTimeline(current);
  showToast('Entrada de seguimiento agregada');
}

function deleteReview(reviewId) {
  const current = getActiveProject();
  if (!current || !current.reviews) return;

  current.reviews = current.reviews.filter(r => r.id !== reviewId);
  saveProjects();
  renderSeguimientoTimeline(current);
  showToast('Entrada eliminada');
}

// ==========================================
// UTILITIES
// ==========================================
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'bg-navyCard border border-cyanAction/50 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0';
  toast.innerHTML = `
    <i data-lucide="check-circle" class="w-4 h-4 text-cyan-400"></i>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `proyectos_procesos_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Copia de seguridad descargada');
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
