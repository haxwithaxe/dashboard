/*!
	Wheelzoom 4.0.1
	license: MIT
	http://www.jacklmoore.com/wheelzoom
*/
window.wheelzoom = (function(){
	var defaults = {
		zoom: 0.10,
		maxZoom: false,
		initialZoom: 1,
		initialX: 0.5,
		initialY: 0.5,
		fit: "stretch",
	};

	var main = function(img, options){
		if (!img || !img.nodeName || img.nodeName !== 'IMG') { return; }

		var settings = {};
		var width;
		var height;
		var bgWidth;
		var bgHeight;
		var bgPosX;
		var bgPosY;
		var previousEvent;
		var transparentSpaceFiller;

		function setSrcToBackground(img) {
			img.style.backgroundRepeat = 'no-repeat';
			img.style.backgroundImage = 'url("'+img.src+'")';
			img.setAttribute("orig-src", img.src);
			transparentSpaceFiller = 'data:image/svg+xml;base64,'+window.btoa('<svg xmlns="http://www.w3.org/2000/svg" width="'+img.naturalWidth+'" height="'+img.naturalHeight+'"></svg>');
			img.src = transparentSpaceFiller;
		}

		function updateBgStyle() {
			if (bgPosX > 0) {
				bgPosX = 0;
			} else if (bgPosX < width - bgWidth) {
				bgPosX = width - bgWidth;
			}

			if (bgPosY > 0) {
				bgPosY = 0;
			} else if (bgPosY < height - bgHeight) {
				bgPosY = height - bgHeight;
			}

			img.style.backgroundSize = bgWidth+'px '+bgHeight+'px';
			img.style.backgroundPosition = bgPosX+'px '+bgPosY+'px';
		}

		function reset() {
			bgWidth = width;
			bgHeight = height;
			bgPosX = bgPosY = 0;
			updateBgStyle();
		}

		function onwheel(e) {
			var deltaY = 0;

			e.preventDefault();

			if (e.deltaY) { // FireFox 17+ (IE9+, Chrome 31+?)
				deltaY = e.deltaY;
			} else if (e.wheelDelta) {
				deltaY = -e.wheelDelta;
			}

			// As far as I know, there is no good cross-browser way to get the cursor position relative to the event target.
			// We have to calculate the target element's position relative to the document, and subtrack that from the
			// cursor's position relative to the document.
			var rect = img.getBoundingClientRect();
			var offsetX = e.pageX - rect.left - window.pageXOffset;
			var offsetY = e.pageY - rect.top - window.pageYOffset;

			// Record the offset between the bg edge and cursor:
			var bgCursorX = offsetX - bgPosX;
			var bgCursorY = offsetY - bgPosY;
			
			// Use the previous offset to get the percent offset between the bg edge and cursor:
			var bgRatioX = bgCursorX/bgWidth;
			var bgRatioY = bgCursorY/bgHeight;

			// Update the bg size:
			if (deltaY < 0) {
				bgWidth += bgWidth*settings.zoom;
				bgHeight += bgHeight*settings.zoom;
			} else {
				bgWidth -= bgWidth*settings.zoom;
				bgHeight -= bgHeight*settings.zoom;
			}

			if (settings.maxZoom) {
				bgWidth = Math.min(width*settings.maxZoom, bgWidth);
				bgHeight = Math.min(height*settings.maxZoom, bgHeight);
			}

			// Take the percent offset and apply it to the new size:
			bgPosX = offsetX - (bgWidth * bgRatioX);
			bgPosY = offsetY - (bgHeight * bgRatioY);

			// Prevent zooming out beyond the starting size
			if (bgWidth <= width || bgHeight <= height) {
				reset();
			} else {
				updateBgStyle();
			}
		}

		function drag(e) {
			e.preventDefault();
			bgPosX += (e.pageX - previousEvent.pageX);
			bgPosY += (e.pageY - previousEvent.pageY);
			previousEvent = e;
			updateBgStyle();
		}

		function removeDrag() {
			document.removeEventListener('mouseup', removeDrag);
			document.removeEventListener('mousemove', drag);
		}

		// Make the background draggable
		function draggable(e) {
			e.preventDefault();
			previousEvent = e;
			document.addEventListener('mousemove', drag);
			document.addEventListener('mouseup', removeDrag);
		}

		function load(options) {
			if (options !== undefined && options.targetElement === undefined) {
				Object.keys(defaults).forEach(function(key){
					settings[key] = options[key] !== undefined ? options[key] : defaults[key];
				});
			}
			if (img.src == transparentSpaceFiller) {
				return;
			}
			//if (img.naturalWidth == 0 || img.naturalHeight == 0) {
			//	setTimeout(load, 100);
			//}
			var initial = Math.max(settings.initialZoom, 1);
			var computedStyle = window.getComputedStyle(img, null);

			const computedWidth = parseInt(computedStyle.width, 10);
			const computedHeight = parseInt(computedStyle.height, 10);
			const naturalWidth = parseInt(img.naturalWidth, 10);
			const naturalHeight = parseInt(img.naturalHeight, 10);
			var widthRatio = naturalWidth / computedWidth;
			//if (widthRatio > 1) {
			//	widthRatio = widthRatio - 1;
			//}
			var heightRatio = img.naturalHeight / computedHeight;
			//if (heightRatio > 1) {
			//	heightRatio = heightRatio - 1;
			//}
			const naturalAspectRatio = naturalWidth / naturalHeight;
			const computedAspectRatio = computedWidth / computedHeight;

			console.debug("computed/natural specs", settings.fit, {
				computedWidth: computedWidth,
				computedHeight: computedHeight,
				naturalWidth: naturalWidth,
				naturalHeight: naturalHeight,
				widthRatio: widthRatio,
				heightRatio: heightRatio,
				naturalAspectRatio: naturalAspectRatio,
				computedAspectRatio: computedAspectRatio,
			}, img);

			width = computedWidth;
			height = computedHeight;
			if (settings.fit == "width") {
				console.debug("width", widthRatio);
				//height = computedHeight / widthRatio;
				height = naturalHeight / widthRatio;
			} else if (settings.fit == "height") {
				console.debug("height", heightRatio);
				width = naturalWidth / heightRatio;
			} else if (settings.fit == "preserve") {
				console.debug("preserve");
				// Preserve aspect ratio and fit in tile
				if (naturalAspectRatio > 1) {
					console.debug("image: preserve image landscape");
					// Wider than tall - shrink height to match width
					width = naturalWidth / heightRatio;
				} else if (naturalAspectRatio < 1) {
					console.debug("image: preserve image portrait");
					// Taller than wide - shrink width to match height
					height = naturalWidth / widthRatio;
				} else {
					console.debug("image is square");
					// Perfectly square image
					if (computedAspectRatio > 1) {
						width = computedWidth * widthRatio;
					} else if (computedAspectRatio < 1){
						height = computedHeight * heightRatio;
					} else {
						height = computedHeight * heightRatio;
						width = computedWidth * widthRatio;
					}
				}
			} else { // Default behavior is to stretch to fit
				console.debug("stretch");
			}

			bgWidth = width * initial;
			bgHeight = height * initial;
			bgPosX = -(bgWidth - width) * settings.initialX;
			bgPosY = -(bgHeight - height) * settings.initialY;

			setSrcToBackground(img);

			img.style.backgroundSize = bgWidth+'px '+bgHeight+'px';
			img.style.backgroundPosition = bgPosX+'px '+bgPosY+'px';

			img.addEventListener('wheelzoom.reset', reset);

			img.addEventListener('wheel', onwheel);
			img.addEventListener('mousedown', draggable);
		}

		var destroy = function () {
			img.removeEventListener('wheelzoom.destroy', destroy);
			img.removeEventListener('wheelzoom.reset', reset);
			img.removeEventListener('load', load);
			img.removeEventListener('mouseup', removeDrag);
			img.removeEventListener('mousemove', drag);
			img.removeEventListener('mousedown', draggable);
			img.removeEventListener('wheel', onwheel);
			img.style.backgroundImage = "";
			img.src = img.getAttribute("orig-src");
		}

		img.addEventListener('wheelzoom.destroy', destroy);

		options = options || {};

		Object.keys(defaults).forEach(function(key){
			settings[key] = options[key] !== undefined ? options[key] : defaults[key];
		});

		if (img.complete) {
			load();
		}

		img.addEventListener('load', (() => setTimeout(load, 100)));
		return {destroy: destroy, load: load};
	};

	// Do nothing in IE9 or below
	if (typeof window.btoa !== 'function') {
		return () => {
			return {destroy: (() => {}), load: (() => {})};
		};
	} else {
		return main;
	}
}());
