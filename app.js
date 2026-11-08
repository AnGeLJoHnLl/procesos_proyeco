/**
 * DevRoadmap & Project Tracker
 * Logic for managing projects, complexity, time estimates, and revision milestones
 */

// App State: Starts completely clean and empty (no pre-made projects)
let projects = [];
let currentLayout = 'grid'; // 'grid' | 'list'

// Storage key for user projects
const STORAGE_KEY = 'dev_roadmap_user_projects_v1';

// Empty fallback
const DEMO_PROJECTS = [];

// Complexity dictionary
const COMPLEXITY_CONFIG = {
  baja: {
    label: 'Baja Complejidad',
    badgeClass: 'badge-complexity-baja',
    icon: 'smile',
    estimateHelp: 'Rápido (1 a 3 semanas)'
  },
  media: {
    label: 'Complejidad Media',
    badgeClass: 'badge-complexity-media',
    icon: 'sliders',
    estimateHelp: 'Moderado (3 a 6 semanas)'
  },
  alta: {
    label: 'Alta Complejidad',
    badgeClass: 'badge-complexity-alta',
    icon: 'zap',
    estimateHelp: 'Complejo (1 a 3 meses)'
  },
  muy_alta: {
    label: 'Muy Alta Complejidad',
    badgeClass: 'badge-complexity-muy_alta',
    icon: 'alert-triangle',
    estimateHelp: 'Crítico / Extenso (> 3 meses)'
  }
};

// Status dictionary
const STATUS_CONFIG = {
  planificado: { label: 'Planificado', class: 'status-planificado', icon: 'clipboard-list' },
  en_progreso: { label: 'En Progreso', class: 'status-en_progreso', icon: 'zap' },
  en_revision: { label: 'En Revisión', class: 'status-en_revision', icon: 'eye' },
  completado: { label: 'Completado', class: 'status-completado', icon: 'check-circle' },
  pausado: { label: 'En Pausa', class: 'status-pausado', icon: 'pause-circle' }
};

// Priority dictionary
const PRIORITY_CONFIG = {
  baja: { label: 'Baja', class: 'text-slate-400 bg-slate-800 border-slate-700' },
  media: { label: 'Media', class: 'text-sky-400 bg-sky-950/40 border-sky-800/40' },
  alta: { label: 'Alta', class: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
  urgente: { label: 'Urgente', class: 'text-rose-400 bg-rose-950/40 border-rose-800/40' }
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
      console.error('Error reading localStorage', e);
      projects = [];
      saveProjects();
    }
  } else {
    projects = [];
    saveProjects();
  }
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function initEventListeners() {
  // Modal buttons
  document.getElementById('btnOpenNewProjectModal').addEventListener('click', () => openProjectModal());
  document.getElementById('btnCloseProjectModal').addEventListener('click', closeProjectModal);
  document.getElementById('btnCancelModal').addEventListener('click', closeProjectModal);
  document.getElementById('projectForm').addEventListener('submit', handleProjectFormSubmit);

  // Milestone field generator in modal
  document.getElementById('btnAddMilestoneField').addEventListener('click', () => addMilestoneField());

  // Revision modal
  document.getElementById('btnCloseRevisionModal').addEventListener('click', closeRevisionModal);
  document.getElementById('btnCancelRevisionModal').addEventListener('click', closeRevisionModal);
  document.getElementById('revisionForm').addEventListener('submit', handleRevisionFormSubmit);

  const revisionSlider = document.getElementById('revisionProgressSlider');
  revisionSlider.addEventListener('input', (e) => {
    document.getElementById('revisionProgressLabel').textContent = `${e.target.value}%`;
  });

  // Filters & Search
  document.getElementById('searchInput').addEventListener('input', renderApp);
  document.getElementById('filterStatus').addEventListener('change', renderApp);
  document.getElementById('filterComplexity').addEventListener('change', renderApp);
  document.getElementById('sortBy').addEventListener('change', renderApp);

  // Layout view switcher
  document.getElementById('viewGridBtn').addEventListener('click', () => setLayout('grid'));
  document.getElementById('viewListBtn').addEventListener('click', () => setLayout('list'));

  // Header actions
  const exportBtn = document.getElementById('btnExportData');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportDataJSON);
  }
}

