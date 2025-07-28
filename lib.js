const currentVersion = "v2025.04.02";
const projectReleasesUrl = "https://github.com/haxwithaxe/dashboard/releases/"
const projectLatestReleaseApiUrl = "https://api.github.com/repos/haxwithaxe/dashboard/releases/latest"
const proxyUrl = "https://corsproxy.io/";
const videoExtensions = [".mp4", ".webm", ".ogg", ".ogv"];


/* Create a new element from a template.
 *
 * Arguments:
 *   id: The template element ID.
 *
 * Returns:
 *  A clone of the template content.
 */
function createFromTemplate(id) {
  const templateElem = document.getElementById(id);
  // Strip leading and trailing whitespace to avoid extra empty text nodes
  templateElem.innerHTML = templateElem.innerHTML.replace(/^[ \t\n\r]+/, "").replace(/[ \t\n\r]+$/, "");
  return templateElem.content.cloneNode(true);
}

// Check for updates on github.
async function checkForUpdates() {
  const latestVersion = await getLatestVersion();
  if (currentVersion != latestVersion) {
    document.getElementById("update-button").style.display = "block";
  } else {
    document.getElementById("update-button").style.display = "none";
  }
}


/* Generate a probably unique ID one way or another
 *
 * Arguments:
 *   uniquish: Some relatively unique within collection string just in case 
 *     self.crypto isn't available.
 *
 * Returns:
 *   A probably unique string.
 */
function generateId(uniquish) {
  if (self.crypto !== undefined && self.crypto.randomUUID !== undefined) {
    return "id" + self.crypto.randomUUID();
  }
  let hash = 0;
  for (const char of uniquish) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0; // Constrain to 32bit integer
  }
  return "id" + hash.toString() + randomInt(1000).toString();
}


/* Get a function that formats dates like C's strftime.
 *
 * Arguments:
 *   formatStr (string): A string with C strftime style format codes.
 *   timezone (string, optional): IANA time zone string. For example 
 *     "America/New_York" or "Etc/UTC".
 *   locale (string, optional): A locale string. For example "en-US".
 *
 * Returns:
 *   A function that formats the time (Date object) given as the argument.
 */
function getDateFormatter(formatStr, timezone, locale) {
  return ((date) => {
    const parts = getDateParts(date, timezone, locale);
    return (formatStr
      .replace("%Y", parts.year4)
      .replace("%y", parts.year2)
      .replace("%m", parts.month)
      .replace("%e", parts.monthNum)
      .replace("%b", parts.monthNameAbrv)
      .replace("%B", parts.monthName)
      .replace("%A", parts.dayName)
      .replace("%a", parts.dayNameAbrv)
      .replace("%d", parts.day)
      .replace("%e", parts.dayNum)
      .replace("%H", parts.hours)
      .replace("%k", parts.hoursNum)
      .replace("%I", parts.hours12)
      .replace("%l", parts.hours12Num)
      .replace("%M", parts.minutes)
      .replace("%S", parts.seconds)
      .replace("%F", `${parts.year4}-${parts.month}-${parts.day}`)
      .replace("%T", `${parts.hours}:${parts.minutes}:${parts.seconds}`)
      .replace("%R", `${parts.hours12}:${parts.minutes}`)
      .replace("%r", `${parts.hours12}:${parts.minutes}:${parts.seconds}`)
      .replace("%p", parts.amPm)
      .replace("%P", parts.amPm.toLowerCase())
      .replace("%Z", parts.timezone));
  });
}


/* Get the various parts of the date and time.
 *
 * Arguments:
 *   date (Date): A Date object.
 *   timezone (string, optional): IANA time zone string. For example 
 *     "America/New_York" or "Etc/UTC".
 *   locale (string, optional): A locale string. For example "en-US".
 *
 * Returns:
 *   An object with date and time parts as strings.
 */
