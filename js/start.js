var map = {};

var layers = {};
layers.attrib = ' &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

layers.skobbler = new L.tileLayer(
    'http://tiles2.skobbler.net/osm_tiles2/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 21, opacity:0.8 }
);
layers.mapquest = new L.tileLayer(
    'http://otile2.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.8 }
);
layers.foursq = new L.tileLayer(
    'https://dnv9my2eseobd.cloudfront.net/v3/foursquare.map-0y1jh28j/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 17 }
);
layers.hikebike = new L.tileLayer(
    'http://{s}.osm.trail.pl/hikebike/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.8 }
); 
layers.osmapa = new L.tileLayer(
    'http://{s}.osm.trail.pl/osmapa.pl/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.8 }
); 
layers.osm = new L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.8 }
);

/**
 * INIT
 * -----------------------------------------------------------------------------
 */
$(document).ready(function() {
    map = L.map('map', {
        center: new L.LatLng(($.cookie('lat')!=null) ? $.cookie('lat') : 51.917, 
                             ($.cookie('lon')!=null) ? $.cookie('lon') : 19.556),
        zoom: ($.cookie('zoom')!=null) ? $.cookie('zoom') : 6 ,
        layers: [layers.skobbler, api.layer.outlines],
        minZoom: 3
    });
    
    map.controlLayers = {
        "Skobbler": layers.skobbler,
        "MapQuest": layers.mapquest,
        "Foursquare": layers.foursq,
        "OpenStreetMap": layers.osm,
        "Osmapa": layers.osmapa,
        "Hike&Bike": layers.hikebike
    };
    L.control.layers(map.controlLayers, null).addTo(map);

    L.control.scale().addTo(map);
    L.control.geoloc().addTo(map);
    L.control.fullscreen().addTo(map);
    
    map.attributionControl.setPrefix('');
    new L.Hash(map);
    
    map.layer = 1; //1=api, 2=search

    map.icon = L.icon({
        iconUrl: 'img/icons/icon.png',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
    });

    map.fitZoom = function(array) {
        if(array.length == 0) {

        } else if(array.length == 1) {
            map.setView(array[0].coord, 17);
        } else {
            var minLat = array[0].coord.lat;
            var maxLat = array[0].coord.lat;
            var minLon = array[0].coord.lng;
            var maxLon = array[0].coord.lng;

            for(var i=1; i<array.length; ++i) {
                if(array[i].coord.lat>maxLat) maxLat = array[i].coord.lat;
                if(array[i].coord.lat<minLat) minLat = array[i].coord.lat;
                if(array[i].coord.lng>maxLon) maxLon = array[i].coord.lng;
                if(array[i].coord.lng<minLon) minLon = array[i].coord.lng;
            }

            map.fitBounds([[minLat, minLon], [maxLat, maxLon]]);
        }
    };
    
    map.on('moveend',function() {
        $.cookie('lat', map.getCenter().lat, { expires: 30 });
        $.cookie('lon', map.getCenter().lng, { expires: 30 });
        $.cookie('zoom', map.getZoom(), { expires: 30 });        
        //if(map.layer == 1)
            api.query();
    });
       
    $(".leaflet-control-zoom").append( $("#map-loading") );
    $("#button-layer-api").button('toggle');
    
    
    $('#about, #contact').popover({
        trigger: 'manual',
        position: 'bottom',
        html : true
    });

    $('#about').click(function(evt) {
        evt.stopPropagation();
        $('#contact').popover('hide');
        $(this).popover('show');
    });

    $('#contact').click(function(evt) {
        evt.stopPropagation();
        $('#about').popover('hide');
        $(this).popover('show');
    });

    $('html').click(function() {
        $('#about, #contact, #show').popover('hide');
    });
    
    api.query();
/**
 * ONCLICK
 * -----------------------------------------------------------------------------
 */   
    //Exit fullscreen
    $("#grave-window-link").click(function() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
    });
       
    $("#indoor-categories").change(function() {
        api.building.currentType = $(this).children(":selected").attr("value");
        api.building.drawLevel(api.building.currentLevel);
        //console.log(api.building.currentType);
    });
});