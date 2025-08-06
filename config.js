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
      fit: "preserve",
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
      fit: "preserve",
      rotateInterval: "2m",
    },
    {
      title: "",
      sources: "https://www.hamqsl.com/solarbc.php",
      refreshInterval: "1h",
    },
    {
      title: "",
      sources: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
      rotateInterval: "0",
    },
  ],
}
