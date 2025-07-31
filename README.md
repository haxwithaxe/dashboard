# Description
***Work In Progress***

This is a dashboard based loosely on [hamdashboard](https://github.com/VA3HDL/hamdashboard). The configuration interface is "simplified" and it has a few more small features.

# Configuration
Currently the only way to configure this dashboard is editing ``config.js``. The application is expecting an `Object` named `userSettings` with the following keys.

# config.js Options
* `topBar` - An object with the configuration for the 3 parts of the top bar.
  * `left` - Left hand top bar configuration.
    * `bgColor` (string, optional) - Override the background color with an HTML color code.
    * `dateFormatLocal` (string, optional) - The locale to format the date and time parts with (eg `"en-US"`). Defaults to the browser's value.
    * `dateFormatTimeZone` (string, optional) - IANA time zone to format the date and time with (eg `"Etc/UTC"` or `"America/New_York"`). Defaults to the browser's value.
    * `dateFormat` (string, optional) - C `strftime` style date and time format. See the (Date Formats)[#Date Formats] section for details. Defaults to `"%A, %B %m - %H:%M:%S %Z"`.
    * `textColor` (string, optional) - Override the text color with an HTML color code.
    * `text` (string, optional) - Override the local date and time with static text.
  * `center` - Center top bar configuration.
    * `text` (string) - Override the local date and time with static text.
    * `bgColor` (string, optional) - Override the background color with an HTML color code.
    * `dateFormatLocal` (string, optional) - The locale to format the date and time parts with (eg `"en-US"`). Defaults to the browser's value.
    * `dateFormatTimeZone` (string, optional) - IANA time zone to format the date and time with (eg `"Etc/UTC"` or `"America/New_York"`). Defaults to the browser's value.
    * `dateFormat` (string, optional) - C `strftime` style date and time format. See the (Date Formats)[#Date Formats] section for details. Defaults to `null` (uses the value of `text`).
    * `textColor` (string, optional) - Override the text color with an HTML color code.
  * `right` - Right hand top bar configuration.
    * `bgColor` (string, optional) - Override the background color with an HTML color code.
    * `dateFormatLocal` (string, optional) - The locale to format the date and time parts with (eg `"en-US"`). Defaults to the browser's value.
    * `dateFormatTimeZone` (string, optional) - IANA time zone to format the date and time with (eg `"Etc/UTC"` or `"America/New_York"`). Defaults to `"Etc/UTC"`..
    * `dateFormat` (string, optional) - C `strftime` style date and time format. See the (Date Formats)[#Date Formats] section for details. Defaults to `"%Y-%m-%d - %H:%M:%S %Z`.
    * `textColor` (string, optional) - Override the text color with an HTML color code.
    * `text` (string, optional) - Override the UTC date and time with static text.
* `columns` (integer) - The number of columns in the tile grid.
* `rows` (integer) - The number of rows in the tile grid.
* `feedScrollSpeed` (number, optional) - The ticker scroll speed in pixels per second. Defaults to `180`.
* `feeds` (Array, optional) - A list of feed specifications. See (Feeds)[#Feeds] for details.
* `menu` (Array, optional) - A list of `Object`s with the following keys.
* `tiles` - A list of `Object`s with the following keys.
  * `iframe` (boolean, optional) - If `true` the tile will default to being loaded as an iframe. Defaults to `false`.
  * `mimetype` (string, optional) - Override the detected mimetype of a video sources by default.
  * `refreshInterval` (interval, optional) - The interval (see Interval section below) to wait between refreshing the current source of this tile. Defaults to `null` (no refreshing).
  * `rotateInterval` (interval, optional) - The interval (see Interval section below) to wait between rotating the source being displayed in the tile. Defaults to `"5m"`.
  * `scale` (number, optional) - The default CSS `transform` scale for the sources in a tile. Defaults to `1`.
  * `sources` - A list of sources to display one at a time in the tile. These can be URL strings or `Object`s with the following keys.
    * `url` - The URL to display when this source is active.
    * `iframe` (boolean, optional) - If `true` the tile will be loaded as an iframe while this source is displayed. Defaults to `iframe` of the tile.
    * `refreshInterval` (interval, optional) - The interval (see Interval section below) to wait between refreshing this source. Defaults to ``5m``.
    * `rotateInterval` (interval, optional) - The interval (see Interval section below) to wait between rotating the source being displayed in the tile. Defaults to `rotateInterval` of the tile.
    * `title` (string, optional) - The title to display at the top of the tile. If left out or set to `null` or `""` the title will be hidden.
    * `mimetype` (string, optional) - Override the detected mimetype of a video source.
    * `video` (boolean, optional) - If `true` force the source to be treated like a video. Defaults to `false`.
  * `title` (string, optional) - The title to display at the top of the tile. If left out or set to `null` or `""` the title will be hidden by default. Defaults to `null`.
  * `video` (boolean, optional) - If `true` force the sources to be treated like videos by default. Defaults to `false`.


## Feeds
A list of `Object`s with the following keys.
* `url` (string) - An RSS or Atom feed URL.
* `bgColor` (string, optional) - Override the background color with an HTML color code.
* `refreshInterval` (interval, optional) - An interval (see Interval section below).
* `textColor` (string, optional) - Override the text color with an HTML color code.
* `titleTextColor` (string, optional) - Override the title text color with an HTML color code.

## Menu
A list of `Object`s with the following keys.
* `text` (string) - The button text.
* `url` (string) - The URL to load when the button is clicked.
* `bgColor` (string, optional) - Override the button background color with an HTML color code.
* `scale` (number, optional) - The default CSS `transform` scale for the display of the loaded URL. Defaults to `1`.
* `textColor` (string, optional) - Override the button text color with an HTML color code.

## Top Bar

### Date Formats
* `"iso"`
* A subset of the C `strftime` style formatting is available.
  * `%Y` - 4 digit year.
  * `%y` - 2 digit year (``00``-``99``, eg ``25`` for the year ``2025``).
  * `%m` - 2 digit month (``01``-``12``).
  * `%e` - 1-2 digit month (``1``-``12``).
  * `%b` - Abreviated month name.
  * `%B` - Month name.
  * `%a` - Abreviated day of the week (eg ``Thu`` for Thursday).
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
  * `%p` - AM or PM.
  * `%P` - Lower case AM or PM.
  * `%Z` - Short timezone (eg ``UTC`` for ``Etc/UTC`` or ``EST`` for ``America/New_York``).

#### Examples
* ``%A, %B %m - %H:%M:%S %Z`` gives ``Wednesday, July 30 - 21:34:33 EDT`` for Eastern Daylight Time at the moment of writing.
* ``%F - %T %Z`` gives ``2025-07-31 - 01:34:33 UTC`` for UTC at the moment of writing.


## Tiles
A list of `Object`s with the following keys.
* `iframe` (boolean, optional) - If `true` the tile will default to being loaded as an iframe. Defaults to `false`.
* `mimetype` (string, optional) - Override the detected mimetype of a video sources by default.
* `refreshInterval` (interval, optional) - The interval (see Interval section below) to wait between refreshing the current source of this tile. Defaults to `null` (no refreshing).
* `rotateInterval` (interval, optional) - The interval (see Interval section below) to wait between rotating the source being displayed in the tile. Defaults to `"5m"`.
* `scale` (number, optional) - The default CSS `transform` scale for the sources in a tile. Defaults to `1`.
* `sources` - A list of sources to display one at a time in the tile. These can be URL strings or `Object`s with the following keys.
* `title` (string, optional) - The title to display at the top of the tile. If left out or set to `null` or `""` the title will be hidden by default. Defaults to `null`.
* `video` (boolean, optional) - If `true` force the sources to be treated like videos by default. Defaults to `false`.

### Sources
A list of sources to display one at a time in the tile. These can be URL strings or `Object`s with the following keys.
* `url` - The URL to display when this source is active.
* `iframe` (boolean, optional) - If `true` the tile will be loaded as an iframe while this source is displayed. Defaults to `iframe` of the tile.
* `refreshInterval` (interval, optional) - The interval (see Interval section below) to wait between refreshing this source. Defaults to ``5m``.
* `rotateInterval` (interval, optional) - The interval (see Interval section below) to wait between rotating the source being displayed in the tile. Defaults to `rotateInterval` of the tile.
* `title` (string, optional) - The title to display at the top of the tile. If left out or set to `null` or `""` the title will be hidden.
* `mimetype` (string, optional) - Override the detected mimetype of a video source.
* `video` (boolean, optional) - If `true` force the source to be treated like a video. Defaults to `false`.

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
Halving the time the source is updated at for the rotate or refresh interval is generally enough to capture the effect of the content being loaded every 30 seconds as long as changes aren't super time critical (See (Nyquist-Shannon sampling)[https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem]).
A source that updates every 15 minutes and provides a forecast for the next 24 hours can safely be loaded every 7.5 or 15 minutes.
A source that updates once a day but changes are rellevent in the first 10 minutes after the change would need to be loaded every 5 minutes to ensure changes are reflected within 10 minutes.
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
