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
  var boundary = '(' + b.getSouthEast().lat + ',' + b.getNorthWest().lng + ',' +
          b.getNorthWest().lat + ',' + b.getSouthEast().lng + ');';

  return '(' +
          'way["level"="0"]' + boundary +
          'rel(bw)->.relations;node(w);' +
          ');' +
          'out;';
};

api.tagBuilding = function(id) {
  return text = '(' +
          'relation(' + id + ');>>->.rels;>;' +
          ');' +
          'out;';
};

/**
 * QUERY
 * -----------------------------------------------------------------------------
 */
api.query = function() {
  if (map.layer === 1) {
    //download elements for zoom 10+
    if (map.getZoom() > 9) {
      $('.leaflet-control-requery-info').html(translations['Click to load buildings']);
      //api.loadShell();
      if (map.getZoom() < 16) {
        //full outline
        map.removeLayer(api.layer.outlines);
        map.addLayer(api.layer.pins);
      } else {
        //pin only
        map.removeLayer(api.layer.pins);
        map.addLayer(api.layer.outlines);
      }
    } else
      $('.leaflet-control-requery-info').html(translations['<strong>Zoom in</strong> to load buildings']);
  } else if (map.layer === 2) {
    if (map.getZoom() < 16) {
      //pin only
      map.removeLayer(api.layer.building);
      map.addLayer(api.layer.pins);
    } else {
      //outline
      map.removeLayer(api.layer.pins);
      map.addLayer(api.layer.building);
      for (var i in api.building.getLevel(0).pois)
        api.building.getLevel(api.building.currentLevel).pois[i].draw();
    }
  }
};

api.loadShell = function() {
  map.query.startAnimation();
  $('.leaflet-control-requery').fadeIn('fast');
  $('.leaflet-control-requery-info').fadeIn('fast');
  //$('#map-loading').css('display', 'block');
  //$('#map-zoominfo').css('display', 'none');

  map.layer = 1;
  if (map.hasLayer(api.layer.building)) {
    api.layer.building.clearLayers();
    map.removeLayer(api.layer.building);

  }
  if (!map.hasLayer(api.layer.outlines))
    map.addLayer(api.layer.outlines);

  $.ajax({
    url: "http://overpass.osm.rambler.ru/cgi/interpreter?data=" + encodeURIComponent(api.tagShell()),
    type: 'GET',
    crossDomain: true,
    success: function(data) {
      api.parseShell(data);
      map.query.stopAnimation();
      //$('#map-loading')[0].style.display = 'none';
    }
  });
};

api.loadBuilding = function(id) {
  map.query.startAnimation();
  
  $('.leaflet-control-requery-info').fadeOut('fast');
  map.layer = 2;

  if (!map.hasLayer(api.layer.building)) {
    api.layer.building.clearLayers();
    map.addLayer(api.layer.building);
  }

  $.ajax({
    url: "http://overpass.osm.rambler.ru/cgi/interpreter?data=" + encodeURIComponent(api.tagBuilding(id)),
    type: 'GET',
    crossDomain: true,
    success: function(data) {
      if (map.hasLayer(api.layer.outlines))
        map.removeLayer(api.layer.outlines);
      api.parseBuilding(data);
      map.query.stopAnimation();
      $('.leaflet-control-requery').fadeOut('fast');
      $('.leaflet-control-requery-info').fadeOut('fast');
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
 * PARSING SHELL
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
      if ($(this).attr("type") == "way" && $(this).attr("role") == "outer")
        shell = $(this).attr("ref");
    });
    $(this).find('tag').each(function() {
      if ($(this).attr("k") == "name")
        name = $(this).attr("v");
    });

    if (shell != null) {
      outlines[shell].relationId = $(this).attr("id");
      outlines[shell].name = name;
      if (!containsId(api.shells, shell)) {
        api.shells.push(shell);
        outlines[shell].draw();
      }
    }
  });
}

/**
 * PARSING BUILDING
 * -----------------------------------------------------------------------------
 */
