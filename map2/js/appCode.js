
import * as turfPractice from "./turfPractice.js";
import { wmsLayers } from "./layers.js";


let map = L.map('map', {
    center: [58.374, 26.715], 
    zoom: 16, 
    zoomControl: true
});
map.zoomControl.setPosition('topright');

let activeWmsLayers = {};

map.createPane('customDistrictsPane');
map.getPane('customDistrictsPane').style.zIndex = 350; 

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap contributors'
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri, Maxar',
    maxZoom: 19
});

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: OpenStreetMap, SRTM | Map style: OpenTopoMap',
    maxZoom: 17
});

let districtsLayer, choroplethLayer, heatMapLayer, markersLayer;

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
        onEachFeature: (f, l) => l.bindPopup(f.properties.NIMI || 'District ' + f.properties.OBJECTID)
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
        onEachFeature: (f, l) => l.bindPopup('<strong>' + f.properties.NIMI + '</strong><br>Towers: ' + f.properties.TOWERS)
    });
}

async function loadHeatMapLayer() {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson');
    const data = await response.json();
    const heatData = data.features.map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0], f.properties.area || 1]);
    heatMapLayer = L.heatLayer(heatData, { radius: 20, blur: 15, maxZoom: 17 });
}

async function loadMarkersLayer() {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson');
    const data = await response.json();
    const geoJsonLayer = L.geoJson(data, {
        pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 5, fillColor: 'red', color: 'red', weight: 1, fillOpacity: 0.5 }),
        onEachFeature: (f, l) => l.bindPopup('Cell Tower<br>Area: ' + (f.properties.area || 'Unknown'))
    });
    markersLayer = L.markerClusterGroup().addLayer(geoJsonLayer);
}

function loadWmsLayers(layersList, overlayLayers) {
    layersList.forEach(layer => {
        let paneName = `${layer.layers}-pane`;
        map.createPane(paneName);
        map.getPane(paneName).style.zIndex = layer.zIndex;

        let newLayer = L.tileLayer.wms(layer.url, {
            layers: layer.layers,
            format: layer.format,
            transparent: layer.transparent,
            version: layer.version,
            pane: paneName
        });

        overlayLayers[layer.title.en] = newLayer;
        activeWmsLayers[layer.layers] = false; 
    });
}

function getLayerTitle(layerName) {
    const layer = wmsLayers.find(l => l.layers === layerName);
    return layer ? layer.title.en : layerName;
}

function buildRequestUrl(e, baseUrl, layerName) {
    const bounds = map.getBounds();
    const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()].join(',');
    const size = map.getSize();
    const xPoint = Math.floor(e.containerPoint.x);
    const yPoint = Math.floor(e.containerPoint.y);

    const params = new URLSearchParams({
        service: 'WMS',
        version: '1.1.1',
        request: 'GetFeatureInfo',
        layers: layerName,
        query_layers: layerName,
        info_format: 'application/json',
        x: xPoint,
        y: yPoint,
        srs: 'EPSG:4326',
        width: size.x,
        height: size.y,
        bbox: bbox
    });
    return baseUrl + params;
}

function fetchWmsData(fullUrl, layerName) {
    const content = document.getElementById('info-content');
    fetch(fullUrl)
        .then(res => res.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                let html = `<h4>${getLayerTitle(layerName)}</h4><ul>`;
                for (const key in data.features[0].properties) {
                    html += `<li><strong>${key}:</strong> ${data.features[0].properties[key]}</li>`;
                }
                content.innerHTML += html + '</ul>';
            } else {
                content.innerHTML += `<em>No features found for ${getLayerTitle(layerName)}</em><br>`;
            }
        })
        .catch(err => console.error('WMS Request failed:', err));
}

map.on('overlayadd', (e) => {
    if (e.layer.options.layers) activeWmsLayers[e.layer.options.layers] = true;
});

map.on('overlayremove', (e) => {
    if (e.layer.options.layers) activeWmsLayers[e.layer.options.layers] = false;
});

map.on('click', function(e) {
    const infoBox = document.getElementById('info-box');
    const infoContent = document.getElementById('info-content');
    const anyActive = Object.values(activeWmsLayers).some(v => v === true);

    if (anyActive) {
        infoBox.style.display = 'block';
        infoContent.innerHTML = ""; 
        Object.entries(activeWmsLayers).forEach(([layerName, isActive]) => {
            if (isActive) {
                const url = buildRequestUrl(e, 'https://landscape-geoinformatics.ut.ee/geoserver/pa2023/wms?', layerName);
                fetchWmsData(url, layerName);
            }
        });
    }
});

document.getElementById('info-close').addEventListener('click', () => {
    document.getElementById('info-box').style.display = 'none';
});

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
        "Markers": markersLayer,
        "Heatmap": heatMapLayer,
        "Choropleth layer": choroplethLayer,
        "Tartu districts": districtsLayer
    };

    loadWmsLayers(wmsLayers, overlayLayers);

    L.control.layers(baseLayers, overlayLayers, { collapsed: false, position: 'topleft' }).addTo(map);

    osmLayer.addTo(map);


    turfPractice.turfFunctions(map);
}

export function defaultMapSettings() {
    map.setView([58.374, 26.715], 16);
}

initializeApp();