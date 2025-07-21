
// Load from config.js
window.dashboard = Config.create(userSettings);

// Configurable grid layout logic. Defaults to standard 4 columns by 3 rows if values are missing in config.js file.
document.getElementById("focused-container").addEventListener("dbclick", (event) => {
  console.debug("focused-image.ondbclick: event", event);
  defocusImage(event);
  document.getElementById("full-screen").src = "about:blank";
  document.getElementById("iframe-container").style.zIndex = -2;
  document.getElementById("iframe-container").style.backgroundColor = "black";
  document.getElementById("full-screen").style.display = "none";
  startTiles();
});
document.getElementById("refresh-button").querySelector("a").onclick = (() => {
  window.location.reload();
  startTiles();
});
document.getElementById("back-button").querySelector("a").onclick = ((event) => {
  defocusImage(event);
  document.getelementbyid("full-screen").src = "about:blank";
  document.getelementbyid("iframe-container").style.zindex = -2;
  document.getelementbyid("iframe-container").style.backgroundcolor = "black";
  document.getelementbyid("full-screen").style.display = "none";
  starttiles();
});
document.getElementById("help-button").querySelector("a").onclick = (() => dashboard.popup(helpText));
document.getElementById("sources-button").querySelector("a").onclick = (() => {
  document.getElementById("overlay").style.display = "block";
});

const updateButton = document.getElementById("update-button");
updateButton.querySelector("a").href = projectReleasesUrl;
updateButton.querySelector("a").target = "_blank";


window.addEventListener("resize", function () {
  window.location.reload();
});


// Load Initial Data
dashboard.start();

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
  // Unhide the RSS ticker div
  const ticker = document.querySelector("#feed-ticker");
  ticker.classList.remove("hidden");
  // Call the function to fetch and display RSS feeds
  dashboard.feeds.fetch();
  // Add event listeners for pause and resume functionality
  const tickerContainer = document.querySelector("#feeds-container");
  tickerContainer.addEventListener("mouseenter", () => {            
    tickerContainer.style.animationPlayState = "paused";
  });
  tickerContainer.addEventListener("mouseleave", () => {            
    tickerContainer.style.animationPlayState = "running";
  });
}

wheelzoom(document.querySelectorAll("img"));
// Update every second
setInterval((() => dashboard.topBar.show()), 1000);

// Run the check when the application starts
checkForUpdates();
