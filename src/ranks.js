/* =====================================================================
   APEX RANK SYSTEM
   Apex's own ladder, fully independent of iRacing iRating / Safety Rating.
   A driver's tier comes purely from their Apex Ranking Points (RP).
   Change the thresholds here to rebalance the whole app — the front end
   reads this list from /api/ranks, so nothing else needs editing.
   ===================================================================== */

const PLACEMENT_RACES = 5; // races needed before a driver gets a tier

const UNRANKED = { id: "unranked", name: "Unranked", group: "unranked", level: 0, minRP: null };

const RANK_TIERS = [
  { id: "bronze-1",       name: "Bronze 1",       group: "bronze",   level: 1, minRP: 0    },
  { id: "bronze-2",       name: "Bronze 2",       group: "bronze",   level: 2, minRP: 300  },
  { id: "bronze-3",       name: "Bronze 3",       group: "bronze",   level: 3, minRP: 600  },
  { id: "silver-1",       name: "Silver 1",       group: "silver",   level: 1, minRP: 900  },
  { id: "silver-2",       name: "Silver 2",       group: "silver",   level: 2, minRP: 1100 },
  { id: "silver-3",       name: "Silver 3",       group: "silver",   level: 3, minRP: 1300 },
  { id: "gold-1",         name: "Gold 1",         group: "gold",     level: 1, minRP: 1500 },
  { id: "gold-2",         name: "Gold 2",         group: "gold",     level: 2, minRP: 1650 },
  { id: "gold-3",         name: "Gold 3",         group: "gold",     level: 3, minRP: 2000 },
  { id: "platinum-1",     name: "Platinum 1",     group: "platinum", level: 1, minRP: 2200 },
  { id: "platinum-2",     name: "Platinum 2",     group: "platinum", level: 2, minRP: 2400 },
  { id: "platinum-3",     name: "Platinum 3",     group: "platinum", level: 3, minRP: 2600 },
  { id: "diamond-1",      name: "Diamond 1",      group: "diamond",  level: 1, minRP: 2800 },
  { id: "diamond-2",      name: "Diamond 2",      group: "diamond",  level: 2, minRP: 3000 },
  { id: "diamond-3",      name: "Diamond 3",      group: "diamond",  level: 3, minRP: 3200 },
  { id: "diamond-4",      name: "Diamond 4",      group: "diamond",  level: 4, minRP: 3400 },
  { id: "champion",       name: "Champion",       group: "champion", level: 0, minRP: 3700 },
  { id: "grand-champion", name: "Grand Champion", group: "grand",    level: 0, minRP: 4000 },
];

function tierForRP(rp, racesCompleted) {
  if (racesCompleted < PLACEMENT_RACES) return UNRANKED;
  let tier = RANK_TIERS[0];
  for (const t of RANK_TIERS) if (rp >= t.minRP) tier = t;
  return tier;
}

function nextTier(tier) {
  const i = RANK_TIERS.findIndex((t) => t.id === tier.id);
  return i >= 0 && i < RANK_TIERS.length - 1 ? RANK_TIERS[i + 1] : null;
}

/* Everything the "Your rank" card needs, worked out on the server */
function rankSummary(rp, racesCompleted) {
  const tier = tierForRP(rp, racesCompleted);

  if (tier === UNRANKED) {
    const left = PLACEMENT_RACES - racesCompleted;
    return {
      tier,
      next: RANK_TIERS[0],
      progressPct: (racesCompleted / PLACEMENT_RACES) * 100,
      note: `${left} placement race${left === 1 ? "" : "s"} left`,
    };
  }

  const next = nextTier(tier);
  if (!next) return { tier, next: null, progressPct: 100, note: "Top tier reached" };

  const toNext = next.minRP - rp;
  return {
    tier,
    next,
    progressPct: ((rp - tier.minRP) / (next.minRP - tier.minRP)) * 100,
    note: `${toNext.toLocaleString("en-US")} RP to ${next.name}`,
  };
}

module.exports = { PLACEMENT_RACES, UNRANKED, RANK_TIERS, tierForRP, nextTier, rankSummary };
