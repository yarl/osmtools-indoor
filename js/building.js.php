<script>
/**
 * BUILDINGS
 * -----------------------------------------------------------------------------
 */
var building = {};
building.color = {
    'Fashion': '#a5b178',
    'Home': '#6e305e',
    'Electronics': '#c43741',
    'Health': '#3e719e',
    'Food': '#59946c',
    'Service': '#2d878b',
    'Gastronomy': '#f9a338',
    'Sport': '#f0653d',
    'Entertainment': '#e2d23d',
    'Other': '#666'
}

building.types = {
    'Fashion': '<?php echo __('Fashion'); ?>',
    'Home': '<?php echo __('Home'); ?>',
    'Electronics': '<?php echo __('Electronics'); ?>',
    'Health': '<?php echo __('Health'); ?>',
    'Food': '<?php echo __('Food'); ?>',
    'Service': '<?php echo __('Service'); ?>',
    'Gastronomy': '<?php echo __('Gastronomy'); ?>',
    'Sport': '<?php echo __('Sport'); ?>',
    'Entertainment': '<?php echo __('Entertainment'); ?>',
    'Other': '<?php echo __('Other'); ?>'
}

building.outline = function(coords) {
    //this.id = id;
    this.coords = coords;
    this.relationId;
    this.name;
    
    /** Draw outline with popup "Enter..." **/
    this.draw = function() {
        new L.Polygon(this.coords)      
            .bindPopup('<strong>' + this.name + '</strong><hr />'+
            '<div style="text-align:right; margin-top: 5px;">'+
                '<a class="btn btn-mini" href="http://osm.org/browse/relation/' + this.relationId + '" target="_blank"><?php echo __('Open in OSM'); ?></a> '+
                '<button class="btn btn-mini btn-success" id="building-open" onclick="api.loadBuilding(' + this.relationId + ');"><?php echo __('Enter'); ?></button>'+
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
        for(var i in this.coords) {
            sumLat += this.coords[i].lat;
            sumLon += this.coords[i].lng;
        }
        return new L.LatLng(sumLat/this.coords.length, sumLon/this.coords.length);
    }
}

building.building = function(id, name, levels) {
    this.id = id;
    this.name = name;
    this.levels = levels;
    this.shell;
    
    this.currentLevel = 0;
    this.currentType = 'All';

    /** Draw level n and write list of rooms **/
    this.drawLevel = function(n) {
        for(var i in api.building.levels) {
            var level = api.building.levels[i];
            if(level.level == n) {
                level.draw(level);
                $('#indoor-rooms').html(level.list());
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
        L.popup()
            .setLatLng(room.center(room))
            .setContent('<span style="color:'+ room.color(room) +'">■</span> ' + room.name)
            .openOn(map);
    }
}
building.level = function(id, level, rooms) {
    this.id = id;
    this.level = level;
    this.rooms = rooms;
    this.shell; //todo!
    this.coords;
    this.name = "?";
    
    /** Write list of all room on level **/

    this.list = function() {
        this.rooms.sort(function(a, b) {
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
        for(var i in this.rooms)
            if(this.rooms[i] != null && this.rooms[i].name != null)
                if(api.building.currentType == 'All' || this.rooms[i].category == api.building.currentType) 
                    txt += '<div class="indoor-list-room" onclick="api.building.popup('+this.id+','+i+')"><span style="color:'+ this.rooms[i].color(this.rooms[i], 'All') +'">■</span> ' + this.rooms[i].name + '</div>';
        return txt;
    }
    
    /** Draw level **/
    this.draw = function() {
        api.layer.building.clearLayers();
        for(var i in this.rooms) 
            if(this.rooms[i] != null)
                this.rooms[i].draw(this.rooms[i]);
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
    this.draw = function() {
        var helper = this;
        
        this.polygon = new L.Polygon(this.coords, {
            clickable: this.clickable(),
            weight: this.weight(),
            color: this.color(),
            fillOpacity: 0.4
        })
        .bindLabel('<span style="color:'+ this.color() +'">■</span> ' + this.name)
        .on('click', function() {
            $('#indoor-window-header').html(helper.name);
            $('#indoor-window-text').html("<h4><?php echo __('Type'); ?></h4>" + building.types[helper.category]);
            $("#indoor-window-link").attr("href", "http://www.openstreetmap.org/browse/way/" + helper.id);

            var href = "http://localhost:8111/load_and_zoom";
                href += "?left=" + helper.polygon.getBounds().getSouthWest().lng;
                href += "&right=" + helper.polygon.getBounds().getNorthEast().lng;
                href += "&top=" + helper.polygon.getBounds().getNorthEast().lat;
                href += "&bottom=" + helper.polygon.getBounds().getSouthWest().lat;
                href += "&select=way" + helper.id;

            $("#indoor-window-josm").click(function(){
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
                $('#josm-iframe').attr("src", href);
            });

            $('#indoor-window').modal();
        });

        api.layer.building.addLayer(this.polygon);
    }
    
    /** Color for room **/
    this.color = function() {
        switch(this.type) {
            case 'corridor':return '#ccc';
            case 'verticalpassage':return '#aaa';
        }
        if(api.building.currentType == 'All' || this.category == api.building.currentType) {
            if(this.category != null) return building.color[this.category];
            if(this.name != null) return '#666';
            return '#999';
        }
        return '#666';
    }
     
    /** Click or not **/
    this.clickable = function() {
        if(this.type == 'corridor')
            return false;
        if(this.name == null)
            return false;
        return true;
    }
    
    /** Color for room **/
    this.weight = function() {
        switch(this.type) {
            case 'corridor':return 0;
            case 'verticalpassage':return 0;  
        }
        return 2;
    }
    
    /** Center of room outline **/
    this.center = function() {
        var sumLat = 0, sumLon = 0;
        for(var i in this.coords) {
            sumLat += this.coords[i].lat;
            sumLon += this.coords[i].lng;
        }
        return new L.LatLng(sumLat/this.coords.length, sumLon/this.coords.length);
    }
}
</script>