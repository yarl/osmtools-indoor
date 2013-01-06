var api = {};
api.layer = {};

api.layer.building = new L.LayerGroup();
api.layer.outlines = new L.LayerGroup();    //full outline
api.layer.pins = new L.LayerGroup();        //pin only

api.shells = new Array();       //list of outlines
api.building;                   //building

/**
 * API QUERYS
 * -----------------------------------------------------------------------------
 */

api.tagShell = function() {
    var b = map.getBounds();
    var boundary = '('+b.getSouthEast().lat+','+b.getNorthWest().lng+','+
        b.getNorthWest().lat+','+b.getSouthEast().lng+');';
    
    return '('+
        'way["level"="0"]["building"="yes"]'+boundary+
        'rel(bw)->.relations;node(w);'+
    ');'+
    'out;';
}

api.tagBuilding = function(id) {
    return text = '('+
        'relation('+id+');'+
        'rel(r);'+
        'node(r)->.nodes;'+
        'way(r);'+
        'node(w);'+
    ');'+
    'out;';
}

/**
 * QUERY
 * -----------------------------------------------------------------------------
 */
api.query = function() {
    if(map.layer == 1) {
        //download elements for zoom 10+
        if(map.getZoom() > 9) {
            api.loadShell();
            if(map.getZoom() < 16) {
                //full outline
                map.removeLayer(api.layer.outlines);
                map.addLayer(api.layer.pins);
            } else {
                //pin only
                map.removeLayer(api.layer.pins);
                map.addLayer(api.layer.outlines);
            }
        } else
            $('#map-zoominfo').css('display', 'block');
    } else if(map.layer == 2) {
        if(map.getZoom() < 16) {
            //full outline
            map.removeLayer(api.layer.building);
            map.addLayer(api.layer.pins);
        } else {
            //pin only
            map.removeLayer(api.layer.pins);
            map.addLayer(api.layer.building);
        }
    }
}

api.loadShell = function() {  
        $('#map-loading').css('display', 'block');
        $('#map-zoominfo').css('display', 'none');

        map.layer = 1;
        if(map.hasLayer(api.layer.building)) {
            api.layer.building.clearLayers();
            map.removeLayer(api.layer.building);
            
            $('#indoor-navigation').css('display', 'none');     // right panel
            $('#indoor-categories').val('All').attr('selected', true);
            $('#indoor-map').attr({"class": 'span12'});
            map.invalidateSize();
        }
        if(!map.hasLayer(api.layer.outlines))
            map.addLayer(api.layer.outlines);

        $.ajax({
            url: "http://overpass-api.de/api/interpreter?data=" + encodeURIComponent(api.tagShell()),
            type: 'GET',
            crossDomain: true,
            success: function(data) {
                api.parseShell(data);
                $('#map-loading')[0].style.display = 'none';
            }
        });
}

api.loadBuilding = function(id) {  
        $('#map-loading').css('display', 'block');
        $('#map-zoominfo').css('display', 'none');

        map.layer = 2;
        if(!map.hasLayer(api.layer.building)) {
            api.layer.building.clearLayers();
            map.addLayer(api.layer.building);
        }
 
        $.ajax({
            url: "http://overpass-api.de/api/interpreter?data=" + encodeURIComponent(api.tagBuilding(id)),
            type: 'GET',
            crossDomain: true,
            success: function(data) {
                if(map.hasLayer(api.layer.outlines))
                   map.removeLayer(api.layer.outlines); 
                api.parseBuilding(data);
                $('#map-loading')[0].style.display = 'none';
            }
        });
}

/**
 * CONTAINS
 * -----------------------------------------------------------------------------
 */
function containsId(array, object) {
    for (var i in array)
        if (array[i] == object)
            return true;
    return false;
}

/**
 * PARSING
 * -----------------------------------------------------------------------------
 */
api.parseShell = function(data) {   
    var nodes = new Array();
    var outlines = new Array();
    
    $(data).find('node').each(function() {
        nodes[$(this).attr("id")] = new L.LatLng($(this).attr("lat"), $(this).attr("lon"));
    });
    
    $(data).find('way').each(function() {
        var coords = new Array();
        $(this).find('nd').each(function() {
            coords.push(nodes[$(this).attr("ref")]);
        });  
        outlines[$(this).attr("id")] = new building.outline(coords);
    });
    
    $(data).find('relation').each(function() {
        var shell, name;
        $(this).find('member').each(function() {
            if($(this).attr("type") == "way" && $(this).attr("role") == "outer")
                shell = $(this).attr("ref");
        }); 
        $(this).find('tag').each(function() {
            if($(this).attr("k") == "name")
                name = $(this).attr("v");
        }); 
        
        if(shell != null) {
            outlines[shell].relationId = $(this).attr("id");
            outlines[shell].name = name;
            if(!containsId(api.shells, shell)) {
                api.shells.push(shell);
                outlines[shell].draw();
            }
        }
    });
}

