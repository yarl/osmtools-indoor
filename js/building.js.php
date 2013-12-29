<script>
  /**
   * BUILDINGS
   * -----------------------------------------------------------------------------
   */
  var building = {};
  building.color = {
    'Fashion': '#a5b178',
    'Home': '#6e305e',
    'Electronics': '#a2222b',
    'Health': '#3e719e',
    'Food': '#59946c',
    'Service': '#2d878b',
    'Gastronomy': '#f9a338',
    'Sport': '#f0653d',
    'Entertainment': '#e2d23d',
    'Other': '#666'
  };

  building.outline = function(coords) {
    //this.id = id;
    this.coords = coords;
    this.relationId;
    this.name;

    /** Draw outline with popup "Enter..." **/
    this.draw = function() {
      new L.Polygon(this.coords)
              .bindPopup('<strong>' + (this.name == undefined ? "<em>no name</em>" : this.name) + '</strong><hr />' +
                      '<div style="text-align:right; margin-top: 5px;">' +
                      '<a class="btn btn-mini" href="http://osm.org/browse/relation/' + this.relationId + '" target="_blank">' + translations['Open in OSM'] + '</a> ' +
                      '<button class="btn btn-mini btn-success" id="building-open" onclick="api.loadBuilding(' + this.relationId + ');">' + translations['Enter'] + '</button>' +
                      '</div>')
              .addTo(api.layer.outlines);

      new L.marker(this.center())
              .addTo(api.layer.pins)
              .on('click', function() {
                map.setView(this.getLatLng(), 17);
              });
    }

    /** Center of outline **/
    this.center = function() {
      var sumLat = 0, sumLon = 0;
      for (var i in this.coords) {
        sumLat += this.coords[i].lat;
        sumLon += this.coords[i].lng;
      }
      return new L.LatLng(sumLat / this.coords.length, sumLon / this.coords.length);
    }
  }

  building.building = function(id, name, levels) {
    this.id = id;
    this.name = name;
    this.levels = levels;
    this.shell;

    this.currentLevel = 0;
    this.currentType = 'All';

    /** Return level n **/
    this.getLevel = function(n) {
      for (var i in api.building.levels) {
        var level = api.building.levels[i];
        if (level.level == n)
          return level;
      }
    }

    /** Draw level n and write list of rooms **/
    this.drawLevel = function(n) {
      var level = this.getLevel(n);
      if (level != undefined) {
        level.draw();
        $('#indoor-rooms').html(level.list());
        api.building.currentLevel = n;
        return true;
      }
      alert("Something went wrong (no level " + n + ")!");
      api.loadShell();
      return false;
    };

    /**
     * Draw level switcher
     */
    this.drawLevelSwitcher = function() {
      var levels = api.building.levels.slice();
      levels.sort(function(a, b) {
        return a.level - b.level;
      });

      //add text
      $('#indoor-navigation h3').text(this.name);
      $('#indoor-escape button').attr('title', translations['Close']);

      var txt = '<div class="btn-group" data-toggle="buttons">';
      for (var i in levels) {
        var l = levels[i].level;
        txt += '<label class="btn" id="indoor-levels-' + l + '" onclick="api.building.drawLevel(' + l + ');"><input type="radio">' + l + '</label>';
      }
      txt += '</div>';
      $("#indoor-levels").html(txt);
    };

    /** Show popup for selected room in the list. Here because of shorter addr. **/
    this.popup = function(level_, room_) {
      var level = api.building.levels[level_];
      var room = level.rooms[room_];
      map.setView(room.center(room), map.getZoom());
      L.popup()
              .setLatLng(room.center(room))
              .setContent(room.label())
              .openOn(map);
    }
  }
  building.level = function(id, level, rooms) {
    this.id = id;
    this.level = level;

    this.rooms = rooms;
    this.pois = new Array();

    this.shell; //@TODO
    this.coords;
    this.name = "?";

    /** Write list of all room on level **/
    this.list = function() {
      this.rooms.sort(function(a, b) {
        var nameA, nameB;
        if (a.name == null)
          nameA = "~";
        else
          nameA = a.name.toLowerCase();
        if (b.name == null)
          nameB = "~";
        else
          nameB = b.name.toLowerCase();

        if (nameA < nameB)
          return -1;
        if (nameA > nameB)
          return 1;
        return 0;
      });

      var txt = '';
      for (var i in this.rooms)
        if (this.rooms[i] != null && this.rooms[i].label() != null)
          if (api.building.currentType == 'All' || this.rooms[i].category == api.building.currentType)
            txt += '<div class="indoor-list-room" onclick="api.building.popup(' + this.id + ',' + i + ')">' + this.rooms[i].label() + '</div>';
      if (txt == '') {
        if (api.building.currentType == 'All')
          txt += '<em>' + translations['Empty floor'] + '</em>';
        else
          txt += '<em>' + translations['None on this floor'] + '</em>';
      }

      return txt;
    };

    /** Draw level **/
    this.draw = function() {
      api.layer.building.clearLayers();
      for (var i in this.rooms)
        if (this.rooms[i] !== null)
          this.rooms[i].draw();
      for (var i in this.pois)
        if (this.pois[i] !== null)
          this.pois[i].draw();
    };
  };

  building.room = function(id, coords) {
    this.id = id;
    this.coords = coords;
    this.name;
    this.ref;

    this.type;      // corridor,room...
    this.category;  // fashion,home,health...
    this.shop;      // value of amenity=* or shop=*
    this.access;
    this.contact = {};
    this.opening_hours;

    this.polygon;

    /** Draw room **/
    this.draw = function() {
      var helper = this;
      var coor = this.coords
      if (this.inner != undefined)
        coor = [this.coords, this.inner];

      this.polygon = new L.Polygon(coor, {
        smoothFactor: 0.2,
        clickable: this.clickable(),
        weight: this.weight(),
        color: this.color(),
        fillOpacity: 0.4
      })
              .bindLabel(this.label())
              .addTo(api.layer.building)
              .on('click', function() {
                helper.modal();
              });
      if (this.type == "corridor")
        this.polygon.bringToBack();

      for (var i in this.coords) {
        if (this.coords[i].door != null) {
          new L.circleMarker(this.coords[i], {
            radius: 2,
            weight: 2,
            clickable: false,
            color: '#666',
            fillOpacity: 0.8
          })
                  .addTo(api.layer.building);
        }
      }
    }

    //formatted label
    this.label = function() {
      if (this.name == undefined && this.ref != undefined)
        return '<span style="color:' + this.color() + '">■</span> #' + this.ref;
      if (this.name != undefined)
        return '<span style="color:' + this.color() + '">■</span> ' + this.name;
      return null;
    }

    this.modal = function() {
      $('#indoor-window-header').html(this.name);

      // Text to be displayed in modal window
      var window_text = "<h4>" + translations['Type'] + "</h4>" + translations[this.category];

      // Process contact:* keys
      if (!$.isEmptyObject(this.contact)) {
        var keys_translated = {
          email: '<?php echo __('email'); ?>',
          fax: '<?php echo __('fax'); ?>',
          phone: '<?php echo __('phone'); ?>',
          website: '<?php echo __('website'); ?>'
        }

        window_text += '<h5><?php echo __('Contact'); ?></h5>\n';
        window_text += '<ul>\n';
        $.each(this.contact, function(key, value) {
          if (key == 'website') {
            value = '<a href="' + value + '">' + value + '</a>';
          } else if (key == 'email') {
            value = '<a href="mailto:' + value + '">' + value + '</a>';
          }

          window_text += '<li>' + (keys_translated[key] != undefined ? keys_translated[key] : key) + ': ' + value + '</li>\n';
        });
        window_text += '</ul>\n';
      }

      //Process opening_hours key
      if (this.opening_hours != null) {
        window_text += '<h5><?php echo __('Opening hours'); ?></h5>\n';
        var oh = new window.opening_hours(this.opening_hours);
        var now = new Date();
        var from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var to = new Date(from.getTime() + 24 * 60 * 60 * 1000);

        window_text += '<ul class="opening_hours-datelist">\n';
        //We'll display opening hours for 7 days starting today
        for (var i = 0; i <= 6; i++) {
          window_text += '<li><span>' + $.format.date(from, '<?php echo __('dd/MM/yyyy'); ?>') + '</span>';
          var opening_hours = oh.getOpenIntervals(from, to);
          if (!$.isEmptyObject(opening_hours)) {
            $.each(opening_hours, function(key, value) {
              window_text += '<span class="open">'
                      + $.format.date(value[0], '<?php echo __('hh:mm a'); ?>')
                      + ' - '
                      + $.format.date(value[1], '<?php echo __('hh:mm a'); ?>')
                      + '</span>';
            });
          } else {
            window_text += '<span class="closed"><?php echo __('closed'); ?></span>\n';
          }
          window_text += '</li>\n';

          // move to next day
          from = to;
          to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
        }
        window_text += '</ul>';
      }


      $('#indoor-window-text').html(window_text);
      $("#indoor-window-link").attr("href", "http://www.openstreetmap.org/browse/way/" + this.id);

      var href = "http://localhost:8111/load_and_zoom";
      href += "?left=" + this.polygon.getBounds().getSouthWest().lng;
      href += "&right=" + this.polygon.getBounds().getNorthEast().lng;
      href += "&top=" + this.polygon.getBounds().getNorthEast().lat;
      href += "&bottom=" + this.polygon.getBounds().getSouthWest().lat;
      href += "&select=way" + this.id;

      $("#indoor-window-josm").click(function() {
        if (document.exitFullscreen)
          document.exitFullscreen();
        else if (document.mozCancelFullScreen)
          document.mozCancelFullScreen();
        else if (document.webkitCancelFullScreen)
          document.webkitCancelFullScreen();
        $('#josm-iframe').attr("src", href);
      });

      $('#indoor-window').modal();
    }

    /** Color for room **/
    this.color = function() {
      switch (this.type) {
        case 'corridor':
          {
            if (this.access == "private")
              return '#bb9696';
            return '#bbb';
          }
        case 'verticalpassage':
          return '#aaa';
        case 'room':
          {
            if (this.access == "private")
              return '#997a7a';
            if (this.name == null)
              return '#888';
            if (api.building.currentType == 'All' || this.category == api.building.currentType)
              return building.color[this.category];
            else
              return '#555';
          }

      }
      return '#aaa';
    }

    /** Click or not **/
    this.clickable = function() {
      if (this.type == 'corridor')
        return false;
      if (this.name == null)
        return false;
      return true;
    }

    /** Color for room **/
    this.weight = function() {
      switch (this.type) {
        case 'corridor':
          return 1;
        case 'verticalpassage':
          return 0;
      }
      return 2;
    }

    /** Center of room outline **/
    this.center = function() {
      var sumLat = 0, sumLon = 0;
      for (var i in this.coords) {
        sumLat += this.coords[i].lat;
        sumLon += this.coords[i].lng;
      }
      return new L.LatLng(sumLat / this.coords.length, sumLon / this.coords.length);
    }
  }

  building.poi = function(id, coords, type, name) {
    this.id = id;
    this.coords = coords;
    this.type = type;
    this.name = name;

    this.marker = new L.marker([this.coords.lat, this.coords.lng]);
    this.circle = new L.circle([this.coords.lat, this.coords.lng], 0.5, {
      weight: 2,
      color: '#666',
      fillOpacity: 0.4
    });
    this.current;

    this.icon = function() {
      switch (this.type) {
        case 'atm' :
          return 'img/pois/atm.png';
        case 'office' :
          return 'img/pois/info.png';
        case 'telephone' :
          return 'img/pois/tel.png';
        case 'vending_machine' :
          return 'img/pois/vmachine.png';
        default :
          return null;
      }
    }

    this.draw = function() {
      var helper = this;
      //circle - no name
      if (this.icon() == null || map.getZoom() < 20) {
        if (this.current != 2) {
          this.current = 2;
          api.layer.building.removeLayer(this.marker);
          this.circle.addTo(api.layer.building);
          this.circle.on('click', function() {
            helper.modal()
          });
        }
      } else {
        if (this.current != 1) {
          this.current = 1;
          api.layer.building.removeLayer(this.circle);
          this.marker.setIcon(L.icon({
            iconUrl: this.icon(),
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          }));
          this.marker.bindLabel(this.name);
          this.marker.addTo(api.layer.building);
          this.marker.on('click', function() {
            helper.modal()
          });
        }
      }
    }

    this.modal = function() {
      $('#indoor-window-header').html(this.name == undefined ? "<em><?php echo __('no name'); ?></em>" : this.name);
      $('#indoor-window-text').html("<h4><?php echo __('Type'); ?></h4>" + this.type);
      $("#indoor-window-link").attr("href", "http://www.openstreetmap.org/browse/node/" + this.id);

      var href = "http://localhost:8111/load_and_zoom";
      href += "?left=" + String(parseFloat(this.coords.lng) - 0.001);
      href += "&right=" + String(parseFloat(this.coords.lng) + 0.001);
      href += "&top=" + String(parseFloat(this.coords.lat) + 0.001);
      href += "&bottom=" + String(parseFloat(this.coords.lat) - 0.001);
      href += "&select=node" + this.id;

      $("#indoor-window-josm").click(function() {
        if (document.exitFullscreen)
          document.exitFullscreen();
        else if (document.mozCancelFullScreen)
          document.mozCancelFullScreen();
        else if (document.webkitCancelFullScreen)
          document.webkitCancelFullScreen();
        $('#josm-iframe').attr("src", href);
      });

      $('#indoor-window').modal();
    }
  }
</script>
