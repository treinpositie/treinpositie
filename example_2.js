$(function () {
    // Setup leaflet map
    var map = new L.Map('map').setView([-7.7892432, 110.3612823,], 17); //Center map and default zoom level

    var markersLayer = new L.LayerGroup();
    map.addLayer(markersLayer);

    var smallIcon = L.icon({
        iconUrl: 'images/st4.png',
        iconSize: [15, 15],
        iconAnchor: [4, 13],
        popupAnchor: [3, -12]
    });

    for (i in stasiun.features) {
        var title = stasiun.features[i].properties.namobj,  //value searched
            info = stasiun.features[i].properties.namobj,
            marker = new L.Marker(new L.latLng(stasiun.features[i].properties.lon, stasiun.features[i].properties.lat), { title: title, icon: smallIcon });//se property searched
        marker.bindPopup(info);
        markersLayer.addLayer(marker);
    }

    var basemapLayer = new L.TileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1
    });

    //Init Sidebar Control
    var sidebar = L.control.sidebar({
        autopan: true,
        container: "sidebar",
        position: "left"
    }).addTo(map);

    // Adds the background layer to the map
    map.addLayer(basemapLayer);

    // Style dan POPUP JSON Jalur Kereta
    var myStyle = {
        "color": "#ff0000",
        "weight": 2,
        "opacity": 0.65
    };
    var myStyle2 = {
        "color": "#0000FF",
        "weight": 2,
        "opacity": 0.65
    };

    function popUp(f, l) {
        var out = [];
        if (f.properties) {
            // for(key in f.properties){
            //  console.log(key);
            // }
            out.push("FID: " + ": " + f.properties["FID"]);
            out.push("Objectid: " + ": " + f.properties["objectid"]);
            out.push("Ini Jalur Rel Kereta Api");
            l.bindPopup(out.join("<br />"));
        }
    }

    // LEGENDA ????????????
    function iconByName(name) {
        return '<i class="icon icon-' + name + '"></i>';
    }

    function featureToMarker(feature, latlng) {
        return L.marker(latlng, {
            icon: L.divIcon({
                className: 'marker-' + feature.properties.amenity,
                html: iconByName(feature.properties.amenity),
                iconUrl: '/images/markers/' + feature.properties.amenity + '.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        });
    }

    var baseLayers = [
        {
            group: "Basemap Layers",
            icon: iconByName('parking'),
            collapsed: true,
            layers: [
                {
                    name: "OpenStreetMap",
                    layer: basemapLayer
                },
                {
                    name: "OpenStreetMap_Mapnik",
                    layer: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    })
                },
                {
                    name: "Citra Google Hybrid",
                    layer: L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
                        maxZoom: 20,
                        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                        attribution: 'Map by <a href="https://maps.google.com/">Google</a>'
                    })
                }
            ]
        }
    ];

    var overLayers = [
        {
            name: "Rel Kereta Yogyakarta - Bandung",
            icon: iconByName('bar'),
            layer: new L.GeoJSON(jalur1, { onEachFeature: popUp, style: myStyle, pointToLayer: featureToMarker }).addTo(map)
        },
        {
            name: "Rel Kereta Bandung - Yogyakarta",
            icon: iconByName('drinking_water'),
            layer: new L.GeoJSON(jalur2, { onEachFeature: popUp, style: myStyle, pointToLayer: featureToMarker }).addTo(map)
        }
    ];

    // var panelLayers = new L.Control.PanelLayers(baseLayers, overLayers, {
    //     collapsibleGroups: true,
    //     collapsed: true
    // });
    // map.addControl(panelLayers);

    var layerControl = new L.Control.PanelLayers(
        baseLayers, overLayers,
        {
            position: "topleft",
            collapsibleGroups: true,
            collapsed: false
        }
    ).addTo(map);


    //Move Layers control to sidebar
    var layerControlContainer = layerControl.getContainer();
    $("#layercontrol").append(layerControlContainer);
    $(".leaflet-control-layers-list").prepend("<strong class='title'>Base Maps</strong><br>");
    $(".leaflet-control-layers-separator").after("<br><strong class='title'>Layers</strong><br>");

    // Colors for AwesomeMarkers
    var _colorIdx = 0,
        _colors = [
            'darkgreen',
            'orange',
            'darkgreen',
            'darkblue',
            'darkgreen',
            'darkblue',
            'orange'
        ];

    function _assignColor() {
        return _colors[_colorIdx++ % 7];
    }

    // =====================================================
    // =============== Playback ============================
    // =====================================================

    // Playback options
    var playbackOptions = {
        // layer and marker options
        layer: {
            pointToLayer: function (featureData, latlng) {
                var result = {};

                if (featureData && featureData.properties && featureData.properties.path_options) {
                    result = featureData.properties.path_options;
                }

                if (!result.radius) {
                    result.radius = 5;
                }

                return new L.CircleMarker(latlng, result);
            }
        },

        marker: function () {
            return {
                icon: L.AwesomeMarkers.icon({
                    prefix: 'fa',
                    icon: 'train',
                    markerColor: _assignColor()
                }),
                getPopup: function (feature) {
                    return feature.properties.title;
                }
            };
        },
        popups: true,
        fadeMarkersWhenStale: true,
        tracksLayer: false
    };

    // Initialize playback
    var playback = new L.Playback(map, demoTracks, null, playbackOptions);

    // Initialize custom control
    var control = new L.Playback.Control(playback);
    control.addTo(map);
    
    // Add data
    playback.addData(ka119, ka283, ka157, ka79, ka131, ka5, ka285, ka120, ka284, ka158, ka132, ka80, ka6, ka286);

});
