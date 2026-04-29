let map = L.map('map', {
    center: [58.373523, 26.716045],
    zoom: 12,
    zoomControl: true 
});
map.zoomControl.setPosition('topright');


map.createPane('customDistrictsPane');
map.getPane('customDistrictsPane').style.zIndex = 390; 

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap contributors'
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri, Maxar'
});

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenTopoMap'
});

// Variables for Overlays
let districtsLayer, choroplethLayer, heatMapLayer, markersLayer;

// 4. Layer Functions
function getDistrictColor(id) {
    switch (id) {
        case 1: return '#ff0000';
        case 13: return '#009933';
        case 6: return '#0000ff';
        case 7: return '#ff0066';
        default: return '#ffffff';
    }
}

async function loadDistrictsLayer() {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson');
    const data = await response.json();
    districtsLayer = L.geoJson(data, {
        pane: 'customDistrictsPane',
        style: (f) => ({ fillColor: getDistrictColor(f.properties.OBJECTID), fillOpacity: 0.5, weight: 1, color: 'grey' }),
        onEachFeature: (f, l) => l.bindPopup(f.properties.NIMI)
    });
}

async function loadChoroplethLayer() {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson');
    const data = await response.json();
    choroplethLayer = L.choropleth(data, {
        valueProperty: 'TOWERS',
        scale: ['#e6ffe6', '#004d00'],
        steps: 11,
        mode: 'q',
        pane: 'customDistrictsPane',
        style: { color: '#fff', weight: 2, fillOpacity: 0.8 },
        onEachFeature: (f, l) => l.bindPopup(f.properties.NIMI + ': ' + f.properties.TOWERS + ' towers')
    });
}

async function loadHeatMapLayer() {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson');
    const data = await response.json();
    const heatData = data.features.map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0], f.properties.area || 1]);
    heatMapLayer = L.heatLayer(heatData, { radius: 20, blur: 15 });
}

async function loadMarkersLayer() {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson');
    const data = await response.json();
    const geoJsonLayer = L.geoJson(data, {
        pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 5, fillColor: 'red', color: 'red', weight: 1, fillOpacity: 0.5 }),
        onEachFeature: (f, l) => l.bindPopup('Cell Tower<br>Area: ' + f.properties.area)
    });
    markersLayer = L.markerClusterGroup().addLayer(geoJsonLayer);
}

async function initializeApp() {
    await Promise.all([
        loadDistrictsLayer(),
        loadChoroplethLayer(),
        loadHeatMapLayer(),
        loadMarkersLayer()
    ]);

    const baseLayers = {
        "OpenStreetMap": osmLayer,
        "Satellite": satelliteLayer,
        "Topographic": topoLayer
    };

    const overlayLayers = {
        "Tartu districts": districtsLayer,
        "Choropleth layer": choroplethLayer,
        "Heatmap": heatMapLayer,
        "Markers": markersLayer
    };

    L.control.layers(baseLayers, overlayLayers, { collapsed: false, position: 'topleft' }).addTo(map);

    osmLayer.addTo(map);
    districtsLayer.addTo(map);
}

function defaultMapSettings() {
    map.setView([58.373523, 26.716045], 12);
}

initializeApp();