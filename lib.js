const currentVersion = "v2025.04.02";
const projectReleasesUrl = "https://github.com/haxwithaxe/dashboard/releases/"
const projectLatestReleaseApiUrl = "https://api.github.com/repos/haxwithaxe/dashboard/releases/latest"
const proxyUrl = "https://corsproxy.io/";
const videoExtensions = [".mp4", ".webm", ".ogg", ".ogv"];


function createFromTemplate(id) {
  const templateElem = document.getElementById(id);
  // Strip leading and trailing whitespace to avoid extra empty text nodes
  templateElem.innerHTML = templateElem.innerHTML.replace(/^[ \t\n\r]+/, "").replace(/[ \t\n\r]+$/, "");
  return templateElem.content.cloneNode(true);
}


async function checkForUpdates() {
  const latestVersion = await getLatestVersion();
  if (currentVersion != latestVersion) {
    document.getElementById("update-button").style.display = "block";
  } else {
    document.getElementById("update-button").style.display = "none";
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


// This function shows the larger images when double click to enlarge
function defocusImage(event) {
  //console.debug("defocusImage");
  event.preventDefault();
  const focusedContainer = document.getElementById("focused-container");
  focusedContainer.removeAttribute("tile");
  focusedContainer.style.display = "none";
  focusedContainer.style.zIndex = -2;
  // Start rotation and refreshes
  startTiles();
}


/* Generate a probably unique ID one way or another
 * Arguments:
 *   uniquish: Some relatively unique within collection string
 */
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


/* Parse an interval string and return the equivalent milliseconds
 *
 * Arguments:
 *   interval_string: An interval composed of a number and optionally a unit.
 *     Units:
 *       <none>: Milliseconds
 *       s: Seconds
 *       m: Minutes
 *       h: Hours
 *       d: Days
 *       w: Weeks
 *
 * Examples:
 *   300000 = 300000 milliseconds (aka 5 minutes)
 *   600s = 600 seconds
 *   20m = 20 minutes
 *   3h = 3 hours
 *   4d = 4 days
 *   2w0.5d11m = 2 weeks, 0.5 days, and 11 minutes (combined)
 */
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


function startTiles() {
  dashboard.tiles.show();
}


function stopTiles() {
  dashboard.tiles.stop();
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


class Item {

  static create(spec, defaults) {
    //console.debug("Item.create(spec, defaults)", spec, defaults);
    var values = {};
    if (defaults !== undefined) {
      values = Object.assign({}, defaults);
    }
    values = Object.assign(Object.assign(values, spec), {_defaults: defaults, _spec: spec});
    const sealed = Object.assign(Object.create(this.prototype), new this(Item));
    const newObj = Object.assign(sealed, values);
    newObj.postConstructor();
    return newObj;
  }

  constructor(values) {
    if (!values instanceof Item) {
      throw new Error(`Use ${this.constructor.name}.create(...) instead of new operator`);
    }
  }

  postConstructor() {
    //console.debug(`${this.constructor.name}.postConstructor: this.id before`, this.id);
    if (this.id === undefined) {
      this.id = generateId(this.constructor.name);
    }
    //console.debug(`${this.constructor.name}.postConstructor: this.id after`, this.id);
    this.insert();
  }

  populateTemplate(fragment) {
    return fragment;
  }

  insert() {
    if (this.templateId === undefined) {
      //console.debug(`${this.constructor.name}.insert: missing templateId`, this);
      return;
    }
    this.fragment = createFromTemplate(this.templateId);
    this.fragment.childNodes.forEach((child) => child.id = this.id);
    this.fragment = this.populateTemplate(this.fragment);
    this.setCallbacks(this.fragment);
    if (this.containerElem == null || this.containerElem === undefined) {
      document.getElementById(this.parentContainerId).appendChild(this.fragment);
    } else {
      console.debug("this.containerElem", this.containerElem, this.fragment);
      this.containerElem.replaceWith(this.fragment);
    }
  }

  setCallbacks(fragment) {
    return fragment;
  }

  get containerElem() {
    const elem = document.getElementById(this.id);
    //console.debug(`${this.constructor.name}.containerElem: this.id`, this.id, elem);
    return elem;
  }

  equals(other) {
    for (let key in this) {
      let a = this[key];
      let b = other[key];
      if (!Object.is(a, b)) {
        if (a == null || b == null) {
          return false;  
        } else if (a instanceof Item && b instanceof Item) {
          if (!a.equals(b)) {
            return false;
          }
        } else if (!Object.is(a.valueOf(), b.valueOf())) {
          return false;
        }
      }
    }
    return true;
  }
}


class Collection extends Item {

  childClass;
  childDefaults;
  specs = [];

  static create(spec, defaults) {
    //console.debug("Collection.create(spec, defaults)", spec, defaults);
    if (Array.isArray(spec)) {
      spec = {specs: spec};
    }
    return super.create(spec, defaults);
  }

  postConstructor() {
    this.children = [];
    super.postConstructor();
    if (this.childDefaults === undefined) {
      this.childDefaults = this;
    }
    this.specs.forEach((childSpec) => {
      this.children.push(this.childClass.create(childSpec, this.childDefaults));
    });
  }

  get length() {
    return this.children.length;
  }

  append(childSpec) {
    if (childSpec instanceof this.childClass) {
      childSpec = childSpec.toSpec();
    }
    this.children.append(this.childClass.create(childSpec, this.childDefaults));
  }

  filter(func) {
    this.children.filter(func);
  }
  
  find(func) {
    return this.children.find(func);
  }

  findIndexById(childId) {
    if (childId instanceof this.childClass) {
      childId = childId.id;
    }
    return this.children.findIndex(this.get(childId));
  }

  get(childId) {
    if (childId instanceof this.childClass) {
      childId = childId.id;
    }
    return this.children.find((child) => child.id == childId);
  }

  insert() {
    document.getElementById(this.id).childNodes.forEach((child) =>
      document.getElementById(this.id).removeChild(child)
    );
    this.children.sort(sortCompareOrder).forEach((child) => child.show());
  }

  map(func) {
    return this.children.map(func);
  }

  push(child) {
    this.children.push(child);
  }

  pop(child) {
    if (childId instanceof this.childClass) {
      childId = childId.id;
    }
    return this.children.pop(this.findIndexById(child));
  }

  shift(child) {
    return this.children.shift(child);
  }

  toSpec() {
    return this.children.map((child) => child.toSpec());
  }

  unshift(child) {
    this.children.unshift(child);
  }
}


class UrlCollection extends Collection {

  static create(spec, defaults) {
    if (typeof spec == "string") {
      spec = {specs: [{url: spec}]};
    } else if (Array.isArray(spec)) {
      spec = {
        specs: spec.map((s) => {
          if (typeof s == "string") {
            return {url: s};
          }
          if (s instanceof this) {
            return s.toSpec();
          }
          return s;
        })
      };
    }
    return super.create(spec, defaults);
  }
}


class Config extends Item {

  columns = 4;
  comment = null;
  defaultMenuSide = "left";
  rows = 3;
  feedScrollSpeed = 180;
  menu = {};
  feeds = {};
  tiles = {};
  topBar = {};

  postConstructor() {
    //console.debug("Config.postConstructor: this", this);
    this.menu = Menu.create(this.menu);
    this.feeds = Feeds.create(this.feeds, {scrollSpeed: this.feedScrollSpeed});
    this.tiles = Tiles.create(this.tiles);
    this.topBar = TopBar.create(this.topBar);
  }

  toSpec() {
    return {
      columns: this.columns,
      defaultMenuSide: this.defaultMenuSide,
      feedScrollSpeed: this.feedScrollSpeed,
      rows: this.rows,
      feeds: this.feeds.toSpec(),
      menu: this.menu.toSpec(),
      tiles: this.tiles.toSpec(),
      topBar: this.topBar.toSpec(),
    };
  }

  start() {
    this.topBar.show();
    this.menu.hide();
    this.tiles.start();
  }
}


class Feed extends Item {

  bgColor = null;
  comment = null;
  refreshInterval = "1h";
  scrollSpeed;
  textColor = null;
  titleTextColor = null;
  url;

  postConstructor() {
    this.parentContainerId = "feeds-container";
    this.templateId = "feed-item";
    if (this.url === undefined) {
      console.error("Missing 'url' option in the following feed configuration", config);
    }
    super.postConstructor();
    this.refreshTimeoutRef = setInterval((() => this.fetch()), parseInterval(this.refreshInterval));
    this.fetch();
  }

  insert() {
    return;
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
    const feedTitleText = feedXml.querySelector("channel > title, feed > title")?.textContent || "Unknown Feed";
    const lastUpdated = feedXml.querySelector("channel > lastBuildDate, feed > updated")?.textContent || "Unknown Time";
    const feedItems = feedXml.querySelectorAll(itemTag);
    const feedText = [];
    const feedTitle = createFromTemplate("feed-title");
    if (this.titleTextColor != null) {
      feedTitle.style.color = this.titleTextColor;
    }
    feedTitle.children[0].textContent = `${feedTitleText} - Last Updated: ${lastUpdated} -`;
    feedElems.push(feedTitle);
    feedItems.forEach((item) => {
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
      feedItemAnchor.textContent = itemTitle;
      feedElems.push(feedItem);
    });
    var delimElem = createFromTemplate("feed-delim");
    if (this.textColor != null) {
      delimElem.color = this.textColor;
    }
    feedElems.push(delimElem);
    this.containerElem.childNodes.forEach((child) => this.containerElem.removeChild(child));
    feedElems.forEach((item) => this.containerElem.appendChild(item));
    // Detect a failure to load all feeds
    //   Do this here because the fetching is asynchronous
    var globalEntries = 0;
    if (document.getElementById(this.parentContainerId).childElementCount < 1) {
      document.getElementById("feed-ticker-error").classList.remove("hidden");
    } else {
      document.getElementById("feed-ticker-error").classList.add("hidden");
    }
    this.updateSpeed();
  }

  updateSpeed() {
    // Calculate the width of the content and the container
    const contentWidth = this.containerElem.scrollWidth;
    const containerWidth = this.containerElem.parentElement.offsetWidth;
    // Calculate the duration based on the content width
    const duration = (contentWidth * 2) / this.scrollSpeed;
    // Update the CSS variable for the animation duration
    this.containerElem.style.setProperty("--ticker-duration", `${duration}s`);
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
}


class Feeds extends UrlCollection {

  childClass = Feed;
  id = "feeds-container";

  fetch() {
    this.children.forEach((child) => child.fetch());
  }
}


class MenuItem extends Item {

  bgColor = null;
  comment = null;
  order = -1;
  scale = 1;
  text = "No Text";
  textColor = null;
  url = "#";

  postConstructor() {
    this.parentContainerId = "user-menu-container";
    this.templateId = "user-menu-item";
    this.id = generateId(this.text + this.url);
    // Allow for override
    if (this.onClickCallback !== undefined) {
      this.onClickCallback = function() {
        document.getElementById("iframe-container").style.zIndex = 1;
        document.getElementById("full-screen").style.display = "block";
        document.getElementById("full-screen").src = this.url;
        document.getElementById("full-screen").style.transform = `scale(${this.scale})`;
      };
    }
    super.postConstructor();
  }

  populateTemplate(fragment) {
    const link = fragment.querySelector("a");
    link.onclick = this.onClickCallback;
    link.textContent = this.text;
    if (this.bgColor != null) {
      link.style.backgroundColor = this.bgColor;
    }
    if (this.textColor != null) {
      link.style.color = this.textColor;
    }
    console.debug("fragment", fragment);
    return fragment;
  }

  toSpec() {
    return {
      bgColor: this.bgColor,
      comment: this.comment,
      order: this.order,
      scale: this.scale,
      text: this.text,
      textColor: this.textColor,
      url: this.url,
    }; 
  }

  show() {
    var link = this.containerElem.querySelector("a");
    link.onclick = this.onClickCallback;
    link.textContent = this.text;
    if (this.bgColor != null) {
      link.style.backgroundColor = this.bgColor;
    }
    if (this.textColor != null) {
      link.style.color = this.textColor;
    }
  }
}


class Menu extends Collection {

  childClass = MenuItem;
  id = "user-menu-container";

  insert() {
    return;
  }

  show() {
    document.getElementById("menu-container").style.display = "block";
    document.getElementById("global-menu-icon").onclick = (() => this.hide());
    this.children.forEach((child) => child.show());
  }

  hide() {
    document.getElementById("menu-container").style.display = "none";
    document.getElementById("global-menu-icon").onclick = (() => this.show());
  }
}


class Source extends Item {

  comment = null;
  iframe = false;
  mimetype = null;
  refreshInterval = "5m";
  rotateInterval = "5m";
  url;

  postConstructor() {
    this.parentContainerId = "tiles-container";
    this.templateId = "source-item";
    if (this.url === undefined) {
      console.error("Missing 'url' option in the following config.", this.args.config);
    }
    if (parseInterval(this.rotateInterval) <= parseInterval(this.refreshInterval)) {
      this.refreshInterval = null;
    }
    super.postConstructor();
  }

  insert() {
    return;
  }

  toSpec() {
    return {
      comment: this.comment,
      iframe: this.iframe,
      mimetype: this.mimetype,
      refreshInterval: this.refreshInterval,
      rotateInterval: this.rotateInterval,
      url: this.url,
    };
  }
}


class Sources extends UrlCollection {

  childClass = Source;
  currentIndex = 0;

  get current() {
    return this.children[this.currentIndex];
  }

  insert() {
    return;
  }

  next() {
    if (this.currentIndex >= this.children.length-1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex += 1;
    }
    return this.current;
  }
}


class Tile extends Item {

  comment = null;
  fit = null;
  iframe = false;
  refreshInterval = "5m";
  rotateInterval = "5m";
  scale = 1;
  title = null;

  static create(spec, defaults) {
    //console.debug("Tile.create: spec", spec);
    if (typeof spec == "string") {
      spec = {sources: [{url: spec}]};
    } else if (Array.isArray(spec)){
      spec = {
        sources: spec.map((s) => {
          if (typeof s == "string") {
            return {url: s};
          }
          if (s instanceof Source) {
            return s.toSpec();
          }
          return s;
        })
      };
    }
    return super.create(spec, defaults);
  }

  postConstructor() {
    this.parentContainerId = "tiles-container";
    this.templateId = "tile-item";
    //console.debug("Tile.postConstructor: this.sources", this.sources);
    if (this.sources === undefined || this.sources == null || this.sources == "") {
      console.warn("Missing src option in config", this._spec);
    }
    if (this.sources.length < 1) {
      console.error("Missing URLs in src option in config", this._spec);
    }
    this.sources = Sources.create(this.sources, this.sourceDefaults());
    this.id = `tile-${generateId(this.sources.current.url)}`;
    this.videoId = `video-${this.id}`;
    this.imageId = `image-${this.id}`;
    this.iframeId = `iframe-${this.id}`;
    this.menuId = `menu-${this.id}`;
    this.menuIconId = `menu-icon-${this.id}`;
    super.postConstructor();
    this.insertMenu();
  }

  get imageElem() {
    return document.getElementById(this.imageId);
  }

  get iframeElem() {
    return document.getElementById(this.iframeId);
  }

  get menuElem() {
    return document.getElementById(this.menuId);
  }

  get menuIconElem() {
    return document.getElementById(this.menuIconId);
  }

  get titleElem() {
    return this.containerElem.querySelector(".tile-title");
  }

  get videoElem() {
    return document.getElementById(this.videoId);
  }

  get videoSource() {
    return this.videoElem.querySelector("source");
  }

  focus() {
    const clone = this.containerElem.cloneNode(true);
    const focusedContainer = document.getElementById("focused-container");
    focusedContainer.appendChild(clone);
    // Stop rotation and refreshes
    window.stop();
    stopTiles();
    focusedContainer.style.display = "block";
    focusedContainer.style.zIndex = 5;  // restore default from dashboard.css
    focusedContainer.oncontextmenu = ((event) => {
      event.preventDefault();
      this.rotate();
    });
  }

  getFocusCallback() {
    function showFocused(event) {
      event.preventDefault();
      const tile = dashboard.tiles.get(event.target.id);
      //console.debug("Tile.showFocusedCallback.showFocused: start: this.id", this.id);
      const focusedContainer = document.getElementById("focused-container");
      focusedContainer.appendChild(tile.containerElem);
      // Stop rotation and refreshes
      window.stop();
      stopTiles();
      focusedContainer.style.display = "block";
      focusedContainer.style.zIndex = 5;  // restore default from dashboard.css
      focusedContainer.oncontextmenu = ((e) => {
        //console.debug("Tile.showFocusedCallback.showFocused.focusedContainer.oncontextmenu: start", this.id);
        e.preventDefault();
        tile.rotate();
      });
    }
    return showFocused;
  }

  getRefreshCallback() {
    function refresh(event) {
      event.preventDefault();
      const tile = dashboard.tiles.get(event.target.id);
      tile.refresh();
    }
    return refresh;
  }

  getRotateCallback() {
    function rotate(event) {
      event.preventDefault();
      const tile = dashboard.tiles.get(event.target.id);
      tile.rotate();
    }
    return rotate;
  }

  getTileMenuCallback() {
    function showMenu(event) {
      event.preventDefault();
      const tile = dashboard.tiles.get(event.target.id);
      tile.showMenu();
    }
    return showMenu;
  }

  getTitle() {
    if (this.sources.current.title != null && this.sources.current.title != "" && this.sources.current.title !== undefined) {
      return this.sources.current.title;
    } else if (this.title != null && this.title != "" && this.title !== undefined) {
      return this.title;
    } 
    return null;
  }

  hideMenu() {
    this.menuIconElem.onclick = ((e) => {
      dashboard.tiles.get(e.target.id).showMenu();
    });
    this.menuElem.style.display = "none";
  }

  insertMenu() {
    //console.debug("Tile.insertMenu: this", this);
    document.querySelector(`#${this.id}`).querySelector(`.tile-menu`).id = this.menuId;
    const refreshButton = this.menuElem.querySelector(".tile-refresh-button");
    refreshButton.id = `refresh-button-${this.id}`;
    refreshButton.onclick = ((e) => {
      e.preventDefault();
      this.hideMenu();
      this.refresh();
    });
    const rotateButton = this.menuElem.querySelector(".tile-rotate-button");
    rotateButton.id = `rotate-button-${this.id}`;
    rotateButton.onclick = ((e) => {
      e.preventDefault();
      this.hideMenu();
      this.rotate();
    });
    const focusButton = this.menuElem.querySelector(".tile-focus-button");
    focusButton.id = `focus-button-${this.id}`;
    focusButton.onclick = ((e) => {
      e.preventDefault();
      this.hideMenu();
      dashboard.tiles.focus(this.id);
    });
    const cancelButton = this.menuElem.querySelector(".tile-cancel-button");
    cancelButton.id = `cancel-button-${this.id}`;
    cancelButton.onclick = ((e) => {
      e.preventDefault();
      this.hideMenu();
      this.refresh();
    });
    this.hideMenu();
  }

  idEquals(id) {
    const tileId = `tile${id.split("tile")[1]}`;
    //console.debug("tileId", tileId);
    if (this.id == tileId) {
      //console.debug("id == tileId", tileId);
      return true;
    }
    //console.debug("id != any", id);
    return false;
  }

  isFrame() {
    return this.sources.current.iframe;
  }

  populateTemplate(fragment) {
    const title = this.fragment.querySelector(".tile-title");
    if (this.getTitle() == null) {
      title.style.display = "none";
    } else {
      title.style.display = "block";
      title.innerHTML = this.getTitle();
    }
    //console.debug("getTitle, title", this.getTitle(), title);
    const iframe = this.fragment.querySelector("iframe");
    iframe.id = this.iframeId;
    const image = this.fragment.querySelector("img");
    image.id = this.imageId;
    image.oncontextmenu = this.getRotateCallback();  // global function
    image.ondblclick = this.getFocusCallback();  // global function
    const menuIcon = this.fragment.querySelector(".tile-menu-icon");
    menuIcon.onclick = this.getTileMenuCallback();
    menuIcon.id = this.menuIconId;
    const video = this.fragment.querySelector("video");
    video.id = this.videoId;
    return fragment;
  }

  setCallbacks(fragment) {
    fragment.ondbclick = this.getRotateCallback();
    fragment.oncontextmenu = this.getTileMenuCallback();
    fragment.querySelector(".tile-menu-icon").onclick = this.getTileMenuCallback();
  }

  isVideo() {
    return videoExtensions.some((ext) => this.sources.current.url.includes(ext));
  }

  next() {
    this.sources.next();
    return this;
  }

  refresh() {
    //console.debug("Tile.refresh: tile", this);
    this.show();
    if (!this.isIframe && !this.isVideo) {
      wheelzoom(this.imageElem);
    }
    this.clearRefreshTimeout();
    this.setRefreshTimeout();
  }

  rotate() {
    //console.debug("Tile.rotate: tile", this);
    this.clearRotateTimeout();
    if (this.sources.length > 1) {
      this.next();
      this.setTitle();
      this.setRotateTimeout();
    }
    this.refresh();
  }

  show() {
    if (this.isVideo()) {
      this.showVideo();
    } else if (this.isFrame()) {
      this.showIframe();
    } else {
      // Is image
      this.showImage();
    }
  }

  showIframe(url) {
    if (url === undefined) {
      url = this.sources.current.url;
    }
    this.iframeElem.classList.remove("hidden");
    this.iframeElem.src = url;
    if (this.scale !== null) {
      this.iframeElem.style.transform = `scale(${this.scale})`;
    }
    this.iframeElem.style.zIndex = 0;
    this.imageElem.classList.add("hidden");
    this.videoElem.classList.add("hidden");
  }

  showImage(url) {
    if (url === undefined) {
      url = this.sources.current.url;
    }
    this.imageElem.classList.remove("hidden");
    // Image cache prevention
    // Check if the image URL already include parameters, then avoid the random timestamp
    this.imageElem.src = url.includes("?") ? url : url + "?_=" + Date.now();
    this.imageElem.onerror = function () {
      text = "Failed to load image";
      if (url.includes("?")) {
        // Retry without passing variables first to see if fixes the error
        console.log("Trying without caching prevention");
        this.imageElem.src = url.split("?")[0];
      } else {
        el = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="330">
          <g>
            <text style="font-size:34px; line-height:1.25; white-space:pre; fill:#ffaa00; fill-opacity:1; stroke:#ffaa00; stroke-opacity:1;">
              <tspan x="100" y="150">${text}</tspan>
              </text>
              </g>
              </svg>`;
        this.imageElem.src = "data:image/svg+xml;base64," + window.btoa(el);
      }
    };
    this.iframeElem.classList.add("hidden");
    this.videoElem.classList.add("hidden");
  }

  showMenu() {
    this.menuIconElem.onclick = ((e) => {
      dashboard.tiles.get(e.target.id).hideMenu();
    });
    this.menuElem.style.display = "grid";
  }

  showVideo(url) {
    if (url === undefined) {
      url = this.sources.current.url;
    }
    this.videoElem.classList.remove("hidden");
    this.videoSource.src = url;
    if (this.sources.current.mimetype == null) {
      if (url.includes(".mp4")) {
        this.videoSource.type = "video/mp4";
      } else if (url.includes(".webm")) {
        this.videoSource.type = "video/webm";
      } else if (url.includes(".ogg") || url.includes(".ogv")) {
        this.videoSource.type = "video/ogg";
      } else {
        console.error("Could not determine mimetype for url", url);
      }
    } else {
      this.videoSource.type = this.sources.current.mimetype;
    }
    this.iframeElem.classList.add("hidden");
    this.imageElem.classList.add("hidden");
  }

  start() {
    this.show();
    this.setRefreshTimeout();
    this.setRotateTimeout();
  }

  stop() {
    this.insert();
    this.clearRefreshTimeout();
    this.clearRotateTimeout();
  }

  setTitle() {
    const title = this.getTitle();
    this.titleElem.innerHTML = title;
    if (title == null) {
      this.titleElem.style.display = "none";
    } else {
      this.titleElem.style.display = "block";
    }
  }

  toSpec() {
    return {
      title: this.title,
      fit: this.fit,
      iframe: this.iframe,
      refresh: this.refreshInterval,
      rotate: this.rotateInterval,
      scale: this.scale,
      sources: this.sources.toSpec(),
    };
  }

  clearRefreshTimeout() {
    if (this.refreshTimeoutRef !== undefined) {
      clearTimeout(this.refreshTimeoutRef);
      this.refreshTimeoutRef = undefined;
    }
  }

  clearRotateTimeout() {
    if (this.rotateTimeoutRef !== undefined) {
      clearTimeout(this.rotateTimeoutRef);
      this.rotateTimeoutRef = undefined;
    }
  }

  setRefreshTimeout() {
    if (this.sources.current.refreshInterval != null && this.sources.current.refreshInterval > 0) {
      this.refreshTimeoutRef = setInterval(() => this.getRefreshCallback(), parseInterval(this.refreshInterval));
    }
  }

  setRotateTimeout() {
    if (this.sources.current.rotateInterval != null && this.sources.current.rotateInterval > 0) {
      this.rotateTimeoutRef = setInterval(() => this.getRotateCallback(), parseInterval(this.rotateInterval));
    }
  }

  sourceDefaults() {
    return {
      fit: this.fit,
      iframe: this.iframe,
      mimetype: this.mimetype,
      refreshInterval: this.refreshInterval,
      rotateInterval: this.rotateInterval,
      scale: this.scale,
    };
  }
}

class FocusedTile extends Tile {

  tile;

  postConstructor() {
    this.parentContainerId = "focused-container";
    this.templateId = "focused-tile";
    this.sources = this.tile.sources;
    this.id = `tile-${generateId(this.sources.current.url)}`;
    this.videoId = `video-${this.id}`;
    this.imageId = `image-${this.id}`;
    this.iframeId = `iframe-${this.id}`;
    this.menuId = `menu-${this.id}`;
    this.menuIconId = `menu-icon-${this.id}`;
    this.insert();
    this.insertMenu();
    document.getElementById(this.parentContainerId).style.display = "block";
    super.show();
  }

  hideMenu() {
    this.menuIconElem.onclick = ((e) => {
      dashboard.tiles.focused.showMenu();
    });
    this.menuElem.style.display = "none";
  }

  insertMenu() {
    document.querySelector(`#${this.id}`).querySelector(".tile-menu").id = this.menuId;
    const refreshButton = this.menuElem.querySelector(".tile-refresh-button");
    refreshButton.id = `refresh-button-${this.id}`;
    refreshButton.onclick = ((e) => {
      e.preventDefault();
      this.hideMenu();
      this.refresh();
    });
    const rotateButton = this.menuElem.querySelector(".tile-rotate-button");
    rotateButton.id = `rotate-button-${this.id}`;
    rotateButton.onclick = ((e) => {
      e.preventDefault();
      this.hideMenu();
      this.rotate();
    });
    const focusButton = this.menuElem.querySelector(".tile-focus-button");
    console.debug("this.menuElem", this.menuElem, focusButton);
    focusButton.id = `focus-button-${this.id}`;
    focusButton.onclick = ((e) => {
      e.preventDefault();
      this.hideMenu();
      dashboard.tiles.defocus();
    });
    const cancelButton = this.menuElem.querySelector(".tile-cancel-button");
    cancelButton.id = `cancel-button-${this.id}`;
    cancelButton.onclick = ((e) => {
      e.preventDefault();
      this.hideMenu();
      this.refresh();
    });
    this.hideMenu();
  }

  getRefreshCallback() {
    function refresh(event) {
      event.preventDefault();
      dashboard.tiles.focused.refresh();
    }
    return refresh;
  }

  getRotateCallback() {
    function rotate(event) {
      event.preventDefault();
      dashboard.tiles.focused.rotate();
    }
    return rotate;
  }

  getTileMenuCallback() {
    function showMenu(event) {
      event.preventDefault();
      dashboard.tiles.focused.showMenu();
    }
    return showMenu;
  }

  hide() {
    this.containerElem.remove();
    document.getElementById(this.parentContainerId).style.display = "none";
  }
}


class Tiles extends Collection {

  childClass = Tile;

  postConstructor() {
    this.id = "tiles-container";
    this.focused = null;
    super.postConstructor();
  }

  focus(tileId) {
    this.focused = FocusedTile.create({tile: this.get(tileId)});
    this.focused.show();
  }

  defocus() {
    if (this.focused != null) {
      this.focused.hide();
    }
  }

  get(tileId) {
    if (tileId instanceof this.childClass) {
      tileId = tileId.id;
    }
    const child = this.children.find((child) => child.idEquals(tileId));
    //console.debug("Tiles.get(tileId): child", tileId, child);
    return child;
  }

  insert() {
    return;
  }

  show() {
    this.children.forEach((tile) => tile.show());
  }

  start() {
    this.children.forEach((tile) => tile.start());
  }

  stop() {
    this.children.forEach((tile) => tile.stop());
  }

  toSpec() {
    return this.children.map((tile) => tile.toSpec());
  }
}


class TopBarPart extends Item {

  text = null;
  textColor = null;
  bgColor = null;

  insert() {
    return;
  }

  getText() {
    return this.text;
  }

  // Show the TopBar part
  show() {
    if (this.bgColor != null) {
      this.containerElem.style.backgroudColor = this.bgColor;
    }
    if (this.textColor != null) {
      this.containerElem.style.color = this.textColor;
    }
    if (this.text != null) {
      this.containerElem.innerHTML = this.text;
    } else {
      this.containerElem.innerHTML = this.getText();
    }
  }
}


class TopBarLeft extends TopBarPart {

  text = null;
  textColor = null;
  bgColor = null;

  id = "top-bar-left"; 

  getText() {
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
}


class TopBarCenter extends TopBarPart {

  text = "CALLSIGN - Locator";
  textColor = null;
  bgColor = null;

  id = "top-bar-center"; 
}


class TopBarRight extends TopBarPart {

  text = null;
  textColor = null;
  bgColor = null;

  id = "top-bar-right"; 

  getText() {
    sharedTime.update();
    const utcDate = sharedTime.now.toISOString().slice(0, 10);
    const utcTime = sharedTime.now.toISOString().slice(11, 19) + " UTC";
    return `${utcDate} ${utcTime}`;
  }
}


class TopBar extends Item {

  left;
  center;
  right;
  
  id = "top-bar";

  postConstructor() {
    this.left = TopBarLeft.create(this.left);
    this.center = TopBarCenter.create(this.center);
    this.right = TopBarRight.create(this.right);
  }

  show() {
    this.left.show();
    this.center.show();
    this.right.show();
  }
}
