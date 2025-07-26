# Description
***Work In Progress***
This is a dashboard based loosely on [hamdashboard](https://github.com/VA3HDL/hamdashboard). The configuration interface is simplified and it has a few more small features.

# Configuration
Currently the only way to configure this dashboard is editing ``config.js``. The application is expecting an `Object` named `userSettings` with the following keys.

* `topBar` - An object with the configuration for the 3 parts of the top bar.
  * `left` - Left hand top bar configuration.
    * `text` (string, optional) - Override the local date and time with static text.
    * `textColor` (string, optional) - Override the text color with an HTML color code.
    * `bgColor` (string, optional) - Override the background color with an HTML color code.
  * `center` - Center top bar configuration.
    * `text` - Override the local date and time with static text.
    * `textColor` (string, optional) - Override the text color with an HTML color code.
    * `bgColor` (string, optional) - Override the background color with an HTML color code.
  * `right` - Right hand top bar configuration.
    * `text` (string, optional) - Override the UTC date and time with static text.
    * `textColor` (string, optional) - Override the text color with an HTML color code.
    * `bgColor` (string, optional) - Override the background color with an HTML color code.
* `columns` (integer) - The number of columns in the tile grid.
* `rows` (integer) - The number of rows in the tile grid.
* `feedScrollSpeed` (number, optional) - The speed of the ticker scroll speed in pixels per second.
* `menu` (Array, optional) - A list of `Object`s with the following keys.
  * `text` (string) - The button text.
  * `url` (string) - The URL to load when the button is clicked.
* `feeds` (Array, optional) - A list of `Object`s with the following keys.
  * `url` (string) - An RSS or Atom feed URL.
  * `refreshInterval` (interval, optional) - An interval (see Interval section below).
  * `textColor` (string, optional) - Override the text color with an HTML color code.
  * `titleTextColor` (string, optional) - Override the title text color with an HTML color code.
  * `bgColor` (string, optional) - Override the background color with an HTML color code.
* `tiles` - A list of `Object`s with the following keys.
  * `iframe` (boolean, optional) - If `true` the tile will default to being loaded as an iFrame. Defaults to `false`.
  * `refreshInterval` (interval, optional) - The interval (see Interval section below) to wait between refreshing the current source of this tile. Defaults to `"5m"`.
  * `rotateInterval` (interval, optional) - The interval (see Interval section below) to wait between rotating the source being displayed in the tile. Defaults to `"5m"`.
  * `scale` (number, optional) - FIXME. Defaults to `1`.
  * `title` (string, optional) - The title to display at the top of the tile. If left out or set to `null` or `""` the title will be hidden.
  * `sources` - A list of sources to display one at a time in the tile. These can be URL strings or `Object`s with the following keys.
    * `url` - The URL to display when this source is active.
    * `iframe` (boolean, optional) - If `true` the tile will be loaded as an iFrame while this source is displayed. Defaults to `iframe` of the tile.
    * `refreshInterval` (interval, optional) - The interval (see Interval section below) to wait between refreshing this source. Defaults to `refreshInterval` of the tile.
    * `rotateInterval` (interval, optional) - The interval (see Interval section below) to wait between rotating the source being displayed in the tile. Defaults to `rotateInterval` of the tile.
    * `title` (string, optional) - The title to display at the top of the tile. If left out or set to `null` or `""` the title will be hidden.
    * `mimetype` (string, optional) - Override the detected mimetype of a video source.

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


## Example
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
      refreshInterval: "1d",
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
      title: "",
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
      title: "",
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
      title: "",
      sources: "https://services.swpc.noaa.gov/images/swx-overview-large.gif",
      refreshInterval: "30m",
    },
    {
      title: "",
      sources: [
        "https://www.tvcomm.co.uk/g7izu/Autosave/HF_ZERO1_AutoSave.JPG",
        "https://www.tvcomm.co.uk/g7izu/Autosave/ATL_HF10_AutoSave.JPG",
        "https://www.tvcomm.co.uk/g7izu/Autosave/PACIFIC_HF_AutoSave.JPG",
      ],
      rotateInterval: "2m",
    },
    {
      title: "",
      sources: "https://www.hamqsl.com/solarbc.php",
      refreshInterval: "1h",
    },
    {
      title: "",
      sources: "https://www.hamqsl.com/solarsmall.php",
      refreshInterval: "1h",
    },
  ],
}
```
