/**
 * @author Yarl
 * Based on https://github.com/kartena/Leaflet.Pancontrol
 */

(function(factory) {
  // Packaging/modules magic dance
  var L;
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['leaflet'], factory);
  } else if (typeof module !== 'undefined') {
    // Node/CommonJS
    L = require('leaflet');
    module.exports = factory(L);
  } else {
    // Browser globals
    if (typeof window.L === 'undefined')
      throw 'Leaflet must be loaded first';
    factory(window.L);
  }
}(function(L) {
  'use strict';
  L.Control.Requery = L.Control.extend({
    options: {
      position: 'topleft',
      text: 'Seach area'
    },
    onAdd: function(map) {
      var container = L.DomUtil.create('div', 'leaflet-control-requery leaflet-bar');
      var link = L.DomUtil.create('a', 'leaflet-control-requery-btn', container);
        link.href = '#';
        link.title = this.options.text;
        link.innerHTML = '<div>↻</div>';
        
      L.DomEvent
              .on(link, 'click', L.DomEvent.stopPropagation)
              .on(link, 'click', L.DomEvent.preventDefault)
              .on(link, 'click', function() {
                api.loadShell();
              }, map)
              .on(link, 'dblclick', L.DomEvent.stopPropagation);


      //<strong>Zoom in</strong> to load buildings

      // Add pan control class to the control container
      var controlContainer = L.DomUtil.get(map._controlCorners.topleft);
      if (!L.DomUtil.hasClass(controlContainer, 'has-leaflet-pan-control')) {
        L.DomUtil.addClass(controlContainer, 'has-leaflet-pan-control');
      }

      $("<span class='leaflet-control-requery-info'>"+translations['Click to load buildings']+"</span>").insertAfter("#map");
      
      return container;
    },
    onRemove: function(map) {
      // Remove pan control class to the control container
      var controlContainer = L.DomUtil.get(map._controlCorners.topleft);
      if (L.DomUtil.hasClass(controlContainer, 'has-leaflet-pan-control')) {
        L.DomUtil.removeClass(controlContainer, 'has-leaflet-pan-control');
      }
    },
    startAnimation: function() {
      $('.leaflet-control-requery div').addClass('leaflet-control-rotate');
    },
    stopAnimation: function() {
      $('.leaflet-control-requery div').removeClass('leaflet-control-rotate');
    }
  });

  L.Map.mergeOptions({
    panControl: false
  });

  L.Map.addInitHook(function() {
    if (this.options.panControl) {
      this.panControl = new L.Control.Requery();
      this.addControl(this.panControl);
    }
  });

  L.control.requery = function(options) {
    return new L.Control.Requery(options);
  };

  return L.Control.Requery;
}));