function getDateParts(date, timezone, locale) {
  const tzDate = new Date(date.toLocaleString(locale, {timeZone: timezone, timeZoneName: "short"}));
  const localeString = ((options, override) => tzDate.toLocaleString(override !== undefined ? override : locale, Object.assign({timeZone: timezone}, options)));
  const parts = {
    year4: localeString({year: "numeric"}),
    year2: localeString({year: "2-digit"}),
    month: localeString({month: "2-digit"}),
    monthNum: localeString({month: "numeric"}),
    monthName: localeString({month: "long"}), 
    monthNameAbrv: localeString({month: "short"}), 
    day: localeString({day: "2-digit"}),
    dayNum: localeString({day: "numeric"}),
    dayName: localeString({weekday: "long"}),
    dayNameAbrv: localeString({weekday: "short"}),
    hours: localeString({hour: "2-digit", hour12: false}),
    hoursNum: localeString({hour: "numeric", hour12: false}),
    hours12: localeString({hour: "2-digit", hour12: true}),
    hours12Num: localeString({hour: "numeric", hour12: true}),
    minutes: localeString({minute: "2-digit"}),
    seconds: localeString({second: "2-digit"}),
    amPm: localeString({hour12: true}).split(" ").slice(-1)[0],
    timezone: localeString({timeZoneName: "short"}, "en-US").slice(-3),
  };
  if (typeof timezone == "string" && timezone.toLowerCase().slice(-3) == "utc") {
    parts.timezone = "UTC";
  }
  return parts;
}
// Get the latest version number of this application.
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

