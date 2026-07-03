/* ==========================================================
   PACE — Fitness Tracker
   Vanilla JS, persisted with localStorage
   ========================================================== */

const STORAGE_KEYS = { entries: "pace_entries", goals: "pace_goals" };

const TYPE_ICONS = {
    Walking: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="17" cy="4" r="2"/><path d="M15 8l-3 3 1 5-4 6M9 11l-2 2 1 6M13 11l3 2 3-1"/></svg>`,
    Running: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="4" r="2"/><path d="M8 20l3-5-2-4 4-3 2 3 4-1M9 12l-3 2-2 5"/></svg>`,
    Cycling: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h4l3 8M10 9l3-4h3"/></svg>`,
    Strength: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9v6M2 8v8M20 9v6M22 8v8M7 12h10"/></svg>`,
    Swimming: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 16c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0M2 20c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0"/><circle cx="17" cy="6" r="2"/><path d="M4 12l6-3 3 2 5-2"/></svg>`,
    Other: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
};

const ICONS = {
    edit: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 20 9-9-3-3-9 9v3h3Z"/></svg>`,
    plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"/></svg>`,
};

/* ---------------- date helpers ---------------- */

const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = toKey(new Date());

function dayLabel(key) {
    if (key === todayKey) return "Today";
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    if (key === toKey(yest)) return "Yesterday";
    const d = new Date(key + "T00:00:00");
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function shortDow(key) {
    return new Date(key + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
}

/* ---------------- seed data ---------------- */

function seedEntries() {
    const templates = [
        [6, "Running", 32, 340, 4100],
        [5, "Strength", 40, 260, 900],
        [5, "Walking", 20, 90, 2600],
        [4, "Cycling", 45, 410, 1200],
        [3, "Other", 30, 120, 700],
        [2, "Running", 28, 300, 3800],
        [1, "Walking", 35, 150, 5200],
        [0, "Strength", 38, 250, 850],
        [0, "Walking", 18, 80, 2300],
    ];
    return templates.map(([offset, type, duration, calories, steps], i) => {
        const d = new Date();
        d.setDate(d.getDate() - offset);
        return { id: `seed-${i}`, date: toKey(d), type, duration, calories, steps };
    });
}

/* ---------------- state ---------------- */

let entries = loadEntries();
let goals = loadGoals();

function loadEntries() {
    const raw = localStorage.getItem(STORAGE_KEYS.entries);
    if (raw) {
        try { return JSON.parse(raw); } catch { /* fall through */ }
    }
    const seeded = seedEntries();
    localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(seeded));
    return seeded;
}

function loadGoals() {
    const raw = localStorage.getItem(STORAGE_KEYS.goals);
    if (raw) {
        try { return JSON.parse(raw); } catch { /* fall through */ }
    }
    const defaults = { steps: 10000, calories: 500, active: 45 };
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(defaults));
    return defaults;
}

function saveEntries() { localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries)); }
function saveGoals() { localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals)); }

/* ---------------- derived data ---------------- */

function getTodayTotals() {
    return entries
        .filter((e) => e.date === todayKey)
        .reduce((acc, e) => ({
            steps: acc.steps + e.steps,
            calories: acc.calories + e.calories,
            active: acc.active + e.duration,
        }), { steps: 0, calories: 0, active: 0 });
}

function getWeekData() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(toKey(d));
    }
    return days.map((key) => {
        const dayEntries = entries.filter((e) => e.date === key);
        return {
            key,
            day: shortDow(key),
            steps: dayEntries.reduce((s, e) => s + e.steps, 0),
            calories: dayEntries.reduce((s, e) => s + e.calories, 0),
        };
    });
}

function getStreak() {
    let count = 0;
    for (let i = 0; ; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toKey(d);
        if (entries.some((e) => e.date === key)) count++;
        else break;
    }
    return count;
}

