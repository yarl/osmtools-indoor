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
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Indoor | OSMTools.org</title>

    <link rel="icon" type="image/png" href="icon.png"/>
    <link href="css/bootstrap.css" rel="stylesheet">
    <link rel="stylesheet" href="http://leafletjs.com/dist/leaflet.css" />
    <!--[if lte IE 8]><link rel="stylesheet" href="http://leafletjs.com/dist/leaflet.ie.css" /><![endif]-->
    <link rel="stylesheet" href="js/leaflet/leaflet.label.css" />
    <link rel="stylesheet" href="css/fixes.css">
    <link rel='stylesheet' href='http://fonts.googleapis.com/css?family=Oxygen:400,700&subset=latin,latin-ext' type='text/css'>
    <link rel='stylesheet' href='css/font/typicons.min.css' />

    <script src="http://leafletjs.com/dist/leaflet.js"></script>
    <script src="js/leaflet/leaflet.markercluster.js"></script>
    <script src="js/leaflet/leaflet.label.js"></script>
    <script src="js/leaflet/leaflet.requery.js"></script>
    <script src="js/leaflet/leaflet.hash.js"></script>

    <script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
    <script src="js/jquery/jquery.dateFormat-1.0.js"></script>
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->
  </head>

  <body>  
    <div class="navbar navbar-default navbar-fixed-top" id="top" role="navigation">
      <div class="navbar-inner">
        <div class="container logo">
          <a class="navbar-brand" href="."><img src="img/map-logo.png" alt="OSMTools" /> indoor map</a>
          <span>/</span>
          <span>part of <a href="http://osmtools.org/">osmtools.org</a></span>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="tools" id="indoor-navigation">
        <h3></h3>
        <div id="indoor-escape"><button class="btn"><span class="typcn typcn-backspace"><span><span class="btn-text"></span></button></div>
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

                <div id="indoor-window" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="indoor-window" aria-hidden="true">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h3 class="modal-title" id="indoor-window-header"></h4>
                      </div>
                      <div class="modal-body" id="indoor-window-text"></div>
                      <div class="modal-footer">
                        <button class="btn" id="indoor-window-josm">Edytuj w JOSM</button>
                        <a class="btn" id="indoor-window-link" href="#" target="_blank">Zobacz w OSM</a>
                        <button class="btn btn-primary" id="indoor-window-close" data-dismiss="modal" aria-hidden="true">Zamknij</button>
                      </div>
                    </div><!-- /.modal-content -->
                  </div><!-- /.modal-dialog -->
                </div><!-- /.modal -->

                <div id="map"></div>
                </div>

                <div id="footer">
                  <div class="container">
                    <div class="text-muted pull-left"><small>© 2012-2013</small> by <a href="https://github.com/yarl">Yarl</a> and <a href="https://github.com/yarl/osmtools-indoor/graphs/contributors">commiters</a>. <small>Map by <a href="http://osm.org/">OpenStreetMap contributors</a>. Tiles by <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap Team</a>. Logo by <a href="http://smallicons.net/">smallicons.net</a></small></div>
                    <div class="pull-right">
                      <iframe src="http://ghbtns.com/github-btn.html?user=yarl&repo=osmtools-indoor&type=watch&count=true" allowtransparency="true" frameborder="0" scrolling="0" width="80" height="20"></iframe>
                      <iframe src="http://ghbtns.com/github-btn.html?user=yarl&repo=osmtools-indoor&type=fork&count=true" allowtransparency="true" frameborder="0" scrolling="0" width="75" height="20"></iframe>
                    </div>
                  </div>
                </div>


                <script>
                  var translations = {
                    'Fashion': '<?php echo __('Fashion'); ?>',
                    'Home': '<?php echo __('Home'); ?>',
                    'Electronics': '<?php echo __('Electronics'); ?>',
                    'Health': '<?php echo __('Health'); ?>',
                    'Food': '<?php echo __('Food'); ?>',
                    'Service': '<?php echo __('Service'); ?>',
                    'Gastronomy': '<?php echo __('Gastronomy'); ?>',
                    'Sport': '<?php echo __('Sport'); ?>',
                    'Entertainment': '<?php echo __('Entertainment'); ?>',
                    'Other': '<?php echo __('Other'); ?>',
                    'Open in OSM': '<?php echo __('Open in OSM'); ?>',
                    'Enter': '<?php echo __('Enter'); ?>',
                    'Empty floor': '<?php echo __('Empty floor'); ?>',
                    'None on this floor': '<?php echo __('None on this floor'); ?>',
                    'Type': '<?php echo __('Type'); ?>',
                    'Close': '<?php echo __('Close'); ?>',
                    'Click to load buildings': '<?php echo __('Click to load buildings'); ?>',
                    '<strong>Zoom in</strong> to load buildings': '<?php echo __('<strong>Zoom in</strong> to load buildings'); ?>'
                  };
                </script>
                <script src="js/start.js"></script>
                <script src="js/opening_hours.js/opening_hours.js"></script>
                <?php include('js/building.js.php'); ?>
                <script src="js/overpass.js"></script>
                <script src="js/bootstrap.min.js"></script>

    <!--<iframe src="#" width="0" height="0" id='josm-iframe'></iframe>-->
                </body>
                </html>

