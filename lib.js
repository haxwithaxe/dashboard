const currentVersion = "v2025.04.02";
const projectReleasesUrl = "https://github.com/haxwithaxe/dashboard/releases/"
const projectLatestReleaseApiUrl = "https://api.github.com/repos/haxwithaxe/dashboard/releases/latest"
const proxyUrl = "https://corsproxy.io/";
const videoExtensions = [".mp4", ".webm", ".ogg", ".ogv"];
const defaultValues = {
  topBar: {
    left: {
      bgColor: null,
      text: null,
      textColor: null,
    },
    center: {
      bgColor: null,
      text: "CALLSIGN - Locator",
      textColor: null,
    },
    right: {
      bgColor: null,
      text: null,
      textColor: null,
    }
  },
  columns: 4,
  rows: 3,
  feed: {
    refreshInterval: "5m",
    titleTextColor: null,
    textColor: null,
    bgColor: null,
    scrollSpeed: 180, // pixels per second
  },
  menu: {
    bgColor: null,
    textColor: null,
    side: "left",
  },
  tile: {
    order: -1,
    fit: "both",
    rotateInterval: "5m",
    refreshInterval: "5m",
    scale: 1,
  },
};


function forEachElementByClassName(className, func) {
  return Array.from(document.getElementsByClassName(className)).forEach(func);
}

function getFeedById(feedId) {
  return dashboard.feeds.find((feed) => feed.id == feedId);
}


function getMenuItemById(menuItemId) {
  return dashboard.menu.find((item) => item.id == menuItemId);
}


function getTileById(tileId) {
  return dashboard.tiles.find((tile) => tile.idEquals(tileId));
}


function refresh(event) {
  console.debug("refresh", event);
  event.preventDefault();
  var targetElement = event.target || event.srcElement;
  if (isFocused()) {
    return;
  }
  getTileById(targetElement.id).refresh();
}


function refreshTileById(tileId) {
  console.debug("imgRefresh: tileId", tileId)
  getTileById(tileId).refresh();
}


function rotate(event) {
  console.debug("rotate", event);
  event.preventDefault();
  const targetElement = event.target || event.srcElement;
  const tile = getTileById(targetElement.id);
  console.debug("rotate: tile", tile);
  tile.rotate();
}


function rotateTileById(tileId) {
  console.debug("imgRotate: tileId", tileId)
  getTileById(tileId).rotate();
}


function startTiles() {
  dashboard.tiles.show();
}


function stopTiles() {
  dashboard.tiles.stop();
}

function createFromTemplate(id) {
  console.debug("createFromTemplate(id)", id);
  const templateElem = document.getElementById(id);
  templateElem.innerHTML = templateElem.innerHTML.replace(/^[ \t\n\r]+/, "").replace(/[ \t\n\r]+$/, "");
  return templateElem.content.cloneNode(true);
}


async function checkForUpdates() {
  const latestVersion = await getLatestVersion();
  if (currentVersion != latestVersion) {
    forEachElementByClassName("update-button", (elem) => () => {
      if (elem.parentNode.querySelector(".help-button").checkVisibility()) {
        elem.style.display = "block";
      }
    });
  } else {
    forEachElementByClassName("update-button", (elem) => elem.style.display = "none");
  }
}


async function checkIfFileExists(url) {
  try {
    const response = await fetch(url, {method: "HEAD", mode: "no-cors"});
    return response.ok;
  } catch (error) {
    console.error("Error checking file:", error);
    return false;
  }
}


// Generate a probably unique ID one way or another
// Arguments:
//   uniquish: Some relatively unique within collection string
function generateId(uniquish) {
  if (self.crypto !== undefined && self.crypto.randomUUID !== undefined) {
    return self.crypto.randomUUID();
  }
  let hash = 0;
  for (const char of uniquish) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0; // Constrain to 32bit integer
  }
  return hash.toString() + randomInt(1000).toString();
}


// Image cache prevention
// Check if the image URL already include parameters, then avoid the random timestamp
function getImageURL(url) {
  return url.includes("?") ? url : url + "?_=" + Date.now();
}


async function getLatestVersion() {
  try {
    const response = await fetch(projectLatestReleaseApiUrl);
    const data = await response.json();
    return data.tag_name;
  } catch (error) {
    console.error("Error fetching the latest version:", error);
    return currentVersion; // Fallback to the current version if there's an error
  }
}


function getVideoType(src) {
  if (src.includes(".mp4")) {
    return "video/mp4";
  }
  if (src.includes(".webm")) {
    return "video/webm";
  }
  if (src.includes(".ogg") || src.includes(".ogv")) {
    return "video/ogg";
  }
  return;
}


function isFocused() {
  const isVisibile = document.getElementById("focused-image").checkVisibility();
  console.debug("isFocused: visibility", isVisibile);
  return isVisibile;
}


