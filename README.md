# Description
***Work In Progress***

Almost done enough. Still need to get the image fit in tile config to work.

This is a dashboard based loosely on [hamdashboard](https://github.com/VA3HDL/hamdashboard). The configuration interface is "simplified" and it has a few more small features.

# Usage
There are a couple good options.

1. Dump the files into a web server's static files root, or just open ``index.html`` directly in your browser.

2. Use the docker image and mount your ``config.js`` in the container. Where the files are pre-dumped into a web server's static files root so you don't have to.

## Docker
```sh
docker run -d -v <path to your config.js>:/usr/share/nginx/html/config.js -p <some free port>:80 ghcr.io/haxwithaxe/dashboard:latest
```

## Docker Compose
```yaml
services:
  dashboard:
    image: ghcr.io/haxwithaxe/dashboard:latest
    volumes:
      - <path to your config.js>:/usr/share/nginx/html/config.js
    ports:
      - <some free port>:80
    restart: unless-stopped
```


# Configuration
Currently the only way to configure this dashboard is editing ``config.js``. The application is expecting an `Object` named `userSettings` with the following keys.

# config.js Options
* `topBar` - An `Object` with the configuration for the 3 sections of the top bar.
* `columns` (integer) - The number of columns in the tile grid.
* `rows` (integer) - The number of rows in the tile grid.
* `feedScrollSpeed` (number, optional) - The ticker scroll speed in pixels per second. Defaults to `180`.
* `feeds` (Array, optional) - A list of feed specifications. See [Feeds](#feeds) for details.
* `menu` (Array, optional) - A list of `Object`s with user menu options. See [Menu](#menu) for details.
* `tiles` - A list of `Object`s describing dashboard [tiles](#tiles).

## Feeds
A list of `Object`s with the following keys.
* `url` (string) - An RSS or Atom feed URL.
* `bgColor` (string, optional) - Override the background color with an HTML color code.
* `refreshInterval` (interval, optional) - An interval (see [Interval](#interval) section below).
* `textColor` (string, optional) - Override the text color with an HTML color code.
* `titleTextColor` (string, optional) - Override the title text color with an HTML color code.

## Menu
There is a static predefined menu and a user defined menu. Both are accessed via the menu button in the top right.

### Predefined Menu
* `Back` - Go backward in the interface.
* `Refresh` - Refresh the dashboard.
* `Sources` - Show the contents of ``config.js``.
* `Help` - Show a message about how to use the dashboard.
* `Update` - This button will appear when there is a newer version of the dashboard code available.

### User Menu
The user menu will appear as buttons below the predefined menu items.
The configuration is a list of `Object`s with the following options.
* `text` (string) - The button text.
* `url` (string) - The URL to load when the button is clicked.
* `bgColor` (string, optional) - Override the button background color with an HTML color code.
* `scale` (number, optional) - The default CSS `transform` scale for the display of the loaded URL. Defaults to `1`.
* `textColor` (string, optional) - Override the button text color with an HTML color code.


## Top Bar
The top bar contains a back button (far left), 3 text sections, and a menu button (far right).

### Sections
Each section has the following options.
* `bgColor` (string, optional) - Override the background color with an HTML color code.
* `dateFormatLocal` (string, optional) - The locale to format the date and time parts with (eg `"en-US"`). Defaults to the browser's value.
* `dateFormatTimeZone` (string, optional) - IANA time zone to format the date and time with (eg `"Etc/UTC"` or `"America/New_York"`). Defaults to the browser's value.
* `dateFormat` (string, optional) - C `strftime` style date and time format. See the [Date Formats](#date-formats) section for details. Different defaults for each section.
* `textColor` (string, optional) - Override the text color with an HTML color code.
* `text` (string, optional) - Override the local date and time with static text.

#### Left
By default the left section displays the local date and time with the format ``%A, %B %m - %H:%M:%S %Z``.

#### Center
By default the center section displays static text (the value of `text`).

#### Right
By default the right section displays the UTC date and time with the format ``%Y-%m-%d - %H:%M:%S %Z``.


### Date Formats
* `"iso"` - Format the time using ISO8601. Roughly equivalent to `"%Y-%m-%dT%H:%M:%S.000Z"` (not all the C `strftime` options are implemented here).
* A subset of the C `strftime` style formatting is available.
  * `%Y` - 4 digit year.
  * `%y` - 2 digit year (``00``-``99``, eg ``25`` for the year ``2025``).
  * `%m` - 2 digit month (``01``-``12``).
  * `%e` - 1-2 digit month (``1``-``12``).
  * `%b` - Abbreviated month name.
  * `%B` - Month name.
  * `%a` - Abbreviated day of the week (eg ``Thu`` for Thursday).
  * `%A` - Day of the week.
  * `%d` - 2 digit day of the month (``01``-``31``).
  * `%e` - 1-2 digit day of the month (``1``-``31``).
  * `%H` - 2 digit hours (``00``-``23``).
  * `%k` - 1-2 digit hours (``0``-``23``).
  * `%I` - 2 digit hours (``1``-``12``).
  * `%l` - 1-2 digit hours (``1``-``12``).
  * `%M` - 2 digit minutes.
  * `%S` - 2 digit seconds.
  * `%F` - Equivalent to ``%Y-%m-%d``.
  * `%T` - Equivalent to ``%H:%M:%S``.
  * `%R` - Equivalent to ``%I:%M``
  * `%r` - Equivalent to ``%I:%M:%S``.
  * `%p` - ``AM`` or ``PM``.
  * `%P` - Lower case AM or PM (``am`` or ``pm``).
  * `%Z` - Short timezone (eg ``UTC`` for ``Etc/UTC`` or ``EST`` for ``America/New_York``).

#### Examples
* ``%A, %B %m - %H:%M:%S %Z`` gives ``Wednesday, July 30 - 21:34:33 EDT`` for Eastern Daylight Time at the moment of writing.
* ``%F - %T %Z`` gives ``2025-07-31 - 01:34:33 UTC`` for UTC at the moment of writing.


## Tiles
Tiles are the boxes that display images, iframes, or videos on the dashboard.
The configuration is an `Object`s with the following options.
* `iframe` (boolean, optional) - If `true` the tile will default to being loaded as an iframe. Defaults to `false`.
* `position` (string|boolean, optional) - The default position of image sources within a tile that don't fill the tile. If `false` the default position ``0px 0px`` is used. Otherwise all valid values for the CSS property `background-position` will work. Defaults to `"center"`.
* `mimetype` (string, optional) - Override the detected mimetype of a video sources by default.
* `refreshInterval` (interval, optional) - The interval (see [Interval](#interval) section below) to wait between refreshing the current source of this tile. Defaults to `null` (no refreshing).
* `rotateInterval` (interval, optional) - The interval (see [Interval](#interval) section below) to wait between rotating the source being displayed in the tile. Defaults to `"5m"`.
* `scale` (number, optional) - The default CSS `transform` scale for the sources in a tile. Defaults to `1`.
* `sources` - A list of sources to display one at a time in the tile. These can be URL strings or `Object`s with the following keys.
* `title` (string, optional) - The title to display at the top of the tile. If left out or set to `null` or `""` the title will be hidden by default. Defaults to `null`.
* `video` (boolean, optional) - If `true` force the sources to be treated like videos by default. Defaults to `false`.

### Sources
The `sources` option for each tile can be a URL string, a list of URL strings, or a list of javascript objects with the options below.
A source given as a javascript object has the following options.
* `url` - The URL to display when this source is active.
* `iframe` (boolean, optional) - If `true` the tile will be loaded as an iframe while this source is displayed. Defaults to `iframe` of the tile.
* `position` (string|boolean, optional) - The default position of image sources within a tile that don't fill the tile. If `false` the default position ``0px 0px`` is used. Otherwise all valid values for the CSS property `background-position` will work. Defaults to the `position` set in the tile.
* `mimetype` (string, optional) - Override the detected mimetype of a video source.
* `refreshInterval` (interval, optional) - The interval (see [Interval](#interval) section below) to wait between refreshing this source. Defaults to the `refreshInterval` of the tile or `"5m"`.
* `rotateInterval` (interval, optional) - The interval (see [Interval](#interval) section below) to wait between rotating the source being displayed in the tile. Defaults to the `rotateInterval` of the tile.
* `title` (string, optional) - The title to display at the top of the tile. If left out or set to `null` or `""` the title will be hidden. Defaults to the `title` set in the tile.
* `video` (boolean, optional) - If `true` force the source to be treated like a video. Defaults to the `video` set in the tile or `false`.

Some simple examples.

* The following three configuration snippets are equivalent. They will each display a tile with one source having the URL ``https://example.com/something.png``.
    ```js
    ...
    sources: "https://example.com/something.png",
    ...
    ```

    ```js
    ...
    sources: ["https://example.com/something.png"],
    ...
    ```

    ```js
    ...
    sources: [{url: "https://example.com/something.png"}],
    ...
    ```

* The following configuration snippet will display a tile with the title ``Example``, display the video  with an unknown mimetype, and refresh every hour.
    ```js
    ...
    {
      mimetype: "",
      refreshInterval: "1h",
      sources: "https://example.com/example-video",
      title: "Example",
      video: true,
    }
    ...
    ```

### Sources
Each tile is made up of one or more sources. The keys `iframe`, `refreshInterval`, `rotateInterval`, `scale`, `title`, `mimetype`, and `video` are all defaults for the sources given in `sources`. Individual sources can override the tile level settings. For instance, the following tile configuration:
```js
...
{
  title: "",
  rotateInterval: "11m",
  sources: [
    {
      url: "https://example.com/something.png",
      refreshInterval: "1m",
    },
    {
      url: "https://example.com/something-else.png",
      rotateInterval: "5m",
    },
  ]
}
...
```
This will load ``something.png`` on dashboard page load, refresh every minute for 11 minutes when ``something-else.png`` will be loaded and not refresh at all for 5 minutes until the process repeats with ``something.png`` being loaded. The `rotateInterval` given in the source for ``something-else.png`` overrides the value given in the tile level.

### A note on being kind to your data sources
Rotating and refreshing load the URL of the source anew. Bandwidth and compute aren't free. To avoid abusing the servers that host the files and pages that load in each tile it's best to set the refresh and rotate intervals as long as you can stand them. For instance a feed that is updated once a day can safely be loaded every 1 day or 12 hours if the content isn't time critical.
Halving the time the source is updated at for the rotate or refresh interval is generally enough to capture the effect of the content being loaded every 30 seconds or less as long as changes aren't super time critical (See [Nyquist-Shannon sampling](https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem)).
A source that updates every 15 minutes and provides a forecast for the next 24 hours can safely be loaded every 7.5 or 15 minutes.
A source that updates once a day but changes are relevant in the first 10 minutes after the change would need to be loaded every 5 minutes to ensure changes are reflected within 10 minutes.
A source that updates at a long interval but has content that requires action immediately on change (eg DX cluster or POTA activation update) is reasonable to refresh very frequently. Some services will update their sites automatically though so if the source is in an iframe you may not need to reload at all.


## Rotate and Refresh
* Refresh means the content of the given tile or feed is reloaded without changing the source being displayed.
* Rotate (like a slide carousel) means the source being displayed is changed and loaded into the tile.
* The `rotateInterval` is the interval between the swapping of displayed sources.
* The `refreshInterval` is the interval between refreshing a tile or feed.
* If the `rotateInterval` of a tile is less than the `refreshInterval` the `refreshInterval` is ignored.
* If the `refreshInterval` a tile is not set and the tile has only one source, the `rotateInterval` is effectively the `refreshInterval`.

## Interval
Intervals are strings or numbers. Integers or floats are interpreted as milliseconds. Strings of numbers with the following suffixes are interpreted as described below.
* `s` - Seconds. Example `"5s"` is 5 seconds.
* `m` - Minutes. Example `"3m"` is 3 minutes.
* `h` - Hours. Example `"10h"` is 10 hours.
* `d` - Days. Example `"2d"` is 2 days.
* `w` - Weeks. Example `"1.5w"` is one and a half weeks.

These can be combined in a single string. Example `"1w2d3h4m5s"` is an interval of 1 week, 2 days, 3 hours, 4 minutes, and 5 seconds combined.

## Full Example
```js
const userSettings = {
  topBar: {
    center: {
      text: "AB1CDE - AA00aa",
    },
  },

  // Grid layout width and height
  columns: 4,
  rows: 3,

  // Menu items
  menu: [
    {
      text: "Lightning",
      url: "https://map.blitzortung.org/",
    },
    {
      text: "Weather",
      url: "https://openweathermap.org/weathermap?basemap=map&cities=true&layer=temperature",
    },
    {
      text: "Wind",
      url: "https://earth.nullschool.net/#current/wind/surface/level/annot=fires",
    },
    {
      text: "Space Weather",
      url: "https://www.solarham.com/",
    },
  ],

  // Feed items
  feeds: [
    {
      url: "https://www.amsat.org/feed/",
      refreshInterval: "12h",
    },
    {
      url: "https://daily.hamweekly.com/atom.xml",
      refreshInterval: "12h",
    },
  ],

  // Dashboard tiles
  tiles: [
    {
      title: "USA Forecast",
      sources: "https://www.wpc.ncep.noaa.gov//noaa/noaa.gif",
      refreshInterval: "1h",
    },
    {
      title: "Local Radar",
      sources: "https://radar.weather.gov/ridge/standard/KLWX_loop.gif",
      refreshInterval: "15m",
    },
    {
      sources: [
        {
          title: "7 day",
          url: "https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png",
        },
        {
          title: "2 day",
          url: "https://www.nhc.noaa.gov/xgtwo/two_atl_2d0.png",
        },
        {
          title: "Today",
          url: "https://www.nhc.noaa.gov/xgtwo/two_atl_0d0.png",
        },
        {
          title: "Ocean",
          url: "https://ocean.weather.gov/shtml/ira1.gif",
        },
        {
          title: "GOES16-TAW",
          url: "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/SECTOR/taw/Sandwich/GOES16-TAW-Sandwich-900x540.gif",
        },
      ],
    }, 
    {
      sources: "https://earth.nullschool.net/#current/wind/surface/level/annot=fires",
      iframe: true,
      rotateInterval: 0,
    },
    {
      title: "NOAA D-RAP",
      sources: "https://services.swpc.noaa.gov/images/animations/d-rap/global/d-rap/latest.png",
    },
    {
      title: "foF2",
      sources: "https://prop.kc2g.com/renders/current/fof2-normal-now.svg",
    },
    {
      title: "MUF",
      sources: "https://prop.kc2g.com/renders/current/mufd-normal-now.svg",
    },
    {
      title: "GOES 16 SUVI",
      sources: [
        "https://services.swpc.noaa.gov/images/animations/suvi/primary/map/latest.png",
        "https://services.swpc.noaa.gov/images/animations/suvi/primary/304/latest.png",
        "https://services.swpc.noaa.gov/images/animations/suvi/primary/094/latest.png",
        "https://services.swpc.noaa.gov/images/animations/suvi/primary/131/latest.png",
        "https://services.swpc.noaa.gov/images/animations/suvi/primary/171/latest.png",
        "https://services.swpc.noaa.gov/images/animations/suvi/primary/195/latest.png",
        "https://services.swpc.noaa.gov/images/animations/suvi/primary/284/latest.png",
      ],
    },
    {
      sources: "https://services.swpc.noaa.gov/images/swx-overview-large.gif",
      refreshInterval: "30m",
    },
    {
      sources: [
        "https://www.tvcomm.co.uk/g7izu/Autosave/HF_ZERO1_AutoSave.JPG",
        "https://www.tvcomm.co.uk/g7izu/Autosave/ATL_HF10_AutoSave.JPG",
        "https://www.tvcomm.co.uk/g7izu/Autosave/PACIFIC_HF_AutoSave.JPG",
      ],
      rotateInterval: "2m",
    },
    {
      sources: "https://www.hamqsl.com/solarbc.php",
      refreshInterval: "1h",
    },
    {
      sources: "https://www.hamqsl.com/solarsmall.php",
      refreshInterval: "1h",
    },
  ],
}
```
