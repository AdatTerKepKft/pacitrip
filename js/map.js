// Várjuk meg, míg felépül a HTML struktúra (jQuery)
$(document).ready(function(){

    // Globális változók
    let stopsLayer, routesLayer, view;

    // Utazások adatai
    const trips = {
        nordtrip : {
            name : 'NordTrip - 2018.06.15-29.',
            shortName : 'Nordtrip',
            days : ['2018.06.15.', '2018.06.16.', '2018.06.17.', '2018.06.18.', '2018.06.19.', '2018.06.20.', '2018.06.21.', '2018.06.22.', '2018.06.23.', '2018.06.24.', '2018.06.25.', '2018.06.26.', '2018.06.27.', '2018.06.28.', '2018.06.29.'],
            initView: [[16.074259, 64.260138], 5],
            stopsGeoJSON : 'nordtrip/stops.geojson',
            routeGeoJSON : 'nordtrip/routes.geojson'
        },
        swisstrip : {
            name : 'SwissTrip - 2017.08.14-24.',
            shortName : 'SwissTrip',
            days : ['2017.08.14.', '2017.08.15.', '2017.08.16.', '2017.08.17.', '2017.08.18.', '2017.08.19.', '2017.08.20.', '2017.08.21.', '2017.08.22.','2017.08.23.', '2017.08.24.'],
            initView: [[12.589709, 47.526508], 7],
            stopsGeoJSON : 'swisstrip/stops.geojson',
            routeGeoJSON : 'swisstrip/routes.geojson'       
        },
        iretrip : {
            name : 'IreTrip - 2016.10.24-31.',
            shortName : 'IreTrip',
            days : ['2016.10.24.','2016.10.25.','2016.10.26.', '2016.10.27.', '2016.10.28.', '2016.10.29.', '2016.10.30.','2016.10.31.'],
            initView: [[-7.865367, 53.5], 7],
            stopsGeoJSON : 'iretrip/stops.geojson',
            routeGeoJSON : 'iretrip/routes.geojson'
        },
        eurotrip : {
            name : 'EuroTrip - 2015.08.17-27.',
            shortName : 'EuroTrip',
            days : ['2015.08.17.', '2015.08.18.', '2015.08.19.', '2015.08.20.', '2015.08.21.', '2015.08.22.', '2015.08.23.', '2015.08.24.', '2015.08.25.', '2015.08.26.', '2015.08.27.'],
            initView: [[10.978365, 49.502767], 6.5],
            stopsGeoJSON : 'eurotrip/stops.geojson',
            routeGeoJSON : 'eurotrip/routes.geojson'
        }
    };

    const tripKeys = Object.keys(trips);
    let actualTrip = tripKeys[0];

    // Utazás választó dinamikus felépítése
    createTripSelector();

    // Hozzuk létre az állomások stílusát!
    const stopsStyle = new ol.style.Style({
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
    
    // Hozzuk létre az útvonal stílusát!
    const routesStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [20,20,20,1],
            width: 2
        })
    });
    
    // Hozzuk létre az állomások és az útvonal rétegét!
    setLayers(trips[actualTrip].stopsGeoJSON, trips[actualTrip].routeGeoJSON);

    // Hozzuk létre az OpenStreetMap alaptérképi réteget
    const osm = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
    
    // Hozzuk létre a kicsinyítést-nagyítást vezérlő gombot (Zoom)
    const zoomButton = new ol.control.Zoom();

    // Hozzuk létre a mértéklécet (ScaleLine)
    const scaleBar = new ol.control.ScaleLine();
    
    // Hozzuk létre a térkép alapértelmezett nézőpontját (View)
    setView(trips[actualTrip].initView);
    
    // Hozzunk létre egy fedvényt (Overlay) a térképhez
    let overlay = new ol.Overlay({
        element : $("#popup")[0],
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }        
    });    
    
    // Hozzunk létre egy térképet (OpenLayers)
    let map = new ol.Map({
        view : view,
        layers : [osm, routesLayer, stopsLayer],
        target : 'map',
        controls : [zoomButton, scaleBar],
        overlays : [overlay]
    });
    
    // Kattintás eseménykezelő hozzárendelése a térképhez
    map.on('singleclick', function(evt) {
        let popupdrawn = false;
        map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            if(layer.getProperties().title == 'Állomások' && !popupdrawn){
                buildStopsPopup(feature);
                popupdrawn = true;
            }else if(layer.getProperties().title == 'Útvonal' && !popupdrawn){
                buildRoutesPopup(feature, evt.coordinate);
                popupdrawn = true;
            }
        }, {hitTolerance : 2});
    });
    
    // Kattintás eseménykezelő hozzárendelése az információ ablak bezáró gombjához
    $("#popup-closer").click(function() {
        overlay.setPosition(undefined);
    });
    
    // Az utazás választó gombot és legördülő menüt létrehozó és eseménykezelőket hozzárendelő funkció
    function createTripSelector(){
        $('#tripSelector').append('<button class = "tripSelectorButton" value = "' + actualTrip + '">' + trips[actualTrip]['shortName'] + '</button>');

        for(let key of tripKeys){
            $('#tripSelector').append('<div class = "tripSelectorDropdownItem" value = "' + key + '">' + trips[key]['shortName'] + '</div>');
        }

        $('.tripSelectorButton').click(function(){
            let tripListItems = $('.tripSelectorDropdownItem');
            if(tripListItems.is(':visible')){
                tripListItems.hide();
            }else{
                tripListItems.show();
            }
        });

        $('.tripSelectorDropdownItem').click(function(){
            actualTrip = $(this).attr('value');
            $('.subTitle').text(trips[actualTrip]['name']);
            $('.tripSelectorButton').text(trips[actualTrip]['shortName']);
            $('.tripSelectorButton').val(actualTrip);
            $('.tripSelectorDropdownItem').hide();
            map.removeLayer(stopsLayer);
            map.removeLayer(routesLayer);
            setLayers(trips[actualTrip].stopsGeoJSON, trips[actualTrip].routeGeoJSON);
            map.addLayer(routesLayer);
            map.addLayer(stopsLayer);
            setView(trips[actualTrip].initView);
            map.setView(view);
        });
    }

    // A rétegeket módosító funkció
    function setLayers(stopsGeoJSON, routeGeoJSON){
        routesLayer = new ol.layer.Vector({
            title : 'Útvonal',
            style: routesStyle,
            source : new ol.source.Vector({
                projection : 'EPSG:3857',
                url : 'data/' + routeGeoJSON,
                format : new ol.format.GeoJSON()
            })
        });
        
        stopsLayer = new ol.layer.Vector({
            title: 'Állomások',
            style: stopsStyle,
            source: new ol.source.Vector({
                projection : 'EPSG:3857',
                url: 'data/' + stopsGeoJSON,
                format : new ol.format.GeoJSON()
            })
        });
    }

    // A térképi nézetet módosító funkció
    function setView(tripView){
        view = new ol.View({
            center : ol.proj.transform(tripView[0], 'EPSG:4326', 'EPSG:3857'),
            zoom: tripView[1]
        });

    }

    // Az állomások információ ablakát összeállító és megjelenítő funkció
    function buildStopsPopup(feature){
        const coordinate = feature.getGeometry().getCoordinates();
        const props = feature.getProperties();
        
        const contentHtml = '<div class = "popupHtml">' +
                      props.day + '. nap ' + props.stop + '. állomás: ' + '<br/>' + 
                      props.place + '<br/>' +
                      '<img class = "popupImage" src = "img/' + actualTrip + '/' + props.pic + '"/><br/>' +
                      props.desc + '<br/>' +
                      '</div>';
        
        overlay.setPosition(coordinate);
        
        $("#popup-content").html(contentHtml);
    }
    
    // Az útvonalak információ ablakát összeállító és megjelenítő funkció
    function buildRoutesPopup(feature, clickedpoint){
        const coordinate = feature.getGeometry().getClosestPoint(clickedpoint);
        const props = feature.getProperties();
        
        const contentHtml = '<div class = "popupHtml">' +
                      '<a class = "popupLink" href = "' + props.blog + '" target = "blank">NordTrip ' + props.day + '. nap (' + props.date + ')</a>' + 
                      '</div>';
        
        overlay.setPosition(coordinate);
        
        $("#popup-content").html(contentHtml);        
    }

});