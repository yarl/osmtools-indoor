var map = {};
map.lang = "pl";

    
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
        center: new L.LatLng(51.917, 19.556),
        zoom: 6,
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
        if(map.layer == 1)
            api.query();
    });
       
    $(".leaflet-control-zoom").append( $("#map-loading") );
    $("#button-layer-api").button('toggle');
    
    $('#about').popover({ html : true });
    $('#contact').popover({ html : true });
    $('#show').popover({ html : true });
    
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

/**
 * BUILDINGS
 * -----------------------------------------------------------------------------
 */
var building = {};

building.color = function(type) {
    switch(type) {
        case 'fashion': return '#a5b178';
        case 'home': return '#6e305e';
        case 'electronics': return '#c43741';
        case 'health': return '#3e719e';
        case 'food': return '#59946c';
        case 'service': return '#2d878b';
        case 'gastro': return '#f9a338';
        case 'sport': return '#f0653d';
        case 'entertainment': return '#e2d23d';
    }
    return '#666';
}

building.outline = function(coords) {
    //this.id = id;
    this.coords = coords;
    this.relationId;
    this.name;
    
    /** Draw outline with popup "Enter..." **/
    this.draw = function(outline) {
        var polygon = new L.Polygon(outline.coords);        
        polygon.bindPopup('<strong>' + outline.name + '</strong><hr />'+
            '<div style="text-align:right; margin-top: 5px;">'+
            '<a class="btn btn-mini" href="http://osm.org/browse/relation/' + outline.relationId + '" target="_blank">OSM</a> '+
            '<button class="btn btn-mini btn-success" id="building-open" onclick="api.loadBuilding(' + outline.relationId + ');">Wejdź...</button>'+
            '</div>');
        api.layer.outlines.addLayer(polygon);
        polygon.closePopup();
    }
}

building.building = function(id, name, levels) {
    this.id = id;
    this.name = name;
    this.levels = levels;
    this.shell;
    
    this.currentLevel = 0;
    this.currentType = 'all';

    /** Draw level n and write list of rooms **/
    this.drawLevel = function(n) {
        for(var i in api.building.levels) {
            var level = api.building.levels[i];
            if(level.level == n) {
                level.draw(level);
                $('#indoor-rooms').html(level.list(level));
                api.building.currentLevel = n;
                break;
            }
        }
    }
    
    /** Draw level switcher **/
    this.drawLevelSwitcher = function() {       
        var levels = api.building.levels.slice();
        levels.sort(function(a, b) {
            return a.level - b.level;
        });
        
        var txt = '<div class="btn-group" data-toggle="buttons-radio">'+
            '<button class="btn" onclick="api.loadShell()"><i class="icon-remove"></i></button>';
        for(var i in levels) {
            var l = levels[i].level;
            txt += '<button class="btn" id="indoor-levels-'+l+'" onclick="api.building.drawLevel('+l+');">'+l+'</button>';
        }
        txt += '</div>';
        $("#indoor-levels").html(txt);
    }

    /** Show popup for selected room in the list. Here because of shorter addr. **/
    this.popup = function(level_, room_) {
        var level = api.building.levels[level_];
        var room = level.rooms[room_];
        map.setView(room.center(room), map.getZoom());
        room.polygon.openPopup(room.center(room));
    }
}

building.level = function(id, level, rooms) {
    this.id = id;
    this.level = level;
    this.rooms = rooms;
    this.coords;
    this.name = "?";
    
    /** Write list of all room on level **/
    this.list = function(level) {
        level.rooms.sort(function(a, b) {
            var nameA, nameB;
            if(a.name == null) nameA = "?";
                else nameA=a.name.toLowerCase();
            if(b.name == null) nameB = "?";
                else nameB=b.name.toLowerCase();

            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });
        
        var txt = '';
        for(var i in level.rooms)
            if(level.rooms[i].name != null)
                if(api.building.currentType == 'all' || level.rooms[i].category == api.building.currentType) 
                    txt += '<div class="indoor-list-room" onclick="api.building.popup('+level.id+','+i+')"><span style="color:'+ level.rooms[i].color(level.rooms[i], 'all') +'">■</span> ' + level.rooms[i].name + '</div>';
        return txt;
    }
    
    /** Draw level **/
    this.draw = function(level) {
        api.layer.building.clearLayers();
        for(var i in level.rooms)
            level.rooms[i].draw(level.rooms[i]);
    }
}

building.room = function(id, coords, name) {
    this.id = id;
    this.coords = coords;
    this.name = name;
    
    this.type;      // corridor,room...
    this.category;  // fashion,home,health...
    this.shop;      // value of amenity=* or shop=*
    
    this.polygon;
    
    /** Draw room **/
    this.draw = function(room) {
        var txt = '';
        if(room.shop != null) txt += '<em>'+room.shop+'</em><br/>';
        
        if(room.name != null) txt += room.name;
        else txt += '<em>no name</em>';
        txt += '<hr /><div style="text-align:right; margin-top: 5px;">'+
            '<a class="btn btn-mini" href="http://osm.org/browse/way/' + room.id + '" target="_blank">OSM</a>'+
            '</div>';
        
        room.polygon = new L.Polygon(room.coords, {
            clickable: room.clickable(room),
            weight: room.weight(room),
            color: room.color(room),
            fillOpacity: 0.4
        }).bindLabel('<span style="color:'+ room.color(room, 'all') +'">■</span> ' + room.name);
          
        room.polygon.on('click', function(e) {
            $('#indoor-window-header').html(room.name);
            $('#indoor-window-text').html(room.category);
            $("#indoor-window-link").attr("href", "http://www.openstreetmap.org/browse/way/" + room.id);

            var href = "http://localhost:8111/load_and_zoom";
                href += "?left=" + room.polygon.getBounds().getSouthWest().lng;
                href += "&right=" + room.polygon.getBounds().getNorthEast().lng;
                href += "&top=" + room.polygon.getBounds().getNorthEast().lat;
                href += "&bottom=" + room.polygon.getBounds().getSouthWest().lat;
                href += "&select=way" + room.id;

            $("#indoor-window-josm").click(function(){
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
                $('#josm-iframe').attr("src", href);
            });

            $('#indoor-window').modal();
        });

        api.layer.building.addLayer(room.polygon);
    }
    
    /** Color for room **/
    this.color = function(room) {
        switch(room.type) {
            case 'corridor':return '#ccc';
            case 'verticalpassage':return '#aaa';
        }
        if(api.building.currentType == 'all' || room.category == api.building.currentType) {
            if(room.category != null) return building.color(room.category);
            if(room.name != null) return '#666';
            return '#999';
        }
        return '#666';
    }
     
    /** Color for room **/
    this.clickable = function(room) {
        if(room.type == 'corridor')
            return false;
        if(room.name == null)
            return false;
        return true;
    }
    
    /** Color for room **/
    this.weight = function(room) {
        switch(room.type) {
            case 'corridor':return 0;
            case 'verticalpassage':return 0;  
        }
        return 2;
    }
    
    /** Center of room outline **/
    this.center = function(room) {
        var sumLat = 0, sumLon = 0;
        for(var i in room.coords) {
            sumLat += room.coords[i].lat;
            sumLon += room.coords[i].lng;
        }
        return new L.LatLng(sumLat/room.coords.length, sumLon/room.coords.length);
    }
}