const STORAGE_KEY = 'timecapsule_museum_vault_v1';

// Built-in aesthetic SVG postcards (work offline with zero external image dependencies)
const PRESET_IMAGES = {
  campus: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#F4E4E1"/>
          <stop offset="100%" stop-color="#E7D3B8"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#sky)"/>
      <circle cx="620" cy="120" r="55" fill="#FFF7E8" opacity="0.85"/>
      <rect x="140" y="210" width="520" height="210" fill="#C86D51" rx="6"/>
      <polygon points="120,210 400,115 680,210" fill="#7E9181"/>
      <rect x="365" y="135" width="70" height="75" fill="#F9F6F0" rx="4"/>
      <circle cx="400" cy="172" r="22" fill="none" stroke="#2C2623" stroke-width="3"/>
      <line x1="400" y1="172" x2="400" y2="158" stroke="#2C2623" stroke-width="3"/>
      <line x1="400" y1="172" x2="412" y2="172" stroke="#2C2623" stroke-width="3"/>
      <rect x="200" y="255" width="55" height="80" fill="#F9F6F0" rx="4"/>
      <rect x="290" y="255" width="55" height="80" fill="#F9F6F0" rx="4"/>
      <rect x="455" y="255" width="55" height="80" fill="#F9F6F0" rx="4"/>
      <rect x="545" y="255" width="55" height="80" fill="#F9F6F0" rx="4"/>
      <rect x="372" y="315" width="56" height="105" fill="#4A3B32" rx="4"/>
      <rect x="0" y="420" width="800" height="80" fill="#7E9181"/>
    </svg>
  `)}`,
  coffee: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#EFE4D6"/>
      <ellipse cx="400" cy="390" rx="230" ry="38" fill="#D5C4B0"/>
      <path d="M275 230 H525 L500 375 C495 395 305 395 300 375 Z" fill="#FFFDF9" stroke="#C5A059" stroke-width="4"/>
      <path d="M525 255 C575 255 575 335 512 335" fill="none" stroke="#FFFDF9" stroke-width="18" stroke-linecap="round"/>
      <ellipse cx="400" cy="230" rx="125" ry="24" fill="#9E6240"/>
      <path d="M350 180 Q335 140 355 105" fill="none" stroke="#C86D51" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
      <path d="M405 170 Q390 130 410 95" fill="none" stroke="#C86D51" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
      <path d="M455 180 Q440 140 460 105" fill="none" stroke="#C86D51" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
    </svg>
  `)}`,
  sunset: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#D98A7C"/>
          <stop offset="55%" stop-color="#F4C7A1"/>
          <stop offset="100%" stop-color="#F9E7C8"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#dusk)"/>
      <circle cx="400" cy="295" r="85" fill="#FFF7E4"/>
      <path d="M0 320 Q220 270 430 320 T800 310 L800 500 L0 500 Z" fill="#8C6D62"/>
      <path d="M0 365 Q280 330 520 375 T800 360 L800 500 L0 500 Z" fill="#4E3E39"/>
    </svg>
  `)}`,
  books: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#F4E4E1"/>
      <rect x="190" y="340" width="420" height="48" rx="8" fill="#7E9181"/>
      <rect x="215" y="292" width="370" height="48" rx="8" fill="#C86D51"/>
      <rect x="240" y="244" width="320" height="48" rx="8" fill="#C5A059"/>
      <circle cx="400" cy="175" r="46" fill="#FFFDF9" stroke="#C86D51" stroke-width="4"/>
      <text x="400" y="185" text-anchor="middle" font-family="Georgia" font-size="28" fill="#2C2623">✦</text>
    </svg>
  `)}`
};

const WRITING_PROMPTS = [
  "Dear Future Me, here are three small things making me smile this week that I never want to forget...",
  "I hope by the time you unlock this capsule, you've stopped worrying so much about...",
  "Right now, my favorite song on repeat, my go-to coffee order, and my biggest dream are...",
  "Remember how hard we worked during this semester? Take a deep breath and be proud of how far you've come..."
];

let capsules = [];
let currentFilter = 'all';
let selectedImageData = PRESET_IMAGES.campus;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadCapsules();
  selectPresetImage('campus');
  setQuickDate('6months');
  updateLivePreview();
  renderVault();

  // Live countdown ticker every second
  setInterval(updateCountdowns, 1000);
});

