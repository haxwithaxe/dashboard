
// Load from config.js
window.dashboard = new Config(userSettings, defaultValues);

// Configurable grid layout logic. Defaults to standard 4 columns by 3 rows if values are missing in config.js file.
document.getElementById("focused-image").ondbclick = defocusImage;
console.debug("wtf focused-image", document.getElementById("focused-image"), defocusImage);
document.getElementById("focused-image").oncontextmenu = rotate;
forEachElementByClassName("back-button", (button) => {
  button.querySelector("a").onclick = function(event) {
    defocusImage(event);
    document.getElementById("full-screen").src = "about:blank";
    document.getElementById("iframe-container").style.zIndex = -2;
    document.getElementById("iframe-container").style.backgroundColor = "black";
    document.getElementById("full-screen").style.display = "none";
    startTiles();
  };
});
forEachElementByClassName("refresh-button", (button) => {
  button.querySelector("a").onclick = function() {
    window.location.reload();
    startTiles();
  };
});
forEachElementByClassName("help-button", (button) => {
  button.querySelector("a").onclick = function() {
    alert(
`Double click on an image to expand to full screen.
Double click again to close full screen view.
Right click on an image to display the next one.
Images rotates every 30 seconds automatically by default.`
    );
  };
});
forEachElementByClassName("sources-button", (button) => {
  button.querySelector("a").onclick = function() {
    const configContainer = document.getElementById("config-display");
    configContainer.replaceWith(dashboard.toSources());
    document.getElementById("overlay").style.display = "block";
  };
});
forEachElementByClassName("update-button", (button) => {
  button.querySelector("a").href = projectReleasesUrl;
  button.querySelector("a").target = "_blank";
});
forEachElementByClassName("close-button", (button) => {
  button.onclick = (() => document.getElementById("overlay").style.display = "none");
});
window.addEventListener("resize", function () {
  window.location.reload();
});


// Load Initial Data
dashboard.start();

var layoutGrid = "auto ".repeat(dashboard.columns);
var layoutWidth = 99.6 / dashboard.columns + "vw";
var layoutHeight = 93 / dashboard.rows + "vh";
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
  dashboard.feeds.forEach((feed) => feed.fetch());
  // Add event listeners for pause and resume functionality
  const tickerContainer = document.querySelector("#feed-ticker-container");
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
