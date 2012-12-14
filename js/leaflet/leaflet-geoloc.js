L.Control.Geoloc = L.Control.extend({
	options: {
		position: "topleft"
	},

	onAdd: function(map) {
		this._map = map;

		this._container = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-control');
		
		var link = document.createElement('a');
		link.href = '#';
		link.className = 'leaflet-control-zoom-geoloc';

		if (!L.Browser.touch)
			L.DomEvent.disableClickPropagation(link);
		L.DomEvent.addListener(link, 'click', L.DomEvent.preventDefault);
		L.DomEvent.addListener(link, 'click', function() {
			map.locate({setView: true, maxZoom: 16});
		});
		
		this._container.appendChild(link);
		return this._container;
	},

	onRemove: function(map) {
		map._container.removeChild(this._label);
		map._container.removeChild(this._canvas);
		map.off('zoomend', this._reset);
	},

	getPosition: function() {
		return this.options.position;
	},

	getContainer: function() {
		return this._container;
	}
});

L.control.geoloc = function (options) {
	return new L.Control.Geoloc(options);
};