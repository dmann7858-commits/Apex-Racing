/* =====================================================================
   MOCK DATA SOURCE
   Sample data so the app runs end to end before iRacing is connected.
   It has exactly the same functions as iracing.js, so switching over is
   just a matter of setting DATA_SOURCE=iracing on the server.

   Note: registrations are kept in memory, so they reset whenever the
   server restarts (Render's free plan sleeps after 15 minutes idle).
   ===================================================================== */

// Race IDs the demo driver has joined
const joinedRaces = new Set();

const RACE_INTERVAL_HOURS = 2; // GT3 Sprint runs every 2 hours, on the hour (UTC)
const RACE_CAPACITY = 40;

function nextRaceSlot(now = new Date()) {
  const start = new Date(now);
  start.setUTCMinutes(0, 0, 0);
  do {
    start.setUTCHours(start.getUTCHours() + 1);
  } while (start.getUTCHours() % RACE_INTERVAL_HOURS !== 0 || start <= now);
  return start;
}

function raceIdFor(start) {
  return "gt3-sprint-" + start.toISOString().slice(0, 13).replace(/[-T]/g, "");
}

// Same slot always gives the same starting head count
function baseRegistered(start) {
  return 24 + (start.getUTCHours() + start.getUTCDate()) % 12;
}

function getNextRace() {
  const start = nextRaceSlot();
  const id = raceIdFor(start);
  const joined = joinedRaces.has(id);
  return {
    id,
    name: "GT3 Sprint",
    track: "Spa-Francorchamps",
    car: "GT3",
    start: start.toISOString(),
    registered: baseRegistered(start) + (joined ? 1 : 0),
    capacity: RACE_CAPACITY,
    joined,
    image: "/img/nextrace.jpg",
  };
}

async function getDriver() {
  return { id: "demo", name: "DriverOne", tag: "4821", rp: 1842, racesCompleted: 37, notifications: 3 };
}

async function getRecentRaces() {
  // Newest first. rp = Apex RP gained or lost in that race
  return [
    { pos: 4,  date: "2025-05-05", series: "GT3", track: "Monza",             rp: 34 },
    { pos: 7,  date: "2025-05-03", series: "GT3", track: "Nürburgring",       rp: 12 },
    { pos: 2,  date: "2025-04-28", series: "GT3", track: "Spa-Francorchamps", rp: 28 },
    { pos: 11, date: "2025-04-26", series: "GT3", track: "Silverstone",       rp: -6 },
    { pos: 1,  date: "2025-04-23", series: "GT3", track: "Barcelona",         rp: 41 },
    { pos: 6,  date: "2025-04-20", series: "GT3", track: "Imola",             rp: 9  },
    { pos: 3,  date: "2025-04-18", series: "GT3", track: "Road Atlanta",      rp: 22 },
    { pos: 8,  date: "2025-04-15", series: "GT3", track: "Watkins Glen",      rp: -3 },
    { pos: 5,  date: "2025-04-12", series: "GT3", track: "Suzuka",            rp: 0  },
    { pos: 4,  date: "2025-04-09", series: "GT3", track: "Mount Panorama",    rp: 15 },
  ];
}

async function getFeaturedSeries() {
  return { id: "gt3-ranked", name: "GT3 Ranked", blurb: "Close racing. Real competition.", image: "/img/series.jpg" };
}

async function getSeason() {
  return {
    name: "Season 1",
    start: "2025-05-01",
    end: "2025-07-31",
    weeksRemaining: 12,
    racesCompleted: 37,
    racesTotal: 50,
    globalPosition: 2481,
  };
}

async function getNews() {
  return [
    { slug: "season-1",        title: "Season 1 launches May 1st",       date: "2025-04-28", image: "/img/news1.jpg" },
    { slug: "incident-review", title: "Updated incident review process", date: "2025-04-20", image: "/img/news2.jpg" },
    { slug: "conduct",         title: "New driver conduct guidelines",   date: "2025-04-12", image: "/img/news3.jpg" },
    { slug: "gt3-live",        title: "GT3 series now live",             date: "2025-04-01", image: "/img/news4.jpg" },
  ];
}

async function joinRace(raceId) {
  const race = getNextRace();
  if (race.id !== raceId) return { ok: false, status: 404, error: "That race is no longer open. Refresh to see the next one." };
  if (race.joined) return { ok: true, race };
  if (race.registered >= race.capacity) return { ok: false, status: 409, error: "This race is full. Pick another start time in Find Race." };
  joinedRaces.add(raceId);
  return { ok: true, race: getNextRace() };
}

module.exports = {
  name: "mock",
  getDriver,
  getRecentRaces,
  getFeaturedSeries,
  getNextRace: async () => getNextRace(),
  getSeason,
  getNews,
  joinRace,
};
