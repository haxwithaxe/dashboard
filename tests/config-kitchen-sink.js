const userSettings = {
  topBar: {
    center: {
      text: "W3AXE - FM19la",
    },
  },

  // Grid layout width and height
  columns: 5,
  rows: 3,

  // Menu items
  menu: [
    {
      text: "Lightning",
      url: "https://map.blitzortung.org/#3.87/36.5/-89.41",
    },
    {
      text: "Weather",
      url: "https://openweathermap.org/weathermap?basemap=map&cities=true&layer=temperature&lat=39&lon=-73&zoom=5",
    },
    {
      text: "Wind",
      url: "https://earth.nullschool.net/#current/wind/surface/level/annot=fires/orthographic=-76.51,39.32,10325/loc=-77.490,38.953",
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
    // First row
    {  // 1
      title: "USA Forecast",
      sources: "https://www.wpc.ncep.noaa.gov//noaa/noaa.gif",
      refreshInterval: "8h",
    },
    {  // 2
      title: "LOCAL RADAR",
      sources: "https://radar.weather.gov/ridge/standard/KLWX_loop.gif",
      refreshInterval: "15m",
    },
    {  // 3
      title: "LIGHTNING LOCAL",
      sources: "https://map.blitzortung.org/#6.87/39/-77",
      iframe: true,
      refreshInterval: 0,
    },
    {  // 4
      title: "PM2.5/Ozone/SO2",
      sources: [
        {
          title: "PM2.5",
          url: "https://maryland.maps.arcgis.com/apps/Embed/index.html?webmap=466e4c7215da496f9fb59e9879bdd1c3",
        },
        {
          title: "Ozone",
          url: "https://maryland.maps.arcgis.com/apps/Embed/index.html?webmap=6276743b3a3d437e8739c8cd49bc5fae",
        },
        {
          title: "SO2",
          url: "https://maryland.maps.arcgis.com/apps/Embed/index.html?webmap=21aee769b918468aae6c281462605028",
        },
      ],
      iframe: true,
      rotateInterval: "5m",
    },
    {  // 5
      title: "",
      sources: [
        "https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png",
        "https://www.nhc.noaa.gov/xgtwo/two_atl_2d0.png",
        "https://www.nhc.noaa.gov/xgtwo/two_atl_0d0.png", 
        "https://ocean.weather.gov/shtml/ira1.gif",
        "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/SECTOR/taw/Sandwich/GOES16-TAW-Sandwich-900x540.gif",
      ],
      fit: "preserve",
      rotateInterval: "5m",
    },

    // Second row
    {  // 6
      title: "",
      sources: "https://earth.nullschool.net/#current/wind/surface/level/annot=fires/orthographic=-77.5,38.9,10325/loc=-77.5,38.9",
      iframe: true,
      refreshInterval: 0,
    },
    {  // 7
      title: "NOAA D-RAP",
      sources: "https://services.swpc.noaa.gov/images/animations/d-rap/global/d-rap/latest.png",
      refreshInterval: "6h",
    },
    {  // 8
      title: "foF2",
      sources: "https://prop.kc2g.com/renders/current/fof2-normal-now.svg",
      refreshInterval: "6h",
    },
    {  // 9
      title: "MUF",
      sources: "https://prop.kc2g.com/renders/current/mufd-normal-now.svg",
      refreshInterval: "6h",
    },
    {  // 10
      title: "GOES 16 SUVI",
      sources: [
        {url: "https://services.swpc.noaa.gov/images/animations/suvi/primary/map/latest.png"},
        {url: "https://services.swpc.noaa.gov/images/animations/suvi/primary/304/latest.png"},
        {url: "https://services.swpc.noaa.gov/images/animations/suvi/primary/094/latest.png"},
        {url: "https://services.swpc.noaa.gov/images/animations/suvi/primary/131/latest.png"},
        {url: "https://services.swpc.noaa.gov/images/animations/suvi/primary/171/latest.png"},
        {url: "https://services.swpc.noaa.gov/images/animations/suvi/primary/195/latest.png"},
        {url: "https://services.swpc.noaa.gov/images/animations/suvi/primary/284/latest.png"},
      ],
      fit: "preserve",
      rotateInterval: "5m",
    },

    // Third row
    {  // 11
      title: "",
      sources: "https://services.swpc.noaa.gov/images/swx-overview-large.gif",
    },
    {  // 12
      title: "",
      sources: [
        {url: "https://www.tvcomm.co.uk/g7izu/Autosave/HF_ZERO1_AutoSave.JPG"},
        {url: "https://www.tvcomm.co.uk/g7izu/Autosave/ATL_HF10_AutoSave.JPG"},
        {url: "https://www.tvcomm.co.uk/g7izu/Autosave/PACIFIC_HF_AutoSave.JPG"},
        {url: "https://www.tvcomm.co.uk/g7izu/wp-content/uploads/2024/04/freq_key_2024.png"},
      ],
      fit: "preserve",
      rotateInterval: "5m",
    },
    {  // 13
      title: "",
      sources: "https://www.hamqsl.com/solarbc.php",
      refreshInterval: "7m",
    },
    {  // 14
      title: "",
      sources: "https://www.hamqsl.com/solarsmall.php",
      refreshInterval: "7m",
    },
    {  // 15
      title: "",
      sources: "https://www.hamqsl.com/solar101vhf.php",
      refreshInterval: "7m",
    },
  ],
}

