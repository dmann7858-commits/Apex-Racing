/* =====================================================================
   GRIDLINE — FRONT END
   All data comes from the server's /api routes. The rank tiers
   themselves live on the server in src/ranks.js.
   ===================================================================== */

/* =====================================================================
   1. BADGES
   ===================================================================== */
const TIER_COLOURS = {
  unranked: ["#8a919c","#4a505a"],
  bronze:   ["#e0915e","#8a4521"],
  silver:   ["#e4e9ef","#7f8893"],
  gold:     ["#ffd66b","#b07811"],
  platinum: ["#8fd3ff","#1f6fb8"],
  diamond:  ["#a9b6ff","#3b43b8"],
  champion: ["#ff8a5c","#b4190f"],
  grand:    ["#e6a3ff","#6b1fb3"],
};

let badgeSeq = 0;
function badgeSVG(tier){
  const [light, dark] = TIER_COLOURS[tier.group];
  const id = "bg" + (++badgeSeq);
  const isTop = tier.group === "champion" || tier.group === "grand";
  const pips = tier.level > 0
    ? Array.from({length:tier.level}, (_, i) => {
        const w = 6, gap = 3, total = tier.level * w + (tier.level - 1) * gap;
        return `<rect x="${32 - total/2 + i*(w+gap)}" y="52" width="${w}" height="3" rx="1" fill="${light}"/>`;
      }).join("")
    : "";
  const crown = isTop
    ? `<path d="M20 12 L25 4 L32 10 L39 4 L44 12 Z" fill="${light}" stroke="${dark}" stroke-width="1"/>`
    : "";
  const wings = tier.group === "grand"
    ? `<path d="M6 22 L0 18 L2 34 L8 38Z M58 22 L64 18 L62 34 L56 38Z" fill="url(#${id})" opacity=".85"/>`
    : "";
  return `<svg class="badge" viewBox="0 0 64 72" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
    ${wings}
    <path d="M32 8 L56 17 V37 C56 52 45 62 32 68 C19 62 8 52 8 37 V17 Z" fill="url(#${id})"/>
    <path d="M32 15 L49 22 V37 C49 48 41 55 32 60 C23 55 15 48 15 37 V22 Z" fill="#14171c" stroke="${dark}" stroke-width="1"/>
    <path d="M23 47 L32 24 L41 47 H36 L32 36 L28 47 Z" fill="url(#${id})"/>
    ${pips}${crown}
  </svg>`;
}

/* =====================================================================
   2. API CLIENT
   Talks to the Gridline server. The server decides whether the data comes
   from sample data or from iRacing — the page doesn't need to know.
   ===================================================================== */
