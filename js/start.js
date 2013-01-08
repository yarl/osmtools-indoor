var layers = {};

layers.attrib = ' &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

layers.skobbler = new L.tileLayer(
    'http://tiles2.skobbler.net/osm_tiles2/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 21, opacity:0.8 });
layers.mapquest = new L.tileLayer(
    'http://otile2.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.8 });
layers.foursq = new L.tileLayer(
    'https://dnv9my2eseobd.cloudfront.net/v3/foursquare.map-0y1jh28j/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 17 });
layers.hikebike = new L.tileLayer(
    'http://{s}.osm.trail.pl/hikebike/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.8 }); 
layers.osmapa = new L.tileLayer(
    'http://{s}.osm.trail.pl/osmapa.pl/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.8 }); 
layers.osm = new L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.8 });

/**
 * INIT
 * -----------------------------------------------------------------------------
 */
var map = {};
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
    $(".leaflet-control-zoom").append( $("#map-loading") );
    
    /*
     * Events
     */
    map.on('moveend',function() {
        $.cookie('lat', map.getCenter().lat, { expires: 30 });
        $.cookie('lon', map.getCenter().lng, { expires: 30 });
        $.cookie('zoom', map.getZoom(), { expires: 30 });        
        api.query();
    });
       
    $('#about').popover({
        trigger: 'manual',
        position: 'bottom',
        html : true
    }).click(function(evt) {
        evt.stopPropagation();
        $(this).popover('show');
    });
    $('html').click(function() {
        $('#about, #contact, #show').popover('hide');
    });
    
    /*
     * Start
     */
    map.layer = 1; //1=outdoor, 2=indoor
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