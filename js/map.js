$(document).ready(function(){
    
    var stopsStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: [252,225,28,0.4]
            }),
            stroke: new ol.style.Stroke({
                color: [20,20,20,1],
                width: 1
            })
        })
    });
    
    var routesStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [20,20,20,1],
            width: 2
        })
    });
    
    var stopsLayer = new ol.layer.Vector({
        title: 'Állomások',
        style: stopsStyle,
        source: new ol.source.Vector({
            projection : 'EPSG:3857',
            url: 'data/nordtrip/stops.geojson',
            format : new ol.format.GeoJSON()
        })
    });
    
    var routesLayer = new ol.layer.Vector({
        title : 'Útvonal',
        style: routesStyle,
        source : new ol.source.Vector({
            projection : 'EPSG:3857',
            url : 'data/nordtrip/routes.geojson',
            format : new ol.format.GeoJSON()
        })
    });
    
    var osm = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
    
    var zoomButton = new ol.control.Zoom();

    var scaleBar = new ol.control.ScaleLine();
    
    var view = new ol.View({
        center : ol.proj.transform([16.074259, 64.260138], 'EPSG:4326', 'EPSG:3857'),
        zoom: 5
    });
    
    var container = $("#popup")[0];
    
    var overlay = new ol.Overlay({
        element : container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }        
    });    
    
    var map = new ol.Map({
        view : view,
        layers : [osm, routesLayer, stopsLayer],
        target : 'map',
        controls : [zoomButton, scaleBar],
        overlays : [overlay]
    });
    
    map.on('singleclick', function(evt) {
        var popupdrawn = false;
        map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            if(layer.getProperties().title == 'Állomások' && !popupdrawn){
                buildStopsPopupHtmlContent(feature);
                popupdrawn = true;
            }else if(layer.getProperties().title == 'Útvonal' && !popupdrawn){
                buildRoutesPopupHtmlContent(feature, evt.coordinate);
                popupdrawn = true;
            }
        }, {hitTolerance : 2});
    });
    
    $("#popup-closer").click(function() {
        overlay.setPosition(undefined);
        // $(this).blur();
        // return false;
    });
    
    function buildStopsPopupHtmlContent(feature){
        var coordinate = feature.getGeometry().getCoordinates();
        var props = feature.getProperties();
        
        var contentHtml = '<div class = "popupHtml">' +
                      props.day + '. nap ' + props.stop + '. állomás: ' + '<br/>' + 
                      props.place + '<br/>' +
                      '<img class = "popupImage" src = "img/nordtrip/' + props.pic + '"/><br/>' +
                      props.desc + '<br/>' +
                      '</div>';
        
        overlay.setPosition(coordinate);
        
        $("#popup-content").html(contentHtml);
    }
    
    function buildRoutesPopupHtmlContent(feature, clickedpoint){
        var coordinate = feature.getGeometry().getClosestPoint(clickedpoint);
        var props = feature.getProperties();
        
        var contentHtml = '<div class = "popupHtml">' +
                      '<a class = "popupLink" href = "' + props.blog + '" target = "blank">NordTrip ' + props.day + '. nap (' + props.date + ')</a>' + 
                      '</div>';
        
        overlay.setPosition(coordinate);
        
        $("#popup-content").html(contentHtml);        
    }
});