function loadCapsules() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      capsules = JSON.parse(saved);
      return;
    } catch (e) {
      console.error('Failed to parse saved capsules:', e);
    }
  }

  // Seed 3 sample university capsules on first visit
  const now = Date.now();
  capsules = [
    {
      id: 'cap-demo-1',
      title: 'First Week of Senior Year',
      author: 'Maya Lin',
      mood: '🎓 University Milestone',
      caption: 'Golden hour outside the library courtyard',
      letter: 'Dear Future Maya,\n\nToday we finally picked our capstone project topic! Everything feels equal parts exciting and overwhelming, so I wanted to freeze this exact afternoon in time.\n\nI hope graduation feels as rewarding as we imagine right now. Don’t forget to call your study group friends!',
      image: PRESET_IMAGES.campus,
      createdAt: new Date(now - 86400000 * 14).toISOString(),
      unlockAt: new Date(now - 3600000).toISOString(), // Already ready to unseal!
      opened: false
    },
    {
      id: 'cap-demo-2',
      title: '2:00 AM Hackathon Espresso',
      author: 'Maya Lin',
      mood: '🍂 Late Night Reflections',
      caption: 'Third oat latte & debugging CSS grids',
      letter: 'Dear Future Me,\n\nIf you are reading this next year, laugh at how stressed we were over a single missing semicolon. We survived finals week, built something we were genuinely proud of, and learned that sleep actually matters.',
      image: PRESET_IMAGES.coffee,
      createdAt: new Date(now - 86400000 * 3).toISOString(),
      unlockAt: new Date(now + 86400000 * 180).toISOString(), // Sealed for 6 months
      opened: false
    },
    {
      id: 'cap-demo-3',
      title: 'Freshman Orientation Sunset',
      author: 'Maya Lin',
      mood: '🌸 Nostalgic & Soft',
      caption: 'First evening in a brand new city',
      letter: 'Hello from Day One!\n\nYou don’t know anyone on your dorm floor yet, and your suitcase is still half-unpacked. Take a deep breath—this place is going to become home.',
      image: PRESET_IMAGES.sunset,
      createdAt: new Date(now - 86400000 * 400).toISOString(),
      unlockAt: new Date(now - 86400000 * 35).toISOString(),
      opened: true
    }
  ];
  saveCapsules();
}

function saveCapsules() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
  } catch (err) {
    showToast('⚠️ Storage full! Try using a smaller photo or export a backup.');
  }
}

function switchView(viewName) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`view-${viewName}`).classList.add('active');
  document.getElementById(`tab-${viewName}`).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setFilter(filter, btnEl) {
  currentFilter = filter;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btnEl.classList.add('active');
  renderVault();
}

function getCapsuleState(cap) {
  const isUnlockedByTime = new Date(cap.unlockAt).getTime() <= Date.now();
  if (!isUnlockedByTime) return 'sealed';
  return cap.opened ? 'opened' : 'ready';
}

