const userSettings = {
  topBar: {
    center: {
      text: "AB1CDE - AA00aa",
    },
  },

  // Grid layout width and height
  columns: 5,
  rows: 3,

  // Menu items
  menu: [
    {
      text: "Lightning",
      url: "http://map.blitzortung.org/",
    },
    {
      text: "Weather",
      url: "http://openweathermap.org/weathermap?basemap=map&cities=true&layer=temperature",
    },
    {
      text: "Wind",
      url: "http://earth.nullschool.net/#current/wind/surface/level/annot=fires",
    },
    {
      text: "Space Weather",
      url: "http://www.solarham.com/",
      textColor: "yellow",
      bgColor: "darkblue",
    },
  ],

  // Feed items
  feeds: [
    {
      url: "http://localhost:8000/test.rss",
      refreshInterval: "12h",
      textColor: "magenta",
      bgColor: "darkgreen",
      titleTextColor: "yellow",
    },
    {
      url: "http://localhost:8000/test.atom",
      refreshInterval: "1d",
      textColor: "lightblue",
      bgColor: "darkgreen",
      titleTextColor: "lightred",
    },
  ],

  // Dashboard tiles
  tiles: [
    { // 1
      title: "refresh 1 hour",
      sources: "http://localhost:8000/refresh-1hr.png",
      refreshInterval: "1h",
    },
    { //2
      title: "rotate 30 seconds",
      sources: [
        "http://localhost:8000/rotate-30s.png?source=1",
        "http://localhost:8000/rotate-30s.png?source=2",
      ],
      refreshInterval: "30s",
    },
    { // 3
      title: "rotate iframe 30s",
      sources: [
        "http://localhost:8000/rotate-iframe-30s?source=1",
        "http://localhost:8000/rotate-iframe-30s?source=2",
      ],
      iframe: true,
      rotateInterval: "30s",
    },
    { // 4
      title: "rotate video 30s",
      sources: [
        {
          title: "rotate video 30s 1",
          url: "http://localhost:8000/sample-video.mp4?source=1",
        },
        {
          title: "rotate video 30s 2",
          url: "http://localhost:8000/sample-video.mp4?source=2",
        },
      ],
      rotateInterval: "30s",
    },
    { // 5
      title: "ref/rot 30s/1m",
      sources: [
        "http://localhost:8000/refresh/rotate-1m/30s.png?source=1",
        "http://localhost:8000/refresh/rotate-1m/30s.png?source=2",
      ],
      refreshInterval: "1m",
      rotateInterval: "30s",
    },
    { // 6
      title: "ref/rot iframe 30s/1m",
      sources: [
        "http://localhost:8000/refresh/rotate-iframe-1m/30s?source=1",
        "http://localhost:8000/refresh/rotate-iframe-1m/30s?source=2",
      ],
      iframe: true,
      refreshInterval: "1m",
      rotateInterval: "30s",
    },
    { // 7
      title: "preserve aspect ratio",
      sources: "http://localhost:8000/aspect-ratio.svg",
      fit: "preserve",
    },
    { // 8
      title: "fit width",
      sources: "http://localhost:8000/aspect-ratio.svg",
      fit: "width",
    },
    { // 9
      title: "fit height",
      sources: "http://localhost:8000/aspect-ratio.svg",
      fit: "height",
    },
    { // 10
      title: "Intended failure",
      sources: "http://localhost:8000/404",
      refreshInterval: 0,
    },
    { // 11
      title: "nominal video",
      sources: "http://localhost:8000/sample-video.mp4",
      refreshInterval: 0,
      rotateInterval: 0,
    },
    { // 12
      title: "force mimetype video",
      sources: "http://localhost:8000/sample-video.ogg",
      mimetype: "video/mp4",
      refreshInterval: 0,
      rotateInterval: 0,
    },
    { // 13
      title: "force video no type",
      sources: "http://localhost:8000/sample-video",
      video: true,
      refreshInterval: 0,
      rotateInterval: 0,
    },
    { // 14
      title: "no test",
      sources: "http://localhost:8000/404",
      refreshInterval: 0,
      rotateInterval: 0,
    },
    { // 15
      title: "no test",
      sources: "http://localhost:8000/404",
      refreshInterval: 0,
      rotateInterval: 0,
    },
  ],
}
