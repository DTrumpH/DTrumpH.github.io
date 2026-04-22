let map = L.map('map').setView([58.373523, 26.716045], 12);

const CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
});
CartoDB_Voyager.addTo(map);

function heatDataConvert(feature) {
    return [
        feature.geometry.coordinates[1], 
        feature.geometry.coordinates[0], 
        feature.properties.area        
    ];
}

async function addHeatmapGeoJson(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("File not found");
        
        const data = await response.json();
        
        const heatData = data.features.map(heatDataConvert);
        
        const heatMap = L.heatLayer(heatData, { radius: 10 });
        heatMap.addTo(map);
        
        console.log("Heatmap data loaded:", heatData.length, "points");
    } catch (error) {
        console.error("Error loading heatmap:", error);
    }
}
// default map settings
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12)
}

addHeatmapGeoJson('geojson/tartu_city_celltowers_edu.geojson');