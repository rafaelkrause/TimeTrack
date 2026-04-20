// ── State ──────────────────────────────────────────────────────────────

let currentDate = new Date();
let timerInterval = null;

// ── Dialog / Dropdown helpers (global) ────────────────────────────────

function openDialog(id) {
    const el = document.getElementById(id);
    if (el && typeof el.showModal === "function") el.showModal();
}

function closeDialog(id) {
    const el = document.getElementById(id);
    if (el && typeof el.close === "function") el.close();
}

function toggleDropdown(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const isOpen = el.classList.toggle("is-open");
    if (isOpen) {
        setTimeout(() => {
            document.addEventListener("click", function handler(e) {
                if (!el.contains(e.target)) {
                    el.classList.remove("is-open");
                    document.removeEventListener("click", handler);
                }
            });
        }, 0);
    }
}

// ── Cross-tab sync via BroadcastChannel ───────────────────────────────

const syncChannel = new BroadcastChannel("job-tracker-sync");

syncChannel.addEventListener("message", (event) => {
    if (event.data === "refresh") {
        refreshCurrentActivity();
        refreshDashboard();
    }
    if (event.data === "focus-request") {
        window.focus();
        syncChannel.postMessage("focus-ack");
    }
});

function notifyOtherTabs() {
    syncChannel.postMessage("refresh");
}

// ── Server revision polling (catches tray / external changes) ─────────

let knownRevision = -1;

async function pollRevision() {
    try {
        const data = await api("/api/revision");
        if (knownRevision === -1) {
            knownRevision = data.rev;
            return;
        }
        if (data.rev !== knownRevision) {
            knownRevision = data.rev;
            refreshCurrentActivity();
            refreshDashboard();
        }
    } catch { /* ignore network errors */ }
}

// ── Utility ───────────────────────────────────────────────────────────

function formatDateISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function formatTime(isoStr) {
    if (!isoStr) return "—";
    const d = new Date(isoStr);
    return d.toLocaleTimeString(window.currentLang || "pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

async function api(url, method = "GET", body = null) {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    return res.json();
}

// ── Theme ─────────────────────────────────────────────────────────────

function initTheme() {
    const saved = localStorage.getItem("jt-theme") || "auto";
    applyTheme(saved);
}

function applyTheme(theme) {
    let effective = theme;
    if (theme === "auto") {
        effective = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.classList.toggle("dark", effective === "dark");
    localStorage.setItem("jt-theme", theme);
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if ((localStorage.getItem("jt-theme") || "auto") === "auto") applyTheme("auto");
});

document.addEventListener("click", (e) => {
    if (e.target.closest("#theme-toggle")) {
        const current = localStorage.getItem("jt-theme") || "auto";
        const cycle = { light: "dark", dark: "auto", auto: "light" };
        applyTheme(cycle[current] || "light");
    }
});

// ── Language switch ───────────────────────────────────────────────────

document.addEventListener("click", async (e) => {
    const el = e.target.closest(".lang-switch");
    if (!el) return;
    e.preventDefault();
    const dropdown = el.closest(".dropdown");
    if (dropdown) dropdown.classList.remove("is-open");
    const lang = el.dataset.lang;
    try {
        await fetch("/api/lang", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lang }),
        });
        window.location.reload();
    } catch { /* ignore */ }
});

// ── Current Activity ──────────────────────────────────────────────────

async function refreshCurrentActivity() {
    const data = await api("/api/activity/current");
    const container = document.getElementById("current-activity");
    if (!container) return;

    if (data.activity) {
        container.classList.remove("hidden");
        document.getElementById("current-description").textContent = data.activity.description;

        const badge = document.getElementById("status-badge");
        const btnPause = document.getElementById("btn-pause");
        const btnResume = document.getElementById("btn-resume");

        if (data.activity.status === "paused") {
            badge.textContent = window.i18n.paused;
            badge.className = "badge badge--warning";
            btnPause.classList.add("hidden");
            btnResume.classList.remove("hidden");
        } else {
            badge.textContent = window.i18n.active;
            badge.className = "badge badge--success";
            btnPause.classList.remove("hidden");
            btnResume.classList.add("hidden");
        }

        startTimer(data.effective_seconds, data.activity.status);
    } else {
        container.classList.add("hidden");
        stopTimer();
    }
}

