var layers = {};

layers.attrib = ' &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

layers.skobbler = new L.tileLayer(
    'http://tiles1.skobbler.net/osm_tiles2/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 21, opacity:0.6 });
layers.mapquest = new L.tileLayer(
    'http://otile2.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.8 });
layers.foursq = new L.tileLayer(
    'https://dnv9my2eseobd.cloudfront.net/v3/foursquare.map-0y1jh28j/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 17 });
layers.hot = new L.tileLayer(
    'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 20, opacity:0.5 }); 
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
        center: [localStorage['indoor-lat'] !== undefined ? localStorage['indoor-lat'] : 52.019,
                localStorage['indoor-lng'] !== undefined ? localStorage['indoor-lng'] : 20.676],
        zoom: localStorage['indoor-zoom'] !== undefined ? localStorage['indoor-zoom'] : 6,
        layers: [layers.skobbler, api.layer.outlines],
        minZoom: 3,
        attributionControl: false
    });
    L.control.scale().addTo(map);
    map.query = L.control.requery();
    map.query.addTo(map);
    
    new L.Hash(map);
    //$(".leaflet-control-zoom").append( $("#map-loading") );
    
    /*
     * Events
     */
    map.on('moveend', function(e){
      localStorage['indoor-lat'] = map.getCenter().lat;
      localStorage['indoor-lng'] = map.getCenter().lng;
      localStorage['indoor-zoom'] = map.getZoom();
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
    
    $('#indoor-escape').click(function() {
      api.loadShell();
      $('#indoor-navigation').hide();
    });
    
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