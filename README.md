OpenStreetMap Indoor Mapping browser.

### How it works?
Displayed data are taken 'live' from OSM database is using [Overpass API](http://wiki.openstreetmap.org/wiki/Overpass_API). It's working worldwide.
 
### How to render a building?

In order to render building outline on the map, relation of building should have a way (role 'outer') with tags building='yes' and level='0' (see screenshot below). The relation itself should have tag type='building' and contain subrelations representing building's levels.

![JOSM](http://i.imgur.com/JRAL8.png)

Relation of level should have tag type='level' and contain ways - rooms. Each room should be a member of proper level with role 'buildingpart' and should contain tag buildingpart='room'.

![JOSM](http://i.imgur.com/RUb6i.png)

For more information please take a look at [wiki page](http://wiki.openstreetmap.org/wiki/IndoorOSM#The_Model_.2F_Tagging_Schema).

### License

    Copyright (C) 2012-2013 Yarl (yarl@o2.pl)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