api.parseBuilding = function(data) {
    var nodes = new Array();
    var ways = new Array();
    var relations = new Array();
    
    // Nodes
    // @TODO: wyjścia!
    $(data).find('node').each(function() {
        nodes[$(this).attr("id")] = new L.LatLng($(this).attr("lat"), $(this).attr("lon"));
    });
    //console.log("węzłów " + nodes.length);

    // Ways - rooms
    $(data).find('way').each(function() {
        var coords = new Array();
        $(this).find('nd').each(function() {
            coords.push(nodes[$(this).attr("ref")]);
        });
        
        var name, type, category = "Other", shop;
        $(this).find('tag').each(function() {
            var key = $(this).attr("k").toLowerCase();
            var value = $(this).attr("v");
            if(key == "name") name = value;
            if(key == "ref")
                (name === undefined) ? name = '['+value+']' : name = '['+value+'] '+name;
            
            if(key == "buildingpart") type = value;
            if(key == "shop" && value.match(/(bag|boutique|clothes|cosmetics|jewelry|shoes)/))
                category = "Fashion";
            if(key == "shop" && value.match(/(antiques|art|bathroom_furnishing|bed|carpet|curtain|doityourself|furniture|hardware|interior_decoration|kitchen|pet)/))
                category = "Home";
            if(key == "shop" && value.match(/(computer|electronics|hifi|mobile_phone|photo)/))
                category = "Electronics"; 
            if((key == "amenity" && value.match(/(pharmacy|clinic|fitness_center)/)) || (key == "shop" && value.match(/(baby_goods|beauty|chemist|hairdresser|massage|optician|organic|tattoo)/)))
                category = "Health";
            if(key == "shop" && value.match(/(supermarket|alcohol|bakery|beverages|butcher|convenience|deli|herbalist)/))
                category = "Food";
            if((key == "amenity" && value.match(/(bureau_de_change|post_office)/)) || (key == "shop" && value.match(/(books|dry_cleaning|gift)/)) || (key == "service"))
                category = "Service";
            if(key == "amenity" && value.match(/(cafe|fast_food|food_court|ice_cream|pub|restaurant)/))
                category = "Gastronomy";
            if(key == "shop" && value.match(/(bicycle|dive|outdoor|sports)/))
                category = "Sport";
            if((key == "amenity" && value.match(/(arts_centre|cinema|theatre)/)) || (key == "leisure" && value.match(/(sports_centre)/)))
                category = "Entertainment";
            
            if(key == "shop" && shop == null) shop = value;
            if(key == "amenity" && shop == null) shop = value;
            if(key == "leisure" && shop == null) shop = value;
        }); 
        
        var way = new building.room($(this).attr("id"), coords, name);
        way.type = type;
        way.category = category;
        way.shop = shop;
        
        ways[$(this).attr("id")] = way;
    });
    //console.log("dróg " + ways.length);
    
    // Relations - levels
    $(data).find('relation').each(function() {
        var type, level = "??";
        
        $(this).find('tag').each(function() {
            var key = $(this).attr("k").toLowerCase();
            var value = $(this).attr("v");
            if(key == "type") type = value;
            if(key == "level") level = value;
        }); 
        
        if(type == "level") {
            var rooms = new Array();
            $(this).find('member').each(function() {
                if($(this).attr("role") == "buildingpart")
                    rooms.push(ways[$(this).attr("ref")]);
            }); 
            
            relations[$(this).attr("id")] = new building.level($(this).attr("id"), level, rooms);
        }
    });
    
    // Relations - building
    $(data).find('relation').each(function() {
        var type, name;

        $(this).find('tag').each(function() {
            var key = $(this).attr("k").toLowerCase();
            var value = $(this).attr("v");
            if(key == "type") type = value;
            if(key == "name") name = value;
        }); 

        if(type == "building") {
            var levels = new Array();
            var shell;

            $(this).find('member').each(function() {
                var type = $(this).attr("type");
                var role = $(this).attr("role");
                if(type == "relation") levels.push(relations[$(this).attr("ref")]);
                if(type == "way" && role == "outer") shell = $(this).attr("ref");
            }); 

            api.building = new building.building($(this).attr("id"), name, relations);
            api.building.shell = shell;
        }
    });

    //finish
    if(api.building != undefined) {
        api.building.drawLevelSwitcher();
        if(api.building.drawLevel(0)) {
            $('#indoor-map').attr({"class": 'span10'});
            $('#indoor-navigation').css('display', 'block');
            map.invalidateSize();
            $("#indoor-levels-0").button('toggle');
        }
    } else {
        alert("Something went wrong (no building found)!");
        api.loadShell();
    }
} 