function startTimer(initialSeconds, status) {
    stopTimer();
    let seconds = initialSeconds;
    updateTimerDisplay(seconds);

    if (status === "active") {
        timerInterval = setInterval(() => {
            seconds++;
            updateTimerDisplay(seconds);
        }, 1000);
    }
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay(seconds) {
    const el = document.getElementById("current-timer");
    if (el) el.textContent = formatDuration(seconds);
}

// ── Activity Actions ──────────────────────────────────────────────────

async function startActivity(event) {
    event.preventDefault();
    const input = document.getElementById("activity-description");
    const description = input.value.trim();
    if (!description) return;

    await api("/api/activity/start", "POST", { description });
    input.value = "";
    refreshCurrentActivity();
    refreshDashboard();
    notifyOtherTabs();
}

async function pauseActivity() {
    await api("/api/activity/pause", "POST");
    refreshCurrentActivity();
    notifyOtherTabs();
    showPhrase("pause");
}

async function resumeActivity() {
    await api("/api/activity/resume", "POST");
    refreshCurrentActivity();
    notifyOtherTabs();
}

async function stopActivity() {
    await api("/api/activity/stop", "POST");
    refreshCurrentActivity();
    refreshDashboard();
    notifyOtherTabs();
    showPhrase("stop");
}

async function showPhrase(category) {
    try {
        const data = await api(`/api/phrase/${category}`);
        if (data.phrase) showToast(data.phrase, "info", 4000);
    } catch { /* ignore */ }
}

// ── Dashboard ─────────────────────────────────────────────────────────

function changeDate(delta) {
    currentDate.setDate(currentDate.getDate() + delta);
    updateDateDisplay();
    refreshDashboard();
}

function goToday() {
    currentDate = new Date();
    updateDateDisplay();
    refreshDashboard();
}

function updateDateDisplay() {
    const el = document.getElementById("date-display");
    if (!el) return;
    const todayStr = formatDateISO(new Date());
    const currentStr = formatDateISO(currentDate);
    if (currentStr === todayStr) {
        el.textContent = window.i18n.today;
    } else {
        el.textContent = currentDate.toLocaleDateString(window.currentLang || "pt-BR", {
            weekday: "short", day: "2-digit", month: "2-digit",
        });
    }
}

async function refreshDashboard() {
    const dateStr = formatDateISO(currentDate);
    const data = await api(`/api/dashboard?date=${dateStr}`);

    // Stats
    const trackedEl = document.getElementById("tracked-time");
    const shiftEl = document.getElementById("shift-total");
    const pctEl = document.getElementById("percentage");
    const bar = document.getElementById("progress-bar");

    if (trackedEl) trackedEl.textContent = formatDuration(data.tracked_seconds);
    if (shiftEl) shiftEl.textContent = formatDuration(data.elapsed_shift_seconds);

    if (pctEl) {
        pctEl.textContent = `${data.percentage}%`;
        const t = data.target_percentage;
        pctEl.className = "fw-bold " + (
            data.percentage >= t ? "pct-high" :
            data.percentage >= t * 0.7 ? "pct-mid" : "pct-low"
        );
    }

    if (bar) {
        const pct = Math.min(100, data.percentage);
        bar.style.width = `${pct}%`;
        const t = data.target_percentage;
        bar.className = "progress__bar " + (
            data.percentage >= t ? "progress__bar--success" :
            data.percentage >= t * 0.7 ? "progress__bar--warning" : "progress__bar--destructive"
        );
    }

    // Shift info
    const shiftInfo = document.getElementById("shift-info");
    if (shiftInfo) {
        shiftInfo.textContent = data.shifts.length > 0
            ? data.shifts.map(s => `${s.start}\u2013${s.end}`).join(" | ")
            : window.i18n.no_shift;
    }

    renderTimeline(data);
    renderActivityTable(data.activities);
}

// ── Timeline ──────────────────────────────────────────────────────────

function renderTimeline(data) {
    const container = document.getElementById("timeline");
    const labelsEl = document.getElementById("timeline-labels");
    if (!container) return;
    container.innerHTML = "";
    if (labelsEl) labelsEl.innerHTML = "";

    if (data.shifts.length === 0) {
        container.innerHTML = `<div class="text-muted text-center py-3" style="font-size:0.875rem">${escapeHtml(window.i18n.no_shift)}</div>`;
        container.style.height = "auto";
        return;
    }
    container.style.height = "52px";

    // Compute timeline range
    let earliest = 24, latest = 0;
    for (const s of data.shifts) {
        const [sh, sm] = s.start.split(":").map(Number);
        const [eh, em] = s.end.split(":").map(Number);
        earliest = Math.min(earliest, sh + sm / 60);
        latest = Math.max(latest, eh + em / 60);
    }
    earliest = Math.max(0, earliest - 0.5);
    latest = Math.min(24, latest + 0.5);
    const range = latest - earliest;

    function hoursToPercent(h) {
        return ((h - earliest) / range) * 100;
    }

    function timeStrToPercent(t) {
        const [h, m] = t.split(":").map(Number);
        return hoursToPercent(h + m / 60);
    }

    function isoToPercent(iso) {
        const d = new Date(iso);
        const h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
        return Math.max(0, Math.min(100, hoursToPercent(h)));
    }

    // Shift blocks
    for (const s of data.shifts) {
        const left = timeStrToPercent(s.start);
        const right = timeStrToPercent(s.end);
        const div = document.createElement("div");
        div.className = "timeline-shift";
        div.style.left = `${left}%`;
        div.style.width = `${right - left}%`;
        container.appendChild(div);
    }

    // Activity blocks
    for (const a of data.activities) {
        const left = isoToPercent(a.started_at);
        const endIso = a.ended_at || new Date().toISOString();
        const right = isoToPercent(endIso);
        const div = document.createElement("div");
        div.className = `timeline-activity ${a.status}`;
        div.style.left = `${left}%`;
        div.style.width = `${Math.max(0.3, right - left)}%`;
        div.title = `${a.description}\n${formatTime(a.started_at)} \u2013 ${a.ended_at ? formatTime(a.ended_at) : window.i18n.now}\n${a.effective_duration}`;
        container.appendChild(div);
    }

    // Now marker
    const todayStr = formatDateISO(new Date());
    if (formatDateISO(currentDate) === todayStr) {
        const now = new Date();
        const nowH = now.getHours() + now.getMinutes() / 60;
        if (nowH >= earliest && nowH <= latest) {
            const marker = document.createElement("div");
            marker.className = "timeline-now";
            marker.style.left = `${hoursToPercent(nowH)}%`;
            container.appendChild(marker);
        }
    }

    // Hour labels
    if (labelsEl) {
        for (let h = Math.ceil(earliest); h <= Math.floor(latest); h++) {
            const span = document.createElement("span");
            span.className = "timeline-label";
            span.style.left = `${hoursToPercent(h)}%`;
            span.textContent = `${String(h).padStart(2, "0")}h`;
            labelsEl.appendChild(span);
        }
    }
}

// ── Activity Table ────────────────────────────────────────────────────

function renderActivityTable(activities) {
    const tbody = document.getElementById("activity-table");
    if (!tbody) return;

    if (activities.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">${escapeHtml(window.i18n.no_activities)}</td></tr>`;
        return;
    }

    const statusMap = {
        completed: { label: window.i18n.completed, cls: "badge--secondary" },
        paused:    { label: window.i18n.paused,    cls: "badge--warning" },
        active:    { label: window.i18n.active,    cls: "badge--success" },
    };

    tbody.innerHTML = activities.map(a => {
        const st = statusMap[a.status] || statusMap.completed;
        return `<tr>
            <td>${escapeHtml(a.description)}</td>
            <td>${formatTime(a.started_at)}</td>
            <td>${a.ended_at ? formatTime(a.ended_at) : "\u2014"}</td>
            <td class="font-monospace">${a.effective_duration}</td>
            <td><span class="badge ${st.cls}">${st.label}</span></td>
            <td>
                <button class="btn btn--ghost btn--sm btn--icon btn-edit"
                    data-id="${a.id}" data-status="${a.status}"
                    data-started="${a.started_at}" data-ended="${a.ended_at || ""}"
                    title="${escapeHtml(window.i18n.edit || 'Edit')}">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                </button>
            </td>
        </tr>`;
    }).join("");

    // Attach edit handlers via data attributes (safe for any description content)
    for (const btn of tbody.querySelectorAll(".btn-edit")) {
        const id = btn.dataset.id;
        const row = btn.closest("tr");
        const description = row.querySelector("td").textContent;
        btn.addEventListener("click", () => {
            openEditModal(id, description, btn.dataset.started, btn.dataset.ended, btn.dataset.status);
        });
    }
}

// ── Edit / Delete Activity ────────────────────────────────────────────

function openEditModal(id, description, startedAt, endedAt, status) {
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-status").value = status;
    document.getElementById("edit-description").value = description;

    const startDate = new Date(startedAt);
    document.getElementById("edit-start").value =
        String(startDate.getHours()).padStart(2, "0") + ":" + String(startDate.getMinutes()).padStart(2, "0");

    const endGroup = document.getElementById("edit-end-group");
    const endInput = document.getElementById("edit-end");
    if (endedAt) {
        endGroup.classList.remove("hidden");
        const endDate = new Date(endedAt);
        endInput.value =
            String(endDate.getHours()).padStart(2, "0") + ":" + String(endDate.getMinutes()).padStart(2, "0");
    } else {
        endGroup.classList.add("hidden");
        endInput.value = "";
    }

    openDialog("editModal");
}

function showSaveConfirm() {
    closeDialog("editModal");
    openDialog("confirmSaveModal");
}

function showDeleteConfirm() {
    closeDialog("editModal");
    openDialog("confirmDeleteModal");
}

function backToEdit() {
    closeDialog("confirmSaveModal");
    closeDialog("confirmDeleteModal");
    openDialog("editModal");
}

async function saveEdit() {
    const id = document.getElementById("edit-id").value;
    const body = {
        description: document.getElementById("edit-description").value.trim(),
        start_time: document.getElementById("edit-start").value,
    };
    const endVal = document.getElementById("edit-end").value;
    if (endVal) body.end_time = endVal;

    await api(`/api/activity/${id}`, "PUT", body);
    closeDialog("confirmSaveModal");
    refreshCurrentActivity();
    refreshDashboard();
    notifyOtherTabs();
    showToast(window.i18n.activity_updated);
}

async function deleteActivity() {
    const id = document.getElementById("edit-id").value;
    await api(`/api/activity/${id}`, "DELETE");
    closeDialog("confirmDeleteModal");
    refreshCurrentActivity();
    refreshDashboard();
    notifyOtherTabs();
    showToast(window.i18n.activity_removed);
}

// ── Export ─────────────────────────────────────────────────────────────

function exportData(format) {
    const dateStr = formatDateISO(currentDate);
    window.open(`/api/export?from=${dateStr}&to=${dateStr}&format=${format}`);
}

// ── Settings ──────────────────────────────────────────────────────────

function dayNames() {
    return {
        monday: window.i18n.monday,
        tuesday: window.i18n.tuesday,
        wednesday: window.i18n.wednesday,
        thursday: window.i18n.thursday,
        friday: window.i18n.friday,
        saturday: window.i18n.saturday,
        sunday: window.i18n.sunday,
    };
}
const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

async function loadShifts() {
    const data = await api("/api/shifts");
    const container = document.getElementById("shifts-config");
    if (!container) return;

    container.innerHTML = "";
    const names = dayNames();
    const plusSvg = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
    for (const day of DAY_ORDER) {
        const shifts = data[day] || [];
        const dayDiv = document.createElement("div");
        dayDiv.className = "mb-3";
        dayDiv.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
                <strong style="width:75px;font-size:0.85rem">${escapeHtml(names[day])}</strong>
                <button class="btn btn--outline btn--sm btn--icon" onclick="addShift('${day}')">
                    ${plusSvg}
                </button>
            </div>
            <div id="shifts-${day}" class="flex flex-wrap gap-2">
                ${shifts.map((s, i) => shiftInputHtml(day, i, s.start, s.end)).join("")}
            </div>
        `;
        container.appendChild(dayDiv);
    }
}

function shiftInputHtml(day, index, start, end) {
    const xSvg = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
    return `<div class="shift-row flex items-center gap-1">
        <input type="time" class="input" style="width:auto" value="${start}" data-day="${day}" data-index="${index}" data-field="start">
        <span class="text-muted">\u2013</span>
        <input type="time" class="input" style="width:auto" value="${end}" data-day="${day}" data-index="${index}" data-field="end">
        <button class="btn btn--ghost btn--sm btn--icon" onclick="this.parentElement.remove()">${xSvg}</button>
    </div>`;
}

function addShift(day) {
    const container = document.getElementById(`shifts-${day}`);
    const idx = container.children.length;
    container.insertAdjacentHTML("beforeend", shiftInputHtml(day, idx, "09:00", "18:00"));
}

async function saveShifts() {
    const shifts = {};
    for (const day of DAY_ORDER) {
        shifts[day] = [];
        const container = document.getElementById(`shifts-${day}`);
        if (!container) continue;
        for (const group of container.querySelectorAll(".shift-row")) {
            const inputs = group.querySelectorAll('input[type="time"]');
            if (inputs.length === 2 && inputs[0].value && inputs[1].value) {
                shifts[day].push({ start: inputs[0].value, end: inputs[1].value });
            }
        }
    }
    await api("/api/shifts", "PUT", shifts);
    showToast(window.i18n.shifts_saved);
}

async function saveGeneral() {
    const userName = document.getElementById("user-name")?.value.trim() || "";
    const target = parseInt(document.getElementById("target-percentage")?.value || "90");
    const port = parseInt(document.getElementById("server-port")?.value || "5000");
    const phrasesEnabled = document.getElementById("phrases-enabled")?.checked ?? true;
    await api("/api/config", "PUT", {
        user_name: userName,
        target_percentage: target,
        port,
        phrases_enabled: phrasesEnabled,
    });
    showToast(window.i18n.settings_saved);
}

function exportFromSettings() {
    const from = document.getElementById("export-from")?.value;
    const to = document.getElementById("export-to")?.value;
    const format = document.getElementById("export-format")?.value || "csv";
    if (!from || !to) {
        showToast(window.i18n.pick_dates, "warning");
        return;
    }
    window.open(`/api/export?from=${from}&to=${to}&format=${format}`);
}

// ── Toast ─────────────────────────────────────────────────────────────

function showToast(message, type = "success", duration = 3500) {
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.className = "toast-container";
        document.body.appendChild(toastContainer);
    }
    const variants = { success: "toast--success", error: "toast--error", warning: "toast--error", info: "toast--info" };
    const variant = variants[type] || variants.success;
    const el = document.createElement("div");
    el.className = `toast ${variant}`;
    el.setAttribute("role", "alert");
    el.textContent = message;
    toastContainer.appendChild(el);
    setTimeout(() => {
        el.style.transition = "opacity 0.2s";
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 200);
    }, duration);
}

// ── Init ──────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    // Close <dialog> when clicking on backdrop
    document.querySelectorAll("dialog.dialog").forEach(d => {
        d.addEventListener("click", (e) => {
            if (e.target === d) d.close();
        });
    });

    // Dashboard page
    if (document.getElementById("current-activity")) {
        updateDateDisplay();
        refreshCurrentActivity();
        refreshDashboard();

        // Lightweight revision poll every 3s — detects tray & external changes
        setInterval(pollRevision, 3000);

        // Full refresh every 30s (updates timer accuracy & dashboard stats)
        setInterval(() => {
            refreshCurrentActivity();
            refreshDashboard();
        }, 30000);
    }

    // Settings page: set default export dates to current month
    const exportFrom = document.getElementById("export-from");
    const exportTo = document.getElementById("export-to");
    if (exportFrom && exportTo) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        exportFrom.value = formatDateISO(firstDay);
        exportTo.value = formatDateISO(now);
    }
});
