<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="utf-8">
    <title>Indoor | OSMTools.org</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="yarl@o2.pl">

    <link href="css/bootstrap.css" rel="stylesheet">
    <link href="css/fixes.css" rel="stylesheet">
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Leaflet -->
    <link rel="stylesheet" href="js/leaflet/leaflet.css" />
    <!--[if lte IE 8]><link rel="stylesheet" href="js/leaflet/leaflet.ie.css" /><![endif]-->
    <script src="http://leafletjs.com/dist/leaflet.js"></script>
    
    <link rel="stylesheet" href="js/leaflet/MarkerCluster.css" />
    <link rel="stylesheet" href="js/leaflet/MarkerCluster.Default.css" />
    <!--[if lte IE 8]><link rel="stylesheet" href="js/leaflet/MarkerCluster.Default.ie.css" /><![endif]-->
    
    <script src="js/leaflet/leaflet.markercluster.js"></script>
    <script src="js/leaflet/leaflet-hash.js"></script>
    <script src="js/leaflet/leaflet-geoloc.js"></script>
    <script src="js/leaflet/leaflet-fullscreen.js"></script>
    
    <script src="http://code.jquery.com/jquery-latest.js"></script>
    <script src="js/geo.js"></script>
    <script src="js/gears_init.js"></script>
  </head>

  <body>  
    <div class="navbar navbar-static-top" id="top">
      <div class="navbar-inner">
        <div class="container">
          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a>
          <a class="brand" href="index.php"><img src="img/logo.png" alt="OpenStreetMap Polska" />/indoor<sup>beta</sup></a>
          <div class="nav-collapse collapse">
            <ul class="nav">
              <li><a id="about" rel="popover" 
                     data-placement="bottom" 
                     data-content='<a href="http://wiki.openstreetmap.org/wiki/IndoorOSM">Opis modelu Indoor Mapping</a>'
                     data-original-title="Informacje">Informacje</a>
              </li>
              <li><a id="contact" rel="popover" 
                     data-placement="bottom" 
                     data-content='Autor: <a href="http://www.openstreetmap.org/user/Yarl" alt="Kontakt">user:Yarl</a>'
                     data-original-title="Kontakt">Kontakt</a>
              </li>
            </ul>
            <ul class="nav pull-right">
              <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">Więcej <b class="caret"></b></a>
                <ul class="dropdown-menu">
                  <li><a href="http://osmapa.pl/">osmapa.pl</a></li>
                  <li><a href="http://osmapa.pl/w">osmapa.pl/w</a></li>
                  <li class="divider"></li>
                  <li class="nav-header">Stowarzyszenie</li>
                  <li><a href="http://osm.org.pl">OpenStreetMap Polska</a></li>
                </ul>
              </li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>
    </div>

    <div class="container">
    <a id="map-loading" style="display: none;"><img src="img/loading.gif" alt="Wczytywanie..."/></a>

    <div class="row">
        <!-- MAP -->
        <div class="span10">
            <h3>Mapa</h3>
            <br clear="all" />
            <!-- Map -->
            <div id="map-container">
                <div id="map"></div>
            </div>
            
            <div style="margin-top:5px">
                <a onclick="map.setView(new L.LatLng(51.09447, 17.01945),18)">Sky Tower (Wrocław)</a> | 
                <a onclick="map.setView(new L.LatLng(54.47471, 18.55180),17)">CH Klif (Gdynia)</a>
            </div>
            <div class="alert alert-block" id="map-zoominfo">
                <p>Przybliż mapę aby pobrać elementy</p>
            </div>
        </div>
        
        <!-- OPTIONS -->
        <div class="span2">
            <h3>Nawigacja</h3>
            <div id="indoor-levels"></div>
            <select class="input-medium" id="indoor-categories">
                <option value="all">Wszystko</option>
                <option value="fashion">Moda</option>
                <option value="home">Wyposażenie domu</option>
                <option value="electronics">Elektronika</option>
                <option value="health">Zdrowie</option>
                <option value="food">Spożywcze</option>
                <option value="service">Usługi</option>
                <option value="gastro">Gastronomia</option>
                <option value="sport">Sport</option>
                <option value="entertainment">Rozrywka</option>
            </select>
            <div id="indoor-rooms"></div>
        </div>
      </div>   
      <hr>
      <footer>
          <p>2012 - <a href="http://osmtools.org">OSMTools.org</a></p>
      </footer>

    </div> <!-- /container -->
    <script src="js/start.js"></script>
    <script src="js/overpass.js"></script>
    <script src="js/bootstrap.min.js"></script>
    
    <iframe src="#" width="0" height="0" id='josm-iframe'></iframe>
  </body>
</html>

