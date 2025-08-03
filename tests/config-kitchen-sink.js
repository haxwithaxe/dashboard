const userSettings = {
  topBar: {
    left: {
      text: "Override left text",
      textColor: "red",
      bgColor: "blue",
    },
    center: {
      text: "AB1CDE - AA00aa",
    },
    right: {
      // Top right text should look like
      //   "Override date/time 1970-01-01 00:00:00 CDT"
      dateFormat: "Override date/time %Y-%m-%d %H:%M:%S %Z",
      dateFormatTimeZone: "America/Chicago",
    }
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
      url: "http://localhost:8000/static/test.rss",
      refreshInterval: "12h",
      textColor: "magenta",
      bgColor: "darkgreen",
      titleTextColor: "yellow",
    },
    {
      url: "http://localhost:8000/static/test.atom",
      refreshInterval: "1d",
    },
  ],

  // Dashboard tiles
  tiles: [
    // First row
    { // 1 - Refresh once an hour
      title: "refresh 1 hour",
      sources: "http://localhost:8000/refresh-1hr.png",
      refreshInterval: "1h",
    },
    { //2 - Rotate between images "source=1" and "source=2" every 30 seconds
      title: "rotate 30 seconds",
      sources: [
        "http://localhost:8000/rotate-30s.png?source=1",
        "http://localhost:8000/rotate-30s.png?source=2",
      ],
      refreshInterval: "30s",
    },
    { // 3 - Rotate between iframes "source=1" and "source=2" every 30 seconds
      title: "rotate iframe 30s",
      sources: [
        "http://localhost:8000/rotate-iframe-30s?source=1",
        "http://localhost:8000/rotate-iframe-30s?source=2",
      ],
      iframe: true,
      rotateInterval: "30s",
    },
    { // 4 - Rotate between videos "source=1" and "source=2" every 30 seconds
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
    { // 5 - Rotate between "source=1" and "source=2" every 1 minute and
      //   refresh each every 30 seconds
      title: "ref/rot 30s/1m",
      sources: [
        "http://localhost:8000/refresh/rotate-1m/30s.png?source=1",
        "http://localhost:8000/refresh/rotate-1m/30s.png?source=2",
      ],
      refreshInterval: "30s",
      rotateInterval: "1m",
    },

    // Second row
    { // 6 - Rotate between iframes "source=1" and "source=2" every 1 minute
      //   and refresh each every 30 seconds
      title: "ref/rot iframe 30s/1m",
      sources: [
        "http://localhost:8000/refresh/rotate-iframe-30s/1m?source=1",
        "http://localhost:8000/refresh/rotate-iframe-30s/1m?source=2",
      ],
      iframe: true,
      refreshInterval: "30s",
      rotateInterval: "1m",
    },
    { // 7 - Preserve the aspect ratio of the image
      title: "preserve aspect ratio",
      sources: "http://localhost:8000/static/aspect-ratio.png",
      fit: "preserve",
    },
    { // 8 - Fit the image to the width of the tile leaving the height automatic
      title: "fit width",
      sources: "http://localhost:8000/static/aspect-ratio.png",
      fit: "width",
    },
    { // 9 - Fit the image to the height of the tile leaving the width automatic
      title: "fit height",
      sources: "http://localhost:8000/static/aspect-ratio.png",
      fit: "height",
    },
    { // 10 - Strech the image to fit the tile
      title: "stretch fit",
      sources: "http://localhost:8000/static/aspect-ratio.png",
      fit: "stretch",
    },

    // Third row
    { // 11 - Show a video with just the URL to say it's a video
      title: "nominal video",
      sources: "http://localhost:8000/sample-video.mp4",
      refreshInterval: 0,
      rotateInterval: 0,
    },
    { // 12 - Force the mimetype of the video
      title: "force mimetype video",
      sources: "http://localhost:8000/sample-video.ogg",
      mimetype: "video/mp4",
      refreshInterval: 0,
      rotateInterval: 0,
    },
    { // 13 - Force the video type and let the browser figure out the mimetype
      title: "force video no type",
      sources: "http://localhost:8000/sample-video",
      video: true,
      refreshInterval: 0,
      rotateInterval: 0,
    },
    { // 14 - Alternate between rotating every 30 seconds and every 1 minute
      title: "rotate 30s then 1m",
      sources: [
        {
          title: "rotate 30s then 1m",
          url: "http://localhost:8000/rotate-30s/1m.png?source=30s",
          rotateInterval: "30s",
        },
        {
          title: "rotate 1m then 30s",
          url: "http://localhost:8000/rotate-30s/1m.png?source=1m",
          rotateInterval: "1m"
        },
      ],
    },
    { // 15 - Verify the error message works
      title: "Intended failure",
      sources: "http://localhost:8000/404",
      refreshInterval: 0,
    },
  ],
}