// Hide the focused-container and reset its children.
function hideFocusedContainer() {
  const container = document.getElementById("focused-container");
  container.style.display = "none";
  container.style.zIndex = -2;
  const iframe = document.getElementById("focused-iframe");
  iframe.style.display = "none";
  iframe.style.zIndex = -2;
  const tile = document.getElementById("focused-tile-parent");
  tile.style.display = "none";
  tile.style.zIndex = -2;
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


// Show the focused-container.
function showFocusedContainer() {
  const container = document.getElementById("focused-container");
  container.style.display = "block";
  container.style.zIndex = 2;
}


// Show the focused-container and focused-iframe.
function showFocusedIframe() {
  showFocusedContainer();
  const iframe = document.getElementById("focused-iframe");
  iframe.style.display = "flex";
  iframe.style.zIndex = 2;
  const tile = document.getElementById("focused-tile-parent");
  tile.style.display = "none";
  tile.style.zIndex = -2;
}


// Show the focused-container and focused-tile-parent.
function showFocusedTile() {
  showFocusedContainer();
  iframe = document.getElementById("focused-iframe");
  iframe.style.display = "none";
  iframe.style.zIndex = -2;
  const tile = document.getElementById("focused-tile-parent");
  tile.style.display = "block";
  tile.style.zIndex = 2;
}


/* Show an error message to the user.
 *
 * Arguments:
 *   text: The error text to show the user.
 */
function showGlobalError(text) {
  const errorElem = document.getElementById("global-error");
  const message = createFromTemplate("error-message");
  message.innerText = `Error: ${text}`;
  errorElem.appendChild(message);
  errorElem.classList.remove("hidden");
}

/* Sort items by order.
 *
 * Negative values of `order` are treated like negative indexes.
 *
 * Arguments:
 *   a, b: The items to compare. 
 */
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


// Base class that sort of mimics python's dataclass.
class Item {

  /* Create a new Item
   *
   * Arguments:
   *   spec: The item spec.
   *   defaults (optional): Default values for the new Item.
   */
  static create(spec, defaults) {
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

  // Runs at the end of the `create` method (after `constructor`).
  postConstructor() {
    if (this.id === undefined) {
      this.id = generateId(this.constructor.name);
    }
    this.insert();
  }

  /* Populates an HTML fragment with Item values.
   *
   * Arguments:
   *   fragment: An HTML fragment or element to modify.
   *
   * Returns:
   *   The modified fragment.
   */
  populateTemplate(fragment) {
    return fragment;
  }

  // Insert the Item's element into the DOM.
  insert() {
    if (this.templateId === undefined) {
      // No template required so skip this.
      return;
    }
    this.fragment = createFromTemplate(this.templateId);
    this.fragment.childNodes.forEach((child) => child.id = this.id);
    this.fragment = this.populateTemplate(this.fragment);
    this.setCallbacks(this.fragment);
    if (this.containerElem == null || this.containerElem === undefined) {
      document.getElementById(this.parentContainerId).appendChild(this.fragment);
    } else {
      this.containerElem.replaceWith(this.fragment);
    }
  }

  /* Set various callbacks on an HTML fragment.
   * 
   * Arguments:
   *   fragment: An HTML fragment or element.
   *
   * Returns:
   *   The modified fragment.
   */
  setCallbacks(fragment) {
    return fragment;
  }

  // Returns the outermost element of the Item.
  get containerElem() {
    return document.getElementById(this.id);
  }

  // Generic equality test.
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


// Base class for collections of Items.
class Collection extends Item {

  childClass;  // The class of the child Items.
  childDefaults;  // Default values for the child Items.
  specs = [];  // The input list of child Item specifications.

  static create(spec, defaults) {
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

  // Returns the number of child Items.
  get length() {
    return this.children.length;
  }

  /* Append a child using child specifications
   *
   * Arguments:
   *  childSpec: An Object with specifications for a new child Item.
   */
  append(childSpec) {
    if (childSpec instanceof this.childClass) {
      childSpec = childSpec.toSpec();
    }
    this.children.append(this.childClass.create(childSpec, this.childDefaults));
  }

  /* Filter child Items.
   *
   * Arguments:
   *   func: A function to filter the child Items.
   */
  filter(func) {
    return this.children.filter(func);
  }
 
  /* Find a child Item.
   *
   * Arguments:
   *   func: A function to use to find a child Item.
   */
  find(func) {
    return this.children.find(func);
  }

  /* Find a child element by ID.
   *
   * Arguments:
   *   childId: 
   */
  findIndexById(childId) {
    if (childId instanceof this.childClass) {
      childId = childId.id;
    }
    return this.children.findIndex(this.get(childId));
  }

  // Get a child Item by its ID.
  get(childId) {
    if (childId instanceof this.childClass) {
      childId = childId.id;
    }
    return this.children.find((child) => child.id == childId);
  }

  // Insert the Collection into the DOM.
  insert() {
    document.getElementById(this.id).childNodes.forEach((child) =>
      document.getElementById(this.id).removeChild(child)
    );
    this.children.sort(sortCompareOrder).forEach((child) => child.show());
  }

  // Map the children of the Collection.
  map(func) {
    return this.children.map(func);
  }

  // Push a new child Item onto the Collection.
  push(child) {
    this.children.push(child);
  }

  // Remove a child of the Collection.
  pop(child) {
    if (childId instanceof this.childClass) {
      childId = childId.id;
    }
    return this.children.pop(this.findIndexById(child));
  }

  // Remove children from the Collection.
  shift(children) {
    return this.children.shift(children);
  }

  // Returns an Array of Objects representing the children of the Collection.
  toSpec() {
    return this.children.map((child) => child.toSpec());
  }

  // Add children to the Collection.
  unshift(child) {
    this.children.unshift(child);
  }
}


/* Base class for Collections of URLs.
 *
 * Allows the spec to be a string, a Array of strings or an Array of Objects.
 *
 */
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


/* Dashboard class
 * 
 * Attributes:
 *   columns (Integer): The number of columns in the tile grid. Defaults to 4.
 *   rows (Integer): The number of rows in the tile grid. Defaults to 3.
 *   feedScrollSpeed (Number): The scroll speed of the feed ticker in pixels
 *     per second. Defaults to 180.
 *   menu (Menu): The user defined menu items.
 *   feeds (Feeds): The Collection of feeds.
 *   tiles (Tiles): The Collection of tiles.
 *   topBar (TopBar): The top bar.
 */
class Config extends Item {

  columns = 4;
  rows = 3;
  feedScrollSpeed = 180;
  menu = {};
  feeds = {};
  tiles = {};
  topBar = {};

  postConstructor() {
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

  // Initialize the dashboard.
  start() {
    hideFocusedContainer();
    this.topBar.show();
    this.menu.hide();
    this.tiles.start();
  }
}


/* Individual feed class
 *
 * Attributes:
 *   url (string): RSS or Atom feed URL.
 *   bgColor (HTML color code, optional): Override the feed background color.
 *   refreshInterval (interval, optional): The interval between refreshing the 
 *     feed. Defaults to "1h".
 *   textColor (HTML color code, optional): Override the feed text color.
 *   titleTextColor (HTML color code, optional): Override the feed title text
 *     color.
 */
class Feed extends Item {

  bgColor = null;
  refreshInterval = "1h";
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
    return;  // This has no elements to insert.
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

  // Parse the downloaded feed and display it.
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
  }

  // Asynchronously download the feed.
  fetch() {
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

// Collection of Feed Items.
class Feeds extends UrlCollection {

  childClass = Feed;
  id = "feeds-container";

  fetch() {
    this.children.forEach((child) => child.fetch());
    this.containerElem.style.setProperty("--ticker-duration", `${this._defaults.scrollSpeed}s`);
  }
}


/* Menu item config and display.
 *
 * Attributes:
 *   text (string): The text of the menu button.
 *   bgColor (HTML color code, optional): Override menu button background color.
 *   order (Number, optional): Specify the order to display the button.
 *   scale (Number, optional): CSS transform scale. Defaults to 1.
 *   textColor (HTML color code, optional): Override menu button text color.
 *   url (string, optional): The target URL. Defaults to "#".
 */
class MenuItem extends Item {

  bgColor = null;
  order = -1;
  scale = 1;
  text = "No Text";
  textColor = null;
  url = "#";

  postConstructor() {
    this.parentContainerId = "user-menu-container";
    this.templateId = "user-menu-item";
    this.id = generateId(this.text + this.url);
    super.postConstructor();
  }

  populateTemplate(fragment) {
    const link = fragment.querySelector("a");
    link.textContent = this.text;
    if (this.bgColor != null) {
      link.style.backgroundColor = this.bgColor;
    }
    if (this.textColor != null) {
      link.style.color = this.textColor;
    }
    return fragment;
  }

  focus() {
    showFocusedIframe();
    const iframe = document.getElementById("focused-iframe");
    iframe.style.transform = `scale(${this.scale})`;
    iframe.style.display = "flex";
    iframe.title = this.text;
    iframe.src = this.url;
  }

  setCallbacks(fragment) {
    fragment.getElementById(this.id).onclick = ((event) => {
      event.preventDefault();
      var menuItem = dashboard.menu.get(event.target.id);
      if (menuItem === undefined) {
        menuItem = dashboard.menu.get(event.target.parentElement.id);
      }
      dashboard.menu.focus(menuItem.id);
      dashboard.menu.hide();
    });
    return fragment;
  }

  toSpec() {
    return {
      bgColor: this.bgColor,
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

// A collection of user menu items.
class Menu extends Collection {

  childClass = MenuItem;
  id = "user-menu-container";

  defocus() {
    const iframe = document.getElementById("focused-iframe");
    iframe.src = "about:blank";
    iframe.title = "";
    hideFocusedContainer();
  }

  focus(menuItemId) {
    this.defocus();
    this.get(menuItemId).focus();
  }

  insert() {
    return;  // This has no elements to insert.
  }

  // Show the user menu and global menu.
  show() {
    document.getElementById("menu-container").style.display = "block";
    document.getElementById("global-menu-icon").onclick = (() => this.hide());
    this.children.forEach((child) => child.show());
  }

  // Hide the user menu and global menu.
  hide() {
    document.getElementById("menu-container").style.display = "none";
    document.getElementById("global-menu-icon").onclick = (() => this.show());
  }
}


/* A Tile source.
 *
 * Attributes:
 *   url (string): A URL to display. 
 *   iframe (boolean, optional): If true the source is displayed as an iFrame. 
 *     Defaults to false.
 *   mimetype (string, optional): Override the detected mimetype of the source 
 *     if it is a video.
 *   refreshInterval (interval, optional): The refresh interval for the source.
 *     Defaults to the Tile's refreshInterval or "5m".
 *   rotateInterval (interval, optional): The rotate interval for the source.
 *     Defaults to the Tile's rotateInterval or "5m".
 */
class Source extends Item {

  iframe = false;
  mimetype = null;
  refreshInterval = "5m";
  rotateInterval = "5m";
  url;

  postConstructor() {
    if (this.url === undefined) {
      console.error("Missing 'url' option in the following config.", this.args.config);
    }
    if (parseInterval(this.rotateInterval) <= parseInterval(this.refreshInterval)) {
      this.refreshInterval = null;
    }
    super.postConstructor();
  }

  insert() {
    return;  // This has no elements to insert.
  }

  toSpec() {
    return {
      iframe: this.iframe,
      mimetype: this.mimetype,
      refreshInterval: this.refreshInterval,
      rotateInterval: this.rotateInterval,
      url: this.url,
    };
  }
}


// Collection of Tile sources.
class Sources extends UrlCollection {

  childClass = Source;
  currentIndex = 0;

  // The currently active source.
  get current() {
    return this.children[this.currentIndex];
  }

  insert() {
    return;  // This has no elements to insert.
  }

  // Select the next source and return it.
  next() {
    if (this.currentIndex >= this.children.length-1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex += 1;
    }
    return this.current;
  }
}


/* Dashboard tile config and display.
 * 
 * Attributes:
 *   fit (string, optional): Stretch each source to fit in the tile. Valid 
 *     values if set are "both", "width", "height". Defaults to "width".
 *   iframe (boolean, optional): If true the tile is displayed as an iFrame by
 *     default. Defaults to false.
 *   refreshInterval (interval, optional): The default refreshInterval for the 
 *     tile. Defaults to "5m".
 *   rotateInterval (interval, optional): The default rotateInterval for the 
 *     tile. Defaults to "5m".
 *   scale (Number, optional): The default CSS transform scale for the tile.
 *     Defaults to 1.
 *   title: The title to display over a tile if set.
 */
class Tile extends Item {

  fit = null;
  iframe = false;
  refreshInterval = "5m";
  rotateInterval = "5m";
  scale = 1;
  title = null;

  parentContainerId = "tiles-container";
  templateId = "tile-item";

  /* Create a new Tile.
   *
   * Arguments:
   *   spec (string|Array|Object): The URL of a single source, an Array of URL 
   *     strings, an Array of source configs, or an Object of the tile 
   *     configuration.
   *   defaults: An Object with Tile defaults.
   */
  static create(spec, defaults) {
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

  // The image element.
  get imageElem() {
    return document.getElementById(this.imageId);
  }

  // The iFrame element.
  get iframeElem() {
    return document.getElementById(this.iframeId);
  }

  // The menu container element.
  get menuElem() {
    return document.getElementById(this.menuId);
  }

  // The menu icon element.
  get menuIconElem() {
    return document.getElementById(this.menuIconId);
  }

  // The tile title element.
  get titleElem() {
    return this.containerElem.querySelector(".tile-title");
  }

  // The <video> element.
  get videoElem() {
    return document.getElementById(this.videoId);
  }

  // The <source> element in the <video> element.
  get videoSource() {
    if (this.videoElem.querySelector("source") == null) {
      this.videoElem.appendChild(document.createElement("source"));      
    }
    return this.videoElem.querySelector("source");
  }

  // Get the callback that focuses the tile.
  getFocusCallback() {
    function showFocused(event) {
      event.preventDefault();
      dashboard.tiles.focus(event.target.id);
    }
    return showFocused;
  }

  // Get the callback that refreshes the tile.
  getRefreshCallback() {
    function refresh(event) {
      event.preventDefault();
      const tile = dashboard.tiles.get(event.target.id);
      tile.refresh();
    }
    return refresh;
  }

  // Get the callback that rotates the source of the tile.
  getRotateCallback() {
    function rotate(event) {
      event.preventDefault();
      const tile = dashboard.tiles.get(event.target.id);
      tile.rotate();
    }
    return rotate;
  }

  // Get the callback that shows the tile menu.
  getTileMenuCallback() {
    function showMenu(event) {
      event.preventDefault();
      const tile = dashboard.tiles.get(event.target.id);
      tile.showMenu();
    }
    return showMenu;
  }

  /* Get the tile title.
   *
   * If the current source has its own title that is returned. Otherwise return
   *   the tile's title.
   */
  getTitle() {
    if (this.sources.current.title != null && this.sources.current.title != "" && this.sources.current.title !== undefined) {
      return this.sources.current.title;
    } else if (this.title != null && this.title != "" && this.title !== undefined) {
      return this.title;
    } 
    return null;
  }

  // Hide the tile menu.
  hideMenu() {
    this.menuIconElem.onclick = ((e) => {
      dashboard.tiles.get(e.target.id).showMenu();
    });
    this.menuElem.style.display = "none";
  }

  insertMenu() {
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

  // Test if the given ID goes with the tile.
  idEquals(id) {
    const tileId = `tile${id.split("tile")[1]}`;
    if (this.id == tileId) {
      return true;
    }
    return false;
  }

  // Returns true if the current source is an iFrame.
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
    const iframe = this.fragment.querySelector("iframe");
    iframe.id = this.iframeId;
    const image = this.fragment.querySelector("img");
    image.id = this.imageId;
    const menuIcon = this.fragment.querySelector(".tile-menu-icon");
    menuIcon.onclick = this.getTileMenuCallback();
    menuIcon.id = this.menuIconId;
    const video = this.fragment.querySelector("video");
    video.id = this.videoId;
    return fragment;
  }

  setCallbacks(fragment) {
    fragment.querySelector(".tile-menu-icon").onclick = this.getTileMenuCallback();
  }

  // True if the URL of the current source is probably a video. 
  isVideo() {
    return videoExtensions.some((ext) => this.sources.current.url.includes(ext));
  }

  // Select the next source and return this instance.
  next() {
    this.sources.next();
    return this;
  }

  // Refresh the displayed source.
  refresh() {
    this.show();
    if (!this.isIframe && !this.isVideo) {
      wheelzoom(this.imageElem);
    }
    this.clearRefreshTimeout();
    this.setRefreshTimeout();
  }

  // Switch the displayed source to the next one.
  rotate() {
    this.clearRotateTimeout();
    if (this.sources.length > 1) {
      this.next();
      this.setTitle();
      this.setRotateTimeout();
    }
    this.refresh();
  }

  // Show the appropriate element in the tile.
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

  // Show the URL in an iFrame in the tile.
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

  // Show the image in the URL in the tile.
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
        console.info("Trying without caching prevention");
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

  // Show the tile menu.
  showMenu() {
    // Hide the global menu when the tile menu icon is clicked to reduce
    //   clutter.
    dashboard.menu.hide();
    this.menuIconElem.onclick = ((e) => {
      dashboard.tiles.get(e.target.id).hideMenu();
    });
    this.menuElem.style.display = "grid";
  }

  // Show a video in the URL in the tile.
  showVideo(url) {
    if (url === undefined) {
      url = this.sources.current.url;
    }
    this.videoElem.classList.remove("hidden");
    this.videoSource.remove();  // Remove the source to get it to reload correctly
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

  // Load the tile and set the rotate and refresh timeouts.
  start() {
    this.show();
    this.insertMenu();
    this.setRefreshTimeout();
    this.setRotateTimeout();
  }

  // Clear the tile and unset the rotate and refresh timeouts.
  stop() {
    this.insert();
    this.insertMenu();
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
      refreshInterval: this.refreshInterval,
      rotateInterval: this.rotateInterval,
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
    const interval = parseInterval(this.sources.current.refreshInterval);
    if (interval > 0) {
      this.refreshTimeoutRef = setInterval((() => this.refresh()), parseInterval(interval));
    }
  }

  setRotateTimeout() {
    const interval = parseInterval(this.sources.current.rotateInterval);
    if (interval > 0) {
      this.rotateTimeoutRef = setInterval((() => this.rotate()), interval);
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


/* The focused tile config and display.
 *
 * Attributes:
 *   tile (Tile): The tile to display fullscreen. 
 */
class FocusedTile extends Tile {

  tile;

  parentContainerId = "focused-tile-parent";
  templateId = "focused-tile";

  postConstructor() {
    this.sources = this.tile.sources;
    this.id = `tile-${generateId(this.sources.current.url)}`;
    this.videoId = `video-${this.id}`;
    this.imageId = `image-${this.id}`;
    this.iframeId = `iframe-${this.id}`;
    this.menuId = `menu-${this.id}`;
    this.menuIconId = `menu-icon-${this.id}`;
    this.insert();
    this.insertMenu();
    showFocusedTile();
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

  // Called in superclass Tile.
  // Returns a function that defocuses this Item.
  getFocusCallback() {
    function defocus(event) {
      event.preventDefault();
      dashboard.menu.defocus()
      dashboard.tiles.defocus();
    }
    return defocus;
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
  }
}


// Collection of Tile instances.
class Tiles extends Collection {

  childClass = Tile;
  id = "tiles-container";

  postConstructor() {
    this.focused = null;
    super.postConstructor();
  }

  // Focus the tile corresponding to tileId.
  focus(tileId) {
    window.stop();
    dashboard.tiles.stop();
    showFocusedTile();
    this.focused = FocusedTile.create({tile: this.get(tileId)});
    this.focused.show();
  }

  // Defocus the focused tile.
  defocus() {
    hideFocusedContainer();
    if (this.focused != null) {
      this.focused.hide();
    }
    this.start();
  }

  get(tileId) {
    // Tiles can match the IDs of any of their elements so this had to be
    //   reimplemented with idEquals().
    if (tileId instanceof this.childClass) {
      tileId = tileId.id;
    }
    if (this.focused != null && this.focused.idEquals(tileId)) {
      return this.focused;
    }
    return this.children.find((child) => child.idEquals(tileId));
  }

  insert() {
    return; // No container to insert.
  }

  // Show all tiles.
  show() {
    this.children.forEach((tile) => tile.show());
  }

  // Start all tiles.
  start() {
    this.children.forEach((tile) => tile.start());
  }

  // Stop all tiles.
  stop() {
    this.children.forEach((tile) => tile.stop());
  }

  toSpec() {
    return this.children.map((tile) => tile.toSpec());
  }
}


/* Top bar part base class.
 *
 * Attributes:
 *   text (string): The text to display in the top bar part.
 *   textColor (HTML color code): Override the text color.
 *   bgColor (HTML color code): Override the background color.
 */
class TopBarPart extends Item {

  text = null;
  textColor = null;
  bgColor = null;
  dateFormat = null;
  dateFormatLocale;
  dateFormatTimeZone;

  _dateFormatter;

  postConstructor() {
    if (typeof this.dateFormat != "string") {
      return;
    }
    if (this.dateFormat.toLowerCase() == "iso") {
      this._dateFormatter = ((date) => date.toISOString());
    } else {
      this._dateFormatter = getDateFormatter(this.dateFormat, this.dateFormatTimeZone, this.dateFormatLocale);
    }
  }

  insert() {
    return;
  }

  // Returns the text to display in the top bar part.
  getText() {
    if (this._dateFormatter === undefined) {
      return this.text;
    }
    return this._dateFormatter(new Date());
  }

  // Show the TopBar part.
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


// The left top bar config and display.
class TopBarLeft extends TopBarPart {

  text = null;
  textColor = null;
  bgColor = null;

  id = "top-bar-left"; 
  dateFormat = "%A, %B %d - %H:%M:%S %Z"
}


// The center top bar config and display.
class TopBarCenter extends TopBarPart {

  text = "CALLSIGN - Locator";
  textColor = null;
  bgColor = null;

  id = "top-bar-center"; 
}


// The right top bar config and display.
class TopBarRight extends TopBarPart {

  text = null;
  textColor = null;
  bgColor = null;

  id = "top-bar-right"; 
  dateFormat = "%Y-%m-%d - %H:%M:%S %Z";
  dateFormatTimeZone = "Etc/UTC";
}

/* Top bar configuration and display.
 *
 * Attributes:
 *   left (TopBarLeft): The left top bar part.
 *   center (TopBarCenter): The center top bar part.
 *   right (TopBarRight): The right top bar part.
 */
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
