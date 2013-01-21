<!DOCTYPE html>
<?php
    include('i18n.php');
    function __($token) {
        global $translation;
        $lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
        if (!array_key_exists($token, $translation) || !array_key_exists($lang, $translation[$token]))
            return $token;
        else
            return $translation[$token][$lang];
    }
?>
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
    <link rel="stylesheet" href="js/leaflet/leaflet.label.css" />
    
    <script src="js/leaflet/leaflet.markercluster.js"></script>
    <script src="js/leaflet/leaflet.label.js"></script>
    <script src="js/leaflet/leaflet.providers.js"></script>
    <script src="js/leaflet/leaflet-hash.js"></script>
    <script src="js/leaflet/leaflet-geoloc.js"></script>
    <script src="js/leaflet/leaflet-fullscreen.js"></script>
    
    <script src="js/jquery-latest.js"></script>
    <script src="js/jquery.cookie.js"></script>
    <script src="js/jquery.dateFormat-1.0.js"></script>
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
          <a class="brand" href="."><img src="img/logo.png" alt="OSMTools.org" /><span>/indoor<sup>beta</sup></span></a>
          <div class="nav-collapse collapse">
            <ul class="nav">
              <li><a id="about" rel="popover" 
                     data-placement="bottom" 
                     data-content='<table class="table table-condensed">
                        <tbody>
                            <tr>
                            <td><?php echo __('Description'); ?></td>
                            <td><a href="https://github.com/yarl/osmtools-indoor#readme"><?php echo __('Model implementation'); ?></a></td>
                            </tr><tr>
                            <td><?php echo __('Contact'); ?></td>
                            <td><a href="http://www.openstreetmap.org/user/Yarl">@Yarl</a></td>
                            </tr>
                        </tbody>
                        </table>'
                     data-original-title="<?php echo __('Info'); ?>"><?php echo __('Info'); ?></a>
              </li>
            </ul>
            <ul class="nav pull-right">
              <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown"><?php echo __('More'); ?> <b class="caret"></b></a>
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
        <div class="span12" id="indoor-map">
            <h3><?php echo __('Map'); ?></h3>
            <br clear="all" />
            <!-- Map -->
            <div id="map-container">
                <div id="indoor-window" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="indoor-window" aria-hidden="true">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h3 id="indoor-window-header"></h3>
                    </div>
                    <div class="modal-body" id="indoor-window-text">
                    </div>
                    <div class="modal-footer">
                        <button class="btn" id="indoor-window-josm"><?php echo __('Edit in JOSM'); ?></button>
                        <a class="btn" id="indoor-window-link" href="#" target="_blank"><?php echo __('Open in OSM'); ?></a>
                        <button class="btn btn-primary" id="indoor-window-close" data-dismiss="modal" aria-hidden="true"><?php echo __('Close'); ?></button>
                    </div>
                </div>
                <div id="map"></div>
            </div>
            
            <div style="margin-top:5px">
                Test: 
                <a onclick="map.setView(new L.LatLng(51.09447, 17.01945),18)">Sky Tower (Wrocław)</a> | 
                <a onclick="map.setView(new L.LatLng(54.47471, 18.55180),17)">CH Klif (Gdynia)</a>
            </div>
            <div class="alert alert-info" id="map-zoominfo">
                <button type="button" class="close" data-dismiss="alert">&times;</button>
                <?php echo __('<strong>Zoom in</strong> to load buildings'); ?>
            </div>
        </div>
        
        <!-- OPTIONS -->
        <div class="span2" id="indoor-navigation">
            <h3><?php echo __('Navigation'); ?></h3>
            <div id="indoor-levels"></div>
            <select class="input-medium" id="indoor-categories">
                <option value="All"><?php echo __('All'); ?></option>
                <option value="Fashion"><?php echo __('Fashion'); ?></option>
                <option value="Home"><?php echo __('Home'); ?></option>
                <option value="Electronics"><?php echo __('Electronics'); ?></option>
                <option value="Health"><?php echo __('Health'); ?></option>
                <option value="Food"><?php echo __('Food'); ?></option>
                <option value="Service"><?php echo __('Service'); ?></option>
                <option value="Gastronomy"><?php echo __('Gastronomy'); ?></option>
                <option value="Sport"><?php echo __('Sport'); ?></option>
                <option value="Entertainment"><?php echo __('Entertainment'); ?></option>
                <option value="Other"><?php echo __('Other'); ?></option>
            </select>
            <div id="indoor-rooms"></div>
        </div>
      </div>   
      <hr>
      <footer>
          <div class="row">
            <div class="span6">
            <p>© 2012-2013 by Yarl and <a href="https://github.com/yarl/osmtools-indoor/graphs/contributors" alt="commoters at Github">commiters</a><br />
            <a href="http://osmtools.org">OSMTools.org</a></p>
            </div>
            <div class="span4" style="text-align: right">
                <iframe src="http://ghbtns.com/github-btn.html?user=yarl&repo=osmtools-indoor&type=watch&count=true" allowtransparency="true" frameborder="0" scrolling="0" width="80" height="20"></iframe>
                <iframe src="http://ghbtns.com/github-btn.html?user=yarl&repo=osmtools-indoor&type=fork&count=true" allowtransparency="true" frameborder="0" scrolling="0" width="75" height="20"></iframe>
            </div>
          </div>
      </footer>

    </div> <!-- /container -->
    
    <script src="js/start.js"></script>
    <script src="js/opening_hours.js/opening_hours.js"></script>
    <?php include('js/building.js.php'); ?>
    <script src="js/overpass.js"></script>
    <script src="js/bootstrap.min.js"></script>
    
    <iframe src="#" width="0" height="0" id='josm-iframe'></iframe>
  </body>
</html>

