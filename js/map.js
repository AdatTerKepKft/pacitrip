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
    
    var map = new ol.Map({
        view : view,
        layers : [osm, routesLayer, stopsLayer],
        target : 'map',
        controls : [zoomButton, scaleBar]
    });
});