const GridlineAPI = {
  async request(path, options = {}){
    const res = await fetch("/api" + path, {
      headers:{ "Content-Type":"application/json" },
      ...options,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
    return body;
  },
  getHome(){ return this.request("/home"); },
  getRanks(){ return this.request("/ranks"); },
  joinRace(raceId){ return this.request(`/races/${encodeURIComponent(raceId)}/join`, { method:"POST" }); },
};

/* =====================================================================
   3. RENDERING
   ===================================================================== */
const $ = s => document.querySelector(s);
const fmtDate = iso => new Date(iso + "T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const fmtNum = n => n.toLocaleString("en-US");
const arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const ICON = {
  home:`<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z" fill="currentColor"/>`,
  flag:`<path d="M5 21V4m0 0c4-2 7 2 11 0v9c-4 2-7-2-11 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
  cal:`<rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8"/>`,
  user:`<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
  trophy:`<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4c0 3 2 5 4 5M16 6h4c0 3-2 5-4 5M12 13v4M8 21h8M10 17h4v4h-4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
  car:`<path d="M3 16v-3l2-5h14l2 5v3zM3 16v3h3v-3M18 16v3h3v-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7.5" cy="13" r="1.2" fill="currentColor"/><circle cx="16.5" cy="13" r="1.2" fill="currentColor"/>`,
  chart:`<path d="M4 21V11M9 21V5M14 21v-8M19 21V9" stroke="currentColor" stroke-width="3"/>`,
  doc:`<rect x="5" y="3" width="14" height="18" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.8"/>`,
  mega:`<path d="M3 10v4h3l7 5V5L6 10zM16 8a5 5 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
  cart:`<path d="M2 3h3l3 12h11l2-8H6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="19.5" r="1.5" fill="currentColor"/><circle cx="18" cy="19.5" r="1.5" fill="currentColor"/>`,
  gear:`<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  pin:`<path d="M4 12c3-4 6-5 8-5s5 1 8 5c-3 4-6 5-8 5s-5-1-8-5z" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
  people:`<circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 5a3 3 0 0 1 0 6M18 15c2 .5 3 2 3 5" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
};
const svg = (name, extra="") => `<svg viewBox="0 0 24 24" ${extra}>${ICON[name]}</svg>`;

/* Navigation — add a route here and it appears in the sidebar */
const ROUTES = [
  { id:"home",      label:"Home",       icon:"home" },
  { id:"find-race", label:"Find Race",  icon:"flag",   blurb:"Search open ranked lobbies by series, car and start time." },
  { id:"schedule",  label:"Schedule",   icon:"cal",    blurb:"The full week of ranked sessions, in your local time." },
  { id:"profile",   label:"My Profile", icon:"user",   blurb:"Your RP history, form, incidents and career stats." },
  { id:"rankings",  label:"Rankings",   icon:"trophy", blurb:"Global and regional Gridline leaderboards." },
  { id:"series",    label:"Series",     icon:"car",    blurb:"Every Gridline series with its cars, tracks and rules." },
  { id:"results",   label:"Results",    icon:"chart",  blurb:"Every race you've entered, with RP changes." },
  { id:"incidents", label:"Incidents",  icon:"doc",    blurb:"Report an incident or track a review you're involved in." },
  { id:"news",      label:"News",       icon:"mega",   blurb:"Announcements from the Gridline team." },
  { id:"store",     label:"Store",      icon:"cart",   blurb:"Liveries, badges and supporter perks." },
  { id:"settings",  label:"Settings",   icon:"gear",   blurb:"Account, iRacing link and notification preferences." },
];

function renderNav(){
  $("#nav").innerHTML = ROUTES.map(r =>
    `<li><a href="#${r.id}" data-route="${r.id}">${svg(r.icon)}<span>${r.label}</span></a></li>`
  ).join("");
}

function renderUser(d, tier){
  $("#userChip").innerHTML = `
    <div class="avatar">${svg("user",'style="color:#c9ced6"')}</div>
    <div class="user-text"><div class="user-name">${d.name}</div><div class="user-id">#${d.tag}</div></div>
    <div class="user-rank">${badgeSVG(tier)}<div><div class="t">${tier.name}</div><div class="rp">${fmtNum(d.rp)} RP</div></div></div>`;
  $("#notifCount").textContent = d.notifications;
  $("#notifCount").hidden = !d.notifications;
}

function renderRank(d, rank, races){
  const { tier, progressPct, note } = rank;
  $("#rankMain").innerHTML = `
    <div class="rank-top">${badgeSVG(tier)}
      <div><div class="rank-name">${tier.name}</div><div class="rank-rp">${fmtNum(d.rp)}<small>RP</small></div></div>
    </div>
    <div class="bar gold" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progressPct)}"><span style="width:0%" data-w="${progressPct}%"></span></div>
    <div class="bar-note">${note}</div>`;

  const form = races.slice(0, 10);
  $("#formSub").textContent = `Last ${form.length} races`;
  $("#formGrid").innerHTML = form.map(r => {
    const cls = r.pos === 1 ? "win" : r.rp > 0 ? "gain" : r.rp < 0 ? "loss" : "";
    return `<div class="chip ${cls}" title="${r.track}: ${r.rp > 0 ? "+" : ""}${r.rp} RP">P${r.pos}</div>`;
  }).join("");
}

function renderFeatured(s){
  $("#featured").innerHTML = `
    <div class="panel-head"><h2>Featured series</h2></div>
    <div class="media"><img src="${s.image}" alt="${s.name} cars on track"></div>
    <div class="featured-foot">
      <div><h3>${s.name}</h3><p>${s.blurb}</p></div>
      <a class="btn btn-sm btn-red" href="#series">Join now ${arrow}</a>
    </div>`;
}

function renderNextRace(r){
  const el = $("#nextRace");
  el.innerHTML = `
    <div class="panel-head"><h2>Next race</h2><span class="countdown" id="countdown">--:--:--</span></div>
    <div class="media"><img src="${r.image}" alt="${r.track}"></div>
    <div class="panel-body" style="padding-top:0">
      <div class="next-title">${r.name}</div>
      <div class="next-body">
        <ul class="facts">
          <li>${svg("cal")}<span>${localStart(Date.parse(r.start))}</span></li>
          <li>${svg("pin")}<span>${r.track}</span></li>
          <li>${svg("car")}<span>${r.car}</span></li>
          <li>${svg("people")}<span id="driverCount">${r.registered} / ${r.capacity} drivers</span></li>
        </ul>
        <button class="btn btn-md ${r.joined ? "btn-done" : "btn-red"}" id="joinBtn">${r.joined ? "Registered" : "Join race " + arrow}</button>
      </div>
    </div>`;

  $("#joinBtn").addEventListener("click", async () => {
    if (r.joined) return;
    const btn = $("#joinBtn");
    btn.disabled = true;
    try {
      const { race } = await GridlineAPI.joinRace(r.id);
      Object.assign(r, race);
      btn.className = "btn btn-md btn-done";
      btn.textContent = "Registered";
      $("#driverCount").textContent = `${r.registered} / ${r.capacity} drivers`;
      toast(`Registered for ${r.name} at ${r.track}.`);
    } catch (err) {
      btn.disabled = false;
      toast(err.message, true);
    }
  });

  startCountdown(Date.parse(r.start));
}

// Race times are shown in the viewer's own time zone
function localStart(ms){
  const d = new Date(ms), today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  const time = d.toLocaleTimeString([], {hour:"numeric", minute:"2-digit", timeZoneName:"short"});
  if (d.toDateString() === today.toDateString()) return (d.getHours() >= 17 ? "Tonight, " : "Today, ") + time;
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow, " + time;
  return d.toLocaleDateString([], {weekday:"short", day:"numeric", month:"short"}) + ", " + time;
}

let countdownTimer;
function startCountdown(target){
  clearInterval(countdownTimer);
  const el = $("#countdown");
  const tick = () => {
    const s = Math.max(0, Math.round((target - Date.now()) / 1000));
    if (s === 0){
      el.textContent = "Live now"; el.classList.add("live"); clearInterval(countdownTimer);
      // once it's started, load the following race after a minute
      setTimeout(() => GridlineAPI.getHome().then(d => renderNextRace(d.nextRace)).catch(() => {}), 60000);
      return;
    }
    const p = n => String(n).padStart(2, "0");
    el.textContent = `${p(Math.floor(s/3600))}:${p(Math.floor(s%3600/60))}:${p(s%60)}`;
  };
  tick(); countdownTimer = setInterval(tick, 1000);
}

function renderRaces(races){
  $("#racesBody").innerHTML = races.slice(0, 5).map(r => {
    const cls = r.rp > 0 ? "plus" : r.rp < 0 ? "minus" : "flat";
    return `<tr><td class="pos">P${r.pos}</td><td>${fmtDate(r.date)}</td><td>${r.series}</td><td>${r.track}</td>
      <td class="num ${cls}">${r.rp > 0 ? "+" : ""}${r.rp}</td></tr>`;
  }).join("");
}

function renderSeason(s, tier){
  const pct = s.racesCompleted / s.racesTotal * 100;
  $("#season").innerHTML = `
    <div class="panel-head"><h2>Season progress</h2></div>
    <div class="panel-body">
      <div class="season-name">${s.name}</div>
      <div class="season-row" style="margin-top:6px"><span>${fmtDate(s.start)} – ${fmtDate(s.end)}</span><small>${s.weeksRemaining} weeks remaining</small></div>
      <div class="bar green" style="margin:12px 0 14px"><span style="width:0%" data-w="${pct}%"></span></div>
      <ul class="stats">
        <li><span>Races completed</span><b>${s.racesCompleted} / ${s.racesTotal}</b></li>
        <li><span>Current rank</span><b>${tier.name}</b></li>
        <li><span>Global position</span><b>#${fmtNum(s.globalPosition)}</b></li>
      </ul>
      <a class="btn btn-sm btn-ghost btn-block" href="#rankings">View leaderboards ${arrow}</a>
    </div>`;
}

function renderNews(items){
  $("#newsList").innerHTML = items.map(n => `
    <li><a href="#news">
      <img src="${n.image}" alt="" loading="lazy">
      <div><div class="news-title">${n.title}</div><div class="news-date">${fmtDate(n.date)}</div></div>
    </a></li>`).join("");
}

function renderLadder(tiers, placementRaces, currentId){
  const groups = [...new Set(tiers.map(t => t.group))];
  $("#ladder").innerHTML = groups.map(g => {
    const inGroup = tiers.filter(t => t.group === g);
    return `<div class="ladder-group">${inGroup.map(t => `
      <div class="tier ${t.id === currentId ? "current" : ""} ${g === "grand" || g === "unranked" ? "big" : ""}"
           title="${t.minRP === null ? `Complete ${placementRaces} placement races` : `${fmtNum(t.minRP)}+ RP`}">
        ${badgeSVG(t)}<span>${t.name}</span>
      </div>`).join("")}</div>`;
  }).join("");
  // centre the driver's tier in the strip (horizontal only, never scrolls the page)
  const track = $("#ladder"), cur = track.querySelector(".tier.current");
  if (cur) track.scrollLeft = cur.offsetLeft - track.offsetLeft - track.clientWidth / 2 + cur.clientWidth / 2;
}

/* Fill progress bars after first paint so they animate once */
function animateBars(){
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.querySelectorAll(".bar > span[data-w]").forEach(s => s.style.width = s.dataset.w)));
}

/* =====================================================================
   4. ROUTER + SHELL BEHAVIOUR
   ===================================================================== */
function route(){
  const id = (location.hash || "#home").slice(1);
  const r = ROUTES.find(x => x.id === id) || ROUTES[0];
  document.querySelectorAll("#nav a").forEach(a => {
    if (a.dataset.route === r.id) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current");
  });
  const home = r.id === "home";
  $("#view-home").hidden = !home;
  $("#view-other").hidden = home;
  if (!home){
    $("#phTitle").textContent = r.label;
    $("#phText").textContent = r.blurb + " This page hasn't been built yet.";
  }
  closeMenu();
  window.scrollTo(0, 0);
}

function openMenu(){ $("#sidebar").classList.add("open"); $("#scrim").classList.add("show"); }
function closeMenu(){ $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("show"); }

let toastTimer;
function toast(msg, isError){
  const t = $("#toast");
  t.textContent = msg;
  t.style.borderLeftColor = isError ? "var(--red)" : "var(--green)";
  t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}

/* =====================================================================
   5. BOOT
   ===================================================================== */
async function init(){
  renderNav();
  $("#menuBtn").addEventListener("click", openMenu);
  $("#scrim").addEventListener("click", closeMenu);
  $("#bellBtn").addEventListener("click", () => toast("Notifications panel is coming soon."));
  window.addEventListener("hashchange", route);
  route();

  try {
    const [data, ranks] = await Promise.all([GridlineAPI.getHome(), GridlineAPI.getRanks()]);
    const { driver, rank } = data;

    renderUser(driver, rank.tier);
    renderRank(driver, rank, data.recentRaces);
    renderFeatured(data.featuredSeries);
    renderNextRace(data.nextRace);
    renderRaces(data.recentRaces);
    renderSeason(data.season, rank.tier);
    renderNews(data.news);
    renderLadder(ranks.tiers, ranks.placementRaces, rank.tier.id);
    animateBars();
  } catch (err) {
    console.error(err);
    toast("Couldn't load your dashboard: " + err.message, true);
  }
}
init();