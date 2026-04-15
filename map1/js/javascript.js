let map = L.map('map').setView([58.373523, 26.716045], 12)

const CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

CartoDB_Voyager.addTo(map)

// add geoJSON polygons layer*
async function addDistrictsGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  const polygons = L.geoJson(data, {
    onEachFeature: popUPinfo,
  })
  polygons.addTo(map)
}
addDistrictsGeoJson('map1/geojson/tartu_city_districts_edu.geojson')

function popUPinfo(feature, layer) {
  layer.bindPopup(feature.properties.NIMI)
}