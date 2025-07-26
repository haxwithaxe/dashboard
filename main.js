
// Load from value in config.js
window.dashboard = Config.create(userSettings);

// Reload on refresh button click.
document.getElementById("refresh-button").querySelector("a").onclick = (() => {
  window.location.reload();
  dashboard.tiles.start();
});
// Back out of all alternate views on back button click.
document.getElementById("back-button").querySelector("a").onclick = ((event) => {
  document.getelementbyid("full-screen").src = "about:blank";
  document.getelementbyid("iframe-container").style.zindex = -2;
  document.getelementbyid("iframe-container").style.backgroundcolor = "black";
  document.getelementbyid("full-screen").style.display = "none";
  dashboard.tiles.defocus();
});
// Show help popup on help button click.
// FIXME Implement dashboard.popup().
// FIXME Implement helpText.
document.getElementById("help-button").querySelector("a").onclick = (() => dashboard.popup(helpText));
// Prep update button.
const updateButton = document.getElementById("update-button");
updateButton.querySelector("a").href = projectReleasesUrl;
updateButton.querySelector("a").target = "_blank";
// Reload on window resize.
window.addEventListener("resize", function () {
  window.location.reload();
});
// Load Initial Data
dashboard.start();
// Show global menu on menu button click.
document.getElementById("global-menu-icon").onclick = (() => dashboard.menu.show());

var layoutFeedOffset = dashboard.feeds.length > 0 ? 2 : 0;
var layoutGrid = "auto ".repeat(dashboard.columns);
var layoutWidth = 99.6 / dashboard.columns + "vw";
var layoutHeight = (93 - layoutFeedOffset) / dashboard.rows + "vh";
document.documentElement.style.setProperty(
  "--main-layout",
  layoutGrid
);
document.documentElement.style.setProperty(
  "--main-width",
  layoutWidth
);
document.documentElement.style.setProperty(
  "--main-height",
  layoutHeight
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