function getGrouped() {
    const map = {};
    entries.forEach((e) => {
        map[e.date] = map[e.date] || [];
        map[e.date].push(e);
    });
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

/* ---------------- rendering: rings ---------------- */

const SVG_NS = "http://www.w3.org/2000/svg";

function buildRing(value, goal, color, label, unit, size = 156) {
    const stroke = 10;
    const r = (size - stroke) / 2 - 8;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(1, goal ? value / goal : 0));
    const center = size / 2;

    const block = document.createElement("div");
    block.className = "ring-block";

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

    // tick marks
    const tickCount = 36;
    for (let i = 0; i < tickCount; i++) {
        const angle = (i / tickCount) * 2 * Math.PI - Math.PI / 2;
        const major = i % 3 === 0;
        const rOuter = r + stroke / 2 + 3;
        const rInner = rOuter - (major ? 6 : 3);
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", center + rInner * Math.cos(angle));
        line.setAttribute("y1", center + rInner * Math.sin(angle));
        line.setAttribute("x2", center + rOuter * Math.cos(angle));
        line.setAttribute("y2", center + rOuter * Math.sin(angle));
        line.setAttribute("stroke", "var(--ink)");
        line.setAttribute("stroke-opacity", major ? 0.35 : 0.14);
        line.setAttribute("stroke-width", major ? 1.4 : 1);
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
    }

    const track = document.createElementNS(SVG_NS, "circle");
    track.setAttribute("cx", center);
    track.setAttribute("cy", center);
    track.setAttribute("r", r);
    track.setAttribute("fill", "none");
    track.setAttribute("stroke", "var(--track)");
    track.setAttribute("stroke-width", stroke);
    svg.appendChild(track);

    const progress = document.createElementNS(SVG_NS, "circle");
    progress.setAttribute("cx", center);
    progress.setAttribute("cy", center);
    progress.setAttribute("r", r);
    progress.setAttribute("fill", "none");
    progress.setAttribute("stroke", color);
    progress.setAttribute("stroke-width", stroke);
    progress.setAttribute("stroke-dasharray", c);
    progress.setAttribute("stroke-dashoffset", c * (1 - pct));
    progress.setAttribute("stroke-linecap", "round");
    progress.setAttribute("transform", `rotate(-90 ${center} ${center})`);
    progress.setAttribute("class", "ring-progress");
    svg.appendChild(progress);

    const numText = document.createElementNS(SVG_NS, "text");
    numText.setAttribute("x", center);
    numText.setAttribute("y", center - 6);
    numText.setAttribute("text-anchor", "middle");
    numText.setAttribute("class", "mono-num");
    numText.setAttribute("style", "font-size:26px;fill:var(--ink);");
    numText.textContent = value.toLocaleString();
    svg.appendChild(numText);

    const subText = document.createElementNS(SVG_NS, "text");
    subText.setAttribute("x", center);
    subText.setAttribute("y", center + 16);
    subText.setAttribute("text-anchor", "middle");
    subText.setAttribute("style", "font-size:11px;fill:var(--ink-soft);font-family:Inter,sans-serif;");
    subText.textContent = `${unit} · goal ${goal.toLocaleString()}`;
    svg.appendChild(subText);

    const labelDiv = document.createElement("div");
    labelDiv.className = "label-caps muted";
    labelDiv.textContent = label;

    block.appendChild(svg);
    block.appendChild(labelDiv);
    return block;
}

function renderRings() {
    const totals = getTodayTotals();
    const container = document.getElementById("rings-container");
    container.innerHTML = "";
    container.appendChild(buildRing(totals.steps, goals.steps, "var(--accent-steps)", "Steps", "steps"));
    container.appendChild(buildRing(totals.calories, goals.calories, "var(--accent-cal)", "Calories", "kcal"));
    container.appendChild(buildRing(totals.active, goals.active, "var(--accent-active)", "Active minutes", "min"));
}

/* ---------------- rendering: chart ---------------- */

function renderChart() {
    const data = getWeekData();
    const svg = document.getElementById("chart");
    svg.innerHTML = "";

    const W = 700, H = 260;
    const padL = 40, padR = 40, padT = 16, padB = 30;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const maxSteps = Math.max(...data.map((d) => d.steps), 1) * 1.15;
    const maxCal = Math.max(...data.map((d) => d.calories), 1) * 1.15;
    const n = data.length;
    const slot = plotW / n;

    // gridlines
    for (let i = 0; i <= 4; i++) {
        const y = padT + (plotH / 4) * i;
        const gl = document.createElementNS(SVG_NS, "line");
        gl.setAttribute("x1", padL); gl.setAttribute("x2", W - padR);
        gl.setAttribute("y1", y); gl.setAttribute("y2", y);
        gl.setAttribute("stroke", "var(--line)");
        svg.appendChild(gl);
    }

    // bars (steps, left axis) + line (calories, right axis)
    const linePoints = [];

    data.forEach((d, i) => {
        const x0 = padL + i * slot;
        const barW = slot * 0.4;
        const barH = (d.steps / maxSteps) * plotH;
        const barX = x0 + slot / 2 - barW / 2;
        const barY = padT + plotH - barH;

        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("x", barX);
        rect.setAttribute("y", barY);
        rect.setAttribute("width", barW);
        rect.setAttribute("height", Math.max(barH, 0));
        rect.setAttribute("rx", 3);
        rect.setAttribute("fill", "var(--accent-steps)");
        svg.appendChild(rect);

        const cy = padT + plotH - (d.calories / maxCal) * plotH;
        const cx = x0 + slot / 2;
        linePoints.push([cx, cy]);

        // day label
        const label = document.createElementNS(SVG_NS, "text");
        label.setAttribute("x", cx);
        label.setAttribute("y", H - 8);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("style", "font-size:12px;fill:var(--ink-soft);font-family:Inter,sans-serif;");
        label.textContent = d.day;
        svg.appendChild(label);
    });

    // calories line
    const pathD = linePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "var(--accent-cal)");
    path.setAttribute("stroke-width", 2.5);
    svg.appendChild(path);

    linePoints.forEach(([cx, cy]) => {
        const dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx", cx);
        dot.setAttribute("cy", cy);
        dot.setAttribute("r", 3.5);
        dot.setAttribute("fill", "var(--accent-cal)");
        svg.appendChild(dot);
    });

    const weekSteps = data.reduce((s, d) => s + d.steps, 0);
    const weekCal = data.reduce((s, d) => s + d.calories, 0);
    document.getElementById("week-steps-total").textContent = weekSteps.toLocaleString();
    document.getElementById("week-cal-total").textContent = weekCal.toLocaleString();
}