function renderVault() {
  const grid = document.getElementById('capsules-grid');
  const query = document.getElementById('search-input').value.trim().toLowerCase();

  // Update counts
  const counts = { all: capsules.length, ready: 0, sealed: 0, opened: 0 };
  capsules.forEach(c => counts[getCapsuleState(c)]++);
  document.getElementById('count-all').textContent = counts.all;
  document.getElementById('count-ready').textContent = counts.ready;
  document.getElementById('count-sealed').textContent = counts.sealed;
  document.getElementById('count-opened').textContent = counts.opened;

  const filtered = capsules.filter(cap => {
    const state = getCapsuleState(cap);
    const matchesFilter = currentFilter === 'all' || state === currentFilter;
    const matchesQuery =
      cap.title.toLowerCase().includes(query) ||
      cap.mood.toLowerCase().includes(query) ||
      (cap.caption && cap.caption.toLowerCase().includes(query));
    return matchesFilter && matchesQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: 18px; border: 1px dashed var(--border-sepia);">
        <h3>No memory capsules found in this wing</h3>
        <p style="color: var(--ink-muted); margin: 0.5rem 0 1.25rem;">Try switching filter tabs or seal a brand-new memory capsule.</p>
        <button class="btn-primary" onclick="switchView('create')">✨ Seal a Capsule</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(cap => {
    const state = getCapsuleState(cap);
    const isSealed = state === 'sealed';
    const badgeMap = {
      ready: `<span class="status-badge status-ready">✨ READY TO UNSEAL</span>`,
      sealed: `<span class="status-badge status-sealed">🔒 TIME-LOCKED</span>`,
      opened: `<span class="status-badge status-opened">📖 OPENED KEEPSAKE</span>`
    };

    const actionButton = isSealed
      ? `<button class="btn-secondary" onclick="forceUnlockDemo('${cap.id}')">🔑 Early Demo Unlock</button>`
      : `<button class="btn-primary" onclick="openCapsuleModal('${cap.id}')">💌 ${state === 'ready' ? 'Break Seal & Read' : 'Revisit Memory'}</button>`;

    return `
      <article class="capsule-card">
        <div class="card-top-meta">
          ${badgeMap[state]}
          <span style="color: var(--ink-muted);">${cap.mood}</span>
        </div>

        <div class="polaroid-box ${isSealed ? 'blurred' : ''}">
          <img src="${cap.image}" alt="${escapeHTML(cap.title)}" />
          ${isSealed ? `
            <div class="sealed-overlay">
              <span class="lock-icon">🕯️</span>
              <strong>Sealed Until</strong>
              <small>${formatFriendlyDate(cap.unlockAt)}</small>
            </div>
          ` : ''}
          <p class="handwritten-caption">${escapeHTML(cap.caption || 'Preserved in the archive')}</p>
        </div>

        <h3>${escapeHTML(cap.title)}</h3>
        <p class="capsule-author">Curated by ${escapeHTML(cap.author || 'Anonymous')} • Sealed ${formatShortDate(cap.createdAt)}</p>

        <div class="countdown-box" data-unlock="${cap.unlockAt}" data-id="${cap.id}">
          ${formatCountdownText(cap.unlockAt)}
        </div>

        <div class="card-actions">
          ${actionButton}
          <button class="btn-delete" onclick="deleteCapsule('${cap.id}')" title="Delete Capsule">🗑️</button>
        </div>
      </article>
    `;
  }).join('');
}

function updateCountdowns() {
  document.querySelectorAll('.countdown-box').forEach(box => {
    const unlockAt = box.getAttribute('data-unlock');
    box.textContent = formatCountdownText(unlockAt);
  });
}

function formatCountdownText(unlockIso) {
  const diff = new Date(unlockIso).getTime() - Date.now();
  if (diff <= 0) {
    return `✨ Unlocked on ${formatFriendlyDate(unlockIso)}`;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return `⏳ Unlocks in ${days}d ${hours}h ${mins}m ${secs}s`;
}

/* Creator & Photo Compression */
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      // Compress image so localStorage holds many capsules comfortably
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      selectedImageData = canvas.toDataURL('image/jpeg', 0.78);
      document.getElementById('preview-img').src = selectedImageData;
      showToast('📸 Photo added to your Polaroid frame!');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function selectPresetImage(key) {
  selectedImageData = PRESET_IMAGES[key];
  document.getElementById('preview-img').src = selectedImageData;
}

function insertWritingPrompt() {
  const textarea = document.getElementById('cap-letter');
  const randomPrompt = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
  textarea.value = textarea.value ? `${textarea.value}\n\n${randomPrompt}` : randomPrompt;
  updateLivePreview();
}

function setQuickDate(preset) {
  const dateInput = document.getElementById('cap-unlock-date');
  const d = new Date();

  if (preset === 'now') d.setMinutes(d.getMinutes() - 1);
  if (preset === '1min') d.setMinutes(d.getMinutes() + 1);
  if (preset === '6months') d.setMonth(d.getMonth() + 6);
  if (preset === '1year') d.setFullYear(d.getFullYear() + 1);
  if (preset === 'graduation') {
    d.setFullYear(2028, 4, 20);
    d.setHours(10, 0, 0, 0);
  }

  // Format for datetime-local (YYYY-MM-DDTHH:MM)
  const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  dateInput.value = localIso;
  updateLivePreview();
}

function updateLivePreview() {
  const title = document.getElementById('cap-title').value.trim();
  const mood = document.getElementById('cap-mood').value;
  const caption = document.getElementById('cap-caption').value.trim();
  const letter = document.getElementById('cap-letter').value.trim();
  const unlockVal = document.getElementById('cap-unlock-date').value;

  document.getElementById('preview-title').textContent = title || 'Untitled Memory Capsule';
  document.getElementById('preview-mood').textContent = mood;
  document.getElementById('preview-caption').textContent = caption || 'Autumn afternoon, 2026...';
  document.getElementById('preview-letter').textContent = letter
    ? `"${letter.slice(0, 110)}${letter.length > 110 ? '...' : ''}"`
    : 'Your letter to your future self will appear here once unsealed...';

  document.getElementById('preview-date-label').textContent = unlockVal
    ? `Unlocks on: ${formatFriendlyDate(unlockVal)}`
    : 'Unlocks on: Select a date';
}

function handleCreateCapsule(event) {
  event.preventDefault();

  const newCapsule = {
    id: 'cap-' + Date.now(),
    title: document.getElementById('cap-title').value.trim(),
    author: document.getElementById('cap-author').value.trim() || 'Curator',
    mood: document.getElementById('cap-mood').value,
    caption: document.getElementById('cap-caption').value.trim() || 'Captured in the moment',
    letter: document.getElementById('cap-letter').value.trim(),
    image: selectedImageData,
    createdAt: new Date().toISOString(),
    unlockAt: new Date(document.getElementById('cap-unlock-date').value).toISOString(),
    opened: false
  };

  capsules.unshift(newCapsule);
  saveCapsules();
  document.getElementById('capsule-form').reset();
  selectPresetImage('campus');
  setQuickDate('6months');
  updateLivePreview();

  renderVault();
  switchView('vault');
  showToast('🕯️ Wax-sealed! Your memory capsule is safely archived in the vault.');
}

/* Modal & Unsealing */
function openCapsuleModal(id) {
  const cap = capsules.find(c => c.id === id);
  if (!cap) return;

  cap.opened = true;
  saveCapsules();
  renderVault();

  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <span class="step-tag">${cap.mood}</span>
    <h2 style="font-size: 1.85rem; margin-bottom: 0.25rem;">${escapeHTML(cap.title)}</h2>
    <p style="color: var(--ink-muted); font-size: 0.88rem; margin-bottom: 1.25rem;">
      Sealed by <strong>${escapeHTML(cap.author)}</strong> on ${formatFriendlyDate(cap.createdAt)} • Unsealed ${formatFriendlyDate(cap.unlockAt)}
    </p>
    <div style="background: #fff; padding: 0.85rem; border: 1px solid var(--border-sepia); border-radius: 12px;">
      <img class="modal-photo" src="${cap.image}" alt="${escapeHTML(cap.title)}" />
      <p class="handwritten-caption" style="font-size: 1.55rem;">${escapeHTML(cap.caption)}</p>
    </div>
    <div class="modal-letter-body">${escapeHTML(cap.letter)}</div>
  `;

  document.getElementById('capsule-modal').classList.add('open');
}

function forceUnlockDemo(id) {
  const cap = capsules.find(c => c.id === id);
  if (!cap) return;
  cap.unlockAt = new Date(Date.now() - 1000).toISOString();
  saveCapsules();
  openCapsuleModal(id);
  showToast('🔓 Capsule unsealed early for presentation demo!');
}

function closeModal() {
  document.getElementById('capsule-modal').classList.remove('open');
}

function closeModalOnBackdrop(event) {
  if (event.target.id === 'capsule-modal') closeModal();
}

function deleteCapsule(id) {
  if (!confirm('Remove this memory capsule from the museum vault?')) return;
  capsules = capsules.filter(c => c.id !== id);
  saveCapsules();
  renderVault();
  showToast('🗑️ Memory capsule removed.');
}

/* JSON Backup Export / Import */
function exportVaultJSON() {
  const blob = new Blob([JSON.stringify(capsules, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timecapsule-museum-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('💾 Vault backup downloaded as JSON!');
}

function importVaultJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      capsules = imported;
      saveCapsules();
      renderVault();
      showToast(`📂 Restored ${capsules.length} memory capsules!`);
    } catch (err) {
      showToast('❌ Could not import file. Please select a valid TimeCapsule JSON backup.');
    }
  };
  reader.readAsText(file);
}

/* Helpers */
function formatFriendlyDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatShortDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}