// This function shows the larger images when double click to enlarge
function defocusImage(event) {
  console.debug("defocusImage");
  event.preventDefault();
  const focusedImage = document.getElementById("focused-image");
  focusedImage.style.display = "none";
  focusedImage.style.zIndex = -2;
  // Start rotation and refreshes
  startTiles();
}

function focusImageById(tileId) {
  console.debug("focusImageById", tileId);
  const tile = getTileById(tileId);
  const focusedImage = document.getElementById("focused-image");
  const focusedContainer = document.getElementById("focused-container");
  // Stop rotation and refreshes
  window.stop();
  stopTiles();
  focusedImage.style.display = "block";
  focusedImage.style.zIndex = 3;
  focusedImage.src = tile.sources.current.url.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
  focusedImage.ondbclick = defocusImage;
  focusedContainer.oncontextmenu = ((event) => {
    console.debug("focusImageById oncontextmenu start", tileId);
    event.preventDefault();
    rotateTileById(tileId);
    document.getElementById("focused-image").src = getTileById(tileId).sources.current.url
        .replace(/^url\(["']?/, "")
        .replace(/["']?\)$/, "");
  });
  console.debug("focusImageById end", tileId);
}

// This function shows the larger images when double click to enlarge
function focusImage(event) {
  event.preventDefault();
  var targetElement = event.target || event.srcElement;
  console.debug("focusImage", targetElement);
  focusImageById(targetElement.id);
}


function onMenuClick(menuItemId) {
  console.debug("onMenuClick: menuItemId", menuItemId);
  item = getMenuItemById(menuItemId);
  item.onClickCallback()
}


// Parse an interval string and return the equivalent milliseconds
function parseInterval(interval_string) {
  if (interval_string == null) {
    return 0;
  }
  if (Number.isInteger(interval_string)) {
    return interval_string;
  }
  if (Number.isInteger(interval_string)) {
    return Number.parseInteger(interval_string);
  }
  var re = /([0-9.]+)([wdhms])/g;
  var matches = interval_string.toLowerCase().matchAll(re);
  var interval = 0;
  matches.forEach(
    function(match) {
      if (match.length < 3) {
        console.debug("Got a match with less than 3 elements.", match);
        return
      }
      var quant = Number.parseFloat(match[1]);
      var unit = match[2];
      if (unit == "w") {
        interval += quant * 1000 * 60 * 60 * 24 * 7;
      } else if (unit == "d") {
        interval += quant * 1000 * 60 * 60 * 24;
      } else if (unit == "h") {
        interval += quant * 1000 * 60 * 60;
      } else if (unit == "m") {
        interval += quant * 1000 * 60;
      } else if (unit == "s") {
        interval += quant * 1000;
      }
    }
  );
  return interval;
}


function showGlobalError(text) {
  const errorElem = document.getElementById("global-error");
  const message = createFromTemplate("error-message");
  message.innerText = `Error: ${text}`;
  errorElem.appendChild(message);
  errorElem.classList.remove("hidden");
}


function sortCompareOrder(a, b) {
  if (a.order >= 0 && b.order < 0) {
    return -1;
  }
  if (a.order < 0 && b.order >= 0) {
    return 1;
  }
  return a.order - b.order;
}


class TimeSource {

  constructor() {
    this.#now = new Date();
  }

  get now() {
    return new Date(this.#now.valueOf());
  }
    
  // Update the shared Date object if needed.
  update() {
    const newNow = new Date();
    if (newNow.getSeconds() - this.#now.getSeconds() > 0.1) {
      this.#now = newNow;
    }
  }

  #now;
}


const sharedTime = new TimeSource();


class TopBarPart {
  
  // A top bar part
  // Arguments:
  //  id: The element ID of the top bar part.
  //  config:
  //  defaults:
  //  getText (optional): The callback to get the text of the top bar part. 
  constructor(id, config, defaults, getText) {
    this.id = id;
    if (config === undefined) {
      config = {};
    } else if (typeof config.toSpec == "function") {
      config = config.toSpec();
    }
    this.textOverride = config.text !== undefined ? config.text : defaults.text;
    this.textColor = config.textColor !== undefined ? config.textColor : defaults.textColor;
    this.bgColor = config.bgColor !== undefined ? config.bgColor : defaults.bgColor;
    this.getText = getText !== undefined ? getText : function() { return this.textOverride; };
  }

  // Show the TopBar part
  show() {
    const element = document.getElementById(this.id);
    if (this.bgColor != null) {
      element.style.backgroudColor = this.bgColor;
    }
    if (this.textColor != null) {
      element.style.color = this.textColor;
    }
    if (this.textOverride != null) {
      element.innerHTML = this.textOverride;
    } else {
      element.innerHTML = this.getText();
    }
  }
}


class TopBar {

  // Arguments:
  //   config: Top bar config Object
  //   defaults: Default values Object
  constructor(config, defaults) {
    if (config.toSpec !== undefined) {
      config = config.toSpec();
    }
    this.left = new TopBarPart(
      "top-bar-left",
      config.left,
      {bgColor: null, text: null, textColor: null},
      this.getLeftText
    );
    this.center = new TopBarPart(
      "top-bar-center", 
      config.center, 
      {bgColor: null, text: defaults.center.text, textColor: null}, 
      this.getCenterText  // pass undefined so that an override will be passed
    );
    this.right = new TopBarPart(
      "top-bar-right", 
      config.right, 
      {bgColor: null, text: null, textColor: null},
      this.getRightText
    );
  }

  // Default left text callback.
  getLeftText() {
    sharedTime.update();
    const localDate = sharedTime.now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const localTime = sharedTime.now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
    return `${localDate} - ${localTime}`;
  }

  // Default right text callback.
  getRightText() {
    sharedTime.update();
    const utcDate = sharedTime.now.toISOString().slice(0, 10);
    const utcTime = sharedTime.now.toISOString().slice(11, 19) + " UTC";
    return `${utcDate} ${utcTime}`;
  }

  show() {
    this.left.show();
    this.center.show();
    this.right.show();
  }

  toSource(template) {
    if (this.left.text != null && this.left.bgColor != null && this.left.textColor != null) {
      template.querySelector("config-top-bar-left-container").classList.remove("hidden");
    }
    setTemplateValue(template, "config-top-bar-left-text", this.left.text, this.left.text != null);
    setTemplateValue(template, "config-top-bar-left-bgcolor", this.left.bgColor, this.left.bgColor != null);
    setTemplateValue(template, "config-top-bar-left-text-color", this.left.textColor, this.left.textColor != null);

    if (this.center.text != null && this.center.bgColor != null && this.center.textColor != null) {
      template.querySelector("config-top-bar-center-container").classList.remove("hidden");
    }
    setTemplateValue(template, "config-top-bar-center-text", this.center.text, this.center.text != null);
    setTemplateValue(template, "config-top-bar-center-bgcolor", this.center.bgColor, this.center.bgColor != null);
    setTemplateValue(template, "config-top-bar-center-text-color", this.center.textColor, this.center.textColor != null);

    if (this.right.text != null && this.right.bgColor != null && this.right.textColor != null) {
      template.querySelector("config-top-bar-right-container").classList.remove("hidden");
    }
    setTemplateValue(template, "config-top-bar-right-text", this.right.text, this.right.text != null);
    setTemplateValue(template, "config-top-bar-right-bgcolor", this.right.bgColor, this.right.bgColor != null);
    setTemplateValue(template, "config-top-bar-right-text-color", this.right.textColor, this.right.textColor != null);
    
    return template;
  }
}


class Config {

  // Arguments:
  //  config: An Object of config values
  //  defaults: An Object of default config values
  constructor(config, defaults) {
    this.columns = config.columns !== undefined ? config.columns : defaults.columns;
    this.comment = config.comment !== undefined ? config.comment : null;
    this.rows = config.rows !== undefined ? config.rows : defaults.rows;
    this.feedScrollSpeed = config.feedScrollSpeed !== undefined ? config.feedScrollSpeed : defaults.feed.scrollSpeed;
    Object.assign(defaults.feed, {scrollSpeed: this.feedScrollSpeed});
    this.menuLeft = new Menu("user-menu-left", config.menuLeft, defaults.menuLeft);
    this.menuRight = new Menu("user-menu-right", config.menuRight, defaults.menuRight);
    this.feeds = (config.feeds || []).map((feed) => new Feed(feed, defaults.feed));
    this.tiles = new Tiles(config.tiles, defaults.tile);
    this.topBar = new TopBar(config.topBar, defaults.topBar);
  }

  toSpec() {
    return {
      columns: this.columns,
      rows: this.rows,
      feedScrollSpeed: this.feedScrollSpeed,
      menuLeft: this.menuLeft.toSpec(),
      menuRight: this.menuRight.toSpec(),
      feeds: this.feeds.map((feed) => feed.toSpec()),
      tiles: this.tiles.map((tile) => tile.toSpec()),
      topBar: this.topBar,
    };
  }

  toSources() {
    console.debug("Config.toSources: this", this);
    const template = createFromTemplate("configs-container");
    console.debug("Config.toSources: template before rows", template);
    setTemplateValue(template, "config-rows", this.rows);
    console.debug("Config.toSources: template after rows", template);
    setTemplateValue(template, "config-columns", this.columns);
    this.topBar.toSource(template);
    this.menuLeft.toSource(template);
    this.menuRight.toSource(template);
    this.feeds.forEach((feed) => template.querySelector(".config-feeds-container").appendChild(feed.toSource()));
    this.tiles.toSource(template);
    template.id = "container-display";
    return template;
  }

  start() {
    this.topBar.show();
    this.menuLeft.show();
    this.menuRight.show();
    this.tiles.start();
  }
}


class MenuItem {

  constructor(config, menuClass, defaults) {
    // config will always be undefined, null, or an object
    if (config === undefined || config == null) {
      config = {};
    }
    this.order = config.order !== undefined ? config.order : -1;
    this.bgColor = config.bgColor !== undefined ? config.bgColor : defaults.bgColor;
    this.comment = config.comment !== undefined ? config.comment : null;
    this.textColor = config.textColor !== undefined ? config.textColor : defaults.textColor;
    this.text = config.text !== undefined ? config.text : "No Text";
    this.scale = config.scale !== undefined ? config.scale : defaults.scale;
    this.url = config.url !== undefined ? config.url : "#";
    this.menuClass = menuClass;
    // Allow for override
    this.onClickCallback = config.onClickCallback !== undefined ? config.onClickCallback : function() {
      document.getElementById("iframe-container").style.zIndex = 1;
      document.getElementById("full-screen").style.display = "block";
      document.getElementById("full-screen").src = this.url;
      document.getElementById("full-screen").style.transform = `scale(${this.scale})`;
    };
    this.id = generateId(this.text + this.url);
    this.element = createFromTemplate("menu-item");
    this.element.id = this.id;
    this.element.classList(this.menuClass);
    this.element.querySelector("a").classList(this.menuClass);
  }

  toSpec() {
    return {
      bgColor: this.bgColor,
      textColor: this.textColor,
      text: this.text,
      scale: this.scale,
      url: this.url,
    }; 
  }

  show() {
    var link = this.elemet.querySelector("a");
    link.onclick = this.onClickCallback;
    // Create a new div element
    link.innerText = this.text;
    if (this.bgColor != null) {
      link.style.backgroundColor = this.bgColor;
    }
    if (this.textColor != null) {
      link.style.color = this.textColor;
    }
  }

  toSource() {
    const template = createFromTemplate("config-menu-item");
    setTemplateValue(template, "config-menu-item-text", this.text);
    setTemplateValue(template, "config-menu-item-url", this.url)
    setTemplateValue(template, "config-menu-item-bgcolor", this.bgColor, this.bgColor != null);
    setTemplateValue(template, "config-menu-item-color", this.textColor, this.textColor != null);
    return template;
  }
}


class Menu {

  constructor(id, menuItems, defaults) {
    // Preppend the default options to the menu
    this.#menuItemDefaults = defaults;
    this.id = id;
    this.items = [];
    if (Array.isArray(menuItems)) {
      menuItems.forEach((item) => {
        this.items.push(new MenuItem(item, this.id, defaults));
      });
    }
    this.element = document.getElementById(this.id);
  }

  append(itemObj) {
    this.items.append(new MenuItem(itemObj, this.id, this.#menuItemDefaults));
  }

  filter(func) {
    this.items.filter(func);
  }
  
  find(func) {
    return this.items.find(func);
  }

  findIndexById(itemId) {
    if (typeof itemId == "string") {
      return this.items.findIndex(this.get(itemId));
    } else {
      return this.items.findIndex((i) => i.id == itemId.id);
    }
  }

  get(itemId) {
    return this.items.find((item) => item.id == itemId);
  }

  map(func) {
    return this.items.map(func);
  }

  push(item) {
    this.items.push(item);
  }

  pop(item) {
    return this.items.pop(this.findIndexById(item));
  }

  shift(itemObjs) {
    return this.items.shift(itemObjs);
  }

  show() {
    document.getElementById(this.id).childNodes.forEach((child) =>
      document.getElementById(this.id).removeChild(child)
    );
    this.items.sort(sortCompareOrder).forEach((item, _) => item.show());
  }

  toSpec() {
    return this.items.map((item) => item.toSpec());
  }

  toSource(template) {
    this.items.forEach((item) => template.querySelector(`config-${this.id}-container`).appendChild(item.toSource()));
  }

  unshift(itemObjs) {
    this.items.unshift(itemObjs);
  }

  #menuItemDefaults;
}


class Feed {

  constructor(config, defaults) {
    if (config === undefined) {
      config = {};
    } else if (typeof config == "string") {
      config = {url: config};
    } else if (typeof config.toSpec == "function") {
      config = config.toSpec();
    }
    if (config.url === undefined) {
      console.error("Missing 'url' option in the following feed configuration", config);
    }
    this.url = config.url;
    this.comment = config.comment !== undefined ? config.comment : null;
    this.refreshInterval = config.refreshInterval !== undefined ? config.refreshInterval : defaults.refreshInterval;
    this.bgColor = config.bgColor !== undefined ? config.bgColor : defaults.bgtColor;
    this.textColor = config.textColor !== undefined ? config.textColor : defaults.textColor;
    this.titleTextColor = config.titleTextColor !== undefined ? config.titleTextColor : defaults.titleTextColor;
    this.scrollSpeed = config.feedScrollSpeed !== undefined ? config.feedScrollSpeed : defaults.feedScrollSpeed;
    this.id = generateId(this.url);
    this.element = document.createElement("span");
    this.element.id = this.id;
    document.querySelector("#feed-ticker-container").appendChild(this.element);
    this.#refreshTimeoutRef = setInterval((() => this.fetch()), parseInterval(this.refreshInterval));
    this.fetch();
  }

  toSpec() {
    return {
      bgColor: this.bgColor,
      refreshInterval: this.refreshInterval,
      textColor: this.textColor,
      titleTextColor: this.titleTextColor,
      url: this.url,
    }
  }
  
  toSource() {
    const template = createFromTemplate("config-feed-item");
    setTemplateValue(template, "config-feed-item-url", this.url);
    setTemplateValue(template, "config-feed-item-bgcolor", this.bgColor, this.bgColor != null);
    setTemplateValue(template, "config-feed-item-text-color", this.textColor, this.textColor != null);
    setTemplateValue(template, "config-feed-item-refresh-interval", this.refreshInterval);
    setTemplateValue(template, "config-feed-item-title-text-color", this.titleTextColor, this.titleTextColor != null);
    setTemplateValue(template, "config-feed-item-scroll-speed", this.scrollSpeed);
    return template;
  }

  parse(feedXml) {
    const feedElems = []; 
    if (this.bgColor != null) {
      feedElem.backgroundColor = this.bgColor;
    }
    // Automatically detect whether the feed uses "item" or "entry" tags
    let itemTag = "item"; // Default to RSS
    if (feedXml.querySelector("entry")) {
      itemTag = "entry"; // Switch to Atom if "entry" is found
    }
    // DEBUG: document.getElementById("debug").appendChild(feedXml.documentElement);
    const feedTitleText = feedXml.querySelector("channel > title, feed > title")?.textContent || "Unknown Feed";
    const lastUpdated = feedXml.querySelector("channel > lastBuildDate, feed > updated")?.textContent || "Unknown Time";
    const feedItems = feedXml.querySelectorAll(itemTag);
    //console.debug(`Found ${feedItems.length} items in feed: ${this.url}`);
    

    const feedText = [];
    const feedTitle = createFromTemplate("feed-title");
    if (this.titleTextColor != null) {
      feedTitle.style.color = this.titleTextColor;
    }
    feedTitle.textContent = `${feedTitleText} - Last Updated: ${lastUpdated} -`;
    feedElems.push(feedTitle);
    feedItems.forEach((item) => {
      //console.debug("Feed.parse: loop items: item", item)
      // Handle both <link href="..."> and <link>...</link>
      const linkElement = item.querySelector("link");
      let link = "";
      if (linkElement) {
        if (linkElement.getAttribute("href")) {
          // If <link href="...">
          link = linkElement.getAttribute("href");
        } else {
          // If <link>...</link>
          link = linkElement.textContent;
        }
      }
      const feedItem = createFromTemplate("feed-item");
      const feedItemAnchor = feedItem.querySelector("a");
      feedItemAnchor.href = link;
      if (this.textColor != null) {
        feedItemAnchor.color = this.textColor;
      }
      const itemTitle = item.querySelector("title").textContent;
      //console.debug("itemTitle", itemTitle);
      feedItemAnchor.textContent = itemTitle;
      feedElems.push(feedItem);
    });
    var delimElem = createFromTemplate("feed-delim");
    if (this.textColor != null) {
      delimElem.color = this.textColor;
    }
    feedElems.push(delimElem);
    // Update the content for this feed in the array
    this.element.childNodes.forEach((child) => this.element.removeChild(child));
    feedElems.forEach((item) => this.element.appendChild(item));
    // Detect a failure to load all feeds
    //   Do this here because the fetching is asynchronous
    var globalEntries = 0;
    document.getElementById("feed-ticker-container").childNodes.forEach((feed) => {
      globalEntries += feed.childElementCount;
    });
    if (globalEntries < 1) {
      document.getElementById("feed-ticker-error").classList.remove("hidden");
    } else {
      document.getElementById("feed-ticker-error").classList.add("hidden");
    }
    this.updateSpeed();
  }

  updateSpeed() {
    // Calculate the width of the content and the container
    const contentWidth = this.element.scrollWidth;
    const containerWidth = this.element.parentElement.offsetWidth;
    // Calculate the duration based on the content width
    const duration = (contentWidth * 2) / this.scrollSpeed;
    //console.debug("scroll math: contentWidth, dashboard.feedScrollSpeed", contentWidth, this.scrollSpeed);
    // Update the CSS variable for the animation duration
    this.element.style.setProperty("--ticker-duration", `${duration}s`);
  }

  fetch() {
    //console.log(`Fetching feed: ${this.url}`);
    fetch(proxyUrl + "?url=" + encodeURIComponent(this.url))
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        this.parse(xmlDoc);
      }).catch((error) => {
        console.error(`Error fetching feed from ${this.url}:`, error);
      });
  }


  #refreshTimeoutRef;
}


class Source {

  constructor(config, defaults) {
    if (typeof config == "string") {
      config = {url: config};
    }
    if (config.url === undefined) {
      console.error("Missing 'url' option in the following config.", config);
    }
    this.url = config.url;
    this.comment = config.comment !== undefined ? config.comment : null;
    this.id = generateId(this.url);
    this.refreshInterval = config.refreshInterval !== undefined ? config.refreshInterval : defaults.refreshInterval;
    // Time to dwell on the source
    this.rotateInterval = config.rotateInterval !== undefined ? config.rotateInterval : defaults.rotateInterval;
    if (parseInterval(this.rotateInterval) <= parseInterval(this.refreshInterval)) {
      this.refreshInterval = null;
    }
    this.iframe = config.iframe !== undefined ? config.iframe : defaults.iframe;
    // Video mimetype override
    this.mimetype = config.mimetype !== undefined ? config.mimetype : defaults.mimetype;
  }

  toSpec() {
    return {
      url: this.url,
      refreshInterval: this.refreshInterval,
      rotateInterval: this.rotateInterval,
      iframe: this.iframe,
      mimetype: this.mimetype,
    };
  }

  toSource() {
    const template = createFromTemplate("config-tile-source");
    setTemplateValue(template, "config-tile-source-url", this.url);
    setTemplateValue(template, "config-tile-source-refresh-interval", this.refreshInterval, this.refreshInterval != null);
    setTemplateValue(template, "config-tile-source-rotate-interval", this.rotateInterval, this.rotateInterval != null);
    setTemplateValue(template, "config-tile-source-iframe", this.iframe, this.iframe);
    setTemplateValue(template, "config-tile-source-mimetype", this.mimetype, this.mimetype != null);
    return template;
  }
}

function setTemplateValue(template, key, value, unhide) {
  console.debug("setTemplateValue(template, key, value, unhide): computed class", template, key, value, unhide, `.${key}-value`);
  const valueElem = template.querySelector(`.${key}-value`);
  console.debug("setTemplateValue: computed class, template elem", `.${key}-value`, valueElem);
  valueElem.textContent = value;
  if (unhide) {
    if (template.querySelector(`.${key}-container`) != null) {
      template.querySelector(`.${key}-container`).classList.remove("hidden");
    }
    if (valueElem.parent !== undefined) {
      valueElem.parent.classList.remove("hidden");
    }
    template.querySelector(`.${key}-label`).classList.remove("hidden");
    template.querySelector(`.${key}-value`).classList.remove("hidden");
  }
}

class Sources {

  constructor(sources, defaults) {
    this.#sourceDefaults = defaults;
    this.sources = [];
    if (typeof sources == "string") {
      sources = [sources];
    }
    if (Array.isArray(sources)) {
      sources.forEach((source) => {
        this.sources.push(new Source(source, this.#sourceDefaults));
      });
    }
    this.current = this.sources[this.#currentIndex];
  }

  get length() {
    return this.sources.length;
  }

  filter(func) {
    this.sources.filter(func);
  }
  
  find(func) {
    return this.sources.find(func);
  }

  findIndexById(sourceId) {
    if (typeof sourceId == "string") {
      return this.sources.findIndex(this.get(sourceId));
    } else {
      // Assume source is another Source
      return this.sources.findIndex((item) => source.id == sourceId.id);
    }
  }

  get(sourceId) {
    return this.sources.find((source) => source.id == sourceId);
  }

  map(func) {
    return this.sources.map(func);
  }

  next() {
    console.debug("Tile.next", this.#currentIndex, this.sources.length);
    if (this.#currentIndex >= this.sources.length-1) {
      this.#currentIndex = 0;
    } else {
      this.#currentIndex += 1;
    }
    this.current = this.sources[this.#currentIndex];
    return this.current;
  }

  pop(sourceId) {
    return this.sources.pop(this.findIndexById(sourceId));
  }

  push(item) {
    this.sources.push(item);
  }

  shift(sources) {
    return this.sources.shift(sources);
  }

  toSpec() {
    return this.sources.map((source) => source.toSpec());
  }

  toSource(template) {
    const sources = document.createElement("div");
    sources.classList.add("config-tile-sources-container");
    this.sources.forEach((source) => sources.appendChild(source.toSource()));
    template.querySelector(".config-tile-sources-container").replaceWith(sources);
  }

  unshift(sources) {
    this.sources.unshift(sources);
  }

  #currentIndex = 0;
  #sourceDefaults;
}


class Tile {

  constructor(config, defaults) {
    if (config.toSpec !== undefined) {
      config = config.toSpec();
    }
    this.#config = config;
    this.comment = config.comment !== undefined ? config.comment : null;
    this.rotateInterval = config.rotate !== undefined ? config.rotate : defaults.rotateInterval;
    this.refreshInterval = config.refresh !== undefined ? config.refresh : defaults.refreshInterval;

    this.fit = config.fit !== undefined ? config.fit : defaults.fit;
    this.scale = config.scale !== undefined ? config.scale : defaults.scale;
    this.#title = config.title !== undefined ? config.title : defaults.title;

    if (config.sources === undefined || config.sources == null || config.sources == "") {
      console.warn("Missing src option in config", config);
    }
    if (config.sources.length < 1) {
      console.error("Missing URLs in src option in config", config);
    }
    console.debug("Tile.constructor: config", config);
    this.sources = new Sources(config.sources, this.#sourceDefaults());
    this.id = `tile-${generateId(this.sources.current.url)}`;

    this.videoId = "video-" + this.id;
    this.imageId = "image-" + this.id;
    this.iframeId = "iframe-" + this.id;
    this.fragment = this.#populateTemplate();
    this.fragment.id = this.id;
  }

  get element() {
    return document.getElementById(this.id);
  }

  get titleElem() {
    return this.element.querySelector(".tile-title");
  }

  get video() {
    return document.getElementById(this.videoId);
  }

  get videoSource() {
    return this.video.querySelector("source");
  }

  get image() {
    return document.getElementById(this.imageId);
  }

  get iframe() {
    return document.getElementById(this.iframeId);
  }

  idEquals(id) {
    if (this.id == id) {
      return true;
    }
    if (this.imageId == id) {
      return true;
    }
    if (this.iframeId == id) {
      return true;
    }
    if (this.videoId == id) {
      return true;
    }
    return false;
  }

  isFrame() {
    return this.sources.current.iframe;
  }

  isVideo() {
    return videoExtensions.some((ext) => this.sources.current.url.includes(ext));
  }

  show() {
    console.debug("Tile.show: tile", this);
    if (this.isVideo()) {
      console.debug("Tile.show: is video");
      this.showVideo();
    } else if (this.isFrame()) {
      console.debug("Tile.show: is iframe");
      this.showIframe();
    } else {
      // Is image
      console.debug("Tile.show: is image");
      this.showImage();
    }
  }

  refresh() {
    console.debug("Tile.refresh: tile", this);
    this.show();
    this.#clearRefreshTimeout();
    this.#setRefreshTimeout();
  }

  insert() {
    if (this.element == null) {
      const container = document.getElementById("tiles");
      this.fragment.id = this.id;
      this.fragment.ondbclick = rotate;
      this.fragment.oncontextmenu = refresh;
      container.appendChild(this.fragment);
    } else {
      this.element.replaceWith(this.fragment);
      this.element.ondbclick = rotate;
      this.element.oncontextmenu = refresh;
    }
  }

  rotate() {
    console.debug("Tile.rotate: tile", this);
    this.#clearRotateTimeout();
    if (this.sources.length > 1) {
      this.next();
      this.#setRotateTimeout();
    }
    this.refresh();
  }

  showIframe(url) {
    if (url === undefined) {
      url = this.sources.current.url;
    }
    this.iframe.classList.remove("hidden");
    this.iframe.src = url;
    if (this.scale !== null) {
      this.iframe.style.transform = `scale(${this.scale})`;
    }
    this.iframe.style.zIndex = 0;
    this.image.classList.add("hidden");
    this.video.classList.add("hidden");
  }

  showImage(url) {
    if (url === undefined) {
      url = this.sources.current.url;
    }
    console.debug("Tile.showImage: url", url);
    this.image.classList.remove("hidden");
    this.image.src = getImageURL(url);
    this.image.onerror = function () {
      text = "Failed to load image";
      if (url.includes("?")) {
        // Retry without passing variables first to see if fixes the error
        console.log("Trying without caching prevention");
        this.image.src = url.split("?")[0];
      } else {
        el = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="330">
          <g>
            <text style="font-size:34px; line-height:1.25; white-space:pre; fill:#ffaa00; fill-opacity:1; stroke:#ffaa00; stroke-opacity:1;">
              <tspan x="100" y="150">${text}</tspan>
              </text>
              </g>
              </svg>`;
        this.image.src = "data:image/svg+xml;base64," + window.btoa(el);
      }
    };
    //wheelzoom(this.image);
    this.iframe.classList.add("hidden");
    this.video.classList.add("hidden");
  }

  showVideo(url) {
    if (url === undefined) {
      url = this.sources.current.url;
    }
    this.video.classList.remove("hidden");
    this.videoSource.src = getImageURL(url);
    if (this.sources.current.mimetype == null) {
      this.videoSource.type = getVideoType(url);
    } else {
      this.videoSource.type = this.sources.current.mimetype;
    }
    this.iframe.classList.add("hidden");
    this.image.classList.add("hidden");
  }

  start() {
    this.insert();
    this.show();
    this.#setRefreshTimeout();
    this.#setRotateTimeout();
  }

  stop() {
    this.insert()
    this.#clearRefreshTimeout();
    this.#clearRotateTimeout();
  }

  next() {
    this.sources.next();
    return this;
  }

  toSpec() {
    return {
      title: this.title,
      fit: this.fit,
      iframe: this.#config.iframe,
      refresh: this.refreshInterval,
      rotate: this.rotateInterval,
      scale: this.scale,
      sources: this.sources.toSpec(),
    };
  }

  toSource(template) {
    const container = template.querySelector(".config-tiles-container");
    const tileTemplate = createFromTemplate("config-tile");
    setTemplateValue(tileTemplate, "config-tile-title", this.#title, this.#title != null);
    this.sources.toSource(tileTemplate);
    console.debug("Tile.toSource: tileElem", tileTemplate);
    template.querySelector(".config-tiles-container").appendChild(tileTemplate);
  }

  #config;
  #refreshTimeoutRef;
  #rotateTimeoutRef;
  #title;

  #clearRefreshTimeout() {
    if (this.#refreshTimeoutRef !== undefined) {
      clearTimeout(this.#refreshTimeoutRef);
      this.#refreshTimeoutRef = undefined;
    }
  }

  #clearRotateTimeout() {
    if (this.#rotateTimeoutRef !== undefined) {
      clearTimeout(this.#rotateTimeoutRef);
      this.#rotateTimeoutRef = undefined;
    }
  }

  #populateTemplate() {
    const container = createFromTemplate("tile-container");
    console.debug("container", container);
    container.id = this.id;
    const titleElem = container.querySelector(".tile-title");
    titleElem.innerHTML = this.#title;

    const video = container.querySelector("video");
    video.id = this.videoId;

    const image = container.querySelector("img");
    image.id = this.imageId;
    image.oncontextmenu = rotate;  // global function
    image.ondblclick = focusImage;  // global function
    
    const iframe = container.querySelector("iframe");
    iframe.id = this.iframeId;
    return container;
  }

  #setRefreshTimeout() {
    if (this.sources.current.refreshInterval != null && this.sources.current.refreshInterval > 0) {
      this.#refreshTimeoutRef = setInterval(() => refreshTileById(this.id), parseInterval(this.refreshInterval));
    }
  }

  #setRotateTimeout() {
    if (this.sources.current.rotateInterval != null && this.sources.current.rotateInterval > 0) {
      this.#rotateTimeoutRef = setInterval(() => rotateTileById(this.id), parseInterval(this.rotateInterval));
    }
  }

  #sourceDefaults() {
    return {
      iframe: this.#config.iframe !== undefined ? this.#config.iframe : false,
      fit: this.fit,
      mimetype: this.mimetype,
      refreshInterval: this.refreshInterval,
      rotateInterval: this.rotateInterval,
      scale: this.scale,
    };
  }
}

class Tiles {

  constructor(tiles, defaults) {
    this.#tileDefaults = defaults;
    this.tiles = [];
    if (Array.isArray(tiles)) {
      tiles.forEach((tile) => {
        this.tiles.push(new Tile(tile, this.#tileDefaults));
      });
    }
    this.start();
  }

  get element() {
    return document.querySelector("#tiles");
  }

  get length() {
    return this.tiles.length;
  }

  find(func) {
    return this.tiles.find(func);
  }

  getTileById(tileId) {
    return this.tiles.find((tile) => tile.id == tileId);
  }

  findIndexById(tileId) {
    console.debug("Tiles.findIndexById: this", this);
    if (typeof tileId == "string") {
      return this.tiles.findIndex(this.getTileById(tileId));
    } else {
      // Assume tile is another tile
      return this.tiles.findIndex((item) => tile.id == tileId.id);
    }
  }

  map(func) {
    return this.tiles.map(func);
  }

  pop(tileId) {
    return this.tiles.pop(this.findIndexById(tileId));
  }

  push(item) {
    this.tiles.push(item);
  }

  shift(tiles) {
    return this.tiles.shift(tiles);
  }

  show() {
    this.tiles.forEach((tile) => tile.show());
  }

  start() {
    this.tiles.forEach((tile) => {
      document.getElementById("tiles").appendChild(tile.fragment);
      tile.start();
    });
  }

  stop() {
    this.tiles.forEach((tile) => {
      tile.stop();
    });
  }

  toSpec() {
    return this.tiles.map((tile) => tile.toSpec());
  }

  toSource(template) {
    this.tiles.forEach((tile) => tile.toSource(template));
    console.debug("Tiles.toSource: template", template);
  }

  unshift(tiles) {
    this.tiles.unshift(tiles);
  }

  #tileDefaults;
}