/* ---------------- rendering: log list ---------------- */

function renderLog() {
    const grouped = getGrouped();
    const container = document.getElementById("log-container");
    const empty = document.getElementById("log-empty");
    container.innerHTML = "";
    empty.hidden = grouped.length !== 0;

    grouped.forEach(([date, list]) => {
        const dayBlock = document.createElement("div");

        const dayLabelEl = document.createElement("div");
        dayLabelEl.className = "label-caps muted log-day-label";
        dayLabelEl.textContent = dayLabel(date);
        dayBlock.appendChild(dayLabelEl);

        const listEl = document.createElement("div");
        listEl.className = "log-list";

        list.forEach((e) => {
            const row = document.createElement("div");
            row.className = "log-row";

            const left = document.createElement("div");
            left.className = "log-left";
            left.innerHTML = `
        <div class="icon-box">${TYPE_ICONS[e.type] || TYPE_ICONS.Other}</div>
        <div class="log-type">${e.type}</div>
      `;

            const stats = document.createElement("div");
            stats.className = "log-stats mono-num";
            let statsHTML = "";
            if (e.duration > 0) statsHTML += `<span>${e.duration} min</span>`;
            if (e.steps > 0) statsHTML += `<span>${e.steps.toLocaleString()} steps</span>`;
            if (e.calories > 0) statsHTML += `<span class="cal">${e.calories} kcal</span>`;
            statsHTML += `<button class="delete-btn" data-id="${e.id}">${ICONS.trash}</button>`;
            stats.innerHTML = statsHTML;

            row.appendChild(left);
            row.appendChild(stats);
            listEl.appendChild(row);
        });

        dayBlock.appendChild(listEl);
        container.appendChild(dayBlock);
    });

    container.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            entries = entries.filter((e) => e.id !== btn.dataset.id);
            saveEntries();
            renderAll();
        });
    });
}

/* ---------------- render orchestration ---------------- */

function renderAll() {
    renderRings();
    renderChart();
    renderLog();
    document.getElementById("streak-count").textContent = getStreak();
}

/* ---------------- events ---------------- */

document.getElementById("today-label").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "short", day: "numeric",
});

document.getElementById("f-date").value = todayKey;
document.getElementById("f-date").max = todayKey;

document.getElementById("entry-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const type = document.getElementById("f-type").value;
    const date = document.getElementById("f-date").value || todayKey;
    const duration = Number(document.getElementById("f-duration").value) || 0;
    const steps = Number(document.getElementById("f-steps").value) || 0;
    const calories = Number(document.getElementById("f-calories").value) || 0;

    if (!duration && !steps && !calories) return;

    entries.unshift({ id: `e-${Date.now()}`, date, type, duration, steps, calories });
    saveEntries();

    document.getElementById("f-duration").value = "";
    document.getElementById("f-steps").value = "";
    document.getElementById("f-calories").value = "";

    renderAll();
});

const goalsEditor = document.getElementById("goals-editor");
document.getElementById("goals-toggle").addEventListener("click", () => {
    document.getElementById("goal-steps").value = goals.steps;
    document.getElementById("goal-calories").value = goals.calories;
    document.getElementById("goal-active").value = goals.active;
    goalsEditor.hidden = !goalsEditor.hidden;
});

document.getElementById("goals-cancel").addEventListener("click", () => {
    goalsEditor.hidden = true;
});

document.getElementById("goals-save").addEventListener("click", () => {
    goals = {
        steps: Number(document.getElementById("goal-steps").value) || 1,
        calories: Number(document.getElementById("goal-calories").value) || 1,
        active: Number(document.getElementById("goal-active").value) || 1,
    };
    saveGoals();
    goalsEditor.hidden = true;
    renderAll();
});

/* ---------------- init ---------------- */

renderAll();