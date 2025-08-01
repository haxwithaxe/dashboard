const helpText = `
FIXME Write something helpful!
`
// Load from value in config.js
window.dashboard = Config.create(userSettings);

// Reload on refresh button click.
document.getElementById("refresh-button").querySelector("a").onclick = (() => {
  window.location.reload();
  dashboard.tiles.start();
});
// Back out of all alternate views on back button click.
document.getElementById("back-button").querySelector("a").onclick = ((event) => {
  dashboard.menu.defocus();
  dashboard.menu.hide();
  dashboard.tiles.defocus();
});
document.getElementById("top-bar-back-button").onclick = ((event) => {
  dashboard.menu.defocus();
  dashboard.menu.hide();
  dashboard.tiles.defocus();
});
// Show help popup on help button click.
document
  .getElementById("help-button")
  .querySelector("a")
  .onclick = (() => {
    dashboard.popup("Help", helpText);
    dashboard.menu.hide();
  });
// Prep update button.
const updateButton = document.getElementById("update-button");
updateButton.querySelector("a").href = projectReleasesUrl;
updateButton.querySelector("a").target = "_blank";
// Reload on window resize.
window.addEventListener("resize", (() => window.location.reload()));
const tickerHeight = dashboard.feeds.length > 0 ? 5 : 0;  // vh
const topBarHeight = 6;  // vh
const dashboardGrid = "auto ".repeat(dashboard.columns);
const tileWidth = 99.6 / dashboard.columns + "vw";
const dashboardHeight = 100 - topBarHeight - tickerHeight;  // vh
const tileHeight = dashboardHeight / dashboard.rows + "vh";
document.documentElement.style.setProperty(
  "--tiles-layout",
  dashboardGrid
);
document.documentElement.style.setProperty(
  "--dashboard-height",
  dashboardHeight
);
document.documentElement.style.setProperty(
  "--tile-height",
  tileHeight
);
document.documentElement.style.setProperty(
  "--tile-width",
  tileWidth
);
document.documentElement.style.setProperty(
  "--top-bar-height",
  topBarHeight
);
// Load Initial Data
dashboard.start();
// Show global menu on menu button click.
document.getElementById("global-menu-icon").onclick = (
  () => dashboard.menu.show()
);
if (dashboard.feeds.length > 0) {
  // Unhide the RSS ticker div.
  const ticker = document.querySelector("#feed-ticker");
  ticker.classList.remove("hidden");
  // Call the function to fetch and display feeds.
  dashboard.feeds.fetch();
  // Add event listeners for pause and resume ticker motion.
  const tickerContainer = document.querySelector("#feeds-container");
  tickerContainer.addEventListener("mouseenter", () => {            
    tickerContainer.style.animationPlayState = "paused";
  });
  tickerContainer.addEventListener("mouseleave", () => {            
    tickerContainer.style.animationPlayState = "running";
  });
}
// Apply wheelzoom to all images including the focused container image.
wheelzoom(document.querySelectorAll("img"));
// Update the top bar every second for the seconds display in the times.
setInterval((() => dashboard.topBar.show()), 1000);

// Run the check when the application starts
checkForUpdates();