api.parseBuilding = function(data) {
  var nodes = new Array();
  var ways = new Array();
  var ways_rel = new Array();
  var relations = new Array();

  //NODES
  $(data).find('node').each(function() {
    var i = $(this).attr("id");
    nodes[i] = new L.LatLng($(this).attr("lat"), $(this).attr("lon"));

    //extra tags for doors and pois
    $(this).find('tag').each(function() {
      var key = $(this).attr("k").toLowerCase();
      var value = $(this).attr("v");
      if (key == "door")
        nodes[i].door = value;
      if (key == "name")
        nodes[i].name = value;
      if (key == "amenity" || key == "information")
        nodes[i].poi = value;
    });
  });

  //WAYS (ROOMS)
  $(data).find('way').each(function() {
    var coords = new Array();
    $(this).find('nd').each(function() {
      coords.push(nodes[$(this).attr("ref")]);
    });

    var way = new building.room($(this).attr("id"), coords);
    way.category = "Other";

    $(this).find('tag').each(function() {
      var key = $(this).attr("k").toLowerCase();
      var value = $(this).attr("v");
      if (key == "name")
        way.name = value;
      if (key == "access")
        way.access = value;
      if (key == "ref")
        way.ref = value;
      //(way.name === undefined) ? way.name = '['+value+']' : way.name = '['+value+'] '+way.name;

      if (key == "buildingpart")
        way.type = value;

      if (key == "shop" && value.match(/(bag|boutique|clothes|cosmetics|jewelry|perfumery|shoes)/))
        way.category = "Fashion";
      if (key == "shop" && value.match(/(antiques|art|bathroom_furnishing|bed|carpet|curtain|doityourself|furniture|hardware|interior_decoration|kitchen|pet)/))
        way.category = "Home";
      if (key == "shop" && value.match(/(computer|electronics|hifi|mobile_phone|photo)/))
        way.category = "Electronics";
      if ((key == "amenity" && value.match(/(pharmacy|clinic|fitness_center)/)) || (key == "shop" && value.match(/(baby_goods|beauty|chemist|hairdresser|massage|optician|organic|tattoo)/)))
        way.category = "Health";
      if (key == "shop" && value.match(/(supermarket|alcohol|bakery|beverages|butcher|convenience|deli|herbalist)/))
        way.category = "Food";
      if ((key == "amenity" && value.match(/(bureau_de_change|post_office)/)) || (key == "shop" && value.match(/(books|dry_cleaning|gift)/)) || (key == "service"))
        way.category = "Service";
      if (key == "amenity" && value.match(/(cafe|confectionery|fast_food|food_court|ice_cream|pub|restaurant)/))
        way.category = "Gastronomy";
      if (key == "shop" && value.match(/(bicycle|dive|outdoor|sports)/))
        way.category = "Sport";
      if ((key == "amenity" && value.match(/(arts_centre|cinema|theatre)/)) || (key == "leisure" && value.match(/(sports_centre)/)))
        way.category = "Entertainment";

      if (key == "shop" && way.shop == null)
        way.shop = value;
      if (key == "amenity" && way.shop == null)
        way.shop = value;
      if (key == "leisure" && way.shop == null)
        way.shop = value;

      // key contact:[email|fax|phone|website]
      if (key.match(/^contact:/))
        way.contact[key.split(':')[1]] = value;

      //contact data without contact: prefix
      if (key == "email")
        way.contact.email = value;
      if (key == "fax")
        way.contact.fax = value;
      if (key == "phone")
        way.contact.phone = value;
      if (key == "website")
        way.contact.website = value;
      if (key == "opening_hours")
        way.opening_hours = value;

    });
    ways[$(this).attr("id")] = way;
  });

  //RELATIONS (ROOMS)
  $(data).find('relation').each(function() {
    var type;

    $(this).find('tag').each(function() {
      var key = $(this).attr("k").toLowerCase();
      var value = $(this).attr("v");
      if (key == "type")
        type = value;
    });

    if (type == 'multipolygon') {
      var outers = new Array();
      var inners = new Array();

      $(this).find('member').each(function() {
        if ($(this).attr("type") == "way" && $(this).attr("role") == "outer")
          outers.push(ways[$(this).attr("ref")]);
        if ($(this).attr("type") == "way" && $(this).attr("role") == "inner")
          inners.push(ways[$(this).attr("ref")]);
      });

      var coors_o = new Array();
      var coors_i = new Array();
      for (var i in outers)
        coors_o = coors_o.concat(outers[i].coords);
      for (var i in inners)
        coors_i = coors_i.concat(inners[i].coords);

      var way = new building.room($(this).attr("id"), coors_o);
      way.category = "Other";
      way.inner = coors_i;

      $(this).find('tag').each(function() {
        var key = $(this).attr("k").toLowerCase();
        var value = $(this).attr("v");
        if (key == "buildingpart")
          way.type = value;
      });

      ways_rel[$(this).attr("id")] = way;
    }
  });

  //RELATIONS (LEVELS)
  $(data).find('relation').each(function() {
    var type, level = "??";

    $(this).find('tag').each(function() {
      var key = $(this).attr("k").toLowerCase();
      var value = $(this).attr("v");
      if (key == "type")
        type = value;
      if (key == "level")
        level = value;
    });

    if (type == "level") {
      var rooms = new Array();
      var pois = new Array();
      $(this).find('member').each(function() {
        if ($(this).attr("type") == "way" && $(this).attr("role") == "buildingpart")
          rooms.push(ways[$(this).attr("ref")]);
        if ($(this).attr("type") == "relation" && $(this).attr("role") == "buildingpart")
          rooms.push(ways_rel[$(this).attr("ref")]);
        if ($(this).attr("type") == "node" && $(this).attr("role") == "poi") {
          var ref = $(this).attr("ref");
          pois.push(new building.poi(ref, nodes[ref], nodes[ref].poi, nodes[ref].name));
        }

      });
      var id = $(this).attr("id");
      relations[id] = new building.level($(this).attr("id"), level, rooms);
      relations[id].pois = pois;
    }
  });

  //RELATIONS (BUILDING)
  $(data).find('relation').each(function() {
    var type, name;

    $(this).find('tag').each(function() {
      var key = $(this).attr("k").toLowerCase();
      var value = $(this).attr("v");
      if (key == "type")
        type = value;
      if (key == "name")
        name = value;
    });

    if (type == "building") {
      var levels = new Array();
      var shell;

      $(this).find('member').each(function() {
        var type = $(this).attr("type");
        var role = $(this).attr("role");
        if (type == "relation")
          levels.push(relations[$(this).attr("ref")]);
        if (type == "way" && role == "outer")
          shell = $(this).attr("ref");
      });

      api.building = new building.building($(this).attr("id"), name, relations);
      api.building.shell = shell;
    }
  });

  //finish
  if (api.building != undefined) {
    api.building.drawLevelSwitcher();
    if (api.building.drawLevel(0)) {


      //$('#indoor-map').attr({"class": 'span10'});
      $('#indoor-navigation').show();
      $('.tools').show();

      //map.invalidateSize();
      $("#indoor-levels-0").button('toggle');
    }
  } else {
    alert("Something went wrong (no building found)!");
    api.loadShell();
  }
}
