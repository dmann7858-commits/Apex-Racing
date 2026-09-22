/* =====================================================================
   iRACING DATA SOURCE (placeholder)
   This is where the iRacing Data API gets connected. It must expose the
   same functions as mockData.js so the rest of the app doesn't change.

   Why this lives on the server: your iRacing credentials must never be
   sent to the browser. They are read from environment variables that
   you set in Render's dashboard (never commit them to GitHub).

   iRacing gives you raw race results. Apex RP is YOUR system, so the
   plan is:
     1. Pull a driver's finished races from iRacing.
     2. Work out Apex RP for each race with your own formula.
     3. Store the results in your own database.
     4. Serve the home page from your database, not live from iRacing.

   Check iRacing's current Data API documentation for how to
   authenticate before filling this in, as their login method changes.
   ===================================================================== */

const config = {
  clientId: process.env.IRACING_CLIENT_ID,
  clientSecret: process.env.IRACING_CLIENT_SECRET,
};

function notReady() {
  throw new Error(
    "iRacing data source isn't connected yet. Set DATA_SOURCE=mock, or finish src/services/iracing.js."
  );
}

module.exports = {
  name: "iracing",
  configured: Boolean(config.clientId && config.clientSecret),
  getDriver: async () => notReady(),
  getRecentRaces: async () => notReady(),
  getFeaturedSeries: async () => notReady(),
  getNextRace: async () => notReady(),
  getSeason: async () => notReady(),
  getNews: async () => notReady(),
  joinRace: async () => notReady(),
};
