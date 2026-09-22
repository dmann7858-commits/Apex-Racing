const express = require("express");
const { RANK_TIERS, UNRANKED, PLACEMENT_RACES, rankSummary } = require("../ranks");

/* Pick the data source from the DATA_SOURCE environment variable */
const source =
  process.env.DATA_SOURCE === "iracing"
    ? require("../services/iracing")
    : require("../services/mockData");

const router = express.Router();

/* Health check — Render pings this to know the server is up */
router.get("/health", (req, res) => {
  res.json({ ok: true, dataSource: source.name, time: new Date().toISOString() });
});

/* The rank ladder shown along the bottom of every page */
router.get("/ranks", (req, res) => {
  res.json({ placementRaces: PLACEMENT_RACES, tiers: [UNRANKED, ...RANK_TIERS] });
});

/* Everything the home page needs, in one request */
router.get("/home", async (req, res, next) => {
  try {
    const [driver, recentRaces, featuredSeries, nextRace, season, news] = await Promise.all([
      source.getDriver(),
      source.getRecentRaces(),
      source.getFeaturedSeries(),
      source.getNextRace(),
      source.getSeason(),
      source.getNews(),
    ]);

    res.json({
      driver,
      rank: rankSummary(driver.rp, driver.racesCompleted),
      recentRaces,
      featuredSeries,
      nextRace,
      season,
      news,
    });
  } catch (err) {
    next(err);
  }
});

/* Register the driver for a race */
router.post("/races/:id/join", async (req, res, next) => {
  try {
    const result = await source.joinRace(req.params.id);
    if (!result.ok) return res.status(result.status || 400).json({ error: result.error });
    res.json({ race: result.race });
  } catch (err) {
    next(err);
  }
});

/* Unknown API route */
router.use((req, res) => res.status(404).json({ error: "No API route at " + req.originalUrl }));

module.exports = router;
