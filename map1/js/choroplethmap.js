let map = L.map('map').setView([58.373523, 26.716045], 12);

const CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
});
CartoDB_Voyager.addTo(map);

async function addChoroplethGeoJson(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        L.choropleth(data, {
            valueProperty: 'TOWERS', 
            scale: ['#ffffff', '#ff9900'], 
            steps: 5, 
            mode: 'q', 
            style: {
                color: '#fff', 
                weight: 2,
                fillOpacity: 0.8,
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(
                    '<strong>District:</strong> ' + feature.properties.NIMI + 
                    '<br><strong>Towers:</strong> ' + feature.properties.TOWERS
                );
            },
        }).addTo(map);

        console.log("Choropleth loaded successfully");
    } catch (error) {
        console.error("Error loading Choropleth data:", error);
    }
}
// default map settings
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12)
}

addChoroplethGeoJson('geojson/tartu_city_districts_edu.geojson');