function setLayout(mode) {
  currentLayout = mode;
  const gridBtn = document.getElementById('viewGridBtn');
  const listBtn = document.getElementById('viewListBtn');
  const container = document.getElementById('projectsContainer');

  if (mode === 'grid') {
    gridBtn.className = 'p-1.5 rounded-lg bg-slate-800 text-brand-400';
    listBtn.className = 'p-1.5 rounded-lg text-slate-400 hover:text-slate-200';
    container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  } else {
    listBtn.className = 'p-1.5 rounded-lg bg-slate-800 text-brand-400';
    gridBtn.className = 'p-1.5 rounded-lg text-slate-400 hover:text-slate-200';
    container.className = 'flex flex-col space-y-4';
  }
}

// ==========================================
// RENDER & FILTER ENGINE
// ==========================================
function renderApp() {
  updateMetrics();

  const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
  const filterStatus = document.getElementById('filterStatus').value;
  const filterComplexity = document.getElementById('filterComplexity').value;
  const sortBy = document.getElementById('sortBy').value;

  // Filter projects
  let filtered = projects.filter(proj => {
    const matchesSearch = 
      proj.title.toLowerCase().includes(searchQuery) ||
      proj.description.toLowerCase().includes(searchQuery) ||
      (proj.category && proj.category.toLowerCase().includes(searchQuery));

    const matchesStatus = (filterStatus === 'ALL') || (proj.status === filterStatus);
    const matchesComplexity = (filterComplexity === 'ALL') || (proj.complexity === filterComplexity);

    return matchesSearch && matchesStatus && matchesComplexity;
  });

  // Sort projects
  filtered.sort((a, b) => {
    if (sortBy === 'progress_asc') return a.progress - b.progress;
    if (sortBy === 'progress_desc') return b.progress - a.progress;
    if (sortBy === 'time_desc') return b.estimatedHours - a.estimatedHours;
    if (sortBy === 'complexity_desc') {
      const weights = { muy_alta: 4, alta: 3, media: 2, baja: 1 };
      return (weights[b.complexity] || 0) - (weights[a.complexity] || 0);
    }
    // Default 'updated'
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });

  const container = document.getElementById('projectsContainer');
  const emptyState = document.getElementById('emptyState');

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    container.innerHTML = filtered.map(proj => renderProjectCard(proj)).join('');
  }

  // Refresh icons
  lucide.createIcons();
}

function updateMetrics() {
  const total = projects.length;
  const inProgress = projects.filter(p => p.status === 'en_progreso' || p.status === 'en_revision').length;
  const completed = projects.filter(p => p.status === 'completado').length;

  const totalEstHours = projects.reduce((acc, p) => acc + (Number(p.estimatedHours) || 0), 0);
  const totalSpentHours = projects.reduce((acc, p) => acc + (Number(p.spentHours) || 0), 0);

  const avgProgress = total > 0 ? Math.round(projects.reduce((acc, p) => acc + (Number(p.progress) || 0), 0) / total) : 0;

  let totalPendingMilestones = 0;
  let totalCompletedMilestones = 0;
  projects.forEach(p => {
    if (p.milestones && p.milestones.length) {
      p.milestones.forEach(m => {
        if (m.completed) totalCompletedMilestones++;
        else totalPendingMilestones++;
      });
    }
  });

  // Update UI Elements
  document.getElementById('statTotalProjects').textContent = total;
  document.getElementById('statActiveBreakdown').textContent = `${inProgress} activos`;
  document.getElementById('statCompletedCount').textContent = `${completed} finalizados`;

  document.getElementById('statAverageProgress').textContent = `${avgProgress}%`;
  document.getElementById('statProgressBar').style.width = `${avgProgress}%`;

  document.getElementById('statTotalEstimatedHours').textContent = `${totalEstHours}h`;
  document.getElementById('statTotalSpentHours').textContent = `${totalSpentHours}h`;

  document.getElementById('statPendingReviews').textContent = totalPendingMilestones;
  document.getElementById('statCompletedReviews').textContent = totalCompletedMilestones;
}

// ==========================================
// PROJECT CARD TEMPLATE
// ==========================================
function renderProjectCard(project) {
  const comp = COMPLEXITY_CONFIG[project.complexity] || COMPLEXITY_CONFIG.media;
  const stat = STATUS_CONFIG[project.status] || STATUS_CONFIG.planificado;
  const prio = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.media;

  // Calculate milestone progress
  const milestones = project.milestones || [];
  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;

  // Format date
  const targetDateFormatted = project.targetDate 
    ? new Date(project.targetDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Sin fecha fija';

  // Last review info
  const reviews = project.reviews || [];
  const lastReview = reviews.length > 0 ? reviews[reviews.length - 1] : null;

  return `
    <div class="project-card bg-cardBg border border-cardBorder rounded-2xl p-5 shadow-sm hover:border-slate-700 flex flex-col justify-between" id="card-${project.id}">
      
      <!-- Card Top: Tags & Actions -->
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs px-2.5 py-1 rounded-lg ${stat.class} font-semibold flex items-center gap-1">
              <i data-lucide="${stat.icon}" class="w-3.5 h-3.5"></i>
              ${stat.label}
            </span>
            <span class="text-xs px-2 py-0.5 rounded-lg border font-medium ${prio.class}">
              Prioridad ${prio.label}
            </span>
          </div>

          <!-- Quick Actions Menu -->
          <div class="flex items-center space-x-1">
            <button onclick="openProjectModal('${project.id}')" title="Editar proyecto" class="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="deleteProject('${project.id}')" title="Eliminar proyecto" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Category & Title -->
        <div class="mb-1">
          <span class="text-[11px] font-semibold text-brand-400 tracking-wider uppercase">${escapeHtml(project.category || 'General')}</span>
          <h3 class="text-base font-bold text-white tracking-tight leading-snug hover:text-brand-300 transition cursor-pointer" onclick="openProjectModal('${project.id}')">
            ${escapeHtml(project.title)}
          </h3>
        </div>

        <!-- Description -->
        <p class="text-xs text-slate-400 line-clamp-2 mb-4">
          ${escapeHtml(project.description || 'Sin descripción detallada.')}
        </p>

        <!-- COMPLEXITY & TIME DETAILS BADGES -->
        <div class="grid grid-cols-2 gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 mb-4 text-xs">
          <!-- Complexity -->
          <div>
            <span class="text-[10px] text-slate-500 uppercase block font-semibold">Complejidad</span>
            <span class="inline-flex items-center gap-1 font-semibold px-2 py-0.5 mt-0.5 rounded-md ${comp.badgeClass}">
              <i data-lucide="${comp.icon}" class="w-3 h-3"></i>
              ${comp.label.replace('Complejidad ', '')}
            </span>
          </div>

          <!-- Time Estimate & Spent -->
          <div>
            <span class="text-[10px] text-slate-500 uppercase block font-semibold">Tiempo Estimado</span>
            <div class="flex items-center gap-1.5 mt-0.5 font-bold text-slate-200">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>${project.estimatedHours}h est.</span>
              <span class="text-[11px] font-normal text-slate-400">(${project.spentHours || 0}h dedicadas)</span>
            </div>
          </div>

          <!-- Review Frequency -->
          <div>
            <span class="text-[10px] text-slate-500 uppercase block font-semibold">Revisión cada</span>
            <div class="flex items-center gap-1 text-slate-300 font-medium mt-0.5">
              <i data-lucide="repeat" class="w-3 h-3 text-indigo-400"></i>
              <span>${escapeHtml(project.revisionFrequency || 'Semanal')}</span>
            </div>
          </div>

          <!-- Target Date -->
          <div>
            <span class="text-[10px] text-slate-500 uppercase block font-semibold">Fecha Objetivo</span>
            <div class="flex items-center gap-1 text-slate-300 font-medium mt-0.5">
              <i data-lucide="calendar" class="w-3 h-3 text-emerald-400"></i>
              <span>${targetDateFormatted}</span>
            </div>
          </div>
        </div>

        <!-- PROGRESS BAR -->
        <div class="mb-4">
          <div class="flex items-center justify-between text-xs mb-1.5">
            <span class="font-semibold text-slate-300 flex items-center gap-1">
              <span>Progreso de Avance</span>
            </span>
            <span class="font-extrabold text-brand-400">${project.progress}%</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              class="h-2 rounded-full transition-all duration-300 ${getProgressGradient(project.progress)}" 
              style="width: ${project.progress}%"
            ></div>
          </div>
        </div>

        <!-- MILESTONES / HITOS CHECKLIST -->
        <div class="mb-4">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span class="flex items-center gap-1">
              <i data-lucide="check-square" class="w-3.5 h-3.5 text-brand-400"></i>
              Hitos de Revisión (${completedMilestones}/${totalMilestones})
            </span>
            <button onclick="toggleMilestonesExpand('${project.id}')" class="text-[11px] text-brand-400 hover:underline">
              Ver lista
            </button>
          </div>

          <div id="milestones-list-${project.id}" class="space-y-1.5 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60 max-h-32 overflow-y-auto">
            ${milestones.length === 0 ? '<p class="text-xs text-slate-500 italic">No hay hitos programados aún.</p>' : ''}
            ${milestones.map(m => `
              <label class="flex items-start gap-2 text-xs text-slate-300 cursor-pointer hover:text-white select-none">
                <input 
                  type="checkbox" 
                  ${m.completed ? 'checked' : ''} 
                  onchange="toggleMilestoneCheck('${project.id}', '${m.id}')"
                  class="mt-0.5 rounded border-slate-700 bg-slate-800 text-brand-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                >
                <span class="${m.completed ? 'line-through text-slate-500' : ''}">${escapeHtml(m.title)}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- RECENT REVIEWS SUMMARY (EXPANDABLE) -->
        ${lastReview ? `
          <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs mb-4">
            <div class="flex items-center justify-between text-slate-400 mb-1">
              <span class="font-semibold text-emerald-400 flex items-center gap-1 text-[11px]">
                <i data-lucide="check-circle-2" class="w-3 h-3"></i> Última Revisión
              </span>
              <span class="text-[10px] text-slate-500">${lastReview.date} (${lastReview.hours}h)</span>
            </div>
            <p class="text-slate-300 text-xs font-medium">${escapeHtml(lastReview.title)}</p>
            ${lastReview.notes ? `<p class="text-slate-400 text-[11px] mt-0.5 italic">"${escapeHtml(lastReview.notes)}"</p>` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Card Bottom Actions -->
      <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button 
          onclick="openRevisionModal('${project.id}')" 
          class="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center justify-center gap-1.5"
        >
          <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>+ Registrar Revisión</span>
        </button>

        <button 
          onclick="quickAdvanceProgress('${project.id}')" 
          title="Avanzar +10% de progreso rápido"
          class="p-2 rounded-xl bg-slate-800 hover:bg-brand-600/30 text-slate-300 hover:text-brand-300 transition text-xs font-bold"
        >
          +10%
        </button>
      </div>

    </div>
  `;
}

function getProgressGradient(pct) {
  if (pct >= 100) return 'bg-emerald-500';
  if (pct >= 60) return 'bg-gradient-to-r from-brand-500 to-emerald-400';
  if (pct >= 25) return 'bg-gradient-to-r from-amber-500 to-indigo-500';
  return 'bg-gradient-to-r from-rose-500 to-amber-500';
}

// ==========================================
// ACTIONS: TOGGLES & QUICK UPDATES
// ==========================================
function toggleMilestonesExpand(projectId) {
  const container = document.getElementById(`milestones-list-${projectId}`);
  if (!container) return;
  if (container.classList.contains('max-h-32')) {
    container.classList.remove('max-h-32');
    container.classList.add('max-h-96');
  } else {
    container.classList.add('max-h-32');
    container.classList.remove('max-h-96');
  }
}

function toggleMilestoneCheck(projectId, milestoneId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;

  const milestone = proj.milestones.find(m => m.id === milestoneId);
  if (!milestone) return;

  milestone.completed = !milestone.completed;
  proj.updatedAt = new Date().toISOString();

  // Auto-calculate progress based on completed milestones
  const total = proj.milestones.length;
  if (total > 0) {
    const completedCount = proj.milestones.filter(m => m.completed).length;
    proj.progress = Math.round((completedCount / total) * 100);
    if (proj.progress === 100) {
      proj.status = 'completado';
    } else if (proj.status === 'planificado') {
      proj.status = 'en_progreso';
    }
  }

  saveProjects();
  renderApp();
  showToast(`Hito actualizado: ${milestone.completed ? 'Completado' : 'Pendiente'}`);
}

function quickAdvanceProgress(projectId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;

  proj.progress = Math.min(100, (Number(proj.progress) || 0) + 10);
  if (proj.progress === 100) {
    proj.status = 'completado';
  } else if (proj.status === 'planificado') {
    proj.status = 'en_progreso';
  }
  proj.updatedAt = new Date().toISOString();

  saveProjects();
  renderApp();
  showToast(`Progreso de "${proj.title}" actualizado al ${proj.progress}%`);
}

function deleteProject(projectId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;

  if (confirm(`¿Estás seguro de eliminar el proyecto "${proj.title}"?`)) {
    projects = projects.filter(p => p.id !== projectId);
    saveProjects();
    renderApp();
    showToast('Proyecto eliminado');
  }
}

// ==========================================
// MODAL: PROJECT CREATION & EDITING
// ==========================================
function openProjectModal(projectId = null) {
  const modal = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('projectForm');
  const milestonesContainer = document.getElementById('milestonesContainer');

  milestonesContainer.innerHTML = '';

  if (projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    modalTitle.textContent = 'Editar Proyecto';
    document.getElementById('formProjectId').value = proj.id;
    document.getElementById('formTitle').value = proj.title;
    document.getElementById('formCategory').value = proj.category || '';
    document.getElementById('formDescription').value = proj.description || '';
    document.getElementById('formComplexity').value = proj.complexity || 'media';
    document.getElementById('formStatus').value = proj.status || 'en_progreso';
    document.getElementById('formPriority').value = proj.priority || 'media';
    document.getElementById('formEstimatedHours').value = proj.estimatedHours || 30;
    document.getElementById('formRevisionFrequency').value = proj.revisionFrequency || 'Semanal';
    document.getElementById('formTargetDate').value = proj.targetDate || '';

    // Load existing milestones
    if (proj.milestones && proj.milestones.length > 0) {
      proj.milestones.forEach(m => addMilestoneField(m.title, m.completed));
    } else {
      addMilestoneField('', false);
    }
  } else {
    modalTitle.textContent = 'Nuevo Proyecto';
    form.reset();
    document.getElementById('formProjectId').value = '';
    document.getElementById('formComplexity').value = 'media';
    document.getElementById('formStatus').value = 'en_progreso';
    document.getElementById('formPriority').value = 'media';
    document.getElementById('formRevisionFrequency').value = 'Cada 2-3 días';
    document.getElementById('formEstimatedHours').value = 40;

    // Empty milestone fields ready for user's own milestones
    addMilestoneField('', false);
    addMilestoneField('', false);
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeProjectModal() {
  document.getElementById('projectModal').classList.add('hidden');
}

function addMilestoneField(value = '', completed = false) {
  const container = document.getElementById('milestonesContainer');
  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 milestone-input-row';
  row.innerHTML = `
    <input type="checkbox" ${completed ? 'checked' : ''} class="rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-0">
    <input type="text" value="${escapeHtml(value)}" placeholder="Ej: Maquetación del Dashboard..." class="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-brand-500 focus:outline-none">
    <button type="button" onclick="this.parentElement.remove()" class="text-slate-500 hover:text-rose-400 p-1">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;
  container.appendChild(row);
  lucide.createIcons();
}

function handleProjectFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('formProjectId').value;
  const title = document.getElementById('formTitle').value.trim();
  const category = document.getElementById('formCategory').value.trim();
  const description = document.getElementById('formDescription').value.trim();
  const complexity = document.getElementById('formComplexity').value;
  const status = document.getElementById('formStatus').value;
  const priority = document.getElementById('formPriority').value;
  const estimatedHours = Number(document.getElementById('formEstimatedHours').value) || 0;
  const revisionFrequency = document.getElementById('formRevisionFrequency').value;
  const targetDate = document.getElementById('formTargetDate').value;

  // Extract milestones from inputs
  const milestoneRows = document.querySelectorAll('.milestone-input-row');
  const milestones = [];
  milestoneRows.forEach((row, idx) => {
    const textInput = row.querySelector('input[type="text"]');
    const checkInput = row.querySelector('input[type="checkbox"]');
    if (textInput && textInput.value.trim()) {
      milestones.push({
        id: `m-${Date.now()}-${idx}`,
        title: textInput.value.trim(),
        completed: checkInput.checked
      });
    }
  });

  const nowIso = new Date().toISOString();

  if (id) {
    // Edit existing project
    const proj = projects.find(p => p.id === id);
    if (proj) {
      proj.title = title;
      proj.category = category;
      proj.description = description;
      proj.complexity = complexity;
      proj.status = status;
      proj.priority = priority;
      proj.estimatedHours = estimatedHours;
      proj.revisionFrequency = revisionFrequency;
      proj.targetDate = targetDate;
      proj.milestones = milestones;
      proj.updatedAt = nowIso;

      // Recalculate progress if there are milestones
      if (milestones.length > 0) {
        const completed = milestones.filter(m => m.completed).length;
        proj.progress = Math.round((completed / milestones.length) * 100);
      }
    }
    showToast('Proyecto actualizado con éxito');
  } else {
    // Create new project
    const completedCount = milestones.filter(m => m.completed).length;
    const initialProgress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    const newProj = {
      id: `proj-${Date.now()}`,
      title,
      category,
      description,
      complexity,
      status,
      priority,
      estimatedHours,
      spentHours: 0,
      revisionFrequency,
      targetDate,
      progress: initialProgress,
      createdAt: nowIso,
      updatedAt: nowIso,
      milestones,
      reviews: []
    };
    projects.unshift(newProj);
    showToast('¡Proyecto creado con éxito!');
  }

  saveProjects();
  closeProjectModal();
  renderApp();
}

// ==========================================
// MODAL: LOG REVISION
// ==========================================
function openRevisionModal(projectId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;

  document.getElementById('revisionProjectId').value = proj.id;
  document.getElementById('revisionModalProjectTitle').textContent = `Proyecto: ${proj.title}`;
  document.getElementById('revisionTitle').value = `Revisión #${(proj.reviews ? proj.reviews.length : 0) + 1}`;
  document.getElementById('revisionHours').value = '2';
  document.getElementById('revisionNotes').value = '';
  document.getElementById('revisionProgressSlider').value = proj.progress || 0;
  document.getElementById('revisionProgressLabel').textContent = `${proj.progress || 0}%`;

  document.getElementById('revisionModal').classList.remove('hidden');
  lucide.createIcons();
}

function closeRevisionModal() {
  document.getElementById('revisionModal').classList.add('hidden');
}

function handleRevisionFormSubmit(e) {
  e.preventDefault();

  const projectId = document.getElementById('revisionProjectId').value;
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;

  const title = document.getElementById('revisionTitle').value.trim();
  const hours = Number(document.getElementById('revisionHours').value) || 0;
  const status = document.getElementById('revisionStatus').value;
  const notes = document.getElementById('revisionNotes').value.trim();
  const newProgress = Number(document.getElementById('revisionProgressSlider').value);

  if (!proj.reviews) proj.reviews = [];

  const newReview = {
    id: `rev-${Date.now()}`,
    title,
    date: new Date().toISOString().split('T')[0],
    hours,
    status,
    notes
  };

  proj.reviews.push(newReview);
  proj.spentHours = (Number(proj.spentHours) || 0) + hours;
  proj.progress = newProgress;
  proj.updatedAt = new Date().toISOString();

  if (newProgress === 100) {
    proj.status = 'completado';
  } else if (proj.status === 'planificado' && newProgress > 0) {
    proj.status = 'en_progreso';
  }

  saveProjects();
  closeRevisionModal();
  renderApp();
  showToast(`Revisión registrada (+${hours}h sumadas al proyecto)`);
}

// ==========================================
// UTILITIES & EXPORT
// ==========================================
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0';
  toast.innerHTML = `
    <i data-lucide="check" class="w-4 h-4 text-emerald-400"></i>
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
  downloadAnchor.setAttribute("download", `proyectos_roadmap_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Copia de seguridad descargada en JSON